export interface ApiListResponse<T> {
  exitoso: boolean;
  datos: T[];
  total: number;
}
