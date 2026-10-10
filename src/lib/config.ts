import "server-only";
import fs from "node:fs";
import path from "node:path";

// Todas las claves y ajustes viven en config.local.json, en la raíz del
// proyecto. Ese archivo está en .gitignore: nunca se sube a GitHub.
export type Config = {
  supabase: { url: string; key: string };
  apify: { token: string };
  mail: { usuario: string; clave: string; nombre: string; topeDiario: number };
  whatsapp: { aceptoRiesgo: boolean; topePorNumero: number };
  metaAds: { conectado: boolean };
};

const ARCHIVO = path.join(process.cwd(), "config.local.json");

const BASE: Config = {
  supabase: { url: "", key: "" },
  apify: { token: "" },
  mail: { usuario: "", clave: "", nombre: "", topeDiario: 40 },
  whatsapp: { aceptoRiesgo: false, topePorNumero: 30 },
  metaAds: { conectado: false },
};

export function leerConfig(): Config {
  let guardado: Partial<Config> = {};
  try {
    guardado = JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
  } catch {
    // Primera vez: todavía no existe el archivo.
  }
  return {
    supabase: { ...BASE.supabase, ...guardado.supabase },
    apify: { ...BASE.apify, ...guardado.apify },
    mail: { ...BASE.mail, ...guardado.mail },
    whatsapp: { ...BASE.whatsapp, ...guardado.whatsapp },
    metaAds: { ...BASE.metaAds, ...guardado.metaAds },
  };
}

export function guardarConfig(cambios: { [K in keyof Config]?: Partial<Config[K]> }): Config {
  const actual = leerConfig();
  const nuevo: Config = {
    supabase: { ...actual.supabase, ...cambios.supabase },
    apify: { ...actual.apify, ...cambios.apify },
    mail: { ...actual.mail, ...cambios.mail },
    whatsapp: { ...actual.whatsapp, ...cambios.whatsapp },
    metaAds: { ...actual.metaAds, ...cambios.metaAds },
  };
  fs.writeFileSync(ARCHIVO, JSON.stringify(nuevo, null, 2) + "\n");
  return nuevo;
}

// Para mostrar una clave guardada sin revelarla entera.
export function enmascarar(valor: string): string {
  if (!valor) return "";
  return valor.length <= 8 ? "••••" : `${valor.slice(0, 4)}••••${valor.slice(-4)}`;
}
