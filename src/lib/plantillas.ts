import type { Prospecto } from "./tipos";

// Reemplaza lo que va entre corchetes con los datos del prospecto.
// Variables: [negocio], [ciudad], [rubro].
export function completar(texto: string, p: Pick<Prospecto, "nombre" | "ciudad" | "rubro">): string {
  return texto
    .replaceAll("[negocio]", p.nombre)
    .replaceAll("[ciudad]", p.ciudad ?? "")
    .replaceAll("[rubro]", p.rubro ?? "");
}
