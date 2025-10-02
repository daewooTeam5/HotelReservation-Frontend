<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import dayjs from 'dayjs';

// PrimeVue Components
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import PrimeButton from 'primevue/button';
import Avatar from 'primevue/avatar';

// --- Interfaces matching the backend DTO ---
interface PlaceInfo {
  placeId: number;
  placeName: string;
  categoryName: string;
}

interface AnswerInfo {
  content: string;
}

interface Question {
  questionId: number;
  place: PlaceInfo;
  title: string;
  content: string;
  answer: AnswerInfo | null;
  createdAt: string;
}

// --- Component State ---
const questions = ref<Question[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const activeIndex = ref(0); // First accordion tab is open by default

// Pagination state
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 10;

// --- API Fetching ---
const fetchMyQuestions = async (page = 0) => {
  loading.value = true;
  error.value = null;

  try {
    const res = await apiClient.get('/v1/questions/my-questions', {
      params: {
        page: page,
        size: pageSize,
      },
    });
    questions.value = res.data.content;
    totalPages.value = res.data.totalPages;
    currentPage.value = res.data.number;
  } catch (err: any) {
    console.error('Failed to fetch questions:', err);
    error.value = '문의 내역을 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// --- Helper Functions ---
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY.MM.DD');
};

const changePage = (newPage: number) => {
  if (newPage >= 0 && newPage < totalPages.value) {
    fetchMyQuestions(newPage);
  }
};

// --- Lifecycle Hook ---
onMounted(() => {
  fetchMyQuestions();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8">
    <h1 class="text-3xl font-bold! text-gray-900 mb-8">문의</h1>

    <div v-if="loading" class="space-y-4">
      <Skeleton v-for="i in 4" :key="i" height="4rem" borderRadius="8px"></Skeleton>
    </div>

    <div v-else-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else-if="questions.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
      <i class="pi pi-comments text-5xl text-gray-400"></i>
      <p class="mt-4 text-lg text-gray-600">아직 작성한 문의가 없습니다.</p>
    </div>

    <div v-else>
      <Accordion v-model:activeIndex="activeIndex" :multiple="false">
        <AccordionTab v-for="q in questions" :key="q.questionId">
          <template #header>
            <div class="flex justify-between items-center w-full">
              <div class="flex items-center gap-4">
                <Tag
                  :value="q.answer ? '답변 완료' : '답변 대기'"
                  :severity="q.answer ? 'success' : 'warning'"
                />
                <div>
                  <span class="font-bold! text-gray-800">{{ q.title }}</span>
                  <p class="text-sm! text-gray-500 mt-1!">{{ q.place.placeName }}</p>
                </div>
              </div>
              <span class="text-sm! text-gray-500 hidden md:block mr-2!">{{ formatDate(q.createdAt) }}</span>
            </div>
          </template>

          <div class="p-4 space-y-6!">
            <div class="flex gap-4">
              <Avatar label="Q" class="bg-blue-500 text-white" size="medium" shape="circle" />
              <div class="flex-1">
                <p class="font-semibold! text-gray-700">내 질문</p>
                <p class="text-gray-600 mt-1! whitespace-pre-wrap">{{ q.content }}</p>
              </div>
            </div>

            <Divider />

            <div class="flex gap-4">
              <Avatar label="A" class="bg-gray-700 text-white" size="medium" shape="circle" />
              <div class="flex-1">
                <p class="font-semibold! text-gray-700">숙소 답변</p>
                <div v-if="q.answer" class="text-gray-600 mt-1! whitespace-pre-wrap">
                  {{ q.answer.content }}
                </div>
                <div v-else class="text-gray-400 italic mt-1">
                  아직 답변이 등록되지 않았습니다.
                </div>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <div v-if="!loading && totalPages > 1" class="flex justify-center items-center mt-8 gap-2">
      <PrimeButton
        icon="pi pi-angle-left"
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 0"
        text
        rounded
      />
      <span class="text-sm font-medium text-gray-700">
        페이지 {{ currentPage + 1 }} / {{ totalPages }}
      </span>
      <PrimeButton
        icon="pi pi-angle-right"
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        text
        rounded
      />
    </div>
  </div>
</template>

<style scoped>
/* Optional: Customize PrimeVue component styles */
:deep(.p-accordion-header-link) {
  padding: 1.25rem;
}
</style>
