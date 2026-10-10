import Link from "next/link";
import { agregarProspecto, buscarProspectos } from "@/acciones/prospectos";
import { AvisoWhatsApp } from "@/components/aviso-whatsapp";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { PuertaBase } from "@/components/puerta-base";
import { BotonLink, Campo, cx, Encabezado, Nota, Tarjeta, Titulo, Vacio } from "@/components/ui";
import { leerConfig } from "@/lib/config";
import { base, datos } from "@/lib/supabase";
import type { EstadoProspecto, Prospecto } from "@/lib/tipos";
import { TablaProspectos } from "./tabla";

const FILTROS: { valor: EstadoProspecto | "todos"; nombre: string }[] = [
  { valor: "todos", nombre: "Todos" },
  { valor: "nuevo", nombre: "Nuevos" },
  { valor: "en_cola", nombre: "En cola" },
  { valor: "contactado", nombre: "Contactados" },
];

export default async function Prospectos({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === estado)?.valor ?? "todos";
  return (
    <>
      <Encabezado sobre="Scraper · Apify, Google Maps" titulo="Prospectos" />
      <PuertaBase>
        <Contenido filtro={filtro} />
      </PuertaBase>
    </>
  );
}

async function Contenido({ filtro }: { filtro: EstadoProspecto | "todos" }) {
  const conApify = Boolean(leerConfig().apify.token);
  let consulta = base()!.from("prospectos").select("*").order("creado_en", { ascending: false }).limit(300);
  if (filtro !== "todos") consulta = consulta.eq("estado", filtro);
  const prospectos = datos(await consulta) as Prospecto[];

  return (
    <>
      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Buscar negocios</Titulo>
        {conApify ? (
          <FormAccion accion={buscarProspectos} className="flex flex-wrap items-end gap-3">
            <Campo etiqueta="Rubro" name="rubro" placeholder="Dentistas" className="min-w-48 flex-2" required />
            <Campo
              etiqueta="Ciudad"
              name="ciudad"
              placeholder="Córdoba, Argentina"
              className="min-w-48 flex-2"
              required
            />
            <Campo
              etiqueta="Cantidad"
              name="cantidad"
              type="number"
              min={1}
              max={200}
              defaultValue={20}
              className="w-28"
            />
            <BotonEnviar enCurso="Buscando… tarda de 1 a 3 minutos">Buscar</BotonEnviar>
            <label className="flex min-h-11 basis-full cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" name="conMails" className="h-5 w-5 accent-crema" />
              Traer también el mail de cada negocio desde su sitio web (gasta más crédito)
            </label>
          </FormAccion>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex-1">Para buscar negocios primero conectá tu cuenta de Apify.</p>
            <BotonLink href="/conexiones/apify">Conectar Apify</BotonLink>
          </div>
        )}
        <Nota>Cada búsqueda gasta crédito de tu cuenta de Apify. Empezá con pocas para probar.</Nota>

        <details className="border-t border-linea pt-3">
          <summary className="cursor-pointer text-sm font-bold">Agregar un prospecto a mano</summary>
          <FormAccion accion={agregarProspecto} className="mt-3 flex flex-wrap items-end gap-3">
            <Campo etiqueta="Negocio" name="nombre" className="min-w-48 flex-2" required />
            <Campo etiqueta="Teléfono con código de país" name="telefono" placeholder="+54 9 351 555 0101" className="min-w-48 flex-1" />
            <Campo etiqueta="Mail" name="email" type="email" className="min-w-48 flex-1" />
            <Campo etiqueta="Ciudad" name="ciudad" className="min-w-36 flex-1" />
            <Campo etiqueta="Rubro" name="rubro" className="min-w-36 flex-1" />
            <BotonEnviar variante="secundario">Agregar</BotonEnviar>
          </FormAccion>
        </details>
      </Tarjeta>

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={f.valor === "todos" ? "/prospectos" : `/prospectos?estado=${f.valor}`}
            aria-current={f.valor === filtro ? "page" : undefined}
            className={cx(
              "flex min-h-11 items-center rounded-full border border-crema px-4 text-sm font-bold",
              f.valor === filtro ? "bg-crema text-fondo" : "hover:bg-crema/10",
            )}
          >
            {f.nombre}
          </Link>
        ))}
      </nav>

      {prospectos.length === 0 ? (
        <Vacio>
          {filtro === "todos"
            ? "Todavía no hay prospectos. Hacé tu primera búsqueda acá arriba."
            : "No hay prospectos en este estado."}
        </Vacio>
      ) : (
        <TablaProspectos prospectos={prospectos} />
      )}

      <AvisoWhatsApp tamano="chico" />
      <Nota>
        Acá el estado es simple: Nuevo, En cola o Contactado. El seguimiento por etapas está en el
        CRM.
      </Nota>
    </>
  );
}
