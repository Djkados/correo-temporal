# Correo Temporal Mini v25 — PWA

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
