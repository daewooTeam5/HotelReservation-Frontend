import type { ErrorDetails } from '@/types/ErrorDetails.ts';

export type ApiResult<T> = {
  data: T | null;
  message: string;
  success: boolean;
  error: ErrorDetails | null;
  timestamp: string;
};
