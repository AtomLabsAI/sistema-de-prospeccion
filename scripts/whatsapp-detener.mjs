// Apaga los asistentes de WhatsApp que el dashboard dejó corriendo.
// Uso: npm run whatsapp:detener
// No desvincula nada: la próxima vez que abras el dashboard se reconectan.
import fs from "node:fs";
import path from "node:path";

const raiz = path.join(process.cwd(), ".whatsapp");
let apagados = 0;

for (const carpeta of fs.existsSync(raiz) ? fs.readdirSync(raiz) : []) {
  const archivo = path.join(raiz, carpeta, "asistente.pid");
  if (!fs.existsSync(archivo)) continue;
  try {
    process.kill(Number(fs.readFileSync(archivo, "utf8")));
    apagados++;
  } catch {
    // Ya estaba apagado.
  }
  fs.rmSync(archivo, { force: true });
}

console.log(apagados === 0 ? "No había asistentes corriendo." : `Asistentes apagados: ${apagados}.`);
