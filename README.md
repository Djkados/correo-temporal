# Correo Temporal Mini v32 — PWA

Esta versión está preparada para usarse e instalarse tanto en PC como en celular.

## Instalación
La instalación PWA requiere que el sitio se publique por HTTPS (o se ejecute en localhost).

### Android
Chrome/Edge → botón “Instalar” dentro de la app o “Agregar a pantalla de inicio”.

### PC (Windows/macOS/Linux)
Chrome o Edge → botón “Instalar” dentro de la app o icono de instalación en la barra de direcciones.

### iPhone/iPad
Safari → Compartir → Agregar a pantalla de inicio.

## Incluye
- Responsive para PC y móvil.
- Manifest PWA.
- Service Worker.
- Iconos 192 y 512 px.
- Modo standalone.
- App shell disponible offline.
- Las llamadas de correo NO se cachean.
- Aviso cuando no hay conexión.
- Todo lo de v9:
  - correos cortos y múltiples dominios;
  - historial de 10 bandejas;
  - correo editable;
  - actualización cada 7 s cuando está visible;
  - OTP directo y copiable;
  - modo Esperar código;
  - vista completa de mensajes.

## Importante
El buzón necesita internet para consultar nuevos mensajes, incluso cuando la app está instalada.


## Cambio v11
- El botón **Copiar correo** ahora es rectangular y usa el mismo estilo visual de los otros botones.
- En celular se muestra a ancho completo debajo de la dirección.
- Se actualizó el Service Worker para que las nuevas versiones de GitHub Pages se reflejen mejor en la app instalada.


## Cambio v12 — dominios y segundo proveedor
- Selector de dominio antes de generar el correo.
- `@mail123.fr` queda como opción recomendada/favorita.
- Carga en vivo todos los dominios activos de Mail123.
- Fallback actualizado con 14 dominios conocidos de Mail123.
- Integra Mail.tm como segundo proveedor gratuito y muestra sus dominios activos.
- Opción “Automático” para escoger entre los dominios disponibles.
- Los buzones Mail.tm guardan localmente su token/contraseña temporal para poder reabrirlos desde el historial.
- Los correos Mail123 anteriores siguen funcionando con solo escribir la dirección.
- Service Worker actualizado para no cachear ninguna llamada a Mail123 ni Mail.tm.

### Nota
Mail.tm exige atribución visible; la app mantiene el enlace a Mail.tm en el pie de página.


## Cambio v13
- Se eliminó la ventana `confirm()` nativa del navegador al crear un correo nuevo.
- Ahora la confirmación aparece como un modal propio dentro de la app.
- Mantiene el mismo estilo visual de Correo Temporal.
- Botones: **Cancelar** y **Generar nuevo correo**.
- Ya no aparece el texto “djkados.github.io dice”.


## Cambio v14
### Correos recientes
- Buscador entre los últimos 10 correos.
- Flechas izquierda/derecha para recorrer toda la fila.
- Scroll suave y selección directa de cualquier bandeja reciente.

### Dominios
- `@mail123.site` destacado como dominio `.site`.
- Filtros rápidos: Todos / `.site` / `.shop` / `.us`.
- Los filtros muestran únicamente dominios realmente ofrecidos por Mail123 o Mail.tm.
- Si `.shop` o `.us` no están disponibles en los proveedores conectados, el botón queda deshabilitado en lugar de generar una dirección inválida.
- El botón “Dominios” vuelve a consultar la lista en vivo.


## Cambio v15 — 4 gestores
La app puede trabajar con:
1. **Mail123** — base principal, permite consultar buzones por dirección.
2. **Mail.tm** — cuentas temporales con token local.
3. **Mail.gw** — API compatible con Mail.tm; útil para verificaciones rápidas, con retención aproximada de 10 minutos.
4. **DropMail** — opcional mediante token gratuito `af_...`; aporta dominios públicos/rotativos y sesiones que se extienden al consultarlas.

### Extensiones
Filtros dinámicos:
- `.net`
- `.us`
- `.cloud`
- `.shop`
- `.site`

Los filtros solo se habilitan si algún gestor realmente ofrece un dominio con esa extensión en ese momento. La app no inventa dominios.

### DropMail
DropMail requiere desde 2026 un token gratuito generado en:
https://dropmail.me/api/

El token se guarda únicamente en `localStorage` del dispositivo y no forma parte del repositorio de GitHub.


## Cambio v16 — Worker + dominios reales adicionales

Se añade un Cloudflare Worker opcional para integrar proveedores que no funcionan de forma fiable directamente desde GitHub Pages.

### Proveedores del Worker
- **Mailnesia**:
  - `mailnesia.com`
  - `airmailed.shop`
  - `bulkfinder.site`
  - `emaill.mom`
  - `mailed.click`
  - `poofmail.fit`
- **Guerrilla Mail**:
  - `sharklasers.com`
  - `guerrillamail.info`
  - `grr.la`
  - `guerrillamail.biz`
  - `guerrillamail.com`
  - `guerrillamail.de`
  - `guerrillamail.net`
  - `guerrillamail.org`
  - `guerrillamailblock.com`
  - `pokemail.net`
  - `spam4.me`

### Publicación
Publica `cloudflare-worker/worker.js` como Cloudflare Worker y pega su URL HTTPS en la sección:
**Cloudflare Worker · Mailnesia + Guerrilla Mail**

La URL se guarda solamente en el navegador.


## Cambio v17 — limpieza y orden de dominios
- Los gestores con `0` dominios ya no aparecen en la fila de estado.
- Los gestores activos se muestran únicamente cuando realmente aportan dominios.
- El selector prioriza gestores con mayor variedad:
  1. Mailnesia
  2. Guerrilla Mail
  3. Mail123
  4. Mail.gw
  5. Mail.tm
  6. DropMail
- Los dominios se ordenan priorizando:
  `.shop`, `.site`, `.net`, `.us`, `.cloud` y después el resto.
- El modo Automático también prioriza esas extensiones antes de escoger aleatoriamente.


## Cambio v18 — interfaz compacta
- Se redujo el espacio vertical de la cabecera y las tarjetas.
- La sección de dominio ocupa menos alto.
- Filtros TLD y gestores tienen menos separación.
- Cloudflare Worker queda cerrado por defecto.
- DropMail queda cerrado por defecto.
- Acciones y estado del correo tienen menos margen vertical.
- La bandeja de entrada aparece bastante más arriba en PC y celular.


## Cambio v19 — interfaz enfocada en bandeja
- Cloudflare Worker y DropMail se movieron a **⚙️ Configuración**.
- La pantalla principal solo muestra un resumen de gestores activos y dominios.
- **Correos recientes** ahora es una sección plegable.
- La bandeja vacía se redujo a una franja compacta.
- Estado del correo resumido en una sola línea: proveedor, revisión en vivo y cantidad.
- Cuando se detecta un OTP, aparece arriba del correo en una banda destacada con botón **Copiar código**.
- Pie de página simplificado con cantidad de gestores conectados.
- La bandeja aparece bastante más arriba sin perder funciones.


## Cambio v20 — actualización forzada
- Corrige el problema donde la PWA instalada podía seguir mostrando v18/v19 desde caché.
- `sw.js` se registra con versión y `updateViaCache: none`.
- Se ejecuta `registration.update()` al abrir la app.
- Se eliminan automáticamente caches antiguas `correo-temporal-v*`.
- La navegación principal usa `fetch(..., {cache: "no-store"})`.
- Cuando se activa un Worker nuevo, la app recarga una sola vez.
- En **⚙️ Configuración** se muestra `Versión v20` para verificar que la actualización llegó.


## Cambio v21 — corrección crítica de generación
- Corrige referencias DOM faltantes del nuevo banner OTP.
- Ese error detenía el JavaScript antes de conectar el botón **Generar correo temporal**.
- Los proveedores externos ahora tienen timeout para evitar que uno con problemas congele la carga de dominios.
- `@mail123.fr` y cualquier dominio explícitamente seleccionado pueden generar el correo sin esperar a que terminen de cargar todos los gestores.
- Mail123 conserva un fallback local de dominios si las APIs externas fallan.
- El botón Generar se conecta antes que las funciones opcionales de configuración.
- Versión visible en ⚙️ Configuración: **v21**.


## Cambio v22 — Mailnesia/Guerrilla siempre disponibles
- El Cloudflare Worker del proyecto queda configurado por defecto:
  `https://correo-temp-api.djkados11.workers.dev`
- Ya no depende de que la URL sobreviva en `localStorage`.
- Mailnesia conserva fallback de 6 dominios.
- Guerrilla Mail conserva fallback de 11 dominios.
- `.shop`, `.site` y `.net` permanecen seleccionables aunque la consulta `/domains` tarde o falle temporalmente.
- `airmailed.shop` vuelve a estar disponible en el filtro `.shop`.
- Si el Worker responde, la app actualiza los dominios con la lista en vivo.
- Versión visible en Configuración: **v22**.


## Cambio v23 — corrección Guerrilla Mail
- Se corrigió `Guerrilla HTTP 400`.
- La API oficial de Guerrilla requiere:
  - `ip`
  - `agent`
  - sesión mediante cookie `PHPSESSID`
- El Worker ahora guarda y reutiliza `PHPSESSID` entre:
  - `get_email_address`
  - `set_email_user`
  - `get_email_list`
  - `fetch_email`
- El Worker pasa a **Correo Temporal API v17**.
- `/health` informa la capacidad `guerrillaCookieSession:true`.
- Los errores al generar ya no usan `alert()` del navegador; aparecen en un modal propio de la app.
- Frontend visible como **v23**.

### Importante
Esta versión requiere actualizar dos partes:
1. GitHub Pages: `index.html`, `sw.js`, `README.md`.
2. Cloudflare Worker: reemplazar su código por `cloudflare-worker/worker.js`.


## Cambio v24 — Automático realmente variado
- El modo **Automático** ya no prioriza siempre `.shop`.
- Primero elige aleatoriamente entre los gestores activos para evitar que un proveedor con muchos dominios domine el resultado.
- Si hay varios gestores disponibles, procura no repetir el mismo gestor dos veces seguidas.
- Dentro del gestor elegido, procura no repetir el mismo dominio consecutivamente.
- Guarda localmente el último gestor y dominio usados por Automático.
- Si seleccionas un filtro como `.shop`, `.net` o `.site`, Automático respeta ese filtro pero sigue variando dentro de las opciones disponibles.
- Los filtros manuales siguen funcionando igual.
- Versión visible en Configuración: **v24**.


## Cambio v25 — TempMail.lol como gestor principal
- Integra **TempMail.lol** mediante su API oficial v3.
- No requiere API key en el nivel gratuito.
- Usa `POST /v3/inboxes` para crear buzones.
- Usa `/v3/inboxes/:token/wait` para esperar nuevos mensajes.
- Guarda localmente los mensajes ya recibidos porque TempMail.lol consume los emails cuando los devuelve.
- TempMail.lol aparece en Automático como proveedor con dominio aleatorio.
- Guerrilla Mail sale del selector normal y del modo Automático por inestabilidad.
- Mailnesia se conserva para `.shop` y `.site`.
- Mail123 sigue siendo el proveedor base con mayor duración.
- El Worker pasa a **Correo Temporal API v18**.
- Frontend visible como **v25**.

### Nota sobre Generator.email
Generator.email es útil como servicio manual y ofrece muchos dominios, pero no publica una API oficial documentada. No se integra mediante scraping para evitar una dependencia frágil.


## Cambio v26 — DuckMail reemplaza TempMail.lol
- TempMail.lol se retira del modo Automático porque su nivel gratuito bloquea solicitudes desde la red compartida de Cloudflare.
- Se integra **DuckMail** mediante su API oficial.
- DuckMail no requiere API key para usar dominios públicos.
- Las cuentas DuckMail creadas por la app duran **3 días** (`expiresIn: 259200`).
- Los mensajes de DuckMail se conservan hasta 3 días según la documentación del proveedor.
- El Worker consulta dinámicamente `/domains`, crea la cuenta, obtiene Bearer token y lee mensajes/detalles.
- DuckMail entra en el selector y en Automático solo cuando devuelve dominios activos.
- Mail123 y Mailnesia siguen como gestores principales.
- Guerrilla continúa fuera del Automático.
- Worker: **Correo Temporal API v19**.
- Frontend: **v26**.

### TempMail.lol
Puede volver a habilitarse en el futuro si se usa una API key de pago o un backend cuya red sea aceptada por su nivel gratuito, pero ya no afecta la experiencia normal.


## Cambio v27 — aprendizaje de entregabilidad
- **Esperar código** ahora sirve también como prueba real de entregabilidad.
- Si pasan los 5 minutos completos sin recibir ningún mensaje:
  - 1.er fallo consecutivo → dominio **En observación**.
  - 2.º fallo consecutivo → dominio pausado en **Automático por 24 horas**.
  - 3.er fallo consecutivo o más → pausa de **72 horas**.
- Si llega cualquier correo durante la espera, el dominio recupera su estado y se reinician los fallos consecutivos.
- Los dominios pausados:
  - dejan de seleccionarse en **Automático**;
  - siguen visibles y utilizables manualmente.
- El selector marca dominios con:
  - `⚠️ observación`
  - `⚠️ pausado`
- En **⚙️ Configuración → Entregabilidad automática** se muestran los dominios penalizados.
- Botón **Restablecer** para borrar el historial de entregabilidad si hubo un falso negativo.
- Si todos los dominios de un filtro estuvieran pausados, Automático conserva un fallback para no quedar inutilizable.
- Frontend visible como **v27**.
- No requiere cambios en el Cloudflare Worker v19.


## Cambio v28 — bandeja permanente / 30+ días con MailSlurp
- Integra **MailSlurp** como proveedor especial para pruebas largas.
- No entra en Automático: aparece como **📬 MailSlurp · Bandeja 30+ días ⭐**.
- La app reutiliza siempre la misma bandeja identificada con la etiqueta `correo-temporal-30d`.
- Se crea sin fecha de expiración cuando el plan lo permite.
- Si MailSlurp impone una expiración menor a 21 días, la app la rechaza para no usarla en una prueba de 20 días.
- La API key de MailSlurp se guarda exclusivamente como Secret del Cloudflare Worker.
- Se admite un segundo Secret `MAILSLURP_GATEWAY_KEY` para proteger el acceso a esa bandeja desde el Worker.
- En la app solo se guarda esa clave secundaria, nunca la API key real.
- Worker: **Correo Temporal API v20**.
- Frontend: **v28**.

### Cloudflare Secrets
Añadir en Workers & Pages → `correo-temp-api` → Settings / Variables and Secrets:

1. `MAILSLURP_API_KEY`
   - API key creada en el panel de MailSlurp.
   - Guardar como **Secret**.

2. `MAILSLURP_GATEWAY_KEY` (recomendado)
   - Cualquier clave privada larga elegida por ti.
   - Guardar como **Secret**.
   - Pegar la misma clave en ⚙️ Configuración → Bandeja 30+ días.

### MailSlurp gratuito
El plan gratuito actual permite una bandeja permanente y recepción de correos dentro de sus límites mensuales. Si el proveedor cambia estas condiciones, la app mostrará el error real de su API.


## Cambio v29 — FreeCustom + Temp-Mail Agency

Mailnesia deja de ser un proveedor activo. Ya no aparece en el selector, no participa en Automático y no cuenta como gestor activo. Las bandejas antiguas de Mailnesia conservan lectura de compatibilidad mientras el proveedor siga respondiendo.

### Nuevos proveedores

#### FreeCustom.Email
- API oficial protegida por el Cloudflare Worker.
- El plan gratuito expone los dominios gratuitos de la cuenta (actualmente alrededor de 10 según su documentación).
- Permite registrar alias cortos elegidos por la app y leer mensajes completos.
- Requiere `FREECUSTOM_API_KEY` como Secret en Cloudflare.
- Se recomienda además `FREECUSTOM_GATEWAY_KEY` para que terceros no gasten la cuota de la API a través del Worker público.

#### Temp-Mail Agency
- API gratuita sin API key propia.
- La app consulta en vivo los dominios activos del proveedor.
- Cada nueva bandeja crea su propia sesión UUID y usa alias corto personalizado.
- La sesión y el ID de correo quedan guardados localmente para volver a leer la bandeja desde Correos recientes.

### Proveedores que quedan
- Mail123
- FreeCustom.Email
- Temp-Mail Agency
- DuckMail
- Mail.tm (cuando devuelve dominios)
- Mail.gw (cuando devuelve dominios)
- MailSlurp 30+ días
- DropMail opcional

Guerrilla sigue fuera de Automático. Mailnesia queda solo como compatibilidad de lectura para bandejas antiguas.

### Cloudflare Secrets para FreeCustom
En Cloudflare → Workers & Pages → `correo-temp-api` → Settings / Variables and Secrets:

1. `FREECUSTOM_API_KEY`
   - Cree una cuenta gratis en https://www.freecustom.email/
   - Dashboard → API → genere la API key.
   - Guárdela como **Secret**. Nunca la ponga en GitHub.

2. `FREECUSTOM_GATEWAY_KEY` (recomendado)
   - Use una clave privada larga elegida por usted.
   - Guárdela también como **Secret**.
   - Pegue la misma clave en ⚙️ Configuración → FreeCustom.Email dentro de la app.

### Worker
Esta versión requiere **Correo Temporal API v21**.

### Consumo del plan gratuito de FreeCustom
El plan Free actual limita a 1.000 solicitudes/mes, 1 req/s y 10 bandejas activas. Para no gastar la cuota demasiado rápido, la v29 consulta FreeCustom cada 60 segundos en uso normal y cada 15 segundos cuando pulsas **Esperar código**. Para pruebas largas sigue siendo mejor MailSlurp 30+ días.


## Cambio v30 — espera directa de correo
- MailSlurp 30+ días usa el endpoint oficial `GET /waitForLatestEmail` mediante Cloudflare Worker.
- Al pulsar **Esperar código** en MailSlurp, la app mantiene una petición abierta y MailSlurp responde cuando llega un correo; ya no consulta cada 7 segundos.
- La espera se realiza en bloques de hasta 110 segundos y se encadena durante la ventana de 5 minutos del botón.
- `unreadOnly=true` y `since` evitan devolver mensajes anteriores de la bandeja.
- Un timeout de MailSlurp (`HTTP 408`) se trata como espera normal y no como error.
- Si la espera directa falla, la app cae automáticamente a revisión cada 15 segundos.
- Para proveedores sin endpoint de espera, el polling normal baja de 7 a 30 segundos y **Esperar código** usa 15 segundos.
- FreeCustom conserva 60 segundos en uso normal por su cuota gratuita.
- MailSlurp conserva una comprobación normal cada 60 segundos cuando no está en modo Esperar código.
- Worker: **Correo Temporal API v22**.
- Frontend: **v30**.


## Cambio v31 — proveedores depurados
- **FreeCustom.Email eliminado** por no entregar dominios en la integración real.
- **Guerrilla Mail eliminado para correos nuevos**. Se conserva únicamente lectura legacy de sesiones guardadas anteriormente.
- **GrabMail añadido** con 8 dominios públicos oficiales y retención de mensajes de 5 días. No requiere cuenta ni API key.
- **DropMail promovido a proveedor principal**. Su configuración ya no queda escondida y sus dominios permanentes/rotativos entran al modo Automático cuando hay un token `af_…` válido.
- **Temp-Mail Agency** permanece integrado, pero solo aparece cuando realmente devuelve dominios activos.
- **DuckMail** continúa como proveedor principal dinámico.
- `/domains` ya no devuelve FreeCustom ni Guerrilla.
- Nuevo endpoint seguro `/diagnostics/providers` para ver estado HTTP, número de dominios y errores de proveedores sin revelar Secrets.
- `/health` pasa a **Correo Temporal API v23**.
- CORS del Worker permite correctamente `X-MailSlurp-Gateway`.
- Frontend visible como **v31**.

### Proveedores principales v31
1. Mail123
2. DuckMail
3. GrabMail
4. DropMail (con token af_)
5. Mail.tm / Mail.gw cuando tengan dominios
6. Temp-Mail Agency cuando su API entregue dominios
7. MailSlurp 30+ días para pruebas largas

### Limpieza de Cloudflare
Los Secrets `FREECUSTOM_API_KEY` y `FREECUSTOM_GATEWAY_KEY` ya no son utilizados por la v32 y pueden eliminarse de Cloudflare.


## v32 — Mailsac + Inboxes

Proveedores activos para correos nuevos:

- Mail123
- DuckMail
- GrabMail
- DropMail
- Mail.tm
- Mail.gw
- Mailsac
- Inboxes
- MailSlurp 30+ días (separado de Automático)

Temp-Mail Agency, Mailnesia y Guerrilla se conservan únicamente para lectura de bandejas antiguas cuando exista información local suficiente.

### Cloudflare — variables nuevas

Configura en `correo-temp-api` → Settings → Variables and Secrets:

- `MAILSAC_API_KEY` — Secret. Se obtiene en Mailsac → Dashboard → Credentials → API Keys & Users.
- `INBOXES_RAPIDAPI_KEY` — Secret. Se obtiene al suscribirse a Inboxes.com en RapidAPI.
- `INBOXES_RAPIDAPI_HOST` — Variable normal. Valor recomendado actual: `inboxes-com.p.rapidapi.com`.

El Worker pasa a `Correo Temporal API v24`.

### Control de cuota

Mailsac e Inboxes no hacen polling automático en segundo plano. La interfaz muestra `Manual · ahorra cuota`.
Al pulsar `Esperar código`, se revisan cada 30 segundos durante un máximo de 5 minutos.
MailSlurp mantiene su espera directa sin polling.
