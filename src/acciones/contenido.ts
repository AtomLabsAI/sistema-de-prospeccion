"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { semanaDe, sumarDias } from "@/lib/fechas";
import { bien, falla, mal, texto } from "@/lib/formularios";
import { datos as leer, exigirBase } from "@/lib/supabase";
import type { Fila, Resultado, TipoColumna, ValorCelda } from "@/lib/tipos";

const refrescar = () => revalidatePath("/", "layout");
const TIPOS: TipoColumna[] = ["number", "checkbox", "text", "date"];

async function nuevaPlanilla(nombre: string): Promise<string> {
  const db = exigirBase();
  const ultima = leer(
    await db.from("planillas").select("posicion").order("posicion", { ascending: false }).limit(1),
  ) as { posicion: number }[];
  const [planilla] = leer(
    await db
      .from("planillas")
      .insert({ nombre, posicion: (ultima[0]?.posicion ?? 0) + 1 })
      .select("id"),
  ) as { id: string }[];
  return planilla.id;
}

export async function crearPlanilla(_: Resultado, datos: FormData): Promise<Resultado> {
  let id: string;
  try {
    id = await nuevaPlanilla(texto(datos, "nombre") || "Nueva planilla");
  } catch (e) {
    return falla(e);
  }
  refrescar();
  redirect(`/contenido?p=${id}`);
}

// Planilla de arranque, para no empezar con la hoja en blanco.
export async function crearPlanillaEjemplo(): Promise<Resultado> {
  let id: string;
  try {
    const db = exigirBase();
    id = await nuevaPlanilla("Instagram");
    leer(
      await db
        .from("planilla_columnas")
        .insert([
          { planilla_id: id, nombre: "Posts", tipo: "number", meta: 3, posicion: 1 },
          { planilla_id: id, nombre: "Reels", tipo: "number", meta: 2, posicion: 2 },
          { planilla_id: id, nombre: "Historias", tipo: "number", meta: 5, posicion: 3 },
          { planilla_id: id, nombre: "Views", tipo: "number", meta: null, posicion: 4 },
          { planilla_id: id, nombre: "Nota", tipo: "text", meta: null, posicion: 5 },
        ])
        .select("id"),
    );
    const semana = semanaDe(new Date());
    leer(
      await db
        .from("planilla_filas")
        .insert({ planilla_id: id, etiqueta: semana.etiqueta, inicio_periodo: semana.lunes })
        .select("id"),
    );
  } catch (e) {
    return falla(e);
  }
  refrescar();
  redirect(`/contenido?p=${id}`);
}

export async function borrarPlanilla(_: Resultado, datos: FormData): Promise<Resultado> {
  try {
    leer(await exigirBase().from("planillas").delete().eq("id", texto(datos, "id")).select("id"));
  } catch (e) {
    return falla(e);
  }
  refrescar();
  redirect("/contenido");
}

export async function agregarColumna(_: Resultado, datos: FormData): Promise<Resultado> {
  const nombre = texto(datos, "nombre");
  const tipo = texto(datos, "tipo") as TipoColumna;
  const meta = texto(datos, "meta");
  if (!nombre) return mal("Ponele un nombre a la columna.");
  if (!TIPOS.includes(tipo)) return mal("Tipo de columna inválido.");
  try {
    const db = exigirBase();
    const planillaId = texto(datos, "planilla");
    const ultima = leer(
      await db
        .from("planilla_columnas")
        .select("posicion")
        .eq("planilla_id", planillaId)
        .order("posicion", { ascending: false })
        .limit(1),
    ) as { posicion: number }[];
    leer(
      await db
        .from("planilla_columnas")
        .insert({
          planilla_id: planillaId,
          nombre,
          tipo,
          meta: tipo === "number" && meta ? Number(meta) : null,
          posicion: (ultima[0]?.posicion ?? 0) + 1,
        })
        .select("id"),
    );
    refrescar();
    return bien(`Columna "${nombre}" agregada.`);
  } catch (e) {
    return falla(e);
  }
}

export async function borrarColumna(id: string): Promise<void> {
  leer(await exigirBase().from("planilla_columnas").delete().eq("id", id).select("id"));
  refrescar();
}

// Agrega la semana actual; si ya está, la siguiente.
export async function agregarFila(planillaId: string): Promise<void> {
  const db = exigirBase();
  const filas = leer(
    await db
      .from("planilla_filas")
      .select("inicio_periodo")
      .eq("planilla_id", planillaId)
      .not("inicio_periodo", "is", null)
      .order("inicio_periodo", { ascending: false })
      .limit(1),
  ) as { inicio_periodo: string }[];
  let lunes = semanaDe(new Date()).lunes;
  const ultimo = filas[0]?.inicio_periodo;
  if (ultimo && ultimo >= lunes) lunes = sumarDias(ultimo, 7);
  const [a, m, d] = lunes.split("-").map(Number);
  leer(
    await db
      .from("planilla_filas")
      .insert({
        planilla_id: planillaId,
        etiqueta: semanaDe(new Date(a, m - 1, d)).etiqueta,
        inicio_periodo: lunes,
      })
      .select("id"),
  );
  refrescar();
}

export async function borrarFila(id: string): Promise<void> {
  leer(await exigirBase().from("planilla_filas").delete().eq("id", id).select("id"));
  refrescar();
}

export async function guardarCelda(filaId: string, columnaId: string, valor: ValorCelda): Promise<void> {
  const db = exigirBase();
  const fila = leer(
    await db.from("planilla_filas").select("valores").eq("id", filaId).maybeSingle(),
  ) as Pick<Fila, "valores"> | null;
  if (!fila) return;
  const valores = { ...fila.valores };
  if (valor === null || valor === "") delete valores[columnaId];
  else valores[columnaId] = valor;
  leer(await db.from("planilla_filas").update({ valores }).eq("id", filaId).select("id"));
  refrescar();
}
