<template>
  <div class="flex flex-col gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">리뷰 관리</h1>
    </div>

    <!-- 리뷰 테이블 -->
    <DataTable
      :value="reviews"
      responsiveLayout="scroll"
      class="mt-4"
    >
      <!-- 리뷰 아이디 -->
      <Column field="reviewId" header="리뷰 ID" style="min-width: 80px" />

      <!-- 작성자 이름 -->
      <Column field="userName" header="작성자" style="min-width: 120px" />

      <!-- 작성자 권한 (컬러 뱃지) -->
      <Column field="userRole" header="권한" style="min-width: 120px">
        <template #body="slotProps">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="getRoleClass(slotProps.data.userRole)"
          >
            {{ translateRole(slotProps.data.userRole) }}
          </span>
        </template>
      </Column>

      <!-- 숙소 이름 -->
      <Column field="placeName" header="숙소 이름" style="min-width: 150px" />

      <!-- 리뷰 코멘트 -->
      <Column field="comment" header="리뷰 내용" style="min-width: 250px">
        <template #body="slotProps">
          <span class="line-clamp-2">{{ slotProps.data.comment }}</span>
        </template>
      </Column>

      <!-- 사장 답글 -->
      <Column field="ownerReply" header="사장 답글" style="min-width: 250px">
        <template #body="slotProps">
          <span v-if="slotProps.data.ownerReply">{{ slotProps.data.ownerReply }}</span>
          <span v-else class="text-gray-400 italic">아직 답글 없음</span>
        </template>
      </Column>

      <template #empty>
        <div class="text-center text-gray-500 py-6">
          등록된 리뷰가 없습니다.
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const reviews = ref<any[]>([]);

// 권한 번역
const translateRole = (role: string) => {
  const map: Record<string, string> = {
    customer: "사용자",
    hotel_owner: "숙소 관리자",
  };
  return map[role] || role;
};

// 권한별 색상 클래스
const getRoleClass = (role: string) => {
  const map: Record<string, string> = {
    customer: 'bg-blue-100 text-blue-800',        // 사용자 → 파랑
    hotel_owner: 'bg-purple-100 text-purple-800', // 숙소 관리자 → 보라
  };
  return map[role] || 'bg-gray-100 text-gray-800';
};

// 리뷰 데이터 불러오기
const fetchReviews = async () => {
  try {
    const res = await apiClient.get('/v1/admin/review');
    reviews.value = res.data.data;  // APIResult의 data
  } catch (err) {
    console.error('리뷰 불러오기 실패:', err);
  }
};

// 페이지 로드 시 자동 실행
onMounted(() => {
  fetchReviews();
});
</script>
