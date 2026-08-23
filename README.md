# Correo Temporal Mini v16 — PWA

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
