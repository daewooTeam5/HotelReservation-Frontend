<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
import type { User } from '@/types/users.ts';

const { data, isLoading, isError, error } = useQuery<ApiResult<User[]>>({
  queryKey: ['v1', 'users', 'all?start=0&size=10'],
  queryFn: httpFetcher,
});
</script>

<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-4">유저 목록 ✨</h1>

    <div v-if="isLoading">⏳ 불러오는 중...</div>
    <div v-else-if="isError" class="text-red-500">❌ {{ error }}</div>

    <ul v-else class="space-y-2">
      <li v-for="user in data?.data!.content" :key="user.id" class="p-3 rounded-lg bg-gray-100">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
      </li>
    </ul>
  </main>
</template>
