export interface ApiDataResponse<T> {
  exitoso: boolean;
  datos: T;
}

/** `ApiDataResponse<Void>` del backend: `{ "exitoso": true, "datos": null }`. */
export type ApiVoidDataResponse = ApiDataResponse<null>;
