import { guardarTopeWhatsApp } from "@/acciones/conexiones";
import { AvisoWhatsApp } from "@/components/aviso-whatsapp";
import { Cola } from "@/components/cola";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { EditorPlantilla } from "@/components/plantilla";
import { PuertaBase } from "@/components/puerta-base";
import { TarjetaNumero } from "@/components/tarjeta-numero";
import { Avance, BotonLink, Campo, Encabezado, Nota, Tarjeta, Titulo } from "@/components/ui";
import { leerConfig } from "@/lib/config";
import { cola, enviadosHoy } from "@/lib/consultas";
import { base, datos } from "@/lib/supabase";
import type { Plantilla } from "@/lib/tipos";
import { estadoNumeros, NOMBRE_NUMERO, NUMEROS } from "@/lib/whatsapp";

export default function WhatsApp() {
  return (
    <>
      <Encabezado sobre="Primer contacto" titulo="WhatsApp" />
      <AvisoWhatsApp />
      <PuertaBase>
        <Contenido />
      </PuertaBase>
    </>
  );
}

async function Contenido() {
  const db = base()!;
  const { aceptoRiesgo, topePorNumero } = leerConfig().whatsapp;
  const [numeros, mensajes, plantilla, ...enviados] = await Promise.all([
    estadoNumeros({ levantar: aceptoRiesgo }),
    cola(db, "whatsapp"),
    db.from("plantillas").select("*").eq("canal", "whatsapp").maybeSingle(),
    ...NUMEROS.map((n) => enviadosHoy(db, "whatsapp", n)),
  ]);
  const conectados = numeros.filter((n) => n.conexion === "conectado");

  return (
    <>
      {!aceptoRiesgo && (
        <Tarjeta className="flex flex-wrap items-center gap-3">
          <p className="min-w-60 flex-1 font-bold">
            Antes de conectar un número tenés que leer y aceptar el aviso de riesgo.
          </p>
          <BotonLink href="/conexiones/whatsapp">Ir a la guía de WhatsApp</BotonLink>
        </Tarjeta>
      )}

      <section className="flex flex-wrap items-start gap-3">
        {numeros.map((n, i) => (
          <TarjetaNumero key={n.numero} inicial={n} nombre={NOMBRE_NUMERO[n.numero]} habilitado={aceptoRiesgo}>
            <Avance nombre="Enviados hoy" valor={enviados[i]} meta={topePorNumero} />
          </TarjetaNumero>
        ))}
      </section>

      <Tarjeta className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Titulo>Cola de hoy</Titulo>
          <Nota>
            {mensajes.length === 1 ? "1 mensaje esperando" : `${mensajes.length} mensajes esperando`}
          </Nota>
        </div>
        {conectados.length === 0 && mensajes.length > 0 && (
          <p className="font-semibold text-naranja">Conectá al menos un número para poder enviar.</p>
        )}
        <Cola
          mensajes={mensajes}
          numeros={conectados.map((n) => ({ numero: n.numero, nombre: NOMBRE_NUMERO[n.numero] }))}
        />
        <Nota className="border-t border-linea pt-3">
          Tope diario: {topePorNumero} mensajes por número. Al llegar al tope ese número no envía
          más hasta mañana. No hay botón de &quot;enviar todos&quot;.
        </Nota>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Plantilla de primer contacto</Titulo>
        {plantilla.data ? (
          <EditorPlantilla plantilla={datos(plantilla) as Plantilla} />
        ) : (
          <Nota>Falta la plantilla inicial. Corré de nuevo el SQL de las tablas.</Nota>
        )}
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Tope diario</Titulo>
        <FormAccion accion={guardarTopeWhatsApp} className="flex flex-wrap items-end gap-3">
          <Campo
            etiqueta="Mensajes por día, por número"
            name="tope"
            type="number"
            min={1}
            max={60}
            defaultValue={topePorNumero}
            className="w-56"
          />
          <BotonEnviar variante="secundario">Guardar tope</BotonEnviar>
        </FormAccion>
        <Nota>
          Cuanto más bajo, menos riesgo de baneo. Un número nuevo conviene arrancarlo con pocos
          mensajes por día e ir subiendo de a poco.
        </Nota>
      </Tarjeta>
    </>
  );
}
