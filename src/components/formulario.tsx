"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { Resultado } from "@/lib/tipos";
import { claseBoton, cx, type Variante } from "./ui";

export type Accion = (previo: Resultado, datos: FormData) => Promise<Resultado>;

// Formulario que llama a una acción del servidor y muestra el resultado abajo.
export function FormAccion({
  accion,
  className,
  claseMensaje,
  children,
}: {
  accion: Accion;
  className?: string;
  claseMensaje?: string;
  children: ReactNode;
}) {
  const [resultado, enviar] = useActionState(accion, null);
  return (
    <form action={enviar} className={className}>
      {children}
      {resultado && (
        <p
          role="status"
          className={cx(
            "w-full rounded-xl border px-4 py-2.5 text-sm font-semibold",
            claseMensaje,
            resultado.ok ? "border-celeste bg-celeste-suave" : "border-naranja bg-naranja-suave",
          )}
        >
          {resultado.mensaje}
        </p>
      )}
    </form>
  );
}

export function BotonEnviar({
  children,
  variante,
  enCurso = "Guardando…",
  className,
  ...props
}: {
  children: ReactNode;
  variante?: Variante;
  enCurso?: string;
  className?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      {...props}
      disabled={pending || props.disabled}
      className={claseBoton(variante, className)}
    >
      {pending ? enCurso : children}
    </button>
  );
}
