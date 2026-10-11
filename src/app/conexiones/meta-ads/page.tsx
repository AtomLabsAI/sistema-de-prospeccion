import { marcarMetaAds } from "@/acciones/conexiones";
import { Captura } from "@/components/captura";
import { Copiar } from "@/components/copiar";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { BotonLink, Encabezado, Estado, Nota, Paso, Pasos, Tarjeta, Titulo } from "@/components/ui";
import { leerConfig } from "@/lib/config";

const SERVIDOR = "https://mcp.facebook.com/ads";
const COMANDO = `claude mcp add --transport http --client-id TU_APP_ID meta-ads ${SERVIDOR}`;

export default function GuiaMetaAds() {
  const { conectado } = leerConfig().metaAds;
  return (
    <>
      <Encabezado sobre="Conexiones · 5 de 5" titulo="Meta Ads">
        <Estado listo={conectado}>{conectado ? "Conectado" : "Falta conectar"}</Estado>
      </Encabezado>
      <p className="max-w-prose">
        Acá no se pega ninguna clave. Los anuncios se conectan a <strong>Claude</strong> con el
        servidor MCP oficial de Meta, y Claude es el que trae los números a este dashboard cuando se
        lo pedís.
      </p>

      <Tarjeta className="flex flex-col gap-4">
        <Titulo>Opción A · Desde Claude, sin crear una app</Titulo>
        <Pasos>
          <Paso n={1} titulo="Abrí los conectores de Claude">
            <p>
              En claude.ai: <strong>Configuración</strong>, después <strong>Conectores</strong>.
            </p>
            <Captura archivo="meta-ads-1.png" alt="Pantalla de Conectores en Claude" />
          </Paso>
          <Paso n={2} titulo="Agregá el conector de Meta Ads">
            <p>Si no aparece en la lista, agregalo como conector personalizado con esta dirección:</p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-lg bg-fondo px-4 py-2.5 font-mono text-sm break-all">{SERVIDOR}</code>
              <Copiar texto={SERVIDOR} />
            </div>
          </Paso>
          <Paso n={3} titulo="Entrá con tu cuenta de Meta Business">
            <p>
              Elegí solo las cuentas publicitarias que quieras que Claude vea. El conector queda con
              los mismos permisos que tu usuario: para que no cambie nada sin preguntarte, en los
              ajustes del conector dejá las herramientas que modifican en{" "}
              <strong>pedir aprobación</strong>.
            </p>
            <Nota>
              Meta lo está habilitando de a poco. Si tu cuenta todavía no lo tiene, probá más
              adelante: el resto del dashboard funciona igual.
            </Nota>
          </Paso>
          <Paso n={4} titulo="Reiniciá Claude Code y probá">
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-lg bg-fondo px-4 py-2.5 font-mono">/actualizar-ads</code>
              <Copiar texto="/actualizar-ads" />
            </div>
          </Paso>
        </Pasos>
        <BotonLink
          href="https://www.facebook.com/business/help/1456422242197840"
          variante="secundario"
          className="self-start"
        >
          Ver la guía de Meta
        </BotonLink>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-4">
        <Titulo>Opción B · Directo en Claude Code, con tu app de Meta</Titulo>
        <Pasos>
          <Paso n={1} titulo="Creá una app en Meta for Developers">
            <p>
              Agregale el caso de uso <strong>Create &amp; manage ads with ads MCP server</strong> y
              copiá el ID de la app.
            </p>
            <BotonLink href="https://developers.facebook.com/apps" variante="secundario" className="self-start">
              Abrir Meta for Developers
            </BotonLink>
          </Paso>
          <Paso n={2} titulo="Corré este comando en la terminal, con tu ID de app">
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-lg bg-fondo px-4 py-2.5 font-mono text-sm break-all">{COMANDO}</code>
              <Copiar texto={COMANDO} />
            </div>
          </Paso>
          <Paso n={3} titulo="En Claude Code escribí /mcp y entrá con tu cuenta de Meta" />
        </Pasos>
        <BotonLink
          href="https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started"
          variante="secundario"
          className="self-start"
        >
          Ver la documentación de Meta
        </BotonLink>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Cuando ya te funcione</Titulo>
        <p>Marcala como conectada para que aparezca lista en Inicio.</p>
        <FormAccion accion={marcarMetaAds} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="conectado" value={conectado ? "no" : "si"} />
          <BotonEnviar variante={conectado ? "secundario" : "primario"}>
            {conectado ? "Marcar como sin conectar" : "Ya la conecté"}
          </BotonEnviar>
        </FormAccion>
        <Nota>
          El dashboard no puede comprobar esta conexión por su cuenta: vive dentro de Claude, no
          acá.
        </Nota>
      </Tarjeta>
    </>
  );
}
