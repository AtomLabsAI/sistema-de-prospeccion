import { Candado } from "@/components/menu";
import { Bloqueado } from "./bloqueado";

// El CRM se ve, pero está bloqueado: es parte de lo que ofrece Atom aparte de
// este template. El tablero de fondo es solo un dibujo, no hay datos detrás.
export default function Crm() {
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3 text-tenue">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] uppercase">Seguimiento de leads por etapas</p>
          <h1 className="mt-1.5 text-4xl leading-tight font-black tracking-tight">CRM</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-tenue px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
          <Candado className="h-3.5 w-3.5" /> Bloqueado
        </span>
      </header>
      <Bloqueado />
    </>
  );
}
