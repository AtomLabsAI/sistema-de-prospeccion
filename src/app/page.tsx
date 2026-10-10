import Link from "next/link";
import { AvisoWhatsApp } from "@/components/aviso-whatsapp";
import { Avance, BotonLink, Dato, Encabezado, Estado, Nota, Tarjeta, Titulo } from "@/components/ui";
import { leerConfig } from "@/lib/config";
import { listarConexiones } from "@/lib/conexiones";
import { avanceDe, enviadosHoy, listarPlanillas, planillaCompleta } from "@/lib/consultas";
import { hoyISO, inicioDeHoy } from "@/lib/fechas";
import { base, contar } from "@/lib/supabase";

export default async function Inicio() {
  const conexiones = await listarConexiones();
  const listas = conexiones.filter((c) => c.lista).length;
  const baseLista = conexiones[0].lista;

  return (
    <>
      <Encabezado sobre="Sistema de Prospección" titulo="Inicio" />
      <AvisoWhatsApp />

      <Tarjeta className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Titulo>
            Tu sistema: {listas} de {conexiones.length} conexiones listas
          </Titulo>
          <Nota>Cada conexión es independiente. Usás las que conectes.</Nota>
        </div>
        <div aria-hidden="true" className="grid grid-cols-5 gap-1.5">
          {conexiones.map((c) => (
            <span key={c.id} className={`h-2 rounded ${c.lista ? "bg-celeste" : "bg-linea"}`} />
          ))}
        </div>
        <ul className="divide-y divide-linea">
          {conexiones.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-60 flex-1">
                <p className="font-bold">{c.nombre}</p>
                <Nota>{c.detalle}</Nota>
              </div>
              {c.lista ? (
                <Estado listo>Conectado</Estado>
              ) : (
                <BotonLink href={c.href}>Conectar</BotonLink>
              )}
            </li>
          ))}
        </ul>
      </Tarjeta>

      {baseLista && <Hoy />}
    </>
  );
}

async function Hoy() {
  const db = base()!;
  const { topePorNumero } = leerConfig().whatsapp;
  const [prospectos, whatsapp, mails, llamadas, planillas] = await Promise.all([
    contar(
      db.from("prospectos").select("id", { count: "exact", head: true }).gte("creado_en", inicioDeHoy()),
    ),
    enviadosHoy(db, "whatsapp"),
    enviadosHoy(db, "mail"),
    contar(db.from("llamadas").select("id", { count: "exact", head: true }).gte("fecha", hoyISO())),
    listarPlanillas(db),
  ]);
  const primera = planillas[0];
  let avance = null;
  if (primera) {
    const { columnas, filas } = await planillaCompleta(db, primera.id);
    avance = avanceDe(primera, columnas, filas);
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <Titulo>Hoy</Titulo>
        <div className="flex flex-wrap gap-3">
          <Dato nombre="Prospectos nuevos">{prospectos}</Dato>
          <Dato nombre="WhatsApp enviados">
            {whatsapp}{" "}
            <span className="text-[15px] font-semibold text-tenue">
              tope {topePorNumero} por número
            </span>
          </Dato>
          <Dato nombre="Mails enviados">{mails}</Dato>
          <Dato nombre="Llamadas por delante">{llamadas}</Dato>
        </div>
      </section>

      {avance && (
        <Tarjeta className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Titulo>
              Contenido · {avance.planilla} · {avance.etiqueta}
            </Titulo>
            <Link href="/contenido" className="text-sm font-bold underline decoration-naranja underline-offset-4">
              Ver planilla
            </Link>
          </div>
          <div className="flex flex-wrap gap-5">
            {avance.metas.map((m) => (
              <Avance key={m.nombre} {...m} />
            ))}
          </div>
        </Tarjeta>
      )}
    </>
  );
}
