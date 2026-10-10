import type { ReactNode } from "react";
import { estadoBase } from "@/lib/supabase";
import { BotonLink, Tarjeta, Titulo } from "./ui";

// Muestra el contenido solo si la base está lista; si no, explica qué falta.
export async function PuertaBase({ children }: { children: ReactNode }) {
  const { estado, detalle } = await estadoBase();
  if (estado === "lista") return children;
  return (
    <Tarjeta className="flex flex-col items-start gap-3">
      <Titulo>
        {estado === "sin_configurar" && "Falta conectar la base de datos"}
        {estado === "sin_tablas" && "Falta crear las tablas"}
        {estado === "error" && "No pudimos entrar a tu base de datos"}
      </Titulo>
      <p className="max-w-prose">
        {estado === "sin_configurar" &&
          "Esta pantalla guarda sus datos en Supabase. Conectarla lleva unos 5 minutos y se hace una sola vez."}
        {estado === "sin_tablas" &&
          "La conexión con Supabase anda bien, pero todavía no están las tablas. Es el último paso de la guía."}
        {estado === "error" && `Supabase respondió: ${detalle}`}
      </p>
      <BotonLink href="/conexiones/supabase">Ir a la guía de Supabase</BotonLink>
    </Tarjeta>
  );
}
