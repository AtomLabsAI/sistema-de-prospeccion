// Fechas en hora local de la compu donde corre el dashboard.

const dos = (n: number) => String(n).padStart(2, "0");

export function aFechaISO(d: Date): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export function hoyISO(): string {
  return aFechaISO(new Date());
}

// Instante en que empezó el día de hoy: se usa para los topes diarios.
export function inicioDeHoy(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// Semana ISO (lunes a domingo) de una fecha: etiqueta "W41" y el lunes.
export function semanaDe(fecha: Date): { etiqueta: string; lunes: string } {
  const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  // El jueves de la semana define a qué año pertenece.
  const jueves = new Date(lunes);
  jueves.setDate(lunes.getDate() + 3);
  const primerJueves = new Date(jueves.getFullYear(), 0, 4);
  const numero =
    1 +
    Math.round(
      ((jueves.getTime() - primerJueves.getTime()) / 86400000 -
        3 +
        ((primerJueves.getDay() + 6) % 7)) /
        7,
    );
  return { etiqueta: `W${numero}`, lunes: aFechaISO(lunes) };
}

const deISO = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
};

export function sumarDias(iso: string, dias: number): string {
  const d = deISO(iso);
  d.setDate(d.getDate() + dias);
  return aFechaISO(d);
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

// "5 al 11 oct" o "28 sep al 4 oct"
export function rangoSemana(lunesISO: string): string {
  const lunes = deISO(lunesISO);
  const domingo = deISO(sumarDias(lunesISO, 6));
  const fin = `${domingo.getDate()} ${MESES[domingo.getMonth()]}`;
  return lunes.getMonth() === domingo.getMonth()
    ? `${lunes.getDate()} al ${fin}`
    : `${lunes.getDate()} ${MESES[lunes.getMonth()]} al ${fin}`;
}

// "mié 14 oct · 15:00"
export function fechaCorta(iso: string, hora?: string | null): string {
  const d = deISO(iso);
  const texto = `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
  return hora ? `${texto} · ${hora.slice(0, 5)}` : texto;
}

// "hoy a las 9:40" o "8 oct a las 18:05"
export function momento(isoCompleto: string): string {
  const d = new Date(isoCompleto);
  const hora = `${d.getHours()}:${dos(d.getMinutes())}`;
  return aFechaISO(d) === hoyISO()
    ? `hoy a las ${hora}`
    : `el ${d.getDate()} ${MESES[d.getMonth()]} a las ${hora}`;
}
