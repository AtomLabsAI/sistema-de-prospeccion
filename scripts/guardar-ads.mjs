// Guarda en tu base la última foto de tus campañas de Meta Ads.
// Lo usa Claude con el comando /actualizar-ads.
//
// Uso: npm run ads:guardar -- datos/ads.json
//
// Formato del archivo:
// {
//   "desde": "2026-10-03", "hasta": "2026-10-10", "moneda": "UYU",
//   "campanas": [
//     { "id": "123", "nombre": "Mensajes octubre", "estado": "ACTIVE", "gasto": 4120.5, "resultados": 21 }
//   ]
// }
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const salir = (mensaje) => {
  console.error(mensaje);
  process.exit(1);
};

const archivo = process.argv[2];
if (!archivo) salir("Falta el archivo. Uso: npm run ads:guardar -- datos/ads.json");

let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "config.local.json"), "utf8"));
} catch {
  salir("No encuentro config.local.json. Primero conectá Supabase desde el dashboard.");
}
const { url, key } = config.supabase ?? {};
if (!url || !key) salir("Falta conectar Supabase desde el dashboard (Conexiones, Base de datos).");

let foto;
try {
  foto = JSON.parse(fs.readFileSync(archivo, "utf8"));
} catch {
  salir(`No pude leer ${archivo} como JSON.`);
}
if (!Array.isArray(foto.campanas)) salir('El archivo tiene que traer una lista "campanas".');

const ahora = new Date().toISOString();
const filas = foto.campanas.map((c, i) => {
  if (!c.nombre) salir(`A la campaña ${i + 1} le falta "nombre".`);
  const gasto = Number(c.gasto ?? 0);
  const resultados = Number(c.resultados ?? 0);
  if (Number.isNaN(gasto) || Number.isNaN(resultados)) {
    salir(`En "${c.nombre}", "gasto" y "resultados" tienen que ser números.`);
  }
  return {
    campana_id: c.id != null ? String(c.id) : null,
    nombre: String(c.nombre),
    estado: c.estado ? String(c.estado) : null,
    gasto,
    resultados,
    moneda: foto.moneda ?? null,
    desde: foto.desde ?? null,
    hasta: foto.hasta ?? null,
    actualizado_en: ahora,
  };
});

const db = createClient(url, key, { auth: { persistSession: false } });

// La foto nueva reemplaza a la anterior.
const borrado = await db.from("ads_campanas").delete().not("id", "is", null);
if (borrado.error) salir(`No pude limpiar la foto anterior: ${borrado.error.message}`);
if (filas.length > 0) {
  const guardado = await db.from("ads_campanas").insert(filas);
  if (guardado.error) salir(`No pude guardar las campañas: ${guardado.error.message}`);
}

console.log(`Listo: ${filas.length} campañas guardadas. Abrí la pantalla Ads del dashboard.`);
