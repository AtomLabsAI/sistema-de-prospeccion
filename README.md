# Sistema de Prospección · Template de Atom

Buscá negocios, escribiles por WhatsApp y por mail, seguí tus anuncios y tu contenido, y agendá tus llamadas de venta. Todo en un dashboard que corre en tu compu y guarda los datos en tu propia base.

> ## ⚠️ WhatsApp va por una API NO OFICIAL: te pueden banear el número
>
> La conexión con WhatsApp no es un producto de Meta. Meta puede bloquear el número **sin aviso y sin vuelta atrás**, sobre todo si mandás mensajes en frío.
>
> - Usá un número que puedas perder. **Nunca** el personal ni el principal de tu negocio.
> - El dashboard no manda nada solo: cada mensaje lo aprobás vos, uno por uno, con tope diario por número.
> - Si no querés correr ese riesgo, no conectes WhatsApp. El resto del dashboard funciona igual.

```
Vos ──► Dashboard (en tu compu) ──► Supabase (tu base de datos)
              │
              ├──► Apify ............ busca negocios en Google Maps
              ├──► WhatsApp ......... hasta 3 números, API no oficial
              ├──► Gmail ............ correos en frío
              └──► Claude + Meta .... trae tus anuncios
```

---

## 0. Antes de empezar

| Qué | Dónde | Para qué |
|---|---|---|
| Node.js **22.13 o más** (la que ofrece hoy nodejs.org sirve) | [nodejs.org](https://nodejs.org) | Correr el dashboard |
| Git | [git-scm.com](https://git-scm.com) | Bajar el template y sus piezas |
| Claude Code | [claude.com/claude-code](https://claude.com/claude-code) | Conectar la base y traer tus anuncios |
| Cuenta de Supabase | [supabase.com](https://supabase.com) | Tu base de datos |

Las demás cuentas (Apify, Gmail, Meta) las vas conectando cuando las necesites.

## 1. Copiá el template

En GitHub: **Use this template → Create a new repository**. Después clonalo:

```bash
git clone https://github.com/TU-USUARIO/TU-REPO.git
```

```bash
cd TU-REPO && npm install
```

## 2. Prendé el dashboard

```bash
npm run dev
```

Abrí [http://127.0.0.1:3000](http://127.0.0.1:3000). Si ese puerto está ocupado, la terminal te muestra la dirección que usó.

El dashboard solo se puede abrir desde tu compu. No tiene login porque no sale de ahí.

## 3. Conectá lo que vayas a usar

Entrá a **Conexiones**. Cada una tiene su guía paso a paso dentro del dashboard, y son independientes: empezá por la base de datos y seguí con las que quieras.

| # | Conexión | Qué necesitás | Tiempo |
|---|---|---|---|
| 1 | **Base de datos** (Supabase) | Un proyecto de Supabase. Con Claude Code: `/conectar` | 5 min |
| 2 | **Scraper** (Apify) | Tu token de Apify | 2 min |
| 3 | **WhatsApp** | Un celular con el número a vincular. Leé el aviso de arriba | 3 min por número |
| 4 | **Mail** (Gmail) | Una contraseña de aplicación de Google | 3 min |
| 5 | **Meta Ads** | Conectar el MCP de Meta con Claude | 5 min |

### Hasta 3 números de WhatsApp en un mismo celular

- **Número 1:** la cuenta que ya tenés en WhatsApp.
- **Número 2:** en la misma app, Ajustes → Agregar cuenta. Cambiás de una a otra con doble toque en tu foto de perfil, abajo, igual que en Instagram.
- **Número 3:** WhatsApp Business, que es otra app.

Cada número se vincula escaneando un QR que aparece en el dashboard (Conexiones → WhatsApp).

## 4. Cómo se usa

| Pantalla | Qué hacés ahí |
|---|---|
| **Prospectos** | Buscás negocios por rubro y ciudad, los tildás y los mandás a la cola de WhatsApp o de mail |
| **WhatsApp** | Revisás cada mensaje, lo editás si hace falta y lo aprobás. Tope: 30 por día por número |
| **Mail** | Lo mismo, por correo. Tope: 40 por día |
| **Ads** | Ves gasto, resultados y costo por resultado de tus campañas. Se actualiza con `/actualizar-ads` en Claude Code |
| **Contenido** | Planillas por semana: vos elegís qué medir y la meta de cada cosa |
| **Llamadas** | Una lista para no olvidarte de ninguna llamada de venta |
| **CRM** | Bloqueado. Es el seguimiento de leads por etapas; para tenerlo, hablá con Atom |

Los topes diarios los podés cambiar en las pantallas de WhatsApp y de Mail. Cuanto más bajos, menos riesgo.

### Comandos para Claude Code

Abrí Claude Code en la carpeta del proyecto y escribí:

| Comando | Qué hace |
|---|---|
| `/conectar` | Encuentra tu proyecto de Supabase, crea las tablas y te dice dónde pegar la clave |
| `/actualizar-ads` | Lee tus campañas de Meta y las muestra en la pantalla Ads |

También le podés pedir cambios en castellano: *"agregá una columna de Instagram a los prospectos"*, *"quiero otra plantilla de WhatsApp para seguimiento"*.

## Dónde quedan tus datos

| Qué | Dónde | ¿Se sube a GitHub? |
|---|---|---|
| Prospectos, mensajes, llamadas, métricas | Tu proyecto de Supabase | No |
| Claves (Supabase, Apify, Gmail) | `config.local.json`, en tu compu | **No** (está en `.gitignore`) |
| Sesiones de WhatsApp y una copia de los chats de la última semana de cada número vinculado | Carpeta `.whatsapp/`, en tu compu | **No** (está en `.gitignore`) |

No compartas `config.local.json` ni la carpeta `.whatsapp/`: quien las tenga puede leer tu base, leer esos chats y escribir desde tus números.

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `npm install` falla | Revisá que tengas Git instalado y Node 22.13 o más (`node --version`) |
| WhatsApp dice que necesita otro Node | Instalá la última versión desde nodejs.org, cerrá el dashboard y volvé a abrirlo |
| "Falta crear las tablas" | Corré `/conectar` en Claude Code, o seguí el paso 3 de la guía de Supabase |
| "Esa es la clave pública" | Copiaste la clave equivocada. Va la **secreta**, que empieza con `sb_secret_` |
| El QR de WhatsApp no aparece | Esperá 10 segundos. Si sigue igual, tocá **Conectar** de nuevo |
| Un número quedó "Se desconectó" | Tocá **Reconectar**. Si pide QR otra vez, el celular cerró la sesión |
| Gmail no acepta los datos | Tiene que ser una contraseña de aplicación, con verificación en dos pasos activa |
| La búsqueda de negocios tarda mucho | Es normal que tarde de 1 a 3 minutos. Probá con menos resultados |
| Quedaron procesos de WhatsApp corriendo | `npm run whatsapp:detener` |
| Algo se rompió | Decile a Claude qué ves: *"en Prospectos me sale este error: …"* |

## Lo que tenés que saber antes de mandar mensajes en frío

- **WhatsApp:** arrancá un número nuevo con pocos mensajes por día y subí de a poco. Si te reportan como spam, el baneo llega rápido.
- **Mail:** Google corta los envíos cerca de los 500 por día en cuentas comunes, y el correo en frío puede caer en spam. Escribí mensajes cortos y personales.
- **Datos:** el scraper trae información pública de Google Maps. Revisá las reglas de tu país sobre contactar negocios que no te escribieron primero.

---

Hecho por Atom. WhatsApp funciona con el [WhatsApp Assistant](https://github.com/IgnacioMiranda6/whatsapp-assistant), creado por Diego Marvid.
