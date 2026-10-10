import { Copiar } from "@/components/copiar";
import { PuertaBase } from "@/components/puerta-base";
import { BotonLink, Dato, Encabezado, Etiqueta, Nota, Tarjeta, Titulo } from "@/components/ui";
import { leerConfig } from "@/lib/config";
import { fechaCorta, momento } from "@/lib/fechas";
import { base, datos } from "@/lib/supabase";
import type { CampanaAds } from "@/lib/tipos";

const PROMPTS = [
  "¿Qué anuncio tiene el costo por resultado más alto? Decime si conviene pausarlo.",
  "Comparame esta semana con la anterior y decime qué cambió.",
  "Armame un borrador de campaña para [tu oferta] en [tu ciudad]. No la publiques todavía.",
];

const entero = new Intl.NumberFormat("es", { maximumFractionDigits: 0, useGrouping: "always" });
const celda = "border-b border-linea px-2.5 py-3";

export default function Ads() {
  return (
    <>
      <Encabezado sobre="Meta Ads" titulo="Ads" />
      <PuertaBase>
        <Contenido />
      </PuertaBase>
    </>
  );
}

async function Contenido() {
  const { conectado } = leerConfig().metaAds;
  const campanas = datos(
    await base()!.from("ads_campanas").select("*").order("gasto", { ascending: false }),
  ) as CampanaAds[];

  if (campanas.length === 0) {
    return (
      <Tarjeta className="flex flex-col items-start gap-3">
        <Titulo>Todavía no hay anuncios para mostrar</Titulo>
        <p className="max-w-prose">
          Los números de tus campañas los trae Claude desde tu cuenta de Meta.{" "}
          {conectado
            ? "Abrí Claude Code en esta carpeta y pedile que los actualice:"
            : "Primero conectá Meta Ads con Claude; después pedile que los actualice:"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-fondo px-4 py-2.5 font-mono">/actualizar-ads</code>
          <Copiar texto="/actualizar-ads" />
          {!conectado && <BotonLink href="/conexiones/meta-ads">Conectar Meta Ads</BotonLink>}
        </div>
      </Tarjeta>
    );
  }

  const gasto = campanas.reduce((suma, c) => suma + Number(c.gasto), 0);
  const resultados = campanas.reduce((suma, c) => suma + Number(c.resultados), 0);
  const activas = campanas.filter((c) => c.estado?.toUpperCase() === "ACTIVE").length;
  const { moneda, desde, hasta, actualizado_en } = campanas[0];
  const plata = (n: number) => `${moneda ?? "$"} ${entero.format(n)}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y-2 border-celeste px-1 py-3">
        <p className="min-w-72 flex-1">
          <strong>Actualizado {momento(actualizado_en)}.</strong>{" "}
          <span className="text-tenue">
            {desde && hasta ? `Del ${fechaCorta(desde)} al ${fechaCorta(hasta)}. ` : ""}
            Los números los trae Claude cuando se lo pedís. No son en vivo.
          </span>
        </p>
        <Copiar texto="/actualizar-ads" variante="primario">
          Copiar comando para actualizar
        </Copiar>
      </div>

      <div className="flex flex-wrap gap-3">
        <Dato nombre="Gasto">{plata(gasto)}</Dato>
        <Dato nombre="Resultados">{entero.format(resultados)}</Dato>
        <Dato nombre="Costo por resultado">{resultados > 0 ? plata(gasto / resultados) : "Sin datos"}</Dato>
        <Dato nombre="Campañas activas">{activas}</Dato>
      </div>

      <section className="overflow-x-auto rounded-2xl bg-superficie pt-1.5 pb-1">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs tracking-wider uppercase">
              <th scope="col" className={`${celda} pl-6`}>Campaña</th>
              <th scope="col" className={celda}>Estado</th>
              <th scope="col" className={`${celda} text-right`}>Gasto</th>
              <th scope="col" className={`${celda} text-right`}>Resultados</th>
              <th scope="col" className={`${celda} pr-6 text-right`}>Costo por resultado</th>
            </tr>
          </thead>
          <tbody>
            {campanas.map((c) => (
              <tr key={c.id}>
                <td className={`${celda} pl-6 font-bold`}>{c.nombre}</td>
                <td className={celda}>
                  {c.estado?.toUpperCase() === "ACTIVE" ? (
                    <Etiqueta>Activa</Etiqueta>
                  ) : (
                    <Etiqueta tono="neutro">
                      {c.estado?.toUpperCase() === "PAUSED" ? "Pausada" : (c.estado ?? "Sin estado")}
                    </Etiqueta>
                  )}
                </td>
                <td className={`${celda} text-right tabular-nums`}>{plata(Number(c.gasto))}</td>
                <td className={`${celda} text-right tabular-nums`}>{entero.format(Number(c.resultados))}</td>
                <td className={`${celda} pr-6 text-right tabular-nums`}>
                  {Number(c.resultados) > 0 ? plata(Number(c.gasto) / Number(c.resultados)) : "Sin datos"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Tarjeta className="flex flex-col gap-1">
        <Titulo>Para pedirle a Claude</Titulo>
        <ul className="mt-2 divide-y divide-linea">
          {PROMPTS.map((p) => (
            <li key={p} className="flex items-center justify-between gap-3 py-2.5">
              <p className="min-w-0 text-sm">{p}</p>
              <Copiar texto={p} />
            </li>
          ))}
        </ul>
        <Nota className="pt-2">
          Para crear, pausar o cambiar campañas también se lo pedís a Claude. Este dashboard solo
          muestra.
        </Nota>
      </Tarjeta>
    </>
  );
}
