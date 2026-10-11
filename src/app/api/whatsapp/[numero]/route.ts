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
  // El asistente guarda sus datos con el SQLite que Node trae desde la 22.13.
  const [mayor, menor] = process.versions.node.split(".").map(Number);
  if (mayor < 22 || (mayor === 22 && menor < 13)) {
    return NextResponse.json(
      {
        error: `WhatsApp necesita Node 22.13 o más y esta compu tiene la ${process.versions.node}. Instalá la última desde nodejs.org, cerrá el dashboard y volvé a abrirlo.`,
      },
      { status: 400 },
    );
  }
  await iniciar(n);
  return NextResponse.json(await estadoNumero(n));
}
