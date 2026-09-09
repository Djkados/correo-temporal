import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve('/mnt/data/v32_1work');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerSrc = path.join(root, 'cloudflare-worker', 'worker.js');
const workerMjs = path.join(root, 'tests', '_worker-v32-under-test.mjs');
fs.copyFileSync(workerSrc, workerMjs);
const workerMod = await import(pathToFileURL(workerMjs).href + `?t=${Date.now()}`);
const worker = workerMod.default;

function jsonResponse(obj, status=200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {'Content-Type':'application/json'}
  });
}

function textResponse(text, status=200, contentType='text/plain') {
  return new Response(text, {status, headers:{'Content-Type':contentType}});
}

function section(source, startText, endText) {
  const start = source.indexOf(startText);
  assert.notEqual(start, -1, `Missing section start: ${startText}`);
  const end = source.indexOf(endText, start + startText.length);
  assert.notEqual(end, -1, `Missing section end: ${endText}`);
  return source.slice(start, end);
}

function testFrontendProviderSet() {
  assert.match(index, /const APP_VERSION = '32\.1'/, 'frontend version should be 32.0');
  const pool = section(index, 'function availableDomainPool()', 'function activeProviderItems()');
  assert.match(pool, /provider:'mailsac'/, 'Mailsac must be in new-mail pool');
  assert.match(pool, /provider:'inboxes'/, 'Inboxes must be in new-mail pool');
  assert.doesNotMatch(pool, /provider:'tempagency'/, 'Temp-Mail Agency must not be in final new-mail pool');
  assert.doesNotMatch(pool, /provider:'guerrilla'/, 'Guerrilla must not return to new-mail pool');
  assert.doesNotMatch(pool, /provider:'freecustom'/, 'FreeCustom must not return to new-mail pool');
  assert.match(index, /Mailsac/, 'Mailsac should be visible in UI');
  assert.match(index, /Inboxes/, 'Inboxes should be visible in UI');
  assert.match(index, /Manual · ahorra cuota/, 'quota-sensitive providers should not background-poll');
}

async function testHealthAndDomains() {
  globalThis.fetch = async (url, options={}) => {
    const u = String(url);
    if (u === 'https://mailsac.com/api/me') {
      assert.equal(options.headers['Mailsac-Key'], 'mailsac-secret');
      return jsonResponse({_id:'acct'});
    }
    if (u === 'https://inboxes-com.p.rapidapi.com/domains') {
      assert.equal(options.headers['X-RapidAPI-Key'], 'rapid-secret');
      assert.equal(options.headers['X-RapidAPI-Host'], 'inboxes-com.p.rapidapi.com');
      return jsonResponse([{qdn:'guysmail.com'}, {qdn:'chapsmail.com'}, {qdn:'blondmail.com'}]);
    }
    if (u.startsWith('https://api.duckmail.sbs/domains')) {
      return jsonResponse({'hydra:member':[{domain:'duckmail.sbs',isVerified:true}]});
    }
    throw new Error('Unexpected upstream URL: ' + u);
  };

  const env = {
    MAILSAC_API_KEY:'mailsac-secret',
    INBOXES_RAPIDAPI_KEY:'rapid-secret',
    INBOXES_RAPIDAPI_HOST:'inboxes-com.p.rapidapi.com'
  };

  const healthRes = await worker.fetch(new Request('https://worker.test/health'), env);
  const health = await healthRes.json();
  assert.equal(health.service, 'Correo Temporal API v26');
  assert.equal(health.capabilities.mailsac, true);
  assert.equal(health.capabilities.inboxes, true);
  assert.equal(health.capabilities.tempagency, false);
  assert.equal(health.capabilities.guerrilla, false);
  assert.equal(health.capabilities.freecustom, false);

  const domainsRes = await worker.fetch(new Request('https://worker.test/domains'), env);
  const domains = await domainsRes.json();
  assert.deepEqual(domains.mailsac, ['mailsac.com']);
  assert.deepEqual(domains.inboxes, ['guysmail.com', 'chapsmail.com', 'blondmail.com']);
  assert.equal('tempagency' in domains, false);
  assert.equal('guerrilla' in domains, false);
  assert.equal('freecustom' in domains, false);
}

async function testMailsacCreateListAndDetail() {
  globalThis.fetch = async (url, options={}) => {
    const u = String(url);
    assert.equal(options.headers?.['Mailsac-Key'], 'mailsac-secret');
    if (u === 'https://mailsac.com/api/me') return jsonResponse({_id:'acct'});
    if (u === 'https://mailsac.com/api/addresses/sol27%40mailsac.com/messages') {
      return jsonResponse([{_id:'ms-1', from:[{address:'security@example.com'}], subject:'Código', received:'2026-09-08T20:00:00Z'}]);
    }
    if (u === 'https://mailsac.com/api/addresses/sol27%40mailsac.com/messages/ms-1') {
      return jsonResponse({_id:'ms-1', from:[{address:'security@example.com'}], subject:'Código', received:'2026-09-08T20:00:00Z'});
    }
    if (u === 'https://mailsac.com/api/text/sol27%40mailsac.com/ms-1') {
      return textResponse('Tu código es 483921');
    }
    if (u === 'https://mailsac.com/api/body/sol27%40mailsac.com/ms-1') {
      return textResponse('<p>Tu código es <b>483921</b></p>', 200, 'text/html');
    }
    throw new Error('Unexpected Mailsac URL: ' + u);
  };

  const env = {MAILSAC_API_KEY:'mailsac-secret'};
  const createRes = await worker.fetch(new Request('https://worker.test/mailsac/create?alias=sol27'), env);
  const created = await createRes.json();
  assert.equal(createRes.status, 200);
  assert.equal(created.provider, 'mailsac');
  assert.equal(created.address, 'sol27@mailsac.com');

  const listRes = await worker.fetch(new Request('https://worker.test/mailsac/messages?address=sol27%40mailsac.com'), env);
  const list = await listRes.json();
  assert.equal(list.messages.length, 1);
  assert.equal(list.messages[0].id, 'ms-1');
  assert.equal(list.messages[0].subject, 'Código');

  const detailRes = await worker.fetch(new Request('https://worker.test/mailsac/message?address=sol27%40mailsac.com&id=ms-1'), env);
  const detail = await detailRes.json();
  assert.equal(detail.message.id, 'ms-1');
  assert.match(detail.message.text, /483921/);
  assert.match(detail.message.html, /483921/);
}

async function testInboxesCreateListAndDetail() {
  globalThis.fetch = async (url, options={}) => {
    const u = String(url);
    assert.equal(options.headers?.['X-RapidAPI-Key'], 'rapid-secret');
    assert.equal(options.headers?.['X-RapidAPI-Host'], 'inboxes-com.p.rapidapi.com');
    if (u === 'https://inboxes-com.p.rapidapi.com/inboxes/luna44%40replyloop.com' && options.method === 'POST') {
      return jsonResponse({active:true});
    }
    if (u === 'https://inboxes-com.p.rapidapi.com/inboxes/luna44%40replyloop.com' && (!options.method || options.method === 'GET')) {
      return jsonResponse([{uid:'ib-1', from:'security@example.com', subject:'Verify', date:'2026-09-08T20:00:00Z', mail_html:'<p>Code 772244</p>'}]);
    }
    if (u === 'https://inboxes-com.p.rapidapi.com/messages/ib-1') {
      return jsonResponse({uid:'ib-1', from:'security@example.com', subject:'Verify', text:'Code 772244', html:'<p>Code 772244</p>', date:'2026-09-08T20:00:00Z'});
    }
    throw new Error('Unexpected Inboxes URL: ' + u + ' method=' + (options.method || 'GET'));
  };

  const env = {
    INBOXES_RAPIDAPI_KEY:'rapid-secret',
    INBOXES_RAPIDAPI_HOST:'inboxes-com.p.rapidapi.com'
  };

  const createRes = await worker.fetch(new Request('https://worker.test/inboxes/create?alias=luna44&domain=replyloop.com'), env);
  const created = await createRes.json();
  assert.equal(createRes.status, 200);
  assert.equal(created.provider, 'inboxes');
  assert.equal(created.address, 'luna44@replyloop.com');

  const listRes = await worker.fetch(new Request('https://worker.test/inboxes/messages?address=luna44%40replyloop.com'), env);
  const list = await listRes.json();
  assert.equal(list.messages.length, 1);
  assert.equal(list.messages[0].id, 'ib-1');

  const detailRes = await worker.fetch(new Request('https://worker.test/inboxes/message?id=ib-1'), env);
  const detail = await detailRes.json();
  assert.match(detail.message.text, /772244/);
}

async function testDiagnosticsNoSecretLeak() {
  const mailsacSecret = 'MAILSAC_SUPER_SECRET';
  const rapidSecret = 'RAPID_SUPER_SECRET';

  globalThis.fetch = async (url, options={}) => {
    const u = String(url);
    if (u === 'https://mailsac.com/api/me') return jsonResponse({_id:'acct'});
    if (u === 'https://inboxes-com.p.rapidapi.com/domains') return jsonResponse([{qdn:'guysmail.com'}]);
    if (u.startsWith('https://api.duckmail.sbs/domains')) return jsonResponse({'hydra:member':[{domain:'duckmail.sbs',isVerified:true}]});
    throw new Error('Unexpected diagnostic URL: ' + u);
  };

  const res = await worker.fetch(new Request('https://worker.test/diagnostics/providers'), {
    MAILSAC_API_KEY:mailsacSecret,
    INBOXES_RAPIDAPI_KEY:rapidSecret,
    INBOXES_RAPIDAPI_HOST:'inboxes-com.p.rapidapi.com',
    MAILSLURP_API_KEY:'MAILSLURP_SECRET'
  });
  const text = await res.text();
  const body = JSON.parse(text);
  assert.equal(res.status, 200);
  assert.equal(body.mailsac.ok, true);
  assert.equal(body.mailsac.domains, 1);
  assert.equal(body.inboxes.ok, true);
  assert.equal(body.inboxes.domains, 1);
  assert.equal('tempagency' in body, false);
  assert.doesNotMatch(text, new RegExp(mailsacSecret));
  assert.doesNotMatch(text, new RegExp(rapidSecret));
  assert.doesNotMatch(text, /MAILSLURP_SECRET/);
}

testFrontendProviderSet();
await testHealthAndDomains();
await testMailsacCreateListAndDetail();
await testInboxesCreateListAndDetail();
await testDiagnosticsNoSecretLeak();
console.log('v32 provider tests: PASS');
