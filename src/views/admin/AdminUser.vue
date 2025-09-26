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
      <Column field="status" header="상태" style="min-width: 200px">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <!-- 상태 뱃지 -->
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusClass(slotProps.data.status)"
            >
        {{ translateStatus(slotProps.data.status) }}
      </span>

            <!-- inactive → 허용 + 취소 버튼 둘 다 표시 -->
            <template
              v-if="currentUserRole === 'admin'
              && ['place_admin', 'user_admin'].includes(slotProps.data.role)
              && slotProps.data.status === 'inactive'"
            >
              <!-- 허용 버튼 -->
              <button
                class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                @click="allowUser(slotProps.data.id)"
              >
                허용
              </button>

              <!-- 취소 버튼 -->
              <button
                class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                @click="cancelUser(slotProps.data.id)"
              >
                취소
              </button>
            </template>
          </div>
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

const currentUserRole = ref<string>('admin');

// 허용 (inactive → active)
const allowUser = async (userId: number) => {
  try {
    await apiClient.patch(`/v1/admin/users/${userId}/allow`);
    await fetchUsers(); // 갱신
  } catch (err) {
    console.error('허용 실패:', err);
  }
};

// 취소 (inactive → banned)
const cancelUser = async (userId: number) => {
  try {
    await apiClient.patch(`/v1/admin/users/${userId}/cancel`);
    await fetchUsers(); // 갱신
  } catch (err) {
    console.error('취소 실패:', err);
  }
};

// 취소 처리 → inactive → banned
const banUser = async (user: UserResponse) => {
  try {
    await apiClient.post(`/v1/admin/users/${user.id}/cancel`, {
      status: 'banned',
    });
    await fetchUsers();
  } catch (err) {
    console.error('취소 실패:', err);
  }
};


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
    place_admin: '전체 숙소 관리자',
    user_admin: '전체 유저 관리자',
    hotel_owner: '숙소 오너',
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
