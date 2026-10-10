"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

const SECCIONES = [
  { href: "/", nombre: "Inicio" },
  { href: "/conexiones", nombre: "Conexiones" },
  { href: "/prospectos", nombre: "Prospectos" },
  { href: "/whatsapp", nombre: "WhatsApp", noOficial: true },
  { href: "/mail", nombre: "Mail" },
  { href: "/ads", nombre: "Ads" },
  { href: "/contenido", nombre: "Contenido" },
  { href: "/llamadas", nombre: "Llamadas" },
  { href: "/crm", nombre: "CRM", bloqueado: true },
];

export function Menu() {
  const ruta = usePathname();
  return (
    <nav
      aria-label="Secciones"
      className="flex flex-none flex-col gap-1 border-b border-linea bg-superficie px-4 py-5 md:w-56 md:border-r md:border-b-0 md:py-6"
    >
      <Image
        src="/logo-atom.svg"
        alt="Atom ai"
        width={104}
        height={65}
        priority
        className="mb-4 ml-2 h-auto w-26"
      />
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {SECCIONES.map((s) => {
          const activa = s.href === "/" ? ruta === "/" : ruta.startsWith(s.href);
          return (
            <li key={s.href} className="flex-none">
              <Link
                href={s.href}
                aria-current={activa ? "page" : undefined}
                className={cx(
                  "flex min-h-11 items-center justify-between gap-2 rounded-[10px] px-3 text-sm",
                  activa
                    ? "bg-crema font-bold text-fondo"
                    : cx("font-semibold hover:bg-crema/10", s.bloqueado && "text-tenue"),
                )}
              >
                {s.nombre}
                {s.noOficial && (
                  <span className="rounded-full border border-naranja bg-naranja-suave px-2 py-0.5 text-[10px] font-extrabold tracking-wider whitespace-nowrap text-crema uppercase">
                    No oficial
                  </span>
                )}
                {s.bloqueado && <Candado className="h-4 w-4" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Candado({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
