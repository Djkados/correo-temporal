# Cloudflare Worker — Correo Temporal API v24

## Proveedores activos
- GrabMail — 8 dominios públicos, sin API key.
- DuckMail — dominios dinámicos.
- Mailsac — `mailsac.com`, API oficial con `MAILSAC_API_KEY`.
- Inboxes — dominios dinámicos mediante RapidAPI con `INBOXES_RAPIDAPI_KEY`.
- MailSlurp — bandeja 30+ días y espera directa.
- DropMail se consulta directamente desde el navegador con token `af_…`.

## Compatibilidad legacy
- Temp-Mail Agency — solo lectura de bandejas creadas por v31 cuando la sesión quedó guardada.
- Mailnesia — solo lectura legacy.
- Guerrilla Mail — solo lectura legacy; nunca crea correos nuevos.

## Rutas principales
- `GET /health`
- `GET /domains`
- `GET /diagnostics/providers`
- `GET /grabmail/create?alias=...&domain=...`
- `GET /grabmail/messages?address=...`
- `GET /grabmail/message?address=...&id=...`
- `GET /mailsac/create?alias=...`
- `GET /mailsac/messages?address=...`
- `GET /mailsac/message?address=...&id=...`
- `GET /inboxes/create?alias=...&domain=...`
- `GET /inboxes/messages?address=...`
- `GET /inboxes/message?id=...`
- `GET /duckmail/create?alias=...&domain=...`
- `GET /duckmail/messages?token=...`
- `GET /duckmail/message?token=...&id=...`
- `GET /mailslurp/long-inbox`
- `GET /mailslurp/wait?...`

## Variables / Secrets de Cloudflare
- `MAILSLURP_API_KEY` — Secret.
- `MAILSLURP_GATEWAY_KEY` — Secret recomendado.
- `MAILSAC_API_KEY` — Secret.
- `INBOXES_RAPIDAPI_KEY` — Secret.
- `INBOXES_RAPIDAPI_HOST` — variable normal; valor actual recomendado: `inboxes-com.p.rapidapi.com`.

`FREECUSTOM_API_KEY` y `FREECUSTOM_GATEWAY_KEY` ya no se utilizan y pueden eliminarse.

## Desplegar
1. Cloudflare Dashboard → Workers & Pages → `correo-temp-api`.
2. **Edit code**.
3. Reemplace el código por `worker.js`.
4. **Deploy**.
5. Abra `/health` y confirme `Correo Temporal API v24`.
6. Abra `/diagnostics/providers` para revisar Mailsac, Inboxes, DuckMail y GrabMail sin mostrar Secrets.
