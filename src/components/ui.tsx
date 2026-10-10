import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(" ");
}

// ---------- Botones ----------
const VARIANTES = {
  primario: "bg-crema text-fondo hover:bg-white",
  secundario: "border border-crema text-crema hover:bg-crema/10",
  punteado: "border border-dashed border-tenue text-crema hover:bg-crema/10",
} as const;
export type Variante = keyof typeof VARIANTES;

export function claseBoton(variante: Variante = "primario", extra?: string): string {
  return cx(
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-colors",
    "disabled:cursor-not-allowed disabled:border disabled:border-tenue disabled:bg-linea disabled:text-tenue",
    VARIANTES[variante],
    extra,
  );
}

export function BotonLink({
  href,
  variante,
  className,
  children,
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: ReactNode;
}) {
  const externo = href.startsWith("http");
  return externo ? (
    <a href={href} target="_blank" rel="noreferrer" className={claseBoton(variante, className)}>
      {children}
    </a>
  ) : (
    <Link href={href} className={claseBoton(variante, className)}>
      {children}
    </Link>
  );
}

// ---------- Estructura ----------
export function Encabezado({
  sobre,
  titulo,
  children,
}: {
  sobre: string;
  titulo: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold tracking-[0.14em] uppercase">{sobre}</p>
        <h1 className="mt-1.5 text-4xl leading-tight font-black tracking-tight">{titulo}</h1>
      </div>
      {children}
    </header>
  );
}

export function Tarjeta({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("rounded-2xl bg-superficie p-6", className)} {...props} />;
}

export function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-extrabold tracking-tight">{children}</h2>;
}

export function Nota({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cx("text-[13px] text-tenue", className)}>{children}</p>;
}

const TONOS = {
  celeste: "border-celeste bg-celeste-suave",
  naranja: "border-naranja bg-naranja-suave",
  neutro: "border-tenue text-tenue",
} as const;

export function Etiqueta({
  tono = "celeste",
  children,
}: {
  tono?: keyof typeof TONOS;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase",
        TONOS[tono],
      )}
    >
      {children}
    </span>
  );
}

// Tilde celeste si está listo, círculo vacío si falta.
export function Estado({ listo, children }: { listo: boolean; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-bold">
      {listo ? (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#87abdb" />
          <path
            d="M7.5 12.5l3 3 6-6.5"
            stroke="#1c1b1b"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#b9aeab" strokeWidth="2" />
        </svg>
      )}
      {children}
    </span>
  );
}

// Barra de avance "2/3" contra una meta.
export function Avance({ nombre, valor, meta }: { nombre: string; valor: number; meta: number }) {
  const ancho = meta > 0 ? Math.min(100, Math.round((valor / meta) * 100)) : 0;
  return (
    <div className="min-w-44 flex-1">
      <div className="flex justify-between gap-3 text-sm font-semibold">
        <span>{nombre}</span>
        <span className="tabular-nums">
          {valor}/{meta}
        </span>
      </div>
      <div aria-hidden="true" className="mt-1.5 h-2 rounded bg-linea">
        <div className="h-2 rounded bg-celeste" style={{ width: `${ancho}%` }} />
      </div>
    </div>
  );
}

export function Dato({ nombre, children }: { nombre: string; children: ReactNode }) {
  return (
    <div className="min-w-44 flex-1 rounded-2xl bg-superficie px-5 py-4">
      <p className="text-[13px] font-semibold text-tenue">{nombre}</p>
      <p className="text-3xl font-black tracking-tight tabular-nums">{children}</p>
    </div>
  );
}

// ---------- Formularios ----------
export const claseCampo =
  "min-h-11 w-full rounded-[10px] border border-tenue bg-fondo px-3.5 text-[15px] text-crema placeholder:text-tenue/70";

export function Campo({
  etiqueta,
  className,
  ...props
}: { etiqueta: string } & ComponentProps<"input">) {
  return (
    <label className={cx("flex flex-col gap-1 text-[13px] font-bold", className)}>
      {etiqueta}
      <input className={cx(claseCampo, "font-normal")} {...props} />
    </label>
  );
}

// ---------- Guías paso a paso ----------
export function Pasos({ children }: { children: ReactNode }) {
  return <ol className="flex flex-col gap-4">{children}</ol>;
}

export function Paso({ n, titulo, children }: { n: number; titulo: string; children?: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-crema text-sm font-extrabold text-fondo">
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-bold">{titulo}</p>
        {children}
      </div>
    </li>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-linea px-4 py-8 text-center text-sm text-tenue">
      {children}
    </p>
  );
}
