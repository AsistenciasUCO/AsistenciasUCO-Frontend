#!/usr/bin/env node
// Smoke test de CONTRATO/TRANSPORTE para GET {API_URL}/realtime/stream.
// NO sustituye un E2E de negocio real (UI -> backend -> SSE via
// POST /asistencias): /realtime/emit es solo diagnóstico y probar contra él
// únicamente demuestra que el transporte SSE autenticado funciona, no que el
// backend publica eventos de negocio (ver docs/frontend-realtime.md).
//
// Uso:
//   API_URL=http://localhost:8080/api/v1 \
//   E2E_ACCESS_TOKEN=eyJ... \
//   [E2E_EVENT_TYPE=ASISTENCIA_REGISTRADA] \
//   [E2E_SKIP_EMIT=true] \
//   [E2E_TIMEOUT_MS=15000] \
//   node scripts/realtime-smoke.mjs
//
// No imprime el token en ningún momento. No lo pone en la URL.

import { fetchEventSource } from '@microsoft/fetch-event-source';

const API_URL = process.env.API_URL;
const ACCESS_TOKEN = process.env.E2E_ACCESS_TOKEN;
const EVENT_TYPE = process.env.E2E_EVENT_TYPE || 'ASISTENCIA_REGISTRADA';
const SKIP_EMIT = process.env.E2E_SKIP_EMIT === 'true';
const TIMEOUT_MS = Number(process.env.E2E_TIMEOUT_MS || 15000);

function fail(message) {
  console.error(`[realtime-smoke] FAIL: ${message}`);
  process.exit(1);
}

if (!API_URL) fail('Falta la variable de entorno API_URL.');
if (!ACCESS_TOKEN) fail('Falta la variable de entorno E2E_ACCESS_TOKEN.');

function decodeJwtRoles(token) {
  try {
    const payloadSegment = token.split('.')[1];
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(json);
    return payload.resource_access?.['asistencias-api']?.roles || [];
  } catch {
    return [];
  }
}

function isValidRealtimeEvent(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.eventId === 'string' &&
    typeof value.type === 'string' &&
    typeof value.occurredAt === 'string' &&
    (value.correlationId === null || typeof value.correlationId === 'string') &&
    'payload' in value
  );
}

async function triggerDiagnosticEmit() {
  console.log('[realtime-smoke] Rol ADMINISTRADOR detectado: disparando POST /realtime/emit de diagnóstico...');
  const res = await fetch(`${API_URL}/realtime/emit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ type: EVENT_TYPE }),
  });
  if (!res.ok) {
    console.warn(`[realtime-smoke] POST /realtime/emit devolvió HTTP ${res.status}; se sigue esperando de todas formas.`);
  }
}

async function main() {
  const roles = decodeJwtRoles(ACCESS_TOKEN);
  const isAdmin = roles.includes('ADMINISTRADOR');

  let receivedEvent = null;
  let connected = false;
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  const streamDone = fetchEventSource(`${API_URL}/realtime/stream`, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    signal: controller.signal,
    openWhenHidden: true,
    onopen: async (response) => {
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.startsWith('text/event-stream')) {
        throw new Error(`Respuesta inesperada al conectar: HTTP ${response.status}`);
      }
      connected = true;
      console.log('[realtime-smoke] Conectado a /realtime/stream.');

      if (isAdmin && !SKIP_EMIT) {
        await triggerDiagnosticEmit();
      } else if (!SKIP_EMIT) {
        console.log(
          '[realtime-smoke] El token no tiene rol ADMINISTRADOR: no se dispara /realtime/emit. ' +
            'Esperando a que un evento de negocio real llegue (ver docs/frontend-realtime.md).'
        );
      }
    },
    onmessage: (msg) => {
      if (!msg.data) return; // heartbeat u otro comentario sin campo data
      try {
        const parsed = JSON.parse(msg.data);
        if (isValidRealtimeEvent(parsed)) {
          receivedEvent = parsed;
          clearTimeout(timeout);
          controller.abort();
        }
      } catch {
        // payload no JSON: ignorar, igual que hace el transporte de la app
      }
    },
    onerror: (err) => {
      throw err;
    },
  });

  try {
    await streamDone;
  } catch (err) {
    if (!(err?.name === 'AbortError')) {
      fail(`Error de transporte: ${err?.message || err}`);
    }
  }

  clearTimeout(timeout);

  if (!connected) {
    fail('No se logró abrir la conexión SSE dentro del tiempo esperado.');
  }

  if (!receivedEvent) {
    fail(
      `Timeout (${TIMEOUT_MS}ms) sin recibir ningún evento válido. ` +
        (isAdmin
          ? 'El POST /realtime/emit pudo haber fallado.'
          : 'Sin rol ADMINISTRADOR, este smoke depende de que un evento de negocio real ocurra durante la ventana de espera.')
    );
  }

  console.log('[realtime-smoke] Evento recibido:');
  console.log(`  eventId: ${receivedEvent.eventId}`);
  console.log(`  type: ${receivedEvent.type}`);
  console.log(`  occurredAt: ${receivedEvent.occurredAt}`);
  console.log(`  correlationId: ${receivedEvent.correlationId}`);
  console.log('[realtime-smoke] PASSED');
  process.exit(0);
}

main().catch((err) => fail(err?.message || String(err)));
