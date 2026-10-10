import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { inicioDeHoy, semanaDe } from "./fechas";
import { contar, datos } from "./supabase";
import type { Canal, Columna, Fila, MensajeConProspecto, Planilla } from "./tipos";

// Mensajes enviados hoy por un canal (y, en WhatsApp, por número).
export function enviadosHoy(db: SupabaseClient, canal: Canal, numero?: number): Promise<number> {
  let consulta = db
    .from("mensajes")
    .select("id", { count: "exact", head: true })
    .eq("canal", canal)
    .eq("estado", "enviado")
    .gte("enviado_en", inicioDeHoy());
  if (numero) consulta = consulta.eq("numero", numero);
  return contar(consulta);
}

// La cola de un canal: lo pendiente, y lo que quedó dudoso para revisar.
export async function cola(db: SupabaseClient, canal: Canal): Promise<MensajeConProspecto[]> {
  return datos(
    await db
      .from("mensajes")
      .select("*, prospectos(nombre, telefono, email)")
      .eq("canal", canal)
      .in("estado", ["pendiente", "error"])
      .order("creado_en")
      .limit(100),
  ) as MensajeConProspecto[];
}

export type AvanceSemana = {
  planilla: string;
  etiqueta: string;
  metas: { nombre: string; valor: number; meta: number }[];
};

// Cómo viene la semana en curso de una planilla contra sus metas. Si la semana
// en curso no está cargada, toma la más reciente que no sea futura.
export function avanceDe(planilla: Planilla, columnas: Columna[], filas: Fila[]): AvanceSemana | null {
  const esteLunes = semanaDe(new Date()).lunes;
  const ultima = filas.find((f) => f.inicio_periodo && f.inicio_periodo <= esteLunes) ?? filas[0];
  const conMeta = columnas.filter((c) => c.tipo === "number" && c.meta != null);
  if (!ultima || conMeta.length === 0) return null;
  return {
    planilla: planilla.nombre,
    etiqueta: ultima.etiqueta,
    metas: conMeta.map((c) => ({
      nombre: c.nombre,
      valor: typeof ultima.valores[c.id] === "number" ? (ultima.valores[c.id] as number) : 0,
      meta: Number(c.meta),
    })),
  };
}

export async function planillaCompleta(db: SupabaseClient, planillaId: string) {
  const [columnas, filas] = await Promise.all([
    db.from("planilla_columnas").select("*").eq("planilla_id", planillaId).order("posicion"),
    db
      .from("planilla_filas")
      .select("*")
      .eq("planilla_id", planillaId)
      .order("inicio_periodo", { ascending: false, nullsFirst: false }),
  ]);
  return { columnas: datos(columnas) as Columna[], filas: datos(filas) as Fila[] };
}

export async function listarPlanillas(db: SupabaseClient): Promise<Planilla[]> {
  return datos(await db.from("planillas").select("*").order("posicion")) as Planilla[];
}
