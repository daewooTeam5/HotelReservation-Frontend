<script setup lang="ts">
import type { UserInfo } from '@/types/users';
import { computed, ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';

// API 호출
const { isLoading, isError, data, error } = useQuery<ApiResult<UserInfo>>({
  queryKey: ['v1', 'users', 'my'],
  queryFn: httpFetcher
});

// 유저 정보
const me = computed(() => data.value?.data);

// 에러 메시지
const errMsg = computed(() => {
  if (!error.value) return '';
  return (error.value as Error).message || '알 수 없는 에러';
});
</script>

<template>
  <PrimeCard class="shadow-md">
    <template #title>
      <div class="flex items-center">
        <i class="pi pi-wallet text-primary "></i>
        <span class="text-xl font-bold ml-2!">나의 포인트</span>
      </div>
      <Divider />
    </template>

    <template #content>
      <!-- 로딩 -->
      <div v-if="isLoading" class="w-full">
        <Skeleton height="3rem" class="mb-2" />
        <Skeleton width="70%" height="1.5rem" />
      </div>

      <!-- 에러 -->
      <Message v-else-if="isError" severity="error" :closable="false" class="w-full">
        {{ errMsg || '포인트 정보를 불러오는 데 실패했습니다.' }}
      </Message>

      <!-- 정상 -->
      <div v-else class="w-full">
        <div class="flex flex-column mb-4">
          <div class="flex flex-col  ">
            <Tag severity="info" class="text-xl font-bold!">포인트</Tag>
            <div class="my-2!">
              <span class="text-primary font-bold text-4xl">{{ me?.point?.toLocaleString() ?? 0 }}</span>
              <span class="text-500 text-xl ml-1">P</span>
            </div>
          </div>
        </div>
      </div>
    </template>

  </PrimeCard>
</template>

<style scoped>
</style>
