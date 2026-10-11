"use server";

import { revalidatePath } from "next/cache";
import { probarApify } from "@/lib/apify";
import { guardarConfig, leerConfig } from "@/lib/config";
import { bien, mal, texto } from "@/lib/formularios";
import { probarMail } from "@/lib/mail";
import { estadoBase } from "@/lib/supabase";
import type { Resultado } from "@/lib/tipos";
import { desvincular, esNumero } from "@/lib/whatsapp";

const refrescar = () => revalidatePath("/", "layout");

// La clave pública de Supabase no sirve acá: las tablas están cerradas con RLS.
function esClavePublica(key: string): boolean {
  if (key.startsWith("sb_publishable_")) return true;
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "anon";
  } catch {
    return false;
  }
}

export async function guardarSupabase(_: Resultado, datos: FormData): Promise<Resultado> {
  let url = texto(datos, "url");
  const key = texto(datos, "key") || leerConfig().supabase.key;
  if (!url.startsWith("https://")) return mal("La URL del proyecto tiene que empezar con https://");
  // Si pegaron la dirección del panel (supabase.com/dashboard/project/abcd),
  // se arma la del proyecto. Y de la URL solo se usa el dominio.
  const panel = /supabase\.com\/dashboard\/project\/([a-z0-9]+)/.exec(url);
  try {
    url = panel ? `https://${panel[1]}.supabase.co` : new URL(url).origin;
  } catch {
    return mal("Esa URL no es válida. Tiene esta forma: https://abcdefgh.supabase.co");
  }
  if (!key) return mal("Falta pegar la clave secreta.");
  if (esClavePublica(key)) {
    return mal("Esa es la clave pública. Necesitás la secreta: empieza con sb_secret_.");
  }
  guardarConfig({ supabase: { url, key } });
  refrescar();
  return verificarBase();
}

export async function verificarBase(): Promise<Resultado> {
  const { estado, detalle } = await estadoBase();
  refrescar();
  if (estado === "lista") return bien("Base conectada y con las tablas creadas.");
  if (estado === "sin_tablas") return bien("Conexión correcta. Falta el paso 3: crear las tablas.");
  if (estado === "sin_configurar") return mal("Falta pegar la URL y la clave.");
  return mal(detalle ?? "No se pudo conectar con Supabase.");
}

export async function guardarApify(_: Resultado, datos: FormData): Promise<Resultado> {
  const token = texto(datos, "token");
  if (!token) return mal("Falta pegar el token.");
  const prueba = await probarApify(token);
  if (!prueba.ok) return mal("Apify no aceptó ese token. Copialo de nuevo desde Settings, API & Integrations.");
  guardarConfig({ apify: { token } });
  refrescar();
  return bien(`Apify conectado${prueba.usuario ? ` (cuenta ${prueba.usuario})` : ""}.`);
}

export async function guardarMail(_: Resultado, datos: FormData): Promise<Resultado> {
  const usuario = texto(datos, "usuario");
  // Google muestra la contraseña de aplicación con espacios; van sin espacios.
  const clave = texto(datos, "clave").replace(/\s/g, "") || leerConfig().mail.clave;
  const nombre = texto(datos, "nombre");
  if (!usuario.includes("@")) return mal("Escribí tu dirección de Gmail completa.");
  if (!clave) return mal("Falta pegar la contraseña de aplicación.");
  const prueba = await probarMail({ usuario, clave, nombre });
  if (!prueba.ok) return mal(prueba.error!);
  guardarConfig({ mail: { usuario, clave, nombre } });
  refrescar();
  return bien("Mail conectado. Ya podés aprobar correos desde la cola.");
}

const tope = (datos: FormData, maximo: number) =>
  Math.min(maximo, Math.max(1, Math.round(Number(texto(datos, "tope")) || 1)));

export async function guardarTopeMail(_: Resultado, datos: FormData): Promise<Resultado> {
  const topeDiario = tope(datos, 200);
  guardarConfig({ mail: { topeDiario } });
  refrescar();
  return bien(`Tope guardado: ${topeDiario} correos por día.`);
}

export async function guardarTopeWhatsApp(_: Resultado, datos: FormData): Promise<Resultado> {
  const topePorNumero = tope(datos, 60);
  guardarConfig({ whatsapp: { topePorNumero } });
  refrescar();
  return bien(`Tope guardado: ${topePorNumero} mensajes por día por número.`);
}

export async function aceptarRiesgoWhatsApp(_: Resultado, datos: FormData): Promise<Resultado> {
  if (datos.get("acepto") !== "on") return mal("Tildá la casilla para seguir.");
  guardarConfig({ whatsapp: { aceptoRiesgo: true } });
  refrescar();
  return bien("Listo. Ya podés conectar tus números acá abajo.");
}

export async function desvincularNumero(_: Resultado, datos: FormData): Promise<Resultado> {
  const n = Number(texto(datos, "numero"));
  if (!esNumero(n)) return mal("Número inválido.");
  desvincular(n);
  refrescar();
  return bien("Número desvinculado de este dashboard. Sacalo también desde el celular, en Dispositivos vinculados.");
}

export async function marcarMetaAds(_: Resultado, datos: FormData): Promise<Resultado> {
  const conectado = texto(datos, "conectado") === "si";
  guardarConfig({ metaAds: { conectado } });
  refrescar();
  return bien(conectado ? "Meta Ads marcado como conectado." : "Meta Ads marcado como sin conectar.");
}
