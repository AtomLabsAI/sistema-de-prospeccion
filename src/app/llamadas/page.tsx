import Link from "next/link";
import { borrarLlamada, crearLlamada } from "@/acciones/llamadas";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { PuertaBase } from "@/components/puerta-base";
import { Campo, claseCampo, cx, Encabezado, Nota, Tarjeta, Titulo, Vacio } from "@/components/ui";
import { fechaCorta, hoyISO } from "@/lib/fechas";
import { base, datos } from "@/lib/supabase";
import type { Llamada } from "@/lib/tipos";

const CANALES = ["Meet", "Zoom", "Teléfono", "WhatsApp", "Presencial"];

export default function Llamadas() {
  return (
    <>
      <Encabezado sobre="Agenda" titulo="Llamadas de venta" />
      <PuertaBase>
        <Contenido />
      </PuertaBase>
    </>
  );
}

async function Contenido() {
  const db = base()!;
  const hoy = hoyISO();
  const [proximas, pasadas] = await Promise.all([
    db.from("llamadas").select("*").gte("fecha", hoy).order("fecha").order("hora"),
    db.from("llamadas").select("*").lt("fecha", hoy).order("fecha", { ascending: false }).limit(20),
  ]);

  return (
    <>
      <Tarjeta className="flex flex-col gap-3.5">
        <Titulo>Nueva llamada</Titulo>
        <FormAccion accion={crearLlamada} className="flex flex-wrap items-end gap-3">
          <Campo
            etiqueta="Prospecto"
            name="prospecto"
            placeholder="Nombre del negocio o la persona"
            className="min-w-60 flex-2"
            required
          />
          <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy} className="min-w-40 flex-1" required />
          <Campo etiqueta="Hora" name="hora" type="time" className="min-w-32 flex-1" />
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-[13px] font-bold">
            Canal
            <select name="canal" className={cx(claseCampo, "font-normal")}>
              {CANALES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Campo
            etiqueta="Nota"
            name="nota"
            placeholder="Qué quiere, de dónde vino, lo que haga falta recordar"
            className="basis-full"
          />
          <BotonEnviar enCurso="Agendando…">Agendar llamada</BotonEnviar>
        </FormAccion>
      </Tarjeta>

      <Lista titulo="Próximas llamadas" llamadas={datos(proximas) as Llamada[]} vacio="No tenés llamadas agendadas." />
      {(pasadas.data?.length ?? 0) > 0 && (
        <Lista titulo="Ya pasaron" llamadas={datos(pasadas) as Llamada[]} vacio="" />
      )}

      <Nota>
        Es una lista para no olvidarte de ninguna llamada. No registra si la venta se cerró ni los
        montos: eso es parte del{" "}
        <Link href="/crm" className="font-bold underline decoration-naranja underline-offset-4">
          CRM
        </Link>
        .
      </Nota>
    </>
  );
}

const celda = "border-b border-linea px-2.5 py-3.5";

function Lista({ titulo, llamadas, vacio }: { titulo: string; llamadas: Llamada[]; vacio: string }) {
  return (
    <section className="flex flex-col rounded-2xl bg-superficie pt-5 pb-2">
      <div className="px-6 pb-2">
        <Titulo>{titulo}</Titulo>
      </div>
      {llamadas.length === 0 ? (
        <div className="px-6 pb-4">
          <Vacio>{vacio}</Vacio>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wider uppercase">
                <th scope="col" className={`${celda} pl-6`}>Fecha</th>
                <th scope="col" className={celda}>Prospecto</th>
                <th scope="col" className={celda}>Canal</th>
                <th scope="col" className={celda}>Nota</th>
                <th scope="col" className={`${celda} pr-6`}>
                  <span className="sr-only">Borrar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {llamadas.map((l) => (
                <tr key={l.id}>
                  <td className={`${celda} pl-6 font-bold whitespace-nowrap tabular-nums`}>
                    {fechaCorta(l.fecha, l.hora)}
                  </td>
                  <td className={`${celda} font-bold`}>{l.prospecto}</td>
                  <td className={celda}>{l.canal}</td>
                  <td className={celda}>{l.nota}</td>
                  <td className={`${celda} py-1.5 pr-6 text-right`}>
                    <FormAccion accion={borrarLlamada}>
                      <input type="hidden" name="id" value={l.id} />
                      <BotonEnviar variante="secundario" enCurso="Borrando…">
                        Borrar
                      </BotonEnviar>
                    </FormAccion>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
