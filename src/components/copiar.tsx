"use client";

import { useState } from "react";
import { claseBoton, type Variante } from "./ui";

export function Copiar({
  texto,
  children = "Copiar",
  variante = "secundario",
}: {
  texto: string;
  children?: string;
  variante?: Variante;
}) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className={claseBoton(copiado ? "primario" : variante, "flex-none")}
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
    >
      {copiado ? "Copiado" : children}
    </button>
  );
}
