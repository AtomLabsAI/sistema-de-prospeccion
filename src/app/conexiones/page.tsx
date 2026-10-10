import { BotonLink, Encabezado, Estado, Nota, Tarjeta } from "@/components/ui";
import { listarConexiones } from "@/lib/conexiones";

export default async function Conexiones() {
  const conexiones = await listarConexiones();
  const listas = conexiones.filter((c) => c.lista).length;
  return (
    <>
      <Encabezado sobre={`${listas} de ${conexiones.length} listas`} titulo="Conexiones" />
      <p className="max-w-prose">
        Cada conexión tiene su guía paso a paso. Son independientes entre sí: conectá primero la
        base de datos y después las que vayas a usar.
      </p>
      <ul className="flex flex-col gap-3">
        {conexiones.map((c, i) => (
          <li key={c.id}>
            <Tarjeta className="flex flex-wrap items-center gap-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-crema font-extrabold text-fondo">
                {i + 1}
              </span>
              <div className="min-w-60 flex-1">
                <p className="text-lg font-extrabold">{c.nombre}</p>
                <Nota>{c.detalle}</Nota>
              </div>
              <Estado listo={c.lista}>{c.lista ? "Conectado" : "Falta conectar"}</Estado>
              <BotonLink href={c.href} variante={c.lista ? "secundario" : "primario"}>
                {c.lista ? "Ver guía" : "Conectar"}
              </BotonLink>
            </Tarjeta>
          </li>
        ))}
      </ul>
    </>
  );
}
