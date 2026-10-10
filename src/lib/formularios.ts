import type { Resultado } from "./tipos";

export const texto = (datos: FormData, campo: string) => String(datos.get(campo) ?? "").trim();

export const bien = (mensaje: string): Resultado => ({ ok: true, mensaje });
export const mal = (mensaje: string): Resultado => ({ ok: false, mensaje });

// Convierte cualquier error en un mensaje para mostrar en pantalla.
export const falla = (e: unknown): Resultado =>
  mal(e instanceof Error ? e.message : "Algo salió mal. Probá de nuevo.");
