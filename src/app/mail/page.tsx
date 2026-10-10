import { guardarTopeMail } from "@/acciones/conexiones";
import { Cola } from "@/components/cola";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { EditorPlantilla } from "@/components/plantilla";
import { PuertaBase } from "@/components/puerta-base";
import { Avance, BotonLink, Campo, Encabezado, Estado, Nota, Tarjeta, Titulo } from "@/components/ui";
import { leerConfig } from "@/lib/config";
import { cola, enviadosHoy } from "@/lib/consultas";
import { base, datos } from "@/lib/supabase";
import type { Plantilla } from "@/lib/tipos";

export default function Mail() {
  return (
    <>
      <Encabezado sobre="Correo en frío" titulo="Mail" />
      <PuertaBase>
        <Contenido />
      </PuertaBase>
    </>
  );
}

async function Contenido() {
  const db = base()!;
  const { usuario, clave, topeDiario } = leerConfig().mail;
  const conectado = Boolean(usuario && clave);
  const [mensajes, plantilla, enviados] = await Promise.all([
    cola(db, "mail"),
    db.from("plantillas").select("*").eq("canal", "mail").maybeSingle(),
    enviadosHoy(db, "mail"),
  ]);

  return (
    <>
      <Tarjeta className="flex flex-wrap items-center gap-5">
        <div className="min-w-60 flex-1">
          <Estado listo={conectado}>{conectado ? `Saliendo desde ${usuario}` : "Falta conectar tu Gmail"}</Estado>
        </div>
        {conectado ? (
          <Avance nombre="Enviados hoy" valor={enviados} meta={topeDiario} />
        ) : (
          <BotonLink href="/conexiones/mail">Conectar mail</BotonLink>
        )}
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Titulo>Cola de hoy</Titulo>
          <Nota>{mensajes.length === 1 ? "1 correo esperando" : `${mensajes.length} correos esperando`}</Nota>
        </div>
        <Cola mensajes={mensajes} />
        <Nota className="border-t border-linea pt-3">
          Tope diario: {topeDiario} correos. Solo entran a la cola los prospectos que tienen mail.
          Un correo por negocio, sin secuencias automáticas.
        </Nota>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Plantilla</Titulo>
        {plantilla.data ? (
          <EditorPlantilla plantilla={datos(plantilla) as Plantilla} />
        ) : (
          <Nota>Falta la plantilla inicial. Corré de nuevo el SQL de las tablas.</Nota>
        )}
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Tope diario</Titulo>
        <FormAccion accion={guardarTopeMail} className="flex flex-wrap items-end gap-3">
          <Campo
            etiqueta="Correos por día"
            name="tope"
            type="number"
            min={1}
            max={200}
            defaultValue={topeDiario}
            className="w-56"
          />
          <BotonEnviar variante="secundario">Guardar tope</BotonEnviar>
        </FormAccion>
        <Nota>
          Con correo en frío conviene ir de a poco: si muchos lo marcan como spam, Gmail empieza a
          frenar todos tus correos.
        </Nota>
      </Tarjeta>
    </>
  );
}
