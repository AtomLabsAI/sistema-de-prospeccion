import { cx } from "./ui";

// El aviso que acompaña todo lo que toca WhatsApp. Es sobrio a propósito,
// pero tiene que estar: los alumnos deben conocer el riesgo antes de usarlo.
export function AvisoWhatsApp({ tamano = "medio" }: { tamano?: "grande" | "medio" | "chico" }) {
  return (
    <div
      role="note"
      className={cx(
        "flex items-start gap-3 rounded-2xl border border-naranja bg-naranja-suave",
        tamano === "chico" ? "px-4 py-3" : "px-5 py-4",
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-5 w-5 flex-none text-naranja"
      >
        <path d="M12 3.5 2.5 20h19L12 3.5z" />
        <path d="M12 10v4.5" />
        <path d="M12 17.3v.2" />
      </svg>
      {tamano === "grande" ? (
        <div>
          <p className="text-[17px] font-bold">
            Antes de conectar: WhatsApp funciona con una API no oficial y Meta puede banear el número
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>No es un producto de Meta ni de WhatsApp. El bloqueo puede llegar sin aviso y no se revierte.</li>
            <li>Usá un número que puedas perder, no el personal ni el principal de tu negocio.</li>
            <li>El dashboard no manda mensajes solo: cada uno lo aprobás vos, con tope diario por número.</li>
          </ul>
        </div>
      ) : tamano === "medio" ? (
        <div>
          <p className="font-bold">WhatsApp funciona con una API no oficial: Meta puede banear el número</p>
          <p className="mt-0.5 text-sm">
            Los mensajes en frío son lo que más lo provoca. Usá un número que puedas perder, no el
            personal ni el principal del negocio.
          </p>
        </div>
      ) : (
        <p className="text-sm">
          <strong>WhatsApp va por una API no oficial y Meta puede banear el número.</strong> Los
          mensajes quedan en una cola y no sale ninguno sin que lo apruebes.
        </p>
      )}
    </div>
  );
}
