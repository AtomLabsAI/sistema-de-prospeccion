import "server-only";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

// WhatsApp se conecta con el WhatsApp Assistant (API NO oficial, basada en
// Baileys). Cada número es una instancia aparte del asistente, con su propia
// carpeta y su propio puerto, y solo escucha en esta compu (127.0.0.1).

export const NUMEROS = [1, 2, 3] as const;
export type Numero = (typeof NUMEROS)[number];

export const NOMBRE_NUMERO: Record<Numero, string> = {
  1: "Número 1 · WhatsApp",
  2: "Número 2 · WhatsApp",
  3: "Número 3 · Business",
};

export type Conexion = "apagado" | "iniciando" | "esperando_qr" | "conectado" | "desconectado";

export type EstadoNumero = {
  numero: Numero;
  vinculado: boolean; // ya se escaneó el QR alguna vez
  conexion: Conexion;
  qr: string | null; // imagen del QR lista para mostrar
};

const PUERTO_BASE = 3850;
const carpeta = (n: Numero) => path.join(process.cwd(), ".whatsapp", `numero-${n}`);
const direccion = (n: Numero) => `http://127.0.0.1:${PUERTO_BASE + n}`;
const archivoPid = (n: Numero) => path.join(carpeta(n), "asistente.pid");

export function esNumero(valor: unknown): valor is Numero {
  return valor === 1 || valor === 2 || valor === 3;
}

type Salud = { connection: string; qrPending: boolean };

async function salud(n: Numero): Promise<Salud | null> {
  try {
    const r = await fetch(`${direccion(n)}/health`, { signal: AbortSignal.timeout(1500) });
    return r.ok ? ((await r.json()) as Salud) : null;
  } catch {
    return null; // el asistente de ese número no está corriendo
  }
}

function token(n: Numero): string | null {
  try {
    return fs.readFileSync(path.join(carpeta(n), "data", "bridge-token"), "utf8").trim();
  } catch {
    return null;
  }
}

function vinculado(n: Numero): boolean {
  return fs.existsSync(path.join(carpeta(n), "auth", "creds.json"));
}

// El asistente tarda unos segundos en arrancar después de lanzarlo.
function recienLanzado(n: Numero): boolean {
  const lanzado = fs.statSync(archivoPid(n), { throwIfNoEntry: false })?.mtimeMs ?? 0;
  return Date.now() - lanzado < 20000;
}

function conexionDe(s: Salud | null, n: Numero): Conexion {
  if (!s) return recienLanzado(n) ? "iniciando" : "apagado";
  if (s.connection === "open") return "conectado";
  if (s.connection === "connecting" && s.qrPending) return "esperando_qr";
  if (s.connection === "connecting" || s.connection === "starting") return "iniciando";
  return "desconectado";
}

async function qr(n: Numero): Promise<string | null> {
  const t = token(n);
  if (!t) return null;
  try {
    const r = await fetch(`${direccion(n)}/qr`, {
      headers: { Authorization: `Bearer ${t}` },
      signal: AbortSignal.timeout(1500),
    });
    if (!r.ok) return null;
    const { code } = (await r.json()) as { code: string };
    return await QRCode.toDataURL(code, { margin: 1, width: 320 });
  } catch {
    return null;
  }
}

export async function estadoNumero(n: Numero): Promise<EstadoNumero> {
  const conexion = conexionDe(await salud(n), n);
  return {
    numero: n,
    vinculado: vinculado(n),
    conexion,
    qr: conexion === "esperando_qr" ? await qr(n) : null,
  };
}

// Estado de los 3 números. Si un número ya vinculado quedó apagado (por
// ejemplo, después de reiniciar la compu) lo vuelve a levantar solo.
export async function estadoNumeros(opciones: { levantar?: boolean } = {}): Promise<EstadoNumero[]> {
  const estados = await Promise.all(NUMEROS.map(estadoNumero));
  if (opciones.levantar) {
    for (const e of estados) {
      if (e.vinculado && e.conexion === "apagado") {
        await iniciar(e.numero);
        e.conexion = "iniciando";
      }
    }
  }
  return estados;
}

export function detener(n: Numero): void {
  try {
    process.kill(Number(fs.readFileSync(archivoPid(n), "utf8")));
  } catch {
    // No había proceso, o ya estaba cerrado.
  }
  fs.rmSync(archivoPid(n), { force: true });
}

// Levanta el asistente de un número. Si no está vinculado, a los pocos
// segundos queda esperando el QR.
export async function iniciar(n: Numero): Promise<void> {
  const s = await salud(n);
  const conexion = conexionDe(s, n);
  // Ya está andando, o recién lanzado y todavía arrancando: no lanzar otro encima.
  if (conexion !== "desconectado" && conexion !== "apagado") return;
  // Con el QR vencido el asistente no pide otro: hay que reiniciarlo.
  if (s) detener(n);

  fs.mkdirSync(carpeta(n), { recursive: true });
  // El asistente corre como proceso aparte: Next no tiene que empaquetarlo.
  const entrada = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "node_modules/@diegomarvid/whatsapp-assistant/src/server.js",
  );
  const registro = fs.openSync(path.join(carpeta(n), "asistente.log"), "a");

  // Entorno limpio: sin las variables internas de Next.
  const entorno: Record<string, string | undefined> = {};
  for (const [clave, valor] of Object.entries(process.env)) {
    if (/^(NEXT_|__NEXT|TURBOPACK|NODE_OPTIONS$|NODE_ENV$|PORT$)/.test(clave)) continue;
    entorno[clave] = valor;
  }
  entorno.WA_STATE_DIR = carpeta(n);
  entorno.WA_BRIDGE_PORT = String(PUERTO_BASE + n);

  const hijo = spawn(process.execPath, [entrada], {
    cwd: carpeta(n),
    env: entorno as NodeJS.ProcessEnv,
    detached: true,
    stdio: ["ignore", registro, registro],
    windowsHide: true,
  });
  hijo.unref();
  fs.closeSync(registro);
  if (hijo.pid) fs.writeFileSync(archivoPid(n), String(hijo.pid));
}

// Desvincula un número: apaga su asistente y borra la sesión guardada.
export function desvincular(n: Numero): void {
  detener(n);
  fs.rmSync(carpeta(n), { recursive: true, force: true });
}

// Deja solo dígitos, con código de país. WhatsApp no usa el "+".
export function normalizarTelefono(telefono: string | null | undefined): string | null {
  let digitos = (telefono ?? "").replace(/\D/g, "").replace(/^00/, "");
  if (digitos.length < 10) return null; // sin código de país no se puede enviar
  // Argentina: los celulares en WhatsApp llevan un 9 después del 54.
  if (digitos.startsWith("54") && digitos[2] !== "9") digitos = `549${digitos.slice(2)}`;
  return digitos;
}

export type Envio = { ok: true } | { ok: false; error: string; incierto?: boolean };

// Manda UN mensaje de texto. `idPedido` evita duplicados: si el mismo pedido
// llega dos veces, el asistente no lo manda de nuevo.
export async function enviarWhatsApp(
  n: Numero,
  telefono: string,
  texto: string,
  idPedido: string,
): Promise<Envio> {
  const t = token(n);
  if (!t) return { ok: false, error: "Ese número todavía no está conectado." };
  let r: Response;
  try {
    r = await fetch(`${direccion(n)}/messages/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ jid: `${telefono}@s.whatsapp.net`, text: texto, requestId: idPedido }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    // No sabemos si llegó a salir: no se reintenta solo.
    return {
      ok: false,
      incierto: true,
      error: "Se cortó la conexión con el asistente. Mirá en el celular si el mensaje salió.",
    };
  }
  if (r.status === 200) return { ok: true };
  if (r.status === 202) {
    return {
      ok: false,
      incierto: true,
      error: "El envío quedó a medias. Mirá en el celular si el mensaje salió.",
    };
  }
  if (r.status === 503) return { ok: false, error: "Ese número se desconectó. Volvé a conectarlo." };
  const cuerpo = (await r.json().catch(() => null)) as { message?: string; error?: string } | null;
  return { ok: false, error: cuerpo?.message || cuerpo?.error || "WhatsApp rechazó el mensaje." };
}
