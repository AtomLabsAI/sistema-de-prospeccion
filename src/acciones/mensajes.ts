"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { leerConfig } from "@/lib/config";
import { enviadosHoy } from "@/lib/consultas";
import { bien, falla, mal, texto } from "@/lib/formularios";
import { enviarMail } from "@/lib/mail";
import { datos as leer, exigirBase } from "@/lib/supabase";
import type { Canal, MensajeConProspecto, Resultado } from "@/lib/tipos";
import { enviarWhatsApp, esNumero, estadoNumero, normalizarTelefono } from "@/lib/whatsapp";

const refrescar = () => revalidatePath("/", "layout");

export async function guardarPlantilla(_: Resultado, datos: FormData): Promise<Resultado> {
  const canal = texto(datos, "canal") as Canal;
  const cuerpo = texto(datos, "texto");
  if (!cuerpo) return mal("La plantilla no puede quedar vacía.");
  try {
    leer(
      await exigirBase()
        .from("plantillas")
        .upsert({
          canal,
          asunto: canal === "mail" ? texto(datos, "asunto") : null,
          texto: cuerpo,
          actualizado_en: new Date().toISOString(),
        })
        .select("canal"),
    );
    refrescar();
    return bien("Plantilla guardada. Se usa en los próximos mensajes que mandes a la cola.");
  } catch (e) {
    return falla(e);
  }
}

// El estado del prospecto sale de sus mensajes.
async function recalcularProspecto(db: SupabaseClient, prospectoId: string) {
  const estados = (
    leer(await db.from("mensajes").select("estado").eq("prospecto_id", prospectoId)) as {
      estado: string;
    }[]
  ).map((m) => m.estado);
  const estado = estados.includes("enviado")
    ? "contactado"
    : estados.some((e) => e === "pendiente" || e === "enviando" || e === "error")
      ? "en_cola"
      : "nuevo";
  await db.from("prospectos").update({ estado }).eq("id", prospectoId);
}

export async function editarMensaje(_: Resultado, datos: FormData): Promise<Resultado> {
  const cuerpo = texto(datos, "texto");
  if (!cuerpo) return mal("El mensaje no puede quedar vacío.");
  try {
    const cambios: { texto: string; asunto?: string } = { texto: cuerpo };
    if (datos.has("asunto")) cambios.asunto = texto(datos, "asunto");
    leer(
      await exigirBase()
        .from("mensajes")
        .update(cambios)
        .eq("id", texto(datos, "id"))
        .eq("estado", "pendiente")
        .select("id"),
    );
    refrescar();
    return bien("Mensaje actualizado.");
  } catch (e) {
    return falla(e);
  }
}

export async function saltearMensaje(_: Resultado, datos: FormData): Promise<Resultado> {
  try {
    const db = exigirBase();
    const [mensaje] = leer(
      await db
        .from("mensajes")
        .update({ estado: "salteado" })
        .eq("id", texto(datos, "id"))
        .in("estado", ["pendiente", "error"])
        .select("prospecto_id"),
    ) as { prospecto_id: string }[];
    if (mensaje) await recalcularProspecto(db, mensaje.prospecto_id);
    refrescar();
    return bien("Mensaje salteado.");
  } catch (e) {
    return falla(e);
  }
}

// Aprueba y envía UN mensaje. Es el único lugar del dashboard desde donde
// sale algo hacia WhatsApp o mail, y siempre con un clic de la persona.
export async function aprobarMensaje(_: Resultado, datos: FormData): Promise<Resultado> {
  try {
    const db = exigirBase();
    const config = leerConfig();
    const id = texto(datos, "id");
    const mensaje = leer(
      await db
        .from("mensajes")
        .select("*, prospectos(nombre, telefono, email)")
        .eq("id", id)
        .maybeSingle(),
    ) as MensajeConProspecto | null;
    if (!mensaje || mensaje.estado !== "pendiente") return mal("Ese mensaje ya se procesó.");

    // 1. Chequeos previos, según el canal.
    let numero: number | null = null;
    let telefono = "";
    if (mensaje.canal === "whatsapp") {
      if (!config.whatsapp.aceptoRiesgo) {
        return mal("Antes de enviar tenés que aceptar el aviso de riesgo en Conexiones, WhatsApp.");
      }
      numero = Number(texto(datos, "numero"));
      if (!esNumero(numero)) return mal("Elegí desde qué número enviar.");
      if ((await estadoNumero(numero)).conexion !== "conectado") {
        return mal("Ese número no está conectado.");
      }
      telefono = normalizarTelefono(mensaje.prospectos?.telefono) ?? "";
      if (!telefono) return mal("El teléfono no tiene código de país. Corregilo o salteá el mensaje.");
      if ((await enviadosHoy(db, "whatsapp", numero)) >= config.whatsapp.topePorNumero) {
        return mal(`Ese número ya llegó al tope de hoy (${config.whatsapp.topePorNumero}). Seguí mañana.`);
      }
    } else {
      if (!config.mail.usuario || !config.mail.clave) return mal("Primero conectá tu mail en Conexiones.");
      if (!mensaje.prospectos?.email) return mal("Ese prospecto no tiene mail.");
      if ((await enviadosHoy(db, "mail")) >= config.mail.topeDiario) {
        return mal(`Ya llegaste al tope de hoy (${config.mail.topeDiario} correos). Seguí mañana.`);
      }
    }

    // 2. Reservar el mensaje: si alguien tocó dos veces, el segundo no pasa.
    const reservado = leer(
      await db.from("mensajes").update({ estado: "enviando" }).eq("id", id).eq("estado", "pendiente").select("id"),
    ) as { id: string }[];
    if (reservado.length === 0) return mal("Ese mensaje ya se está enviando.");

    // 3. Enviar.
    const envio =
      mensaje.canal === "whatsapp"
        ? await enviarWhatsApp(numero as 1 | 2 | 3, telefono, mensaje.texto, id)
        : await enviarMail(config.mail, {
            para: mensaje.prospectos!.email!,
            asunto: mensaje.asunto || "(sin asunto)",
            texto: mensaje.texto,
          });

    // 4. Anotar el resultado.
    if (envio.ok) {
      await db
        .from("mensajes")
        .update({ estado: "enviado", numero, error: null, enviado_en: new Date().toISOString() })
        .eq("id", id);
    } else {
      // Si no sabemos si salió, queda en "error" para que nadie lo reenvíe sin mirar.
      const incierto = "incierto" in envio && envio.incierto;
      await db
        .from("mensajes")
        .update({ estado: incierto ? "error" : "pendiente", numero, error: envio.error })
        .eq("id", id);
    }
    await recalcularProspecto(db, mensaje.prospecto_id);
    refrescar();
    return envio.ok
      ? bien(`Enviado a ${mensaje.prospectos?.nombre ?? "el prospecto"}.`)
      : mal(envio.error ?? "No se pudo enviar.");
  } catch (e) {
    return falla(e);
  }
}
