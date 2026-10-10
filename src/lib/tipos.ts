// Formas de las filas de cada tabla (ver supabase/schema.sql).

export type Resultado = { ok: boolean; mensaje: string } | null;

export type Canal = "whatsapp" | "mail";
export type EstadoProspecto = "nuevo" | "en_cola" | "contactado";

export type Prospecto = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  ciudad: string | null;
  rubro: string | null;
  rating: number | null;
  resenas: number | null;
  maps_url: string | null;
  place_id: string | null;
  estado: EstadoProspecto;
  creado_en: string;
};

export type Plantilla = { canal: Canal; asunto: string | null; texto: string };

export type Mensaje = {
  id: string;
  prospecto_id: string;
  canal: Canal;
  numero: number | null;
  asunto: string | null;
  texto: string;
  estado: "pendiente" | "enviando" | "enviado" | "salteado" | "error";
  error: string | null;
  creado_en: string;
  enviado_en: string | null;
};

export type MensajeConProspecto = Mensaje & {
  prospectos: Pick<Prospecto, "nombre" | "telefono" | "email"> | null;
};

export type Llamada = {
  id: string;
  prospecto: string;
  fecha: string;
  hora: string | null;
  canal: string | null;
  nota: string | null;
};

export type TipoColumna = "number" | "checkbox" | "text" | "date";
export type ValorCelda = number | boolean | string | null;

export type Planilla = { id: string; nombre: string; posicion: number };
export type Columna = {
  id: string;
  planilla_id: string;
  nombre: string;
  tipo: TipoColumna;
  meta: number | null;
  posicion: number;
};
export type Fila = {
  id: string;
  planilla_id: string;
  etiqueta: string;
  inicio_periodo: string | null;
  valores: Record<string, ValorCelda>;
};

export type CampanaAds = {
  id: string;
  campana_id: string | null;
  nombre: string;
  estado: string | null;
  gasto: number;
  resultados: number;
  moneda: string | null;
  desde: string | null;
  hasta: string | null;
  actualizado_en: string;
};
