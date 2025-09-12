export type ApiResult<T> = {
  data: T;
  message: string;
  success: boolean;
  error: any;
  timestamp: string;
};
