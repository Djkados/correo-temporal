import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve('/mnt/data/v32_1work');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerSrc = path.join(root, 'cloudflare-worker', 'worker.js');
const workerMjs = path.join(root, 'tests', '_worker-under-test.mjs');
fs.copyFileSync(workerSrc, workerMjs);
const workerMod = await import(pathToFileURL(workerMjs).href + `?t=${Date.now()}`);
const worker = workerMod.default;

function responseJson(obj, status=200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {'Content-Type':'application/json'}
  });
}

async function testMailSlurpWaitTimeoutBecomesNormalResponse() {
  let upstreamUrl = '';
  globalThis.fetch = async (url, options={}) => {
    upstreamUrl = String(url);
    if (upstreamUrl.startsWith('https://api.mailslurp.com/waitForLatestEmail')) {
      return responseJson({message:'timeout'}, 408);
    }
    throw new Error('Unexpected upstream URL: ' + upstreamUrl);
  };

  const req = new Request('https://worker.test/mailslurp/wait?inboxId=abc-123&timeout=110000&since=2026-09-08T19%3A00%3A00.000Z', {
    headers: {'X-MailSlurp-Gateway':'gw'}
  });
  const res = await worker.fetch(req, {MAILSLURP_API_KEY:'api', MAILSLURP_GATEWAY_KEY:'gw'});
  const body = await res.json();

  assert.equal(res.status, 200, 'Wait timeout should be a normal worker response');
  assert.equal(body.timedOut, true, 'Timeout should be represented as timedOut=true');
  assert.match(upstreamUrl, /\/waitForLatestEmail\?/);
  assert.match(upstreamUrl, /inboxId=abc-123/);
  assert.match(upstreamUrl, /timeout=110000/);
  assert.match(upstreamUrl, /unreadOnly=true/);
  assert.match(upstreamUrl, /since=2026-09-08T19%3A00%3A00\.000Z/);
}

async function testMailSlurpWaitReturnsMappedEmail() {
  globalThis.fetch = async (url, options={}) => {
    const u = String(url);
    if (u.startsWith('https://api.mailslurp.com/waitForLatestEmail')) {
      return responseJson({
        id:'mail-1',
        from:'security@example.com',
        subject:'Your code is 481927',
        body:'Use code 481927 to continue',
        createdAt:'2026-09-08T19:00:10.000Z'
      });
    }
    throw new Error('Unexpected upstream URL: ' + u);
  };

  const req = new Request('https://worker.test/mailslurp/wait?inboxId=abc-123&timeout=110000', {
    headers: {'X-MailSlurp-Gateway':'gw'}
  });
  const res = await worker.fetch(req, {MAILSLURP_API_KEY:'api', MAILSLURP_GATEWAY_KEY:'gw'});
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.timedOut, false);
  assert.equal(body.message.id, 'mail-1');
  assert.equal(body.message.subject, 'Your code is 481927');
  assert.match(body.message.text, /481927/);
}

function testFrontendUsesLongWaitForMailSlurpAndSlowerPolling() {
  assert.match(index, /const ACTIVE_POLL_MS = 30 \* 1000/);
  assert.match(index, /const WAIT_POLL_MS = 15 \* 1000/);
  assert.match(index, /const QUOTA_WAIT_POLL_MS = 30 \* 1000/);
  assert.match(index, /Manual · ahorra cuota/);
  assert.match(index, /const MAILSLURP_ACTIVE_POLL_MS = 60 \* 1000/);
  assert.match(index, /const MAILSLURP_WAIT_CHUNK_MS = 110 \* 1000/);
  assert.match(index, /async function waitForMailSlurpInbox\(/);
  assert.match(index, /box\?\.provider === 'mailslurp'/);
  assert.match(index, /\/mailslurp\/wait\?inboxId=/);
  assert.match(index, /mailSlurpWaitAbortController/);
  assert.match(index, /mailslurpWait/);
  assert.match(index, /actualiza Worker para espera directa/);
}

await testMailSlurpWaitTimeoutBecomesNormalResponse();
await testMailSlurpWaitReturnsMappedEmail();
testFrontendUsesLongWaitForMailSlurpAndSlowerPolling();
console.log('v32 wait regression tests: PASS');
