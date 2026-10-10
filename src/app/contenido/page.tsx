import Link from "next/link";
import { agregarColumna, borrarPlanilla, crearPlanilla, crearPlanillaEjemplo } from "@/acciones/contenido";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { PuertaBase } from "@/components/puerta-base";
import { Avance, Campo, claseCampo, cx, Encabezado, Nota, Tarjeta, Titulo } from "@/components/ui";
import { avanceDe, listarPlanillas, planillaCompleta } from "@/lib/consultas";
import { base } from "@/lib/supabase";
import { TablaPlanilla } from "./tabla";

export default async function Contenido({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return (
    <>
      <Encabezado sobre="Métricas por semana" titulo="Contenido" />
      <PuertaBase>
        <Planillas elegida={p} />
      </PuertaBase>
    </>
  );
}

async function Planillas({ elegida }: { elegida?: string }) {
  const db = base()!;
  const planillas = await listarPlanillas(db);

  if (planillas.length === 0) {
    return (
      <Tarjeta className="flex flex-col items-start gap-3">
        <Titulo>Armá tu primera planilla</Titulo>
        <p className="max-w-prose">
          Una planilla es una tabla con una fila por semana. Las columnas las elegís vos (posts,
          reels, views, lo que quieras medir) y a cada una le podés poner una meta semanal.
        </p>
        <FormAccion accion={crearPlanillaEjemplo}>
          <BotonEnviar enCurso="Creando…">Crear una de ejemplo para Instagram</BotonEnviar>
        </FormAccion>
        <FormAccion accion={crearPlanilla} className="flex flex-wrap items-end gap-3">
          <Campo etiqueta="O empezá una vacía" name="nombre" placeholder="LinkedIn" className="w-64" required />
          <BotonEnviar variante="secundario" enCurso="Creando…">
            Crear vacía
          </BotonEnviar>
        </FormAccion>
      </Tarjeta>
    );
  }

  const planilla = planillas.find((x) => x.id === elegida) ?? planillas[0];
  const { columnas, filas } = await planillaCompleta(db, planilla.id);
  const avance = avanceDe(planilla, columnas, filas);

  return (
    <>
      <nav aria-label="Planillas" className="flex flex-wrap items-center gap-2">
        {planillas.map((x) => (
          <Link
            key={x.id}
            href={`/contenido?p=${x.id}`}
            aria-current={x.id === planilla.id ? "page" : undefined}
            className={cx(
              "flex min-h-11 items-center rounded-full border border-crema px-4 text-sm font-bold",
              x.id === planilla.id ? "bg-crema text-fondo" : "hover:bg-crema/10",
            )}
          >
            {x.nombre}
          </Link>
        ))}
        <details className="relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-dashed border-tenue px-4 text-sm font-bold hover:bg-crema/10">
            + Nueva planilla
          </summary>
          <FormAccion
            accion={crearPlanilla}
            className="absolute top-13 left-0 z-10 flex w-72 flex-col gap-3 rounded-2xl border border-linea bg-superficie p-4"
          >
            <Campo etiqueta="Nombre" name="nombre" placeholder="LinkedIn" required />
            <BotonEnviar enCurso="Creando…">Crear</BotonEnviar>
          </FormAccion>
        </details>
      </nav>

      {avance && (
        <Tarjeta className="flex flex-col gap-3.5">
          <Titulo>Cómo venís · semana {avance.etiqueta}</Titulo>
          <div className="flex flex-wrap gap-5">
            {avance.metas.map((m) => (
              <Avance key={m.nombre} {...m} />
            ))}
          </div>
        </Tarjeta>
      )}

      <TablaPlanilla planillaId={planilla.id} columnas={columnas} filas={filas} />

      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Agregar una columna</Titulo>
        <FormAccion accion={agregarColumna} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="planilla" value={planilla.id} />
          <Campo etiqueta="Nombre" name="nombre" placeholder="Posts" className="min-w-48 flex-1" required />
          <label className="flex flex-col gap-1 text-[13px] font-bold">
            Tipo
            <select name="tipo" defaultValue="number" className={cx(claseCampo, "font-normal")}>
              <option value="number">Número</option>
              <option value="checkbox">Casilla</option>
              <option value="text">Texto</option>
              <option value="date">Fecha</option>
            </select>
          </label>
          <Campo
            etiqueta="Meta por semana (opcional)"
            name="meta"
            type="number"
            min={0}
            step="any"
            placeholder="3"
            className="w-52"
          />
          <BotonEnviar variante="secundario">Agregar columna</BotonEnviar>
        </FormAccion>
        <Nota>La meta solo aplica a columnas de número. Los valores se cargan a mano.</Nota>
      </Tarjeta>

      <FormAccion accion={borrarPlanilla} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={planilla.id} />
        <BotonEnviar variante="secundario" enCurso="Borrando…">
          Borrar la planilla {planilla.nombre}
        </BotonEnviar>
        <Nota>Se borra con todas sus semanas. No se puede deshacer.</Nota>
      </FormAccion>
    </>
  );
}
