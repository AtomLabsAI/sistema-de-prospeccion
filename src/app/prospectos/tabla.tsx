"use client";

import { useState } from "react";
import { accionSobreSeleccion } from "@/acciones/prospectos";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { Etiqueta } from "@/components/ui";
import type { EstadoProspecto, Prospecto } from "@/lib/tipos";

const ESTADO: Record<EstadoProspecto, { nombre: string; tono: "celeste" | "naranja" | "neutro" }> = {
  nuevo: { nombre: "Nuevo", tono: "celeste" },
  en_cola: { nombre: "En cola", tono: "naranja" },
  contactado: { nombre: "Contactado", tono: "neutro" },
};

const celda = "border-b border-linea px-2.5 py-3";

export function TablaProspectos({ prospectos }: { prospectos: Prospecto[] }) {
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());
  // Se cuenta solo lo que sigue en pantalla (después de borrar o filtrar).
  const cantidad = prospectos.filter((p) => elegidos.has(p.id)).length;
  const todos = cantidad === prospectos.length;

  const alternar = (id: string) =>
    setElegidos((previo) => {
      const nuevo = new Set(previo);
      if (!nuevo.delete(id)) nuevo.add(id);
      return nuevo;
    });

  return (
    <FormAccion
      accion={accionSobreSeleccion}
      className="flex flex-col rounded-2xl bg-superficie pt-2"
      claseMensaje="mx-6 mb-4 w-auto"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs tracking-wider uppercase">
              <th scope="col" className={`${celda} w-11 pl-6`}>
                <input
                  type="checkbox"
                  aria-label="Elegir todos"
                  checked={todos}
                  onChange={() => setElegidos(todos ? new Set() : new Set(prospectos.map((p) => p.id)))}
                  className="h-5 w-5 accent-crema"
                />
              </th>
              <th scope="col" className={celda}>Negocio</th>
              <th scope="col" className={celda}>Teléfono</th>
              <th scope="col" className={celda}>Mail</th>
              <th scope="col" className={celda}>Web</th>
              <th scope="col" className={`${celda} text-right`}>Rating</th>
              <th scope="col" className={`${celda} pr-6`}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {prospectos.map((p) => (
              <tr key={p.id}>
                <td className={`${celda} py-1.5 pl-6`}>
                  <input
                    type="checkbox"
                    name="id"
                    value={p.id}
                    aria-label={`Elegir ${p.nombre}`}
                    checked={elegidos.has(p.id)}
                    onChange={() => alternar(p.id)}
                    className="h-5 w-5 accent-crema"
                  />
                </td>
                <td className={`${celda} font-bold`}>
                  {p.maps_url ? (
                    <a href={p.maps_url} target="_blank" rel="noreferrer" className="hover:underline">
                      {p.nombre}
                    </a>
                  ) : (
                    p.nombre
                  )}
                  <span className="block text-xs font-normal text-tenue">
                    {[p.rubro, p.ciudad].filter(Boolean).join(" · ")}
                  </span>
                </td>
                <td className={`${celda} whitespace-nowrap tabular-nums`}>{p.telefono ?? "Sin teléfono"}</td>
                <td className={celda}>{p.email ?? "Sin mail"}</td>
                <td className={celda}>
                  {p.sitio_web ? (
                    <a href={p.sitio_web} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      Ver
                    </a>
                  ) : (
                    "No"
                  )}
                </td>
                <td className={`${celda} text-right tabular-nums`}>
                  {p.rating != null ? p.rating.toLocaleString("es") : ""}
                </td>
                <td className={`${celda} pr-6`}>
                  <Etiqueta tono={ESTADO[p.estado].tono}>{ESTADO[p.estado].nombre}</Etiqueta>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <p className="font-extrabold">
          {cantidad === 1 ? "1 seleccionado" : `${cantidad} seleccionados`}
        </p>
        <div className="flex flex-wrap gap-2">
          <BotonEnviar name="intencion" value="whatsapp" enCurso="Armando la cola…" disabled={cantidad === 0}>
            Mandar a la cola de WhatsApp
          </BotonEnviar>
          <BotonEnviar
            name="intencion"
            value="mail"
            variante="secundario"
            enCurso="Armando la cola…"
            disabled={cantidad === 0}
          >
            Mandar a la cola de Mail
          </BotonEnviar>
          <BotonEnviar
            name="intencion"
            value="borrar"
            variante="secundario"
            enCurso="Borrando…"
            disabled={cantidad === 0}
          >
            Borrar
          </BotonEnviar>
        </div>
      </div>
    </FormAccion>
  );
}
