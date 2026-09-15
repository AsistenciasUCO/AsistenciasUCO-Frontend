/**
 * Estado de la conexión realtime, expuesto por `RealtimeService` para uso en
 * UI/diagnóstico. No usar booleanos sueltos: cada causa de desconexión debe
 * ser distinguible.
 */
export type RealtimeConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'UNAUTHORIZED'
  | 'ERROR';
