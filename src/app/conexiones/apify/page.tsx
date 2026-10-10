import { guardarApify } from "@/acciones/conexiones";
import { Captura } from "@/components/captura";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { BotonLink, Campo, Encabezado, Estado, Nota, Paso, Pasos, Tarjeta } from "@/components/ui";
import { enmascarar, leerConfig } from "@/lib/config";

export default function GuiaApify() {
  const { token } = leerConfig().apify;
  return (
    <>
      <Encabezado sobre="Conexiones · 2 de 5" titulo="Scraper">
        <Estado listo={Boolean(token)}>{token ? "Conectado" : "Falta conectar"}</Estado>
      </Encabezado>
      <p className="max-w-prose">
        Apify es el servicio que busca negocios en Google Maps por rubro y ciudad. Cada búsqueda
        gasta crédito de tu cuenta: el plan gratis trae crédito todos los meses para probar.
      </p>

      <Tarjeta>
        <Pasos>
          <Paso n={1} titulo="Creá tu cuenta en Apify">
            <BotonLink href="https://console.apify.com/sign-up" variante="secundario" className="self-start">
              Abrir Apify
            </BotonLink>
          </Paso>
          <Paso n={2} titulo="Copiá tu token">
            <p>
              En la consola: <strong>Settings</strong>, después <strong>API &amp; Integrations</strong>
              . Copiá el <strong>Personal API token</strong>.
            </p>
            <BotonLink
              href="https://console.apify.com/settings/integrations"
              variante="secundario"
              className="self-start"
            >
              Ir a mi token
            </BotonLink>
            <Captura archivo="apify-1.png" alt="Dónde copiar el token de Apify" />
          </Paso>
          <Paso n={3} titulo="Pegalo acá">
            <FormAccion accion={guardarApify} className="flex flex-wrap items-end gap-3">
              <Campo
                etiqueta="Token de Apify"
                name="token"
                type="password"
                placeholder={token ? `Guardado: ${enmascarar(token)}` : "apify_api_..."}
                className="min-w-60 flex-1"
                autoComplete="off"
                required
              />
              <BotonEnviar enCurso="Probando…">Guardar y probar</BotonEnviar>
            </FormAccion>
            <Nota>El token queda solo en tu compu, en config.local.json.</Nota>
          </Paso>
        </Pasos>
      </Tarjeta>

      {token && (
        <BotonLink href="/prospectos" className="self-start">
          Ir a buscar prospectos
        </BotonLink>
      )}
    </>
  );
}
