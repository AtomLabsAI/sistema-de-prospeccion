import { guardarMail } from "@/acciones/conexiones";
import { Captura } from "@/components/captura";
import { BotonEnviar, FormAccion } from "@/components/formulario";
import { BotonLink, Campo, Encabezado, Estado, Nota, Paso, Pasos, Tarjeta } from "@/components/ui";
import { enmascarar, leerConfig } from "@/lib/config";

export default function GuiaMail() {
  const { usuario, clave, nombre } = leerConfig().mail;
  const listo = Boolean(usuario && clave);
  return (
    <>
      <Encabezado sobre="Conexiones · 4 de 5" titulo="Mail">
        <Estado listo={listo}>{listo ? "Conectado" : "Falta conectar"}</Estado>
      </Encabezado>
      <p className="max-w-prose">
        Los correos en frío salen desde tu propio Gmail (el común o el de tu negocio en Google
        Workspace). No se usa tu contraseña de siempre: Google te da una{" "}
        <strong>contraseña de aplicación</strong> solo para esto.
      </p>

      <Tarjeta>
        <Pasos>
          <Paso n={1} titulo="Activá la verificación en dos pasos">
            <p>Google solo deja crear contraseñas de aplicación si la tenés activa.</p>
            <BotonLink
              href="https://myaccount.google.com/signinoptions/two-step-verification"
              variante="secundario"
              className="self-start"
            >
              Abrir verificación en dos pasos
            </BotonLink>
            <Captura archivo="mail-1.png" alt="Verificación en dos pasos de Google" />
          </Paso>
          <Paso n={2} titulo="Creá una contraseña de aplicación">
            <p>
              Ponele un nombre (por ejemplo, &quot;Dashboard&quot;) y copiá las 16 letras que te
              muestra. Solo se ven una vez.
            </p>
            <BotonLink
              href="https://myaccount.google.com/apppasswords"
              variante="secundario"
              className="self-start"
            >
              Abrir contraseñas de aplicación
            </BotonLink>
            <Captura archivo="mail-2.png" alt="Pantalla de contraseñas de aplicación de Google" />
          </Paso>
          <Paso n={3} titulo="Pegá los datos acá">
            <FormAccion accion={guardarMail} className="flex flex-wrap items-end gap-3">
              <Campo
                etiqueta="Tu Gmail"
                name="usuario"
                type="email"
                defaultValue={usuario}
                placeholder="vos@tunegocio.com"
                className="min-w-56 flex-1"
                required
              />
              <Campo
                etiqueta="Contraseña de aplicación"
                name="clave"
                type="password"
                placeholder={clave ? `Guardada: ${enmascarar(clave)}` : "16 letras"}
                className="min-w-56 flex-1"
                autoComplete="off"
              />
              <Campo
                etiqueta="Nombre que ve quien recibe"
                name="nombre"
                defaultValue={nombre}
                placeholder="Tu nombre o el del negocio"
                className="min-w-56 flex-1"
              />
              <BotonEnviar enCurso="Probando…">Guardar y probar</BotonEnviar>
            </FormAccion>
            <Nota>La contraseña queda solo en tu compu, en config.local.json.</Nota>
          </Paso>
        </Pasos>
      </Tarjeta>

      <Nota className="max-w-prose">
        Dos cosas a tener en cuenta: Google corta los envíos cerca de los 500 correos por día en
        cuentas comunes, y el correo en frío puede caer en spam. Por eso el dashboard arranca con un
        tope bajo, que podés cambiar en la pantalla de Mail.
      </Nota>

      {listo && (
        <BotonLink href="/mail" className="self-start">
          Ir a la cola de Mail
        </BotonLink>
      )}
    </>
  );
}
