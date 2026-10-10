---
description: Trae tus campañas de Meta Ads y las muestra en la pantalla Ads del dashboard
---

Actualizá la pantalla **Ads** del dashboard con los números reales de la cuenta de Meta de la persona. Hablale en castellano, corto y sin tecnicismos.

1. **Leé las campañas** con las herramientas del MCP de Meta Ads. Si no las tenés, frená y mandala a la guía del dashboard: Conexiones, Meta Ads. Si tiene más de una cuenta publicitaria, preguntá cuál.
2. **Período:** los últimos 7 días, salvo que te pida otro ($ARGUMENTS).
3. Por cada campaña con gasto en el período (o activa), juntá: id, nombre, estado (`ACTIVE`, `PAUSED`, etc.), gasto y resultados. "Resultados" es la cantidad del objetivo principal de la campaña (mensajes iniciados, formularios enviados, compras, clics si es de tráfico). Si las campañas tienen objetivos distintos, usá el resultado propio de cada una y avisalo al final.
4. **Escribí** `datos/ads.json` (creá la carpeta si falta) con esta forma exacta:

   ```json
   {
     "desde": "AAAA-MM-DD",
     "hasta": "AAAA-MM-DD",
     "moneda": "UYU",
     "campanas": [
       { "id": "123", "nombre": "Nombre de la campaña", "estado": "ACTIVE", "gasto": 4120.5, "resultados": 21 }
     ]
   }
   ```

   `moneda` es el código de la moneda de la cuenta publicitaria. Los números van sin símbolos ni separadores de miles.
5. **Guardá** corriendo `npm run ads:guardar -- datos/ads.json`. Si falla, mostrale el mensaje del script y arreglá la causa.
6. **Contale** en tres líneas cómo viene: gasto total, resultados y qué campaña rinde mejor y cuál peor. Decile que ya lo puede ver en la pantalla Ads.

Reglas: este comando solo lee. No pauses, no edites ni crees campañas salvo que te lo pida aparte y de forma explícita. No inventes números: si un dato no viene de Meta, dejalo afuera.
