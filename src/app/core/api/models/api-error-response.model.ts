import { ApiFieldError } from './api-field-error.model';

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  correlationId: string | null;
  details?: ApiFieldError[];
}
