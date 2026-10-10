import fs from "node:fs";
import path from "node:path";
import { guardarSupabase, verificarBase } from "@/acciones/conexiones";
import { Captura } from "@/components/captura";
import { Copiar } from "@/components/copiar";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { BotonLink, Campo, Encabezado, Estado, Nota, Paso, Pasos, Tarjeta, Titulo } from "@/components/ui";
import { enmascarar, leerConfig } from "@/lib/config";
import { estadoBase } from "@/lib/supabase";

export default async function GuiaSupabase() {
  const { url, key } = leerConfig().supabase;
  const { estado } = await estadoBase();
  const sql = fs.readFileSync(path.join(process.cwd(), "supabase", "schema.sql"), "utf8");
  // De https://abcd.supabase.co sale "abcd", para abrir el SQL Editor de ese proyecto.
  const proyecto = /^https:\/\/([a-z0-9]+)\.supabase\.co/.exec(url)?.[1] ?? "_";

  return (
    <>
      <Encabezado sobre="Conexiones · 1 de 5" titulo="Base de datos">
        <Estado listo={estado === "lista"}>
          {estado === "lista" ? "Conectada" : estado === "sin_tablas" ? "Faltan las tablas" : "Falta conectar"}
        </Estado>
      </Encabezado>
      <p className="max-w-prose">
        Todo lo que cargues (prospectos, mensajes, llamadas, métricas) se guarda en tu propio
        proyecto de Supabase. Es gratis para empezar y los datos son tuyos.
      </p>

      <Tarjeta className="flex flex-col gap-3">
        <Titulo>Camino corto: que lo haga Claude</Titulo>
        <p>
          Abrí Claude Code en esta carpeta y escribí el comando. Claude crea las tablas y te pide
          solo la clave secreta.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-fondo px-4 py-2.5 font-mono">/conectar</code>
          <Copiar texto="/conectar" />
        </div>
        <Nota>Necesita el conector de Supabase activo en Claude (Configuración, Conectores).</Nota>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-5">
        <Titulo>Camino a mano: 3 pasos</Titulo>
        <Pasos>
          <Paso n={1} titulo="Creá tu proyecto en Supabase">
            <p>
              Entrá con tu cuenta, tocá <strong>New project</strong>, elegí la región{" "}
              <strong>South America (São Paulo)</strong> y esperá un par de minutos a que termine.
            </p>
            <BotonLink href="https://supabase.com/dashboard/projects" variante="secundario" className="self-start">
              Abrir Supabase
            </BotonLink>
            <Captura archivo="supabase-1.png" alt="Botón New project en Supabase" />
          </Paso>

          <Paso n={2} titulo="Pegá la URL del proyecto y la clave secreta">
            <p>
              En tu proyecto: <strong>Project Settings</strong>. La URL está en{" "}
              <strong>Data API</strong> y la clave en <strong>API Keys</strong>, en la parte de{" "}
              <strong>Secret keys</strong> (empieza con <code>sb_secret_</code>).
            </p>
            <Captura archivo="supabase-2.png" alt="Dónde copiar la URL y la clave secreta" />
            <FormAccion accion={guardarSupabase} className="flex flex-wrap items-end gap-3">
              <Campo
                etiqueta="URL del proyecto"
                name="url"
                type="url"
                defaultValue={url}
                placeholder="https://abcdefgh.supabase.co"
                className="min-w-60 flex-1"
                required
              />
              <Campo
                etiqueta="Clave secreta"
                name="key"
                type="password"
                placeholder={key ? `Guardada: ${enmascarar(key)}` : "sb_secret_..."}
                className="min-w-60 flex-1"
                autoComplete="off"
              />
              <BotonEnviar enCurso="Probando…">Guardar y probar</BotonEnviar>
            </FormAccion>
            <Nota>
              La clave secreta queda solo en tu compu, en el archivo config.local.json. No la
              compartas ni la subas a GitHub.
            </Nota>
          </Paso>

          <Paso n={3} titulo="Creá las tablas">
            <p>
              Copiá el SQL, abrí el SQL Editor, pegalo y tocá <strong>Run</strong>. Después volvé y
              verificá.
            </p>
            <div className="flex flex-wrap gap-3">
              <Copiar texto={sql}>Copiar el SQL</Copiar>
              <BotonLink
                href={`https://supabase.com/dashboard/project/${proyecto}/sql/new`}
                variante="secundario"
              >
                Abrir el SQL Editor
              </BotonLink>
            </div>
            <Captura archivo="supabase-3.png" alt="SQL Editor con el botón Run" />
            <FormAccion accion={verificarBase} className="flex flex-wrap items-center gap-3">
              <BotonEnviar enCurso="Verificando…">Ya lo corrí, verificar</BotonEnviar>
            </FormAccion>
          </Paso>
        </Pasos>
      </Tarjeta>
    </>
  );
}
