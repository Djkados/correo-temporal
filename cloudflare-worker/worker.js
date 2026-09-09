const MAILNESIA_FALLBACK = [
  "mailnesia.com",
  "airmailed.shop",
  "bulkfinder.site",
  "emaill.mom",
  "mailed.click",
  "poofmail.fit"
];

const GUERRILLA_FALLBACK = [
  "sharklasers.com",
  "guerrillamail.info",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me"
];

const GM_API = "https://api.guerrillamail.com/ajax.php";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function textDecode(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html = "") {
  return textDecode(
    String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
  ).trim();
}

function localPart(address) {
  return String(address || "").trim().toLowerCase().split("@")[0] || "";
}

async function getMailnesiaDomains() {
  try {
    const res = await fetch("https://mailnesia.com/domains.html", {
      headers: {"User-Agent": "CorreoTemporalWorker/1.0"}
    });
    if (!res.ok) throw new Error("mailnesia domains");
    const html = await res.text();
    const section = html.match(/<h1[^>]*>\s*Domains\s*<\/h1>([\s\S]*?)(?:Built with|<\/body>)/i)?.[1] || html;
    const found = [...section.matchAll(/(?:^|[>\s])([a-z0-9][a-z0-9.-]+\.[a-z]{2,})(?:[<\s]|$)/gi)]
      .map(m => m[1].toLowerCase())
      .filter(d => !d.includes("mailnesia.com/") && !d.startsWith("www."));
    const unique = [...new Set(found)];
    return unique.length ? ["mailnesia.com", ...unique.filter(d => d !== "mailnesia.com")] : MAILNESIA_FALLBACK;
  } catch {
    return MAILNESIA_FALLBACK;
  }
}

async function getGuerrillaDomains() {
  try {
    const res = await fetch("https://www.guerrillamail.com/en/inbox", {
      headers: {"User-Agent": "CorreoTemporalWorker/1.0"}
    });
    if (!res.ok) throw new Error("gm domains");
    const html = await res.text();

    const found = [...html.matchAll(/<option[^>]*value=["']?([^"'<> ]+\.[a-z]{2,})["']?[^>]*>/gi)]
      .map(m => m[1].toLowerCase())
      .filter(d => !d.includes("/"));

    const unique = [...new Set(found)];
    return unique.length ? unique : GUERRILLA_FALLBACK;
  } catch {
    return GUERRILLA_FALLBACK;
  }
}

function parseRss(xml) {
  const items = [];
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  const pick = (block, tag) => {
    const cdata = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i"));
    if (cdata) return cdata[1].trim();
    const normal = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    return normal ? textDecode(normal[1].trim()) : "";
  };

  itemBlocks.forEach((m, idx) => {
    const block = m[1];
    const title = pick(block, "title") || "(Sin asunto)";
    const link = pick(block, "link");
    const description = pick(block, "description");
    const pubDate = pick(block, "pubDate");
    const guid = pick(block, "guid") || link || `mailnesia-${idx}-${pubDate}`;

    items.push({
      id: guid,
      from: "",
      sender: "",
      subject: stripHtml(title),
      intro: stripHtml(description).slice(0, 180),
      createdAt: pubDate,
      text: stripHtml(description),
      html: description,
      sourceUrl: link
    });
  });

  return items;
}

async function mailnesiaMessages(address) {
  const user = localPart(address);
  if (!user) throw new Error("Dirección inválida");

  const url = `https://mailnesia.com/rss/${encodeURIComponent(user)}?mailcount=50&format=html`;
  const res = await fetch(url, {
    headers: {"User-Agent": "CorreoTemporalWorker/1.0"}
  });

  if (!res.ok) throw new Error(`Mailnesia HTTP ${res.status}`);
  const xml = await res.text();
  return parseRss(xml);
}

function clientMeta(request) {
  return {
    ip:
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
      "127.0.0.1",
    agent: String(
      request.headers.get("User-Agent") ||
      "CorreoTemporal/1.0"
    ).slice(0, 160)
  };
}

function phpSessionFromSetCookie(value = "") {
  const match = String(value).match(/(?:^|[,\s])PHPSESSID=([^;,\s]+)/i);
  return match ? match[1] : "";
}

async function gmCall(request, params, phpSession = "") {
  const meta = clientMeta(request);

  const qs = new URLSearchParams({
    lang: "en",
    ip: meta.ip,
    agent: meta.agent,
    ...params
  });

  const headers = {
    "User-Agent": "CorreoTemporalWorker/1.0",
    "Accept": "application/json",
    "Referer": "https://www.guerrillamail.com/"
  };

  if (phpSession) {
    headers["Cookie"] = `PHPSESSID=${phpSession}`;
  }

  const res = await fetch(`${GM_API}?${qs.toString()}`, {
    method: "GET",
    headers,
    redirect: "follow"
  });

  const raw = await res.text();

  if (!res.ok) {
    throw new Error(`Guerrilla HTTP ${res.status}`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Guerrilla devolvió una respuesta inválida");
  }

  const setCookie =
    res.headers.get("set-cookie") ||
    "";

  const newSession =
    phpSessionFromSetCookie(setCookie) ||
    phpSession;

  return {
    data,
    phpSession: newSession
  };
}

async function guerrillaCreate(request, alias, domain) {
  // 1) Inicializar sesión. Guerrilla mantiene estado con PHPSESSID.
  const start = await gmCall(request, {
    f: "get_email_address"
  });

  let session = start.phpSession;

  if (!session) {
    throw new Error("Guerrilla no devolvió PHPSESSID");
  }

  // 2) Cambiar únicamente el username; la API no recibe el dominio aquí.
  // Los dominios públicos de Guerrilla funcionan como aliases del mismo inbox.
  const updated = await gmCall(
    request,
    {
      f: "set_email_user",
      email_user: alias
    },
    session
  );

  session = updated.phpSession || session;

  const canonical =
    updated.data?.email_addr ||
    start.data?.email_addr ||
    "";

  return {
    // Se mantiene el nombre sidToken por compatibilidad con la app,
    // pero su contenido ahora es el PHPSESSID real.
    sidToken: session,
    canonicalAddress: canonical,
    requestedAddress: `${alias}@${domain}`,
    domain
  };
}

async function guerrillaMessages(request, session) {
  const result = await gmCall(
    request,
    {
      f: "get_email_list",
      offset: "0"
    },
    session
  );

  const data = result.data || {};

  return (data.list || [])
    .filter(m => !/no-reply@guerrillamail\.com/i.test(String(m.mail_from || "")))
    .map(m => ({
      id: String(m.mail_id),
      from: textDecode(m.mail_from || ""),
      sender: textDecode(m.mail_from || ""),
      subject: textDecode(m.mail_subject || "(Sin asunto)"),
      intro: textDecode(m.mail_excerpt || ""),
      createdAt: m.mail_timestamp
        ? new Date(Number(m.mail_timestamp) * 1000).toISOString()
        : (m.mail_date || ""),
      seen: Number(m.mail_read || 0) === 1
    }));
}

async function guerrillaMessage(request, session, id) {
  const result = await gmCall(
    request,
    {
      f: "fetch_email",
      email_id: String(id)
    },
    session
  );

  const m = result.data || {};

  return {
    id: String(m.mail_id || id),
    from: textDecode(m.mail_from || ""),
    sender: textDecode(m.mail_from || ""),
    subject: textDecode(m.mail_subject || "(Sin asunto)"),
    text: stripHtml(m.mail_body || ""),
    html: m.mail_body || "",
    createdAt: m.mail_timestamp
      ? new Date(Number(m.mail_timestamp) * 1000).toISOString()
      : (m.mail_date || "")
  };
}

const DUCK_API = "https://api.duckmail.sbs";

async function duckRequest(path, options = {}) {
  const res = await fetch(`${DUCK_API}${path}`, {
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.body ? {"Content-Type":"application/json"} : {}),
      ...(options.headers || {}),
      "User-Agent": "CorreoTemporalWorker/1.0"
    }
  });

  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {}

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `DuckMail HTTP ${res.status}`);
  }
  return data;
}

async function getDuckMailDomains() {
  try {
    const data = await duckRequest("/domains?page=1");
    return (data?.["hydra:member"] || [])
      .filter(d => d?.isVerified !== false)
      .map(d => String(d?.domain || "").toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function duckPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "Dk!";
  crypto.getRandomValues(new Uint8Array(18)).forEach(v => {
    out += alphabet[v % alphabet.length];
  });
  return out;
}

async function duckCreate(alias, domain) {
  const address = `${alias}@${domain}`.toLowerCase();
  const password = duckPassword();

  let account;
  try {
    account = await duckRequest("/accounts", {
      method:"POST",
      body:JSON.stringify({
        address,
        password,
        expiresIn:259200
      })
    });
  } catch (err) {
    if (!/409|exist/i.test(String(err?.message || ""))) throw err;

    const alt = `${alias}${Math.floor(Math.random()*90+10)}@${domain}`.toLowerCase();
    account = await duckRequest("/accounts", {
      method:"POST",
      body:JSON.stringify({
        address:alt,
        password,
        expiresIn:259200
      })
    });
  }

  const actualAddress = String(account?.address || address).toLowerCase();
  const tokenData = await duckRequest("/token", {
    method:"POST",
    body:JSON.stringify({
      address:actualAddress,
      password
    })
  });

  return {
    address:actualAddress,
    accountId:account?.id || tokenData?.id || "",
    token:tokenData?.token || "",
    expiresIn:259200
  };
}

function mapDuckListMessage(m) {
  return {
    id:String(m?.id || ""),
    from:m?.from?.address || m?.from?.name || "",
    sender:m?.from?.address || "",
    subject:m?.subject || "(Sin asunto)",
    intro:"",
    createdAt:m?.createdAt || "",
    seen:m?.seen === true
  };
}

async function duckMessages(token) {
  const data = await duckRequest("/messages?page=1", {
    headers:{"Authorization":`Bearer ${token}`}
  });

  return {
    messages:(data?.["hydra:member"] || []).map(mapDuckListMessage)
  };
}

async function duckMessage(token, id) {
  const m = await duckRequest(`/messages/${encodeURIComponent(id)}`, {
    headers:{"Authorization":`Bearer ${token}`}
  });

  return {
    message:{
      id:String(m?.id || id),
      from:m?.from?.address || m?.from?.name || "",
      sender:m?.from?.address || "",
      subject:m?.subject || "(Sin asunto)",
      text:m?.text || "",
      html:Array.isArray(m?.html) ? m.html.join("\n") : (m?.html || ""),
      createdAt:m?.createdAt || ""
    }
  };
}


const FREECUSTOM_API = "https://api2.freecustom.email";
const TEMPAGENCY_API = "https://api.temp-mail.agency/api";
const TEMPAGENCY_APP_UUID = "a5x-cj6a-ka1q";

function requireFreeCustomGateway(request, env) {
  if (!env.FREECUSTOM_API_KEY) {
    const err = new Error("FREECUSTOM_API_KEY no configurada");
    err.status = 503;
    throw err;
  }

  if (env.FREECUSTOM_GATEWAY_KEY) {
    const provided = request.headers.get("X-FreeCustom-Gateway") || "";
    if (provided !== env.FREECUSTOM_GATEWAY_KEY) {
      const err = new Error("Clave privada FreeCustom inválida");
      err.status = 401;
      throw err;
    }
  }
}

async function freeCustomRequest(env, path, options={}) {
  if (!env.FREECUSTOM_API_KEY) {
    throw new Error("FREECUSTOM_API_KEY no configurada");
  }

  const res = await fetch(`${FREECUSTOM_API}${path}`, {
    ...options,
    headers:{
      "Accept":"application/json",
      "Authorization":`Bearer ${env.FREECUSTOM_API_KEY}`,
      ...(options.body ? {"Content-Type":"application/json"} : {}),
      ...(options.headers || {})
    }
  });

  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {}

  if (!res.ok) {
    const err = new Error(
      data?.message || data?.error || data?.detail || `FreeCustom HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function getFreeCustomDomains(env) {
  if (!env.FREECUSTOM_API_KEY) return [];
  try {
    const data = await freeCustomRequest(env, "/v1/domains");
    const rows = Array.isArray(data?.data) ? data.data : [];
    return [...new Set(rows
      .filter(item => item?.domain && item?.expired !== true)
      .map(item => String(item.domain).toLowerCase()))];
  } catch {
    return [];
  }
}

async function freeCustomCreate(request, env, alias, domain) {
  requireFreeCustomGateway(request, env);
  const domains = await getFreeCustomDomains(env);
  if (!domains.includes(domain)) {
    const err = new Error("Dominio FreeCustom no disponible");
    err.status = 400;
    throw err;
  }

  const address = `${alias}@${domain}`.toLowerCase();
  try {
    await freeCustomRequest(env, "/v1/inboxes", {
      method:"POST",
      body:JSON.stringify({inbox:address, isTesting:true})
    });
  } catch (err) {
    if (Number(err?.status) !== 409) throw err;
  }

  return {provider:"freecustom", address, domain};
}

function mapFreeCustomMessage(m) {
  return {
    id:String(m?.id || ""),
    from:String(m?.from || ""),
    sender:String(m?.from || ""),
    subject:String(m?.subject || "(Sin asunto)"),
    intro:"",
    createdAt:m?.date || "",
    otp:m?.otp || "",
    verificationLink:m?.verification_link || ""
  };
}

async function freeCustomMessages(request, env, address) {
  requireFreeCustomGateway(request, env);
  const data = await freeCustomRequest(
    env,
    `/v1/inboxes/${encodeURIComponent(address)}/messages?limit=50`
  );
  return {messages:(data?.data?.messages || []).map(mapFreeCustomMessage)};
}

async function freeCustomMessage(request, env, address, id) {
  requireFreeCustomGateway(request, env);
  const data = await freeCustomRequest(
    env,
    `/v1/inboxes/${encodeURIComponent(address)}/messages/${encodeURIComponent(id)}`
  );
  const m = data?.data || {};
  return {message:{
    id:String(m?.id || id),
    from:String(m?.from || ""),
    sender:String(m?.from || ""),
    subject:String(m?.subject || "(Sin asunto)"),
    text:String(m?.text || ""),
    html:String(m?.html || ""),
    createdAt:m?.date || "",
    otp:m?.otp || "",
    verificationLink:m?.verification_link || ""
  }};
}

async function tempAgencyPost(path, fields={}) {
  const body = new URLSearchParams();
  Object.entries(fields).forEach(([key,value]) => body.set(key, String(value)));

  const res = await fetch(`${TEMPAGENCY_API}${path}`, {
    method:"POST",
    headers:{
      "Accept":"application/json",
      "Content-Type":"application/x-www-form-urlencoded",
      "User-Agent":"CorreoTemporalWorker/1.0"
    },
    body:body.toString()
  });

  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {}
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `Temp-Mail Agency HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data || {};
}

async function tempAgencyCreateClient() {
  const data = await tempAgencyPost("/client/create", {app_uuid:TEMPAGENCY_APP_UUID});
  const uuid = String(data?.client?.uuid || "");
  if (!uuid) throw new Error("Temp-Mail Agency no devolvió client UUID");
  return data;
}

async function getTempAgencyDomains() {
  try {
    const session = await tempAgencyCreateClient();
    const uuid = session.client.uuid;
    const data = await tempAgencyPost("/domains", {uuid});
    return [...new Set((data?.domains || [])
      .map(item => String(item?.name || "").toLowerCase())
      .filter(Boolean))];
  } catch {
    return [];
  }
}

async function tempAgencyCreate(alias, domain) {
  const session = await tempAgencyCreateClient();
  const uuid = session.client.uuid;
  const domainData = await tempAgencyPost("/domains", {uuid});
  const selected = (domainData?.domains || []).find(
    item => String(item?.name || "").toLowerCase() === domain
  );
  if (!selected?.id) {
    const err = new Error("Dominio Temp-Mail Agency no disponible");
    err.status = 400;
    throw err;
  }

  const data = await tempAgencyPost("/email/custom", {
    uuid,
    alias,
    domain_id:selected.id
  });
  const email = data?.email || {};
  if (!email?.address || !email?.id) throw new Error("Temp-Mail Agency no devolvió bandeja válida");

  return {
    provider:"tempagency",
    address:String(email.address).toLowerCase(),
    domain:String(email.domain_name || domain).toLowerCase(),
    clientUuid:uuid,
    emailId:String(email.id),
    createdAt:email.created_at || ""
  };
}

function mapTempAgencyMessage(m) {
  return {
    id:String(m?.id || ""),
    from:String(m?.from || ""),
    sender:String(m?.from || ""),
    subject:String(m?.subject || "(Sin asunto)"),
    intro:stripHtml(m?.body || "").slice(0,180),
    text:stripHtml(m?.body || ""),
    html:String(m?.body || ""),
    createdAt:m?.created_at || ""
  };
}

async function tempAgencyMessages(uuid, emailId) {
  const data = await tempAgencyPost("/messages", {
    uuid,
    selected_email_id:emailId
  });
  return {messages:(data?.messages || []).map(mapTempAgencyMessage)};
}

async function tempAgencyMessage(uuid, emailId, id) {
  const list = await tempAgencyMessages(uuid, emailId);
  return {message:list.messages.find(m => String(m.id) === String(id)) || {}};
}

const MAILSLURP_API = "https://api.mailslurp.com";
const MAILSLURP_TAG = "correo-temporal-30d";

function requireMailSlurpGateway(request, env) {
  if (!env.MAILSLURP_API_KEY) {
    throw new Error("MAILSLURP_API_KEY no configurada");
  }

  // Recomendado: protege esta bandeja larga con una segunda clave.
  if (env.MAILSLURP_GATEWAY_KEY) {
    const provided = request.headers.get("X-MailSlurp-Gateway") || "";
    if (provided !== env.MAILSLURP_GATEWAY_KEY) {
      const err = new Error("Clave privada MailSlurp inválida");
      err.status = 401;
      throw err;
    }
  }
}

async function mailslurpRequest(env, path, options={}) {
  if (!env.MAILSLURP_API_KEY) {
    throw new Error("MAILSLURP_API_KEY no configurada");
  }

  const res = await fetch(`${MAILSLURP_API}${path}`, {
    ...options,
    headers: {
      "Accept": "application/json",
      "x-api-key": env.MAILSLURP_API_KEY,
      ...(options.body ? {"Content-Type":"application/json"} : {}),
      ...(options.headers || {})
    }
  });

  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {}

  if (!res.ok) {
    const err = new Error(
      data?.message ||
      data?.error ||
      data?.detail ||
      `MailSlurp HTTP ${res.status}`
    );
    err.status = res.status;
    throw err;
  }

  return data;
}

function normalizeMailSlurpInbox(inbox) {
  return {
    address: inbox?.emailAddress || "",
    inboxId: inbox?.id || "",
    createdAt: inbox?.createdAt || "",
    expiresAt: inbox?.expiresAt || "",
    permanent: !inbox?.expiresAt,
    tags: Array.isArray(inbox?.tags) ? inbox.tags : []
  };
}

async function getOrCreateMailSlurpLongInbox(env) {
  const inboxes = await mailslurpRequest(env, "/inboxes");
  const list = Array.isArray(inboxes) ? inboxes : [];

  let existing = list.find(inbox =>
    Array.isArray(inbox?.tags) && inbox.tags.includes(MAILSLURP_TAG)
  );

  if (!existing) {
    existing = list.find(inbox =>
      String(inbox?.name || "") === "Correo Temporal 30+ dias"
    );
  }

  if (existing) {
    return normalizeMailSlurpInbox(existing);
  }

  const created = await mailslurpRequest(env, "/inboxes/withOptions", {
    method: "POST",
    body: JSON.stringify({
      name: "Correo Temporal 30+ dias",
      description: "Bandeja persistente para pruebas de 20 a 30 dias",
      useDomainPool: true,
      useShortAddress: true,
      favourite: true,
      tags: [MAILSLURP_TAG]
    })
  });

  const result = normalizeMailSlurpInbox(created);

  // Si el plan aplicó una expiración automática, exigimos al menos 21 días
  // para que sea útil en la prueba solicitada.
  if (result.expiresAt) {
    const remaining = new Date(result.expiresAt).getTime() - Date.now();
    if (Number.isFinite(remaining) && remaining < 21 * 24 * 60 * 60 * 1000) {
      throw new Error(
        "El plan de MailSlurp creó una bandeja con menos de 21 días de vigencia"
      );
    }
  }

  return result;
}

function mapMailSlurpPreview(m) {
  return {
    id: String(m?.id || ""),
    from: m?.from || m?.sender || "",
    sender: m?.from || m?.sender || "",
    subject: m?.subject || "(Sin asunto)",
    intro: m?.preview || "",
    createdAt: m?.createdAt || "",
    seen: m?.read === true
  };
}

async function mailSlurpMessages(env, inboxId) {
  const data = await mailslurpRequest(
    env,
    `/inboxes/${encodeURIComponent(inboxId)}/emails/paginated?page=0&size=20&sort=DESC`
  );

  return {
    messages: (data?.content || []).map(mapMailSlurpPreview)
  };
}

async function mailSlurpMessage(env, id) {
  const m = await mailslurpRequest(
    env,
    `/emails/${encodeURIComponent(id)}`
  );

  return {
    message: {
      id: String(m?.id || id),
      from: m?.from || m?.sender || "",
      sender: m?.from || m?.sender || "",
      subject: m?.subject || "(Sin asunto)",
      text: m?.body || m?.bodyExcerpt || "",
      html: m?.html || m?.body || "",
      createdAt: m?.createdAt || ""
    }
  };
}


async function mailSlurpWaitLatest(env, inboxId, timeout, since="") {
  if (!env.MAILSLURP_API_KEY) {
    throw new Error("MAILSLURP_API_KEY no configurada");
  }

  const safeTimeout = Math.max(1000, Math.min(Number(timeout || 110000), 110000));
  const qs = new URLSearchParams({
    inboxId:String(inboxId),
    timeout:String(safeTimeout),
    unreadOnly:"true",
    sort:"DESC"
  });
  if (since) qs.set("since", String(since));

  const res = await fetch(`${MAILSLURP_API}/waitForLatestEmail?${qs.toString()}`, {
    headers:{
      "Accept":"application/json",
      "x-api-key":env.MAILSLURP_API_KEY
    }
  });

  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {}

  // MailSlurp documenta 408 cuando la espera termina sin encontrar email.
  if (res.status === 408) {
    return {timedOut:true, message:null};
  }

  if (!res.ok) {
    const err = new Error(
      data?.message || data?.error || data?.detail || `MailSlurp HTTP ${res.status}`
    );
    err.status = res.status;
    throw err;
  }

  return {
    timedOut:false,
    message:{
      id:String(data?.id || ""),
      from:data?.from || data?.sender || "",
      sender:data?.from || data?.sender || "",
      subject:data?.subject || "(Sin asunto)",
      text:data?.body || data?.bodyExcerpt || "",
      html:data?.html || data?.body || "",
      createdAt:data?.createdAt || ""
    }
  };
}


export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {status:204, headers:corsHeaders()});
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health") {
        return json({
          ok:true,
          service:"Correo Temporal API v22",
          capabilities:{
            guerrillaCookieSession:true,
            mailnesia:false,
            freecustom:!!env.FREECUSTOM_API_KEY,
            tempagency:true,
            duckmail:true,
            mailslurp:!!env.MAILSLURP_API_KEY,
            mailslurpWait:!!env.MAILSLURP_API_KEY
          }
        });
      }

      if (url.pathname === "/domains") {
        const [freecustom, tempagency, guerrilla, duckmail] = await Promise.all([
          getFreeCustomDomains(env),
          getTempAgencyDomains(),
          getGuerrillaDomains(),
          getDuckMailDomains()
        ]);
        return json({freecustom, tempagency, guerrilla, duckmail});
      }

      if (url.pathname === "/freecustom/create") {
        const alias = String(url.searchParams.get("alias") || "").trim().toLowerCase();
        const domain = String(url.searchParams.get("domain") || "").trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9._-]{2,30}$/.test(alias)) return json({error:"Alias inválido"}, 400);
        return json(await freeCustomCreate(request, env, alias, domain));
      }

      if (url.pathname === "/freecustom/messages") {
        const address = String(url.searchParams.get("address") || "").trim().toLowerCase();
        if (!address.includes("@")) return json({error:"Dirección inválida"}, 400);
        return json(await freeCustomMessages(request, env, address));
      }

      if (url.pathname === "/freecustom/message") {
        const address = String(url.searchParams.get("address") || "").trim().toLowerCase();
        const id = String(url.searchParams.get("id") || "").trim();
        if (!address.includes("@") || !id) return json({error:"Falta address o id"}, 400);
        return json(await freeCustomMessage(request, env, address, id));
      }

      if (url.pathname === "/tempagency/create") {
        const alias = String(url.searchParams.get("alias") || "").trim().toLowerCase();
        const domain = String(url.searchParams.get("domain") || "").trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9._-]{2,30}$/.test(alias)) return json({error:"Alias inválido"}, 400);
        return json(await tempAgencyCreate(alias, domain));
      }

      if (url.pathname === "/tempagency/messages") {
        const uuid = String(url.searchParams.get("uuid") || "").trim();
        const emailId = String(url.searchParams.get("emailId") || "").trim();
        if (!uuid || !emailId) return json({error:"Falta uuid o emailId"}, 400);
        return json(await tempAgencyMessages(uuid, emailId));
      }

      if (url.pathname === "/tempagency/message") {
        const uuid = String(url.searchParams.get("uuid") || "").trim();
        const emailId = String(url.searchParams.get("emailId") || "").trim();
        const id = String(url.searchParams.get("id") || "").trim();
        if (!uuid || !emailId || !id) return json({error:"Faltan datos de mensaje"}, 400);
        return json(await tempAgencyMessage(uuid, emailId, id));
      }

      if (url.pathname === "/mailslurp/long-inbox") {
        requireMailSlurpGateway(request, env);
        return json(await getOrCreateMailSlurpLongInbox(env));
      }

      if (url.pathname === "/mailslurp/wait") {
        requireMailSlurpGateway(request, env);
        const inboxId = String(url.searchParams.get("inboxId") || "");
        const timeout = Number(url.searchParams.get("timeout") || 110000);
        const since = String(url.searchParams.get("since") || "");
        if (!inboxId) return json({error:"Falta inboxId"}, 400);
        return json(await mailSlurpWaitLatest(env, inboxId, timeout, since));
      }

      if (url.pathname === "/mailslurp/messages") {
        requireMailSlurpGateway(request, env);
        const inboxId = String(url.searchParams.get("inboxId") || "");
        if (!inboxId) return json({error:"Falta inboxId"}, 400);
        return json(await mailSlurpMessages(env, inboxId));
      }

      if (url.pathname === "/mailslurp/message") {
        requireMailSlurpGateway(request, env);
        const id = String(url.searchParams.get("id") || "");
        if (!id) return json({error:"Falta id"}, 400);
        return json(await mailSlurpMessage(env, id));
      }

      if (url.pathname === "/duckmail/create") {
        const alias = String(url.searchParams.get("alias") || "").trim().toLowerCase();
        const domain = String(url.searchParams.get("domain") || "").trim().toLowerCase();

        if (!/^[a-z0-9][a-z0-9._-]{2,30}$/.test(alias)) {
          return json({error:"Alias inválido"}, 400);
        }

        const domains = await getDuckMailDomains();
        if (!domains.includes(domain)) {
          return json({error:"Dominio DuckMail no disponible"}, 400);
        }

        return json(await duckCreate(alias, domain));
      }

      if (url.pathname === "/duckmail/messages") {
        const token = String(url.searchParams.get("token") || "");
        if (!token) return json({error:"Falta token"}, 400);
        return json(await duckMessages(token));
      }

      if (url.pathname === "/duckmail/message") {
        const token = String(url.searchParams.get("token") || "");
        const id = String(url.searchParams.get("id") || "");
        if (!token || !id) return json({error:"Falta token o id"}, 400);
        return json(await duckMessage(token, id));
      }

      if (url.pathname === "/mailnesia/messages") {
        const messages = await mailnesiaMessages(url.searchParams.get("address"));
        return json({messages});
      }

      if (url.pathname === "/mailnesia/message") {
        const address = url.searchParams.get("address");
        const id = url.searchParams.get("id");
        const messages = await mailnesiaMessages(address);
        const message = messages.find(m => String(m.id) === String(id)) || {};
        return json({message});
      }

      if (url.pathname === "/guerrilla/create") {
        const alias = String(url.searchParams.get("alias") || "").trim();
        const domain = String(url.searchParams.get("domain") || "sharklasers.com").trim();

        if (!/^[a-z0-9][a-z0-9._-]{2,30}$/i.test(alias)) {
          return json({error:"Alias inválido"}, 400);
        }
        if (!GUERRILLA_FALLBACK.includes(domain)) {
          const live = await getGuerrillaDomains();
          if (!live.includes(domain)) return json({error:"Dominio Guerrilla inválido"}, 400);
        }

        return json(await guerrillaCreate(request, alias, domain));
      }

      if (url.pathname === "/guerrilla/messages") {
        const sid = String(url.searchParams.get("sid") || "");
        if (!sid) return json({error:"Falta sid"}, 400);
        return json({messages:await guerrillaMessages(request, sid)});
      }

      if (url.pathname === "/guerrilla/message") {
        const sid = String(url.searchParams.get("sid") || "");
        const id = String(url.searchParams.get("id") || "");
        if (!sid || !id) return json({error:"Falta sid o id"}, 400);
        return json({message:await guerrillaMessage(request, sid, id)});
      }

      return json({error:"Ruta no encontrada"}, 404);
    } catch (err) {
      return json(
        {error:err?.message || String(err)},
        Number(err?.status || 500)
      );
    }
  }
};
