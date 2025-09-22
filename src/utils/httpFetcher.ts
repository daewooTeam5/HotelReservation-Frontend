import type { QueryFunctionContext } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';

export const httpFetcher = async <T>(queryContext: QueryFunctionContext): Promise<T> => {
  const token = localStorage.getItem('accessToken');
  console.log(token);

  try {
    const keys = queryContext.queryKey.join('/');
    const result = await apiClient.get<T>(`${keys}`);

    console.log(keys);
    console.log('http fetcher' + result);
    return result.data as T;
  } catch (err: any) {
    throw new Error(err.response.data.message);
  }
};
