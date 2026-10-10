import { NextResponse } from "next/server";
import { leerConfig } from "@/lib/config";
import { esNumero, estadoNumero, iniciar } from "@/lib/whatsapp";

type Contexto = { params: Promise<{ numero: string }> };

// Estado de un número (y su QR si está esperando que lo escaneen).
export async function GET(_: Request, { params }: Contexto) {
  const n = Number((await params).numero);
  if (!esNumero(n)) return NextResponse.json({ error: "Número inválido." }, { status: 404 });
  return NextResponse.json(await estadoNumero(n));
}

// Levanta el asistente de un número para poder vincularlo.
export async function POST(pedido: Request, { params }: Contexto) {
  // Solo se acepta desde el propio dashboard, no desde otra página abierta en el navegador.
  if (pedido.headers.get("sec-fetch-site") !== "same-origin") {
    return NextResponse.json({ error: "Pedido no permitido." }, { status: 403 });
  }
  const n = Number((await params).numero);
  if (!esNumero(n)) return NextResponse.json({ error: "Número inválido." }, { status: 404 });
  if (!leerConfig().whatsapp.aceptoRiesgo) {
    return NextResponse.json({ error: "Primero aceptá el aviso de riesgo." }, { status: 403 });
  }
  await iniciar(n);
  return NextResponse.json(await estadoNumero(n));
}
