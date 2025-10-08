<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import dayjs from 'dayjs';

import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';

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

const questions = ref<Question[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const activeIndex = ref<number | null>(null);

const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 10;

const fetchMyQuestions = async (page = 0) => {
  loading.value = true;
  error.value = null;
  try {
    const res = await apiClient.get('/v1/questions/my-questions', {
      params: { page: page, size: pageSize },
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

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY.MM.DD');
};
const changePage = (newPage: number) => {
  if (newPage >= 0 && newPage < totalPages.value) {
    fetchMyQuestions(newPage);
  }
};


onMounted(() => {
  fetchMyQuestions();
});


const accordionTabPT = {
  root: {
    style: 'margin-bottom: 23px; border: 1px solid #9991914F; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); overflow: hidden;'
  },
  header: (options) => ({

    style: options.context.active ? 'border-bottom: 1px solid #e5e7eb;' : ''
  }),
  headerAction: {

    style: 'background: #f9fafb; border: none; box-shadow: none;'
  },
  content: {

    style: 'padding: 0;'
  }
};
</script>

<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen shadow-2xl">
    <div class="bg-white max-w-5xl p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">

      <div class="flex justify-between items-center mb-6">
        <h1 style="margin-bottom: 10px;" class="text-2xl md:text-3xl font-bold text-gray-800">1:1 문의 내역</h1>
      </div>

      <div v-if="loading" class="space-y-2.5">
        <Skeleton v-for="i in 5" :key="i" height="5rem" borderRadius="8px"></Skeleton>
      </div>
      <div v-else-if="error">
        <Message severity="error" :closable="false">{{ error }}</Message>
      </div>
      <div v-else-if="questions.length === 0" class="text-center py-16">
        <i class="pi pi-comments text-5xl text-gray-400"></i>
        <p class="mt-4 text-lg text-gray-600">아직 작성한 문의가 없습니다.</p>
      </div>

      <div v-else>
        <Accordion v-model:activeIndex="activeIndex" :unstyled="true">
          <AccordionTab v-for="q in questions" :key="q.questionId" :pt="accordionTabPT">
            <template #header>
              <div class="p-1 flex flex-col sm:flex-row justify-between sm:items-center w-full gap-2">
                <div class="flex items-center gap-3">
                  <Tag :value="q.answer ? '답변 완료' : '답변 대기'" :severity="q.answer ? 'success' : 'warning'" />
                  <div>
                    <h3 class="font-bold! text-gray-800">{{ q.title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ q.place.placeName }}</p>
                  </div>
                </div>
                <span class="text-sm text-gray-500 flex-shrink-0 sm:ml-4">{{ formatDate(q.createdAt) }}</span>
              </div>
            </template>

            <div class="p-4 md:p-6 space-y-6">
              <div class="flex gap-4">
                <Avatar label="Q" class="bg-blue-500 text-white" shape="circle" />
                <div>
                  <p class="font-semibold text-gray-700">내 질문</p>
                  <p class="text-gray-600 mt-1 whitespace-pre-wrap">{{ q.content }}</p>
                </div>
              </div>
              <Divider />
              <div class="flex gap-4">
                <Avatar label="A" class="bg-gray-700 text-white" shape="circle" />
                <div>
                  <p class="font-semibold text-gray-700">숙소 답변</p>
                  <div v-if="q.answer" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ q.answer.content }}</div>
                  <div v-else class="text-gray-400 italic mt-1">아직 답변이 등록되지 않았습니다.</div>
                </div>
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </div>
    </div>
  </div>
</template>
