import fs from "node:fs";
import path from "node:path";

// Captura o GIF de un paso de una guía. Si el archivo todavía no está en
// public/guias/, no muestra nada (ver public/guias/LEEME.md).
export function Captura({ archivo, alt }: { archivo: string; alt: string }) {
  if (!fs.existsSync(path.join(process.cwd(), "public", "guias", archivo))) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- puede ser un GIF
    <img
      src={`/guias/${archivo}`}
      alt={alt}
      className="w-full max-w-xl rounded-xl border border-linea"
    />
  );
}
