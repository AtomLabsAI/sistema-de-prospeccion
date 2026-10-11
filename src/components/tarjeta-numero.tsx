"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { EstadoNumero } from "@/lib/whatsapp";
import { claseBoton, Estado } from "./ui";

const TEXTO: Record<EstadoNumero["conexion"], string> = {
  conectado: "Conectado",
  esperando_qr: "Esperando que escanees el QR",
  iniciando: "Iniciando…",
  desconectado: "Se desconectó",
  apagado: "Sin conectar",
};

// Tarjeta de un número de WhatsApp: muestra su estado en vivo y, cuando hace
// falta, el QR para vincularlo.
export function TarjetaNumero({
  inicial,
  nombre,
  habilitado,
  children,
}: {
  inicial: EstadoNumero;
  nombre: string;
  habilitado: boolean; // false hasta que se acepta el aviso de riesgo
  children?: ReactNode;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(inicial);
  const [error, setError] = useState("");
  const [lanzado, setLanzado] = useState(false);
  const { numero } = inicial;
  const enProceso = estado.conexion === "iniciando" || estado.conexion === "esperando_qr";

  useEffect(() => {
    let vivo = true;
    const id = setInterval(
      async () => {
        try {
          const r = await fetch(`/api/whatsapp/${numero}`, { cache: "no-store" });
          if (!r.ok || !vivo) return;
          const nuevo: EstadoNumero = await r.json();
          setEstado(nuevo);
          // Ya respondió: si después se apaga, no es porque no haya arrancado.
          if (nuevo.conexion !== "iniciando" && nuevo.conexion !== "apagado") setLanzado(false);
        } catch {
          // El dashboard se está reiniciando: se reintenta en la próxima vuelta.
        }
      },
      enProceso ? 2000 : 10000,
    );
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [numero, enProceso]);

  // Al conectarse, el resto de la pantalla (la cola) tiene que enterarse.
  useEffect(() => {
    if (estado.conexion === "conectado" && inicial.conexion !== "conectado") router.refresh();
  }, [estado.conexion, inicial.conexion, router]);

  async function conectar() {
    setError("");
    setEstado((previo) => ({ ...previo, conexion: "iniciando" }));
    try {
      const r = await fetch(`/api/whatsapp/${numero}`, { method: "POST" });
      const cuerpo = await r.json();
      if (r.ok) {
        setEstado(cuerpo);
        setLanzado(true);
      } else {
        setError(cuerpo.error ?? "No se pudo iniciar.");
        setEstado(inicial);
      }
    } catch {
      setError("No se pudo iniciar. ¿Está corriendo el dashboard?");
      setEstado(inicial);
    }
  }

  return (
    <div className="flex min-w-56 flex-1 flex-col gap-3 rounded-2xl bg-superficie px-5 py-4">
      <p className="text-[13px] font-extrabold tracking-wider uppercase">{nombre}</p>
      <Estado listo={estado.conexion === "conectado"}>{TEXTO[estado.conexion]}</Estado>

      {estado.conexion === "esperando_qr" && estado.qr && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- el QR llega como imagen en línea */}
          <img
            src={estado.qr}
            alt="Código QR para vincular este número"
            className="w-56 rounded-lg bg-white p-2"
          />
          <p className="text-[13px] text-tenue">
            En el celular: WhatsApp, Dispositivos vinculados, Vincular un dispositivo. El código se
            renueva solo cada minuto.
          </p>
        </div>
      )}

      {estado.conexion === "conectado" && children}

      {(estado.conexion === "apagado" || estado.conexion === "desconectado") && (
        <button
          type="button"
          onClick={conectar}
          disabled={!habilitado}
          className={claseBoton("secundario", "self-start")}
        >
          {estado.vinculado ? "Reconectar" : "Conectar"}
        </button>
      )}
      {error && <p className="text-sm font-semibold text-naranja">{error}</p>}
      {/* Se tocó Conectar y el asistente no llegó a arrancar. */}
      {lanzado && !error && estado.conexion === "apagado" && (
        <p className="text-sm font-semibold text-naranja">
          No arrancó. Probá de nuevo; si sigue igual, decile a Claude: &quot;el WhatsApp número{" "}
          {numero} no arranca&quot;.
        </p>
      )}
    </div>
  );
}
