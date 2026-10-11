"use server";

import { revalidatePath } from "next/cache";
import { buscarNegocios } from "@/lib/apify";
import { leerConfig } from "@/lib/config";
import { bien, falla, mal, texto } from "@/lib/formularios";
import { completar } from "@/lib/plantillas";
import { datos as leer, exigirBase } from "@/lib/supabase";
import type { Canal, Plantilla, Prospecto, Resultado } from "@/lib/tipos";

export async function buscarProspectos(_: Resultado, datos: FormData): Promise<Resultado> {
  const { token } = leerConfig().apify;
  if (!token) return mal("Primero conectá Apify en Conexiones.");
  const rubro = texto(datos, "rubro");
  const ciudad = texto(datos, "ciudad");
  const cantidad = Math.min(200, Math.max(1, Math.round(Number(texto(datos, "cantidad")) || 20)));
  if (!rubro || !ciudad) return mal("Completá el rubro y la ciudad.");

  try {
    const negocios = await buscarNegocios({
      token,
      rubro,
      ciudad,
      cantidad,
      conMails: datos.get("conMails") === "on",
    });
    if (negocios.length === 0) return bien("La búsqueda no trajo negocios. Probá con otro rubro o ciudad.");
    // Los que ya estaban (mismo lugar de Google Maps) no se tocan.
    const nuevos = leer(
      await exigirBase()
        .from("prospectos")
        .upsert(negocios, { onConflict: "place_id", ignoreDuplicates: true })
        .select("id"),
    );
    revalidatePath("/prospectos");
    return bien(
      `Encontramos ${negocios.length} negocios: ${nuevos.length} nuevos y ${negocios.length - nuevos.length} que ya tenías.`,
    );
  } catch (e) {
    return falla(e);
  }
}

export async function agregarProspecto(_: Resultado, datos: FormData): Promise<Resultado> {
  const nombre = texto(datos, "nombre");
  if (!nombre) return mal("Poné al menos el nombre del negocio.");
  // Sin el código de país, WhatsApp le escribiría a otro número.
  const telefono = texto(datos, "telefono");
  if (telefono && !telefono.startsWith("+")) {
    return mal("Escribí el teléfono con el + y el código de país adelante. Por ejemplo: +54 9 351 555 0101.");
  }
  try {
    leer(
      await exigirBase()
        .from("prospectos")
        .insert({
          nombre,
          telefono: telefono || null,
          email: texto(datos, "email") || null,
          ciudad: texto(datos, "ciudad") || null,
          rubro: texto(datos, "rubro") || null,
        })
        .select("id"),
    );
    revalidatePath("/prospectos");
    return bien(`${nombre} agregado.`);
  } catch (e) {
    return falla(e);
  }
}

// Un solo formulario para la tabla: el botón que se toca dice qué hacer con
// los prospectos tildados.
export async function accionSobreSeleccion(_: Resultado, datos: FormData): Promise<Resultado> {
  const ids = datos.getAll("id").map(String);
  const intencion = texto(datos, "intencion");
  if (ids.length === 0) return mal("Tildá al menos un prospecto.");
  try {
    if (intencion === "borrar") {
      leer(await exigirBase().from("prospectos").delete().in("id", ids).select("id"));
      revalidatePath("/prospectos");
      return bien(`${ids.length} prospectos borrados.`);
    }
    if (intencion === "whatsapp" || intencion === "mail") return await encolar(intencion, ids);
    return mal("Acción desconocida.");
  } catch (e) {
    return falla(e);
  }
}

// Arma un mensaje por prospecto a partir de la plantilla y lo deja PENDIENTE.
// Acá no se envía nada: el envío es uno por uno, desde la cola.
async function encolar(canal: Canal, ids: string[]): Promise<Resultado> {
  const db = exigirBase();
  const plantilla = leer(
    await db.from("plantillas").select("*").eq("canal", canal).maybeSingle(),
  ) as Plantilla | null;
  if (!plantilla) return mal("Falta la plantilla. Corré de nuevo el SQL de las tablas.");

  const prospectos = leer(await db.from("prospectos").select("*").in("id", ids)) as Prospecto[];
  const yaTienen = new Set(
    (
      leer(
        await db
          .from("mensajes")
          .select("prospecto_id")
          .eq("canal", canal)
          .in("prospecto_id", ids)
          .in("estado", ["pendiente", "enviando", "enviado"]),
      ) as { prospecto_id: string }[]
    ).map((m) => m.prospecto_id),
  );

  const contacto = (p: Prospecto) => (canal === "whatsapp" ? p.telefono : p.email);
  const aptos = prospectos.filter((p) => contacto(p) && !yaTienen.has(p.id));
  const sinDato = prospectos.filter((p) => !contacto(p)).length;
  const repetidos = prospectos.filter((p) => contacto(p) && yaTienen.has(p.id)).length;

  if (aptos.length > 0) {
    leer(
      await db
        .from("mensajes")
        .insert(
          aptos.map((p) => ({
            prospecto_id: p.id,
            canal,
            asunto: canal === "mail" ? completar(plantilla.asunto ?? "", p) : null,
            texto: completar(plantilla.texto, p),
          })),
        )
        .select("id"),
    );
    leer(
      await db
        .from("prospectos")
        .update({ estado: "en_cola" })
        .eq("estado", "nuevo")
        .in("id", aptos.map((p) => p.id))
        .select("id"),
    );
  }
  revalidatePath("/", "layout");

  const partes = [`${aptos.length} en la cola de ${canal === "whatsapp" ? "WhatsApp" : "mail"}`];
  if (sinDato) partes.push(`${sinDato} sin ${canal === "whatsapp" ? "teléfono" : "mail"}`);
  if (repetidos) partes.push(`${repetidos} que ya tenían mensaje`);
  return aptos.length > 0 ? bien(`${partes.join(", ")}.`) : mal(`${partes.join(", ")}.`);
}
