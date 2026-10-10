import "server-only";
import { leerConfig } from "./config";
import { estadoBase } from "./supabase";
import { estadoNumeros } from "./whatsapp";

export type Conexion = {
  id: string;
  nombre: string;
  detalle: string;
  href: string;
  lista: boolean;
};

// Las 5 conexiones del dashboard y si cada una está lista. Son
// independientes: se puede usar el dashboard con las que estén conectadas.
export async function listarConexiones(): Promise<Conexion[]> {
  const config = leerConfig();
  const [{ estado }, numeros] = await Promise.all([
    estadoBase(),
    estadoNumeros({ levantar: config.whatsapp.aceptoRiesgo }),
  ]);
  const conectados = numeros.filter((n) => n.conexion === "conectado").length;
  return [
    {
      id: "supabase",
      nombre: "Base de datos",
      detalle: "Supabase. Acá se guarda todo.",
      href: "/conexiones/supabase",
      lista: estado === "lista",
    },
    {
      id: "apify",
      nombre: "Scraper",
      detalle: "Apify, Google Maps. Trae negocios por rubro y ciudad.",
      href: "/conexiones/apify",
      lista: Boolean(config.apify.token),
    },
    {
      id: "whatsapp",
      nombre: "WhatsApp",
      detalle: `${conectados} de 3 números. API no oficial, riesgo de baneo.`,
      href: "/conexiones/whatsapp",
      lista: conectados > 0,
    },
    {
      id: "mail",
      nombre: "Mail",
      detalle: "Tu Gmail, para mandar correos en frío.",
      href: "/conexiones/mail",
      lista: Boolean(config.mail.usuario && config.mail.clave),
    },
    {
      id: "meta-ads",
      nombre: "Meta Ads",
      detalle: "MCP oficial de Meta. Claude trae tus anuncios y los muestra acá.",
      href: "/conexiones/meta-ads",
      lista: config.metaAds.conectado,
    },
  ];
}
