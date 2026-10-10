import { guardarPlantilla } from "@/acciones/mensajes";
import type { Plantilla } from "@/lib/tipos";
import { BotonEnviar, FormAccion } from "./formulario";
import { Campo, claseCampo, cx, Nota } from "./ui";

// Editor de la plantilla de un canal (se usa en WhatsApp y en Mail).
export function EditorPlantilla({ plantilla }: { plantilla: Plantilla }) {
  return (
    <FormAccion accion={guardarPlantilla} className="flex flex-col gap-3">
      <input type="hidden" name="canal" value={plantilla.canal} />
      {plantilla.canal === "mail" && (
        <Campo etiqueta="Asunto" name="asunto" defaultValue={plantilla.asunto ?? ""} />
      )}
      <label className="flex flex-col gap-1 text-[13px] font-bold">
        Mensaje
        <textarea
          name="texto"
          defaultValue={plantilla.texto}
          rows={plantilla.canal === "mail" ? 7 : 4}
          className={cx(claseCampo, "py-2.5 leading-normal font-normal")}
          required
        />
      </label>
      <Nota>
        Lo que va entre corchetes se completa solo con los datos de cada prospecto: [negocio],
        [ciudad] y [rubro]. El cambio vale para los mensajes que mandes a la cola de ahora en más.
      </Nota>
      <BotonEnviar variante="secundario" className="self-start">
        Guardar plantilla
      </BotonEnviar>
    </FormAccion>
  );
}
