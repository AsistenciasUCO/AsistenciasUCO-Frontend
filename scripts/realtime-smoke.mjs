#!/usr/bin/env node
// Smoke real de asistencia batch -> SSE scopeado. Variables obligatorias:
// API_URL, E2E_ACCESS_TOKEN y E2E_GROUP_ID. Si se proporcionan también
// E2E_SESSION_ID y E2E_ATTENDANCE_RECORDS_JSON, el script dispara el command
// batch después de abrir el stream. El token nunca se imprime ni va en la URL.

import { fetchEventSource } from '@microsoft/fetch-event-source';

const API_URL = process.env.API_URL;
const ACCESS_TOKEN = process.env.E2E_ACCESS_TOKEN;
const GROUP_ID = process.env.E2E_GROUP_ID;
const SESSION_ID = process.env.E2E_SESSION_ID;
const RECORDS_JSON = process.env.E2E_ATTENDANCE_RECORDS_JSON;
const TIMEOUT_MS = Number(process.env.E2E_TIMEOUT_MS || 15000);
const EVENT_TYPE = 'ASISTENCIAS_SESION_ACTUALIZADAS';

function fail(message) {
  console.error(`[realtime-smoke] FAIL: ${message}`);
  process.exit(1);
}

if (!API_URL) fail('Falta la variable de entorno API_URL.');
if (!ACCESS_TOKEN) fail('Falta la variable de entorno E2E_ACCESS_TOKEN.');
if (!GROUP_ID) fail('Falta la variable de entorno E2E_GROUP_ID.');
if ((SESSION_ID && !RECORDS_JSON) || (!SESSION_ID && RECORDS_JSON)) {
  fail('E2E_SESSION_ID y E2E_ATTENDANCE_RECORDS_JSON deben definirse juntos.');
}

function parseRecords() {
  if (!RECORDS_JSON) return null;
  try {
    const records = JSON.parse(RECORDS_JSON);
    if (!Array.isArray(records)) throw new Error('no es un arreglo');
    return records;
  } catch (error) {
    fail(`E2E_ATTENDANCE_RECORDS_JSON inválido: ${error.message}`);
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
    value.payload &&
    typeof value.payload === 'object'
  );
}

async function saveBatch(records) {
  const response = await fetch(`${API_URL}/asistencias/lote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ sesionId: SESSION_ID, registros: records }),
  });
  if (!response.ok) {
    throw new Error(`POST /asistencias/lote devolvió HTTP ${response.status}`);
  }
  console.log('[realtime-smoke] POST /asistencias/lote completado.');
}

async function main() {
  const records = parseRecords();
  let receivedEvent = null;
  let connected = false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const streamUrl = `${API_URL}/realtime/stream?grupoId=${encodeURIComponent(
    GROUP_ID
  )}`;

  try {
    await fetchEventSource(streamUrl, {
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
          throw new Error(
            `Respuesta inesperada al conectar: HTTP ${response.status}`
          );
        }
        connected = true;
        console.log(
          `[realtime-smoke] Conectado al stream scopeado del grupo ${GROUP_ID}.`
        );
        if (records) await saveBatch(records);
      },
      onmessage: (message) => {
        if (!message.data) return;
        try {
          const event = JSON.parse(message.data);
          if (
            isValidRealtimeEvent(event) &&
            event.type === EVENT_TYPE &&
            event.payload.grupo === GROUP_ID &&
            (!SESSION_ID || event.payload.sesion === SESSION_ID)
          ) {
            receivedEvent = event;
            clearTimeout(timeout);
            controller.abort();
          }
        } catch {
          // Igual que la app: un payload no JSON se descarta sin romper el stream.
        }
      },
      onerror: (error) => {
        throw error;
      },
    });
  } catch (error) {
    if (error?.name !== 'AbortError') {
      fail(`Error de transporte: ${error?.message || error}`);
    }
  }

  clearTimeout(timeout);
  if (!connected) fail('No se logró abrir la conexión SSE.');
  if (!receivedEvent) {
    fail(`Timeout (${TIMEOUT_MS}ms) sin recibir ${EVENT_TYPE} para el scope.`);
  }

  console.log(`[realtime-smoke] Evento ${EVENT_TYPE} recibido y validado.`);
  console.log(`[realtime-smoke] grupo: ${receivedEvent.payload.grupo}`);
  console.log(`[realtime-smoke] sesion: ${receivedEvent.payload.sesion}`);
  console.log('[realtime-smoke] PASSED');
}

main().catch((error) => fail(error?.message || String(error)));
