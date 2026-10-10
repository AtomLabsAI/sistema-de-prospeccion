---
description: Conecta el dashboard con tu proyecto de Supabase y crea las tablas
---

Conectá este dashboard con el proyecto de Supabase de la persona. Hablale en castellano, corto y sin tecnicismos.

1. **Buscá el proyecto** con las herramientas del conector de Supabase. Si no tenés esas herramientas, frená y decile que active el conector en claude.ai (Configuración, Conectores, Supabase) y reinicie Claude Code. Si hay más de un proyecto, preguntá cuál usar. Si no hay ninguno, ofrecé crearlo (región São Paulo).
2. **Creá las tablas** aplicando el contenido completo de `supabase/schema.sql` como una migración. Ese SQL se puede correr más de una vez sin romper nada. No lo modifiques.
3. **Guardá la URL** del proyecto en `config.local.json`, dentro de `supabase.url`. Si el archivo no existe, crealo con esta forma y completá solo la URL:

   ```json
   { "supabase": { "url": "", "key": "" } }
   ```

   Si ya existe, cambiá solo `supabase.url` y dejá intacto todo lo demás.
4. **Pedile la clave secreta.** El conector no puede leerla. Explicale dónde está: en su proyecto de Supabase, Project Settings, API Keys, sección "Secret keys" (empieza con `sb_secret_`). Decile que la pegue en el dashboard, en Conexiones, Base de datos, paso 2, y que toque "Guardar y probar". No le pidas que la pegue en el chat.
5. **Cerrá** diciéndole que cuando el dashboard muestre "Base conectada" ya puede seguir con las otras conexiones.

Reglas: nunca muestres ni escribas claves en el chat, nunca subas `config.local.json` a GitHub, y no le des a la clave pública (`sb_publishable_` o `anon`) acceso a las tablas: están cerradas con RLS a propósito.
