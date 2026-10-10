"use client";

import { useState } from "react";
import { Candado } from "@/components/menu";
import { claseBoton } from "@/components/ui";

// WhatsApp de Atom, con el mensaje ya escrito.
const CONTACTO =
  "https://wa.me/59892904766?text=" +
  encodeURIComponent("Hola Atom, quiero obtener el acceso al CRM del dashboard de prospección.");

const ETAPAS: [string, number][] = [
  ["Nuevo", 3],
  ["Contactado", 2],
  ["Llamada agendada", 2],
  ["Propuesta enviada", 1],
  ["Cerrado", 2],
];

export function Bloqueado() {
  const [abierto, setAbierto] = useState(false);
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#232222]">
      <div aria-hidden="true" className="flex min-h-[560px] flex-wrap items-start gap-3 p-5">
        {ETAPAS.map(([etapa, tarjetas]) => (
          <div key={etapa} className="flex min-w-40 flex-1 flex-col gap-2.5 rounded-xl bg-[#333130] p-3">
            <p className="text-xs font-extrabold tracking-wider text-tenue uppercase">{etapa}</p>
            {Array.from({ length: tarjetas }, (_, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-[10px] bg-[#3d3b3a] p-3">
                <span className="h-2.5 w-3/4 rounded bg-[#5a5655]" />
                <span className="h-2 w-1/2 rounded bg-[#4d4a49]" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-fondo/55 p-4"
      >
        <span className="flex flex-col items-center gap-2 rounded-2xl border border-tenue bg-superficie px-8 py-6">
          <Candado className="h-10 w-10" />
          <span className="text-[22px] font-black tracking-tight">CRM bloqueado</span>
          <span className="text-sm font-semibold text-tenue">Tocá para ver cómo obtener el acceso</span>
        </span>
      </button>

      {abierto && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-titulo"
            className="flex w-full max-w-md flex-col gap-3 rounded-2xl bg-superficie p-7"
          >
            <h2 id="crm-titulo" className="text-[26px] leading-tight font-black tracking-tight">
              Contactate con Atom para obtener el acceso
            </h2>
            <div aria-hidden="true" className="h-1 w-12 rounded bg-naranja" />
            <p>
              El CRM sigue cada lead por etapas, desde el primer mensaje hasta el cierre. No viene
              incluido en este template.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <a href={CONTACTO} target="_blank" rel="noreferrer" className={claseBoton("primario")}>
                Escribirle a Atom por WhatsApp
              </a>
              <button
                type="button"
                autoFocus
                onClick={() => setAbierto(false)}
                className={claseBoton("secundario")}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
