import { InjectionToken } from '@angular/core';
import { fetchEventSource, FetchEventSourceInit } from '@microsoft/fetch-event-source';

export type FetchEventSourceFn = (
  input: RequestInfo,
  init: FetchEventSourceInit
) => Promise<void>;

/**
 * Indirección sobre `fetchEventSource` únicamente para poder sustituirla en
 * tests (fetch/ReadableStream real es incómodo de simular); en producción
 * resuelve a la función real de `@microsoft/fetch-event-source`.
 */
export const SSE_FETCH_EVENT_SOURCE = new InjectionToken<FetchEventSourceFn>(
  'SSE_FETCH_EVENT_SOURCE',
  { providedIn: 'root', factory: () => fetchEventSource }
);
