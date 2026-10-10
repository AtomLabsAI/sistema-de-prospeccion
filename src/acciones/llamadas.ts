"use server";

import { revalidatePath } from "next/cache";
import { bien, falla, mal, texto } from "@/lib/formularios";
import { datos as leer, exigirBase } from "@/lib/supabase";
import type { Resultado } from "@/lib/tipos";

export async function crearLlamada(_: Resultado, datos: FormData): Promise<Resultado> {
  const prospecto = texto(datos, "prospecto");
  const fecha = texto(datos, "fecha");
  if (!prospecto || !fecha) return mal("Completá con quién es la llamada y la fecha.");
  try {
    leer(
      await exigirBase()
        .from("llamadas")
        .insert({
          prospecto,
          fecha,
          hora: texto(datos, "hora") || null,
          canal: texto(datos, "canal") || null,
          nota: texto(datos, "nota") || null,
        })
        .select("id"),
    );
    revalidatePath("/", "layout");
    return bien(`Llamada con ${prospecto} agendada.`);
  } catch (e) {
    return falla(e);
  }
}

export async function borrarLlamada(_: Resultado, datos: FormData): Promise<Resultado> {
  try {
    leer(await exigirBase().from("llamadas").delete().eq("id", texto(datos, "id")).select("id"));
    revalidatePath("/", "layout");
    return bien("Llamada borrada.");
  } catch (e) {
    return falla(e);
  }
}
