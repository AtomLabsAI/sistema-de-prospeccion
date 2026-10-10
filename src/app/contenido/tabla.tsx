"use client";

import { useTransition } from "react";
import { agregarFila, borrarColumna, borrarFila, guardarCelda } from "@/acciones/contenido";
import { claseBoton, Vacio } from "@/components/ui";
import { rangoSemana } from "@/lib/fechas";
import type { Columna, Fila, ValorCelda } from "@/lib/tipos";

const TIPO: Record<Columna["tipo"], string> = {
  number: "Número",
  checkbox: "Casilla",
  text: "Texto",
  date: "Fecha",
};

const celda = "border-b border-linea px-2.5 py-2";
const entrada =
  "min-h-11 w-full min-w-20 rounded-lg border border-linea bg-transparent px-2 hover:border-tenue focus:bg-fondo";
const botonChico =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-lg text-tenue hover:bg-crema/10 hover:text-crema";

export function TablaPlanilla({
  planillaId,
  columnas,
  filas,
}: {
  planillaId: string;
  columnas: Columna[];
  filas: Fila[];
}) {
  const [guardando, correr] = useTransition();

  return (
    <section className="flex flex-col rounded-2xl bg-superficie pt-2">
      {columnas.length === 0 ? (
        <div className="p-4">
          <Vacio>Esta planilla todavía no tiene columnas. Agregá la primera acá abajo.</Vacio>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left align-bottom">
                <th scope="col" className={`${celda} pl-6 text-xs tracking-wider uppercase`}>
                  Semana
                </th>
                {columnas.map((c) => (
                  <th key={c.id} scope="col" className={celda}>
                    <div className="flex items-end justify-between gap-1">
                      <span>
                        {c.nombre}
                        <span className="block text-xs font-medium text-tenue">
                          {TIPO[c.tipo]}
                          {c.meta != null ? ` · meta ${c.meta}` : ""}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Borrar la columna ${c.nombre}`}
                        title="Borrar columna"
                        className={botonChico}
                        onClick={() => {
                          if (confirm(`¿Borrar la columna "${c.nombre}" con todos sus valores?`)) {
                            correr(() => borrarColumna(c.id));
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
                <th scope="col" className={`${celda} w-11 pr-4`}>
                  <span className="sr-only">Borrar fila</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <th scope="row" className={`${celda} pl-6 text-left whitespace-nowrap`}>
                    {f.etiqueta}
                    {f.inicio_periodo && (
                      <span className="block text-xs font-medium text-tenue">
                        {rangoSemana(f.inicio_periodo)}
                      </span>
                    )}
                  </th>
                  {columnas.map((c) => (
                    <td key={c.id} className={celda}>
                      <Celda
                        // Si el valor cambia en la base, la celda se vuelve a armar con el nuevo.
                        key={String(f.valores[c.id] ?? "")}
                        columna={c}
                        etiqueta={`${c.nombre}, ${f.etiqueta}`}
                        valor={f.valores[c.id] ?? null}
                        guardar={(valor) => correr(() => guardarCelda(f.id, c.id, valor))}
                      />
                    </td>
                  ))}
                  <td className={`${celda} pr-4`}>
                    <button
                      type="button"
                      aria-label={`Borrar la semana ${f.etiqueta}`}
                      title="Borrar semana"
                      className={botonChico}
                      onClick={() => {
                        if (confirm(`¿Borrar la semana ${f.etiqueta}?`)) correr(() => borrarFila(f.id));
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <button
          type="button"
          disabled={guardando}
          className={claseBoton("punteado")}
          onClick={() => correr(() => agregarFila(planillaId))}
        >
          + Nueva semana
        </button>
        <p role="status" className="text-[13px] text-tenue">
          {guardando ? "Guardando…" : "Los cambios se guardan solos al salir de cada celda."}
        </p>
      </div>
    </section>
  );
}

function Celda({
  columna,
  etiqueta,
  valor,
  guardar,
}: {
  columna: Columna;
  etiqueta: string;
  valor: ValorCelda;
  guardar: (valor: ValorCelda) => void;
}) {
  if (columna.tipo === "checkbox") {
    return (
      <input
        type="checkbox"
        aria-label={etiqueta}
        defaultChecked={valor === true}
        onChange={(e) => guardar(e.target.checked)}
        className="h-5.5 w-5.5 accent-crema"
      />
    );
  }
  const texto = valor == null ? "" : String(valor);
  return (
    <input
      type={columna.tipo === "number" ? "number" : columna.tipo === "date" ? "date" : "text"}
      aria-label={etiqueta}
      defaultValue={texto}
      step="any"
      className={`${entrada} ${columna.tipo === "number" ? "text-right tabular-nums" : ""}`}
      onBlur={(e) => {
        const nuevo = e.target.value.trim();
        if (nuevo === texto) return;
        if (columna.tipo !== "number") guardar(nuevo || null);
        else if (nuevo === "" || !Number.isNaN(Number(nuevo))) guardar(nuevo === "" ? null : Number(nuevo));
      }}
    />
  );
}
