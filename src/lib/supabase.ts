import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { leerConfig } from "./config";

let cache: { firma: string; cliente: SupabaseClient } | null = null;

// Devuelve el cliente de Supabase, o null si todavía no se conectó.
export function base(): SupabaseClient | null {
  const { url, key } = leerConfig().supabase;
  if (!url || !key) return null;
  const firma = `${url}|${key}`;
  if (cache?.firma !== firma) {
    try {
      cache = {
        firma,
        cliente: createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        }),
      };
    } catch {
      return null;
    }
  }
  return cache.cliente;
}

export function exigirBase(): SupabaseClient {
  const db = base();
  if (!db) throw new Error("Falta conectar la base de datos.");
  return db;
}

export type EstadoBase = "sin_configurar" | "sin_tablas" | "error" | "lista";

export async function estadoBase(): Promise<{ estado: EstadoBase; detalle?: string }> {
  const db = base();
  if (!db) return { estado: "sin_configurar" };
  try {
    const { error } = await db.from("prospectos").select("id").limit(1);
    if (!error) return { estado: "lista" };
    // PGRST205 / 42P01: la conexión anda pero las tablas no existen todavía.
    if (error.code === "PGRST205" || error.code === "42P01") return { estado: "sin_tablas" };
    return { estado: "error", detalle: error.message };
  } catch (e) {
    return { estado: "error", detalle: e instanceof Error ? e.message : "No se pudo conectar." };
  }
}

// Atajo para consultas: devuelve los datos o tira el error de Supabase.
export function datos<T>(respuesta: { data: T | null; error: { message: string } | null }): T {
  if (respuesta.error) throw new Error(respuesta.error.message || "Error de base de datos.");
  return respuesta.data as T;
}

export async function contar(
  consulta: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  const { count, error } = await consulta;
  if (error) throw new Error(error.message || "No se pudo contar en la base de datos.");
  return count ?? 0;
}
