<template>
  <div class="flex flex-col gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">유저 관리</h1>
    </div>

    <!-- 유저 테이블 -->
    <DataTable :value="users" responsiveLayout="scroll" class="mt-4">
      <!-- 아이디 -->
      <Column field="id" header="아이디" style="min-width: 80px" />

      <!-- 이메일 (admin이면 userId로 대체) -->
      <Column header="이메일 / ID" style="min-width: 200px">
        <template #body="slotProps">
          <span>
            {{ slotProps.data.role === 'admin' ? slotProps.data.userId : slotProps.data.email }}
          </span>
        </template>
      </Column>

      <!-- 이름 -->
      <Column field="name" header="이름" style="min-width: 150px" />

      <!-- 권한 -->
      <Column field="role" header="권한" style="min-width: 120px">
        <template #body="slotProps">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="getRoleClass(slotProps.data.role)"
          >
            {{ translateRole(slotProps.data.role) }}
          </span>
        </template>
      </Column>

      <!-- 상태 -->
      <Column field="status" header="상태" style="min-width: 120px">
        <template #body="slotProps">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="getStatusClass(slotProps.data.status)"
          >
            {{ translateStatus(slotProps.data.status) }}
          </span>
        </template>
      </Column>

      <template #empty>
        <div class="text-center text-gray-500 py-6">유저가 없습니다.</div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

interface UserResponse {
  id: number;
  userId: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

// 유저 데이터
const users = ref<UserResponse[]>([]);

// API 호출
const fetchUsers = async () => {
  try {
    const res = await apiClient.get('/v1/admin/users', {
      params: {
        start: 0,
        size: 20,
      },
    });
    users.value = res.data.data.content;
  } catch (err) {
    console.error('유저 리스트 불러오기 실패:', err);
  }
};

// 권한 색상
const getRoleClass = (role: string) => {
  const map: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    hotel_owner: 'bg-blue-100 text-blue-800',
    customer: 'bg-green-100 text-green-800',
  };
  return map[role] || 'bg-gray-100 text-gray-800';
};

// 권한 한글 번역
const translateRole = (role: string) => {
  const map: Record<string, string> = {
    admin: '관리자',
    hotel_owner: '호텔 관리자',
    customer: '사용자',
  };
  return map[role] || role;
};

// 상태 색상
const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

// 상태 한글 번역
const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
    banned: '정지',
  };
  return map[status] || status;
};

// 페이지 로드 시 호출
onMounted(fetchUsers);
</script>
