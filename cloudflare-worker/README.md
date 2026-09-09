# Cloudflare Worker — Correo Temporal v16

## Qué agrega
Este Worker sirve como puente para:
- Mailnesia
- Guerrilla Mail

## Desplegar
1. Cloudflare Dashboard → Workers & Pages.
2. Create → Worker.
3. Abra el editor.
4. Reemplace el código por `worker.js`.
5. Deploy.
6. Copie la URL `https://....workers.dev`.
7. En Correo Temporal, abra **Cloudflare Worker · Mailnesia + Guerrilla Mail**.
8. Pegue la URL y pulse **Conectar Worker**.

No necesita variables de entorno ni secretos.


## API v21 — FreeCustom + Temp-Mail Agency

Nuevas rutas:
- `GET /freecustom/create?alias=...&domain=...`
- `GET /freecustom/messages?address=...`
- `GET /freecustom/message?address=...&id=...`
- `GET /tempagency/create?alias=...&domain=...`
- `GET /tempagency/messages?uuid=...&emailId=...`
- `GET /tempagency/message?uuid=...&emailId=...&id=...`

Secrets:
- `FREECUSTOM_API_KEY` — requerido para activar FreeCustom.
- `FREECUSTOM_GATEWAY_KEY` — recomendado para proteger el uso de la cuota.
- Se mantienen los Secrets de MailSlurp si usa la bandeja 30+ días.

Mailnesia ya no se expone en `/domains`; las rutas antiguas de lectura se conservan solo por compatibilidad.
