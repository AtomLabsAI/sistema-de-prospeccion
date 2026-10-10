@AGENTS.md

# Dashboard de prospección · reglas para Claude

Template de Atom para alumnos que no programan. Hablales en castellano rioplatense, corto y sin tecnicismos. Cuando termines un cambio, deciles qué pantalla abrir para verlo.

## Qué es

Dashboard que corre **en la compu de la persona** (`npm run dev`, solo en 127.0.0.1) y guarda sus datos en **su** proyecto de Supabase. No tiene login ni se publica en internet: no agregues deploy ni autenticación salvo que te lo pidan.

Stack: Next.js (App Router, sin Cache Components), TypeScript, Tailwind v4, Supabase.

## Mapa

| Dónde | Qué hay |
|---|---|
| `src/app/<pantalla>/page.tsx` | Una carpeta por pantalla del menú |
| `src/app/conexiones/<id>/page.tsx` | Las guías paso a paso de cada conexión |
| `src/acciones/*.ts` | Acciones del servidor: todo lo que escribe en la base o envía algo |
| `src/lib/*.ts` | Config, Supabase, WhatsApp, Apify, mail, fechas |
| `src/components/*.tsx` | Piezas de interfaz compartidas (`ui.tsx` tiene botones, tarjetas, campos) |
| `supabase/schema.sql` | Todas las tablas. Se puede correr varias veces |
| `scripts/*.mjs` | Utilidades de terminal (`ads:guardar`, `whatsapp:detener`) |
| `.claude/commands/` | `/conectar` y `/actualizar-ads` |

## Reglas que no se negocian

1. **WhatsApp nunca envía solo.** El único camino de salida es `aprobarMensaje` (`src/acciones/mensajes.ts`): un clic de la persona por mensaje, con tope diario por número. No agregues "enviar todos", envíos programados, reintentos automáticos ni respuestas automáticas, aunque te lo pidan como atajo: explicá que eso es lo que hace banear los números.
2. **El aviso de riesgo se queda.** `AvisoWhatsApp` aparece en toda pantalla que toque WhatsApp, y hay que aceptar el riesgo antes de vincular un número. Es sobrio a propósito (no lo vuelvas un cartel gigante), pero no lo escondas ni lo saques.
3. **Las claves no salen de la compu.** Viven en `config.local.json` (ignorado por Git) y se leen solo en el servidor con `leerConfig()`. Nunca las muestres enteras, nunca las mandes al navegador, nunca las escribas en el chat ni en el código. Lo mismo con la carpeta `.whatsapp/`.
4. **La base está cerrada con RLS y sin políticas.** El dashboard entra con la clave secreta, solo desde el servidor. No agregues políticas para la clave pública ni uses Supabase desde componentes cliente.
5. **El CRM está bloqueado a propósito.** No lo construyas ni lo desbloquees: es un producto aparte de Atom.

## Cómo agregar cosas

- **Una tabla o columna:** sumala a `supabase/schema.sql` de forma que se pueda correr de nuevo (`create table if not exists`, `add column if not exists`), activale RLS y aplicala al proyecto de la persona. Actualizá el tipo en `src/lib/tipos.ts`.
- **Una pantalla:** carpeta en `src/app/`, envolvé el contenido que use datos con `<PuertaBase>` y agregala a `SECCIONES` en `src/components/menu.tsx`.
- **Un formulario:** `FormAccion` + `BotonEnviar`, con una acción en `src/acciones/` que devuelva `bien(...)` o `mal(...)` en palabras que entienda alguien que no programa.

## Diseño

Marca Atom en oscuro y **liso**: sin texturas, sin degradados, sin sombras. Usá solo los colores de `src/app/globals.css` (`fondo`, `superficie`, `linea`, `crema`, `tenue`, `celeste`, `naranja`). Tipografía Montserrat. El naranja es para avisos; el celeste, para avances y estados positivos. Botones y campos de 44 px de alto como mínimo.

## Antes de dar algo por terminado

```bash
npm run tipos && npm run lint && npm run build
```
