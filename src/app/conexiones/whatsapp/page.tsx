import { aceptarRiesgoWhatsApp, desvincularNumero } from "@/acciones/conexiones";
import { AvisoWhatsApp } from "@/components/aviso-whatsapp";
import { Captura } from "@/components/captura";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { TarjetaNumero } from "@/components/tarjeta-numero";
import { BotonLink, Encabezado, Estado, Nota, Tarjeta, Titulo } from "@/components/ui";
import { leerConfig } from "@/lib/config";
import { estadoNumeros, NOMBRE_NUMERO } from "@/lib/whatsapp";

const TRES_NUMEROS = [
  {
    sobre: "Número 1",
    titulo: "WhatsApp",
    texto: "La cuenta que ya tenés en la app de siempre.",
  },
  {
    sobre: "Número 2",
    titulo: "WhatsApp, segunda cuenta",
    texto:
      "En la misma app: Ajustes, Agregar cuenta. Cambiás de una a otra con doble toque en tu foto de perfil, abajo, igual que en Instagram.",
  },
  {
    sobre: "Número 3",
    titulo: "WhatsApp Business",
    texto: "Es otra app. La instalás aparte y le ponés el tercer número.",
  },
];

export default async function GuiaWhatsApp() {
  const { aceptoRiesgo } = leerConfig().whatsapp;
  const numeros = await estadoNumeros({ levantar: aceptoRiesgo });
  const conectados = numeros.filter((n) => n.conexion === "conectado").length;

  return (
    <>
      <Encabezado sobre="Conexiones · 3 de 5" titulo="WhatsApp">
        <Estado listo={conectados > 0}>{conectados} de 3 números conectados</Estado>
      </Encabezado>

      <AvisoWhatsApp tamano="grande" />

      <section className="flex flex-col gap-3">
        <Titulo>Podés tener hasta 3 números en el mismo celular</Titulo>
        <div className="flex flex-wrap gap-3">
          {TRES_NUMEROS.map((n) => (
            <div key={n.sobre} className="min-w-56 flex-1 rounded-2xl bg-superficie px-5 py-4">
              <p className="text-[13px] font-extrabold tracking-wider uppercase">{n.sobre}</p>
              <p className="mt-0.5 text-[17px] font-bold">{n.titulo}</p>
              <Nota className="mt-1.5 text-sm">{n.texto}</Nota>
            </div>
          ))}
        </div>
        <Captura archivo="whatsapp-1.png" alt="Cómo agregar una segunda cuenta en WhatsApp" />
      </section>

      {!aceptoRiesgo && (
        <Tarjeta className="flex flex-col gap-3">
          <Titulo>Antes de conectar</Titulo>
          <FormAccion accion={aceptarRiesgoWhatsApp} className="flex flex-wrap items-center gap-4">
            <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3 font-bold">
              <input type="checkbox" name="acepto" className="h-5.5 w-5.5 flex-none accent-crema" />
              Entiendo que es una API no oficial y que me pueden banear el número
            </label>
            <BotonEnviar>Aceptar y seguir</BotonEnviar>
          </FormAccion>
        </Tarjeta>
      )}

      <section className="flex flex-col gap-3">
        <Titulo>Conectá tus números</Titulo>
        <p className="max-w-prose">
          Tocá <strong>Conectar</strong> y escaneá el QR desde el celular: WhatsApp,{" "}
          <strong>Dispositivos vinculados</strong>, <strong>Vincular un dispositivo</strong>. Hacelo
          una vez por cada número; después se reconectan solos.
        </p>
        <div className="flex flex-wrap items-start gap-3">
          {numeros.map((n) => (
            <TarjetaNumero
              key={n.numero}
              inicial={n}
              nombre={NOMBRE_NUMERO[n.numero]}
              habilitado={aceptoRiesgo}
            >
              <FormAccion accion={desvincularNumero}>
                <input type="hidden" name="numero" value={n.numero} />
                <BotonEnviar variante="secundario" enCurso="Desvinculando…" className="mb-2">
                  Desvincular
                </BotonEnviar>
              </FormAccion>
            </TarjetaNumero>
          ))}
        </div>
        <Captura archivo="whatsapp-2.png" alt="Dispositivos vinculados en WhatsApp" />
        <Nota className="max-w-prose">
          Cada número corre con una copia del{" "}
          <a
            href="https://github.com/IgnacioMiranda6/whatsapp-assistant"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-naranja underline-offset-4"
          >
            WhatsApp Assistant
          </a>
          , en tu compu. La sesión y una copia de los chats de la última semana de ese número se
          guardan en la carpeta .whatsapp de este proyecto y no salen de ahí. Si apagás la compu,
          los números se desconectan hasta que vuelvas a abrir el dashboard.
        </Nota>
      </section>

      {conectados > 0 && (
        <BotonLink href="/whatsapp" className="self-start">
          Ir a la cola de WhatsApp
        </BotonLink>
      )}
    </>
  );
}
