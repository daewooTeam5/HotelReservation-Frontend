import type { QueryFunctionContext } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';
import type { AxiosError } from 'axios';

export const httpFetcher = async <T>(queryContext: QueryFunctionContext): Promise<T> => {
  const token = localStorage.getItem('accessToken');
  console.log(token);

  try {
    const keys = queryContext.queryKey.join('/');
    const result = await apiClient.get<T>(`${keys}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    } as any);

    console.log(keys);
    console.log('http fetcher' + result);
    return result.data as T;
  } catch (err: AxiosError) {
    throw new Error(err.response.data.message);
  }
};
