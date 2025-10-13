<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">리뷰 관리</h1>
    </div>

    <!-- 토스트 -->
    <Toast />

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

    <DataTable :value="reviews" responsiveLayout="scroll" class="mt-4">
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
import { useToast } from 'primevue/usetoast';
import { apiClient } from '@/utils/axiosClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import PrimeSelect from 'primevue/select';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

const toast = useToast();

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

const translateRole = (role: string) => {
  const map: Record<string, string> = {
    customer: "사용자",
    hotel_owner: "숙소 관리자",
  };
  return map[role] || role;
};

const getRoleClass = (role: string) => {
  const map: Record<string, string> = {
    customer: 'bg-green-100 text-green-800',
    hotel_owner: 'bg-purple-100 text-purple-800',
  };
  return map[role] || 'bg-gray-100 text-gray-800';
};

const translateReplyStatus = (reply: string | null): string => {
  return reply ? '답변 완료' : '답변 대기';
};

const getReplyStatusClass = (reply: string | null): string => {
  return reply
    ? 'bg-blue-100 text-blue-800'
    : 'bg-red-100 text-red-800';
};

const fetchReviews = async () => {
  try {
    const res = await apiClient.get('/v1/admin/review');
    reviews.value = res.data.data;
  } catch (err) {
    console.error('리뷰 불러오기 실패:', err);
  }
};

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

const deleteReview = async (reviewId: number) => {


  try {
    await apiClient.delete(`/v1/admin/review/${reviewId}`);
    await fetchReviews();

    // ✅ 토스트 메시지로 알림
    toast.add({
      severity: 'success',
      summary: '삭제 완료',
      detail: `리뷰 #${reviewId}가 삭제되었습니다.`,
      life: 2500
    });
  } catch (err) {
    console.error('리뷰 삭제 실패:', err);
    toast.add({
      severity: 'error',
      summary: '삭제 실패',
      detail: '리뷰 삭제 중 오류가 발생했습니다.',
      life: 3000
    });
  }
};

onMounted(() => {
  fetchReviews();
});
</script>
