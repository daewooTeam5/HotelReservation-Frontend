<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">리뷰 관리</h1>
    </div>

    <div class="flex flex-wrap gap-4 items-center">
      <InputText v-model="filters.userName" placeholder="작성자 이름" />
      <InputText v-model="filters.placeName" placeholder="숙소 이름" />
      <PrimeSelect
        v-model="filters.replyStatus"
        :options="[{ label: '답변 여부 전체', value: '' }, ...replyStatusOptions]"
        optionLabel="label"
        optionValue="value"
        placeholder="답변 여부"
        class="w-40"
      />
      <Button label="검색" icon="pi pi-search" @click="searchReviews" />
    </div>

    <DataTable
      :value="reviews"
      responsiveLayout="scroll"
      class="mt-4"
    >
      <Column field="reviewId" header="리뷰 ID" style="min-width: 80px" />
      <Column field="userName" header="작성자" style="min-width: 120px" />
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

      <Column field="rating" header="별점" style="min-width: 150px">
        <template #body="slotProps">
          <div class="flex items-center gap-1">
            <i
              v-for="i in 5"
              :key="i"
              class="pi"
              :class="i <= slotProps.data.rating ? 'pi-star-fill text-yellow-500' : 'pi-star text-gray-300'"
            ></i>
            <span class="ml-2 font-semibold text-gray-600"></span>
          </div>
        </template>
      </Column>

      <Column field="placeName" header="숙소 이름" style="min-width: 150px" />
      <Column field="comment" header="리뷰 내용" style="min-width: 250px">
        <template #body="slotProps">
          <span class="line-clamp-2">{{ slotProps.data.comment }}</span>
        </template>
      </Column>
      <Column field="ownerReply" header="답변 여부" style="min-width: 120px">
        <template #body="slotProps">
      <span
        class="px-3 py-1 rounded-full text-xs font-medium"
        :class="getReplyStatusClass(slotProps.data.ownerReply)"
      >
        {{ translateReplyStatus(slotProps.data.ownerReply) }}
      </span>
        </template>
      </Column>

      <Column header="관리" style="min-width: 100px; text-align: center;">
        <template #body="slotProps">
          <button
            @click="deleteReview(slotProps.data.reviewId)"
            class="text-red-500 hover:text-red-700 font-medium text-sm"
          >
            삭제
          </button>
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
import InputText from 'primevue/inputtext';
import PrimeSelect from 'primevue/select';
import Button from 'primevue/button';

const reviews = ref<any[]>([]);

const filters = ref({
  userName: "",
  placeName: "",
  replyStatus: ""
});

const replyStatusOptions = ref([
  { label: '답변 있음', value: 'Y' },
  { label: '답변 없음', value: 'N' }
]);

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
    customer: 'bg-green-100 text-green-800',
    hotel_owner: 'bg-purple-100 text-purple-800',
  };
  return map[role] || 'bg-gray-100 text-gray-800';
};

// 답변 여부 번역
const translateReplyStatus = (reply: string | null): string => {
  return reply ? '답변 완료' : '답변 대기';
};

// 답변 여부 색상 클래스
const getReplyStatusClass = (reply: string | null): string => {
  return reply
    ? 'bg-blue-100 text-blue-800'
    : 'bg-red-100 text-red-800';
};

// 리뷰 데이터 불러오기
const fetchReviews = async () => {
  try {
    const res = await apiClient.get('/v1/admin/review');
    reviews.value = res.data.data;
  } catch (err) {
    console.error('리뷰 불러오기 실패:', err);
  }
};

// 검색 API 호출
const searchReviews = async () => {
  try {
    const params = {
      userName: filters.value.userName || undefined,
      placeName: filters.value.placeName || undefined,
      replyStatus: filters.value.replyStatus || undefined
    };
    const res = await apiClient.get('/v1/admin/review', { params });
    reviews.value = res.data.data;
  } catch (err) {
    console.error("검색 실패:", err);
  }
};

// [ADD] 리뷰 삭제 함수
const deleteReview = async (reviewId: number) => {
  // 사용자에게 삭제 여부 확인
  if (!confirm(`정말로 리뷰 ID #${reviewId}를 삭제하시겠습니까?`)) {
    return;
  }

  try {
    // API 호출
    await apiClient.delete(`/v1/admin/review/${reviewId}`);

    // UI에서 즉시 제거하거나 목록을 새로고침
    // 1. (간단한 방법) 목록 새로고침
    await fetchReviews();

    // 2. (더 빠른 UI 반응) 로컬 상태에서 제거
    // reviews.value = reviews.value.filter(r => r.reviewId !== reviewId);

    alert('리뷰가 성공적으로 삭제되었습니다.');
  } catch (err) {
    console.error('리뷰 삭제 실패:', err);
    alert('리뷰 삭제 중 오류가 발생했습니다.');
  }
};

// 페이지 로드 시 자동 실행
onMounted(() => {
  fetchReviews();
});
</script>
