<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResult } from '@/types/ApiResult';
import Button from 'primevue/button';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import QuestionFormModal from './QuestionFormModal.vue';
import QuestionDetailModal from './QuestionDetailModal.vue'; // 상세 보기 모달 추가
import { useRouter, useRoute } from 'vue-router';

// --- Props & Emits ---
const props = defineProps<{
  placeId: number;
}>();

// --- 상태 관리 ---
interface Question {
  questionId: number;
  title: string;
  content: string;
  answer: string | null;
  userName: string;
  createdAt: string;
}

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const isFormModalVisible = ref(false);
const isDetailModalVisible = ref(false); // 상세 보기 모달 상태

// --- 데이터 가져오기 ---
const fetchQuestions = async () => {
  const response = await apiClient.get<ApiResult<Question[]>>(`/v1/places/${props.placeId}/questions`);
  return response.data.data || [];
};

const { isLoading, data: questions } = useQuery<Question[]>({
  queryKey: ['questions', props.placeId],
  queryFn: fetchQuestions,
  enabled: computed(() => !!props.placeId),
});

// --- 함수 ---
const visibleQuestions = computed(() => {
  return questions.value?.slice(0, 5) || [];
});

const handleWriteQuestionClick = () => {
  if (!authStore.accessToken) {
    toast.add({ severity: 'warn', summary: '알림', detail: '로그인이 필요한 기능입니다.', life: 3000 });
    router.push({
      path: '/auth/signin',
      query: { redirect: route.fullPath }
    });
    return;
  }
  isFormModalVisible.value = true;
};

const onQuestionSubmitted = () => {
  queryClient.invalidateQueries({ queryKey: ['questions', props.placeId] });
};

const openDetailModal = () => {
  isDetailModalVisible.value = true;
};
</script>

<template>
  <section class="mt-10 p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">숙소에 관한 질문</h2>
      <Button
        label="문의하기"
        icon="pi pi-comment"
        @click="handleWriteQuestionClick"
      />
    </div>

    <div v-if="isLoading">
      <Skeleton height="3rem" class="mb-2" />
      <Skeleton height="3rem" />
    </div>
    <div v-else-if="!questions || questions.length === 0" class="text-center text-gray-500 py-8">
      <p class="text-lg font-semibold">아직 등록된 문의가 없습니다.</p>
      <p class="mt-2">이 숙소에 대해 궁금한 점을 가장 먼저 물어보세요!</p>
    </div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="q in visibleQuestions" :key="q.questionId">
          <Accordion :activeIndex="null">
            <AccordionTab>
              <template #header>
                <div class="flex justify-between w-full items-center">
                  <span>{{ q.title }}</span>
                  <div class="text-sm text-gray-500">
                    <span>{{ q.userName }}</span>
                  </div>
                </div>
              </template>
              <div class="p-4">
                <p class="whitespace-pre-wrap">{{ q.content }}</p>
                <div v-if="q.answer" class="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p class="font-semibold text-sm text-blue-800">숙소 관리자 답변</p>
                  <p class="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{{ q.answer }}</p>
                </div>
              </div>
            </AccordionTab>
          </Accordion>
        </div>
      </div>

      <div v-if="questions && questions.length > 5" class="text-center mt-6">
        <Button label="더 많은 질문 보기..." text @click="openDetailModal" />
      </div>
    </div>

    <QuestionFormModal
      :place-id="props.placeId"
      v-model:visible="isFormModalVisible"
      @question-submitted="onQuestionSubmitted"
    />

    <QuestionDetailModal
      :place-id="props.placeId"
      v-model:visible="isDetailModalVisible"
    />
  </section>
</template>
