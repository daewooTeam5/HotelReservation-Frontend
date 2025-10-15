<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">문의 관리</h1>

    <div class="flex flex-wrap gap-4 mb-6 items-end p-4 bg-gray-50 rounded-lg">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium mb-1">사용자 ID (기본키)</label>
        <InputText v-model.number="searchParams.userId" type="number" placeholder="User ID" class="w-full"/>
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium mb-1">사용자 로그인 ID</label>
        <InputText v-model="searchParams.userLoginId" placeholder="User Login ID" class="w-full" />
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium mb-1">키워드 검색</label>
        <InputText v-model="searchParams.keyword" placeholder="제목, 내용" class="w-full" />
      </div>
      <div class="flex items-end gap-2">
        <Button label="검색" icon="pi pi-search" @click="handleSearch" />
        <Button label="초기화" icon="pi pi-refresh" severity="secondary" @click="resetSearch" />
      </div>
    </div>

    <div v-if="isLoading || isSearching" class="text-center py-10">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    </div>
    <div v-else-if="isError" class="text-center py-10 bg-red-50 text-red-700 rounded-lg">
      <p>문의 내역을 불러오는 데 실패했습니다.</p>
    </div>
    <div v-else-if="!questions || questions.length === 0" class="text-center py-10 text-gray-500">
      등록된 문의가 없습니다.
    </div>

    <div v-else class="bg-white rounded shadow overflow-x-auto">
      <DataTable :value="questions" v-model:expandedRows="expandedRows" stripedRows>
        <Column :expander="true" headerStyle="width: 3rem" />
        <Column field="questionId" header="ID" />
        <Column field="userName" header="고객명" />
        <Column field="title" header="제목" />
        <Column field="createdAt" header="작성일">
          <template #body="slotProps">
            {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
          </template>
        </Column>
        <Column header="답변 상태">
          <template #body="slotProps">
            <span v-if="slotProps.data.answer" class="text-green-600 font-semibold">답변 완료</span>
            <span v-else class="text-red-500">답변 대기</span>
          </template>
        </Column>
        <Column header="삭제">
          <template #body="slotProps">
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              @click="confirmDelete(slotProps.data.questionId)"
            />
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="p-4 bg-gray-50 flex flex-col gap-4">
            <h4 class="font-bold text-gray-700">질문 내용</h4>
            <p class="mt-1 mb-4 p-3 bg-white rounded border whitespace-pre-wrap">{{ slotProps.data.content }}</p>

            <h4 class="font-bold text-gray-700">답변</h4>
            <div v-if="slotProps.data.answer" class="mt-1 mb-4 p-3 bg-white rounded border whitespace-pre-wrap">
              {{ slotProps.data.answer }}
            </div>
            <div v-else class="mt-1 mb-4 p-3 text-gray-500 bg-white rounded border">
              아직 등록된 답변이 없습니다.
            </div>
            <Button
              :label="slotProps.data.answer ? '답변 수정' : '답변하기'"
              icon="pi pi-comment"
              class="p-button-sm"
              @click="openAnswerDialog(slotProps.data)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="isAnswerDialogOpen" modal header="문의 답변 작성" :style="{ width: '500px' }">
      <div>
        <p class="mb-2 text-gray-600"><b>고객:</b> {{ currentQuestion?.userName }}</p>
        <p class="font-semibold">{{ currentQuestion?.title }}</p>
        <p class="mb-4 text-gray-600 p-2 bg-gray-100 rounded">"{{ currentQuestion?.content }}"</p>
        <Textarea v-model="answerText" rows="6" class="w-full" placeholder="답변을 입력하세요..." />
      </div>
      <template #footer>
        <Button label="취소" class="p-button-text" @click="isAnswerDialogOpen = false" />
        <Button label="저장" icon="pi pi-check" class="p-button-primary" @click="saveAnswer" :loading="isSubmitting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from 'primevue/inputtext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from "primevue/usetoast";
import type { ApiResult } from '@/types/ApiResult';
import { useAuthStore } from '@/stores/authStore';
          
interface Question {
  questionId: number;
  title: string;
  content: string;
  answer: string | null;
  userName: string;
  createdAt: string;
}

const queryClient = useQueryClient();
const toast = useToast();
const expandedRows = ref([]);
const authStore = useAuthStore();
          
const placeId = computed(() => authStore.user?.placeId); // 로그인된 사용자의 placeId를 동적으로 가져옵니다.

const searchParams = ref<{
  userId: number | null;
  userLoginId: string;
  keyword: string;
}>({
  userId: null,
  userLoginId: '',
  keyword: ''
});
const isSearching = ref(false);

const { data: questions, isLoading, isError, refetch } = useQuery<Question[]>({
  queryKey: ['ownerQuestions', placeId, searchParams],
  queryFn: async () => {
    isSearching.value = true;
    const response = await apiClient.post<ApiResult<Question[]>>(
      `/v1/owner/places/${placeId.value}/questions/search`,
      searchParams.value
    );
    isSearching.value = false;
    return response.data.data || [];
  },
  enabled: computed(() => !!placeId.value),
  initialData: []
});

const handleSearch = () => {
  refetch();
};

const resetSearch = () => {
  searchParams.value = { userId: null, userLoginId: '', keyword: '' };
  refetch();
};

const isAnswerDialogOpen = ref(false);
const currentQuestion = ref<Question | null>(null);
const answerText = ref("");

const { mutate: submitAnswer, isPending: isSubmitting } = useMutation({
  mutationFn: (payload: { questionId: number, answer: string }) => {
    return apiClient.post(`/v1/owner/questions/${payload.questionId}/answer`, { answer: payload.answer });
  },
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '답변이 등록되었습니다.', life: 3000 });
    isAnswerDialogOpen.value = false;
    queryClient.invalidateQueries({ queryKey: ['ownerQuestions'] });
  },
  onError: (err: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: err.response?.data?.error?.detail || '답변 등록에 실패했습니다.', life: 3000 });
  }
});

const { mutate: deleteQuestion } = useMutation({
  mutationFn: (questionId: number) => apiClient.delete(`/v1/owner/questions/${questionId}`),
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '문의가 삭제되었습니다.', life: 3000 });
    queryClient.invalidateQueries({ queryKey: ['ownerQuestions'] });
  },
  onError: (err: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: err.response?.data?.error?.detail || '삭제에 실패했습니다.', life: 3000 });
  }
});

const confirmDelete = (questionId: number) => {
  if (confirm('정말로 이 문의를 삭제하시겠습니까? 답변도 함께 삭제됩니다.')) {
    deleteQuestion(questionId);
  }
};

const openAnswerDialog = (question: Question) => {
  currentQuestion.value = question;
  answerText.value = question.answer || "";
  isAnswerDialogOpen.value = true;
};

const saveAnswer = () => {
  if (currentQuestion.value && answerText.value.trim()) {
    submitAnswer({ questionId: currentQuestion.value.questionId, answer: answerText.value });
  }
};
</script>
