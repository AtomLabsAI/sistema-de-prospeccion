import "server-only";

// Scraper de Google Maps de Apify (actor compass/crawler-google-places).
const API = "https://api.apify.com/v2";
const ACTOR = "compass~crawler-google-places";

export type NegocioEncontrado = {
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
};

const cabeceras = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export async function probarApify(token: string): Promise<{ ok: boolean; usuario?: string }> {
  try {
    const r = await fetch(`${API}/users/me`, {
      headers: cabeceras(token),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return { ok: false };
    const { data } = (await r.json()) as { data?: { username?: string } };
    return { ok: true, usuario: data?.username };
  } catch {
    return { ok: false };
  }
}

type ItemApify = {
  title?: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  address?: string;
  city?: string;
  categoryName?: string;
  totalScore?: number;
  reviewsCount?: number;
  url?: string;
  placeId?: string;
  emails?: string[];
};

const pausa = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

// Lanza una búsqueda y espera a que termine (suele tardar de 1 a 3 minutos).
export async function buscarNegocios(opciones: {
  token: string;
  rubro: string;
  ciudad: string;
  cantidad: number;
  conMails: boolean;
}): Promise<NegocioEncontrado[]> {
  const { token, rubro, ciudad, cantidad, conMails } = opciones;

  const inicio = await fetch(`${API}/acts/${ACTOR}/runs`, {
    method: "POST",
    headers: cabeceras(token),
    body: JSON.stringify({
      searchStringsArray: [rubro],
      locationQuery: ciudad,
      maxCrawledPlacesPerSearch: cantidad,
      language: "es",
      skipClosedPlaces: true,
      // Extra pago de Apify: entra al sitio web de cada negocio a buscar el mail.
      scrapeContacts: conMails,
    }),
  });
  if (inicio.status === 401) throw new Error("Apify rechazó el token. Revisalo en Conexiones.");
  if (inicio.status === 402) throw new Error("Tu cuenta de Apify se quedó sin crédito.");
  if (!inicio.ok) throw new Error(`Apify no pudo iniciar la búsqueda (error ${inicio.status}).`);
  const corrida = ((await inicio.json()) as { data: { id: string; defaultDatasetId: string } }).data;

  const limite = Date.now() + 6 * 60 * 1000;
  for (;;) {
    await pausa(4000);
    const r = await fetch(`${API}/actor-runs/${corrida.id}`, { headers: cabeceras(token) });
    const estado = r.ok ? ((await r.json()) as { data: { status: string } }).data.status : "";
    if (estado === "SUCCEEDED") break;
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(estado)) {
      throw new Error("La búsqueda de Apify falló. Probá de nuevo con menos resultados.");
    }
    if (Date.now() > limite) {
      throw new Error("La búsqueda está tardando demasiado. Probá con menos resultados.");
    }
  }

  const r = await fetch(`${API}/datasets/${corrida.defaultDatasetId}/items?clean=true`, {
    headers: cabeceras(token),
  });
  if (!r.ok) throw new Error("No se pudieron leer los resultados de Apify.");
  const items = (await r.json()) as ItemApify[];

  return items
    .filter((item) => item.title)
    .map((item) => ({
      nombre: item.title!,
      telefono: item.phoneUnformatted || item.phone || null,
      email: item.emails?.[0] ?? null,
      sitio_web: item.website ?? null,
      direccion: item.address ?? null,
      ciudad: item.city ?? ciudad,
      rubro: item.categoryName ?? rubro,
      rating: item.totalScore ?? null,
      resenas: item.reviewsCount ?? null,
      maps_url: item.url ?? null,
      place_id: item.placeId ?? null,
    }));
}
