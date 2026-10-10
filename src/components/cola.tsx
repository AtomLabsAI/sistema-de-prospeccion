"use client";

import { useState } from "react";
import { aprobarMensaje, editarMensaje, saltearMensaje } from "@/acciones/mensajes";
import type { MensajeConProspecto } from "@/lib/tipos";
import { BotonEnviar, FormAccion } from "./formulario";
import { claseBoton, claseCampo, cx, Etiqueta, Vacio } from "./ui";

// La cola de un canal. Cada mensaje se aprueba con su propio botón: no hay
// (ni tiene que haber) un "enviar todos".
export function Cola({
  mensajes,
  numeros,
}: {
  mensajes: MensajeConProspecto[];
  // Solo WhatsApp: los números conectados desde los que se puede enviar.
  numeros?: { numero: number; nombre: string }[];
}) {
  const [preferido, setNumero] = useState(0);
  // Si el número elegido se desconectó (o todavía no se eligió), va el primero conectado.
  const numero = numeros?.some((n) => n.numero === preferido) ? preferido : (numeros?.[0]?.numero ?? 0);
  if (mensajes.length === 0) {
    return <Vacio>La cola está vacía. Elegí prospectos en la pantalla Prospectos y mandalos acá.</Vacio>;
  }
  return (
    <div className="flex flex-col">
      {numeros && numeros.length > 0 && (
        <label className="mb-3 flex flex-col gap-1 self-start text-[13px] font-bold">
          Enviar desde
          <select
            value={numero}
            onChange={(e) => setNumero(Number(e.target.value))}
            className={cx(claseCampo, "font-normal")}
          >
            {numeros.map((n) => (
              <option key={n.numero} value={n.numero}>
                {n.nombre}
              </option>
            ))}
          </select>
        </label>
      )}
      {mensajes.map((m) => (
        <FilaCola key={m.id} mensaje={m} numero={numeros ? numero : undefined} />
      ))}
    </div>
  );
}

function FilaCola({ mensaje: m, numero }: { mensaje: MensajeConProspecto; numero?: number }) {
  const [editando, setEditando] = useState(false);
  const destino = m.canal === "whatsapp" ? m.prospectos?.telefono : m.prospectos?.email;
  // "error" = no sabemos si salió. No se puede reenviar: solo saltear.
  const dudoso = m.estado === "error";

  return (
    <div className="flex flex-col gap-3 border-t border-linea py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-bold">{m.prospectos?.nombre ?? "Prospecto borrado"}</p>
        <p className="text-sm text-tenue tabular-nums">{destino}</p>
        {dudoso && <Etiqueta tono="naranja">Revisar</Etiqueta>}
      </div>

      {m.error && <p className="text-sm font-semibold text-naranja">{m.error}</p>}

      {editando ? (
        <FormAccion accion={editarMensaje} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={m.id} />
          {m.canal === "mail" && (
            <input name="asunto" defaultValue={m.asunto ?? ""} aria-label="Asunto" className={claseCampo} />
          )}
          <textarea
            name="texto"
            defaultValue={m.texto}
            aria-label="Mensaje"
            rows={m.canal === "mail" ? 7 : 3}
            className={cx(claseCampo, "py-2.5 leading-normal")}
          />
          <div className="flex gap-2">
            <BotonEnviar variante="secundario">Guardar cambios</BotonEnviar>
            <button type="button" onClick={() => setEditando(false)} className={claseBoton("secundario")}>
              Cerrar
            </button>
          </div>
        </FormAccion>
      ) : (
        <div className="text-sm">
          {m.canal === "mail" && <p className="font-bold">{m.asunto}</p>}
          <p className="whitespace-pre-line">{m.texto}</p>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-2">
        {!dudoso && !editando && (
          <button type="button" onClick={() => setEditando(true)} className={claseBoton("secundario")}>
            Editar
          </button>
        )}
        <FormAccion accion={saltearMensaje} className="flex flex-col items-start gap-2" claseMensaje="w-auto">
          <input type="hidden" name="id" value={m.id} />
          <BotonEnviar variante="secundario" enCurso="Salteando…">
            {dudoso ? "Ya lo revisé, sacar de la cola" : "Saltear"}
          </BotonEnviar>
        </FormAccion>
        {!dudoso && (
          <FormAccion accion={aprobarMensaje} className="flex flex-col items-start gap-2" claseMensaje="w-auto">
            <input type="hidden" name="id" value={m.id} />
            {numero !== undefined && <input type="hidden" name="numero" value={numero} />}
            <BotonEnviar enCurso="Enviando…" disabled={numero === 0}>
              Aprobar y enviar
            </BotonEnviar>
          </FormAccion>
        )}
      </div>
    </div>
  );
}
