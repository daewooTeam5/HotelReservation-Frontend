<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import dayjs from 'dayjs';


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
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <div class="bg-white w-full p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
      <!-- 헤더 -->
      <div class="mb-6!">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2!">1:1 문의 내역</h1>
        <p class="text-gray-600 text-sm">숙소에 문의한 내용과 답변을 확인하세요.</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="space-y-3">
        <Skeleton v-for="i in 5" :key="i" height="6rem" borderRadius="8px"></Skeleton>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error">
        <Message severity="error" :closable="false">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-xl"></i>
            <div>
              <p class="font-semibold">오류 발생</p>
              <p class="text-sm mt-1">{{ error }}</p>
            </div>
          </div>
        </Message>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="questions.length === 0" class="text-center py-16">
        <div class="inline-block p-4 bg-gray-100 rounded-full mb-3!">
          <i class="pi pi-comments text-5xl text-gray-300"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1!">아직 작성한 문의가 없습니다</h3>
        <p class="text-gray-500 text-sm">숙소에 궁금한 사항을 문의해보세요.</p>
      </div>

      <!-- 문의 리스트 -->
      <div v-else class="space-y-3">
        <Accordion v-model:activeIndex="activeIndex" :unstyled="true">
          <AccordionTab v-for="q in questions" :key="q.questionId" :pt="accordionTabPT">
            <template #header>
              <div class="p-3 flex flex-col sm:flex-row justify-between sm:items-center w-full gap-3">
                <div class="flex items-start gap-3 flex-1">
                  <Tag
                    :value="q.answer ? '답변완료' : '답변대기'"
                    :severity="q.answer ? 'success' : 'warning'"
                    class="flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 mb-1! truncate">{{ q.title }}</h3>
                    <div class="flex items-center gap-2 text-sm text-gray-500">
                      <i class="pi pi-building text-xs"></i>
                      <span class="truncate">{{ q.place.placeName }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                  <i class="pi pi-calendar text-xs"></i>
                  <span>{{ formatDate(q.createdAt) }}</span>
                </div>
              </div>
            </template>

            <div class="p-5 md:p-6 bg-gray-50">
              <!-- 숙소 정보 -->
              <div class="mb-2! p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div class="flex items-center gap-2">
                  <i class="pi pi-building text-blue-600 text-lg"></i>
                  <div>
                    <h4 class="font-bold text-gray-900">{{ q.place.placeName }}</h4>
                    <p class="text-xs text-gray-500">{{ q.place.categoryName }}</p>
                  </div>
                </div>
              </div>

              <!-- 질문 섹션 -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-1!">
                <div class="flex gap-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span class="text-white font-bold text-lg">Q</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2!">
                      <p class="font-semibold text-gray-800">내 질문</p>
                      <span class="text-xs text-gray-500">{{ formatDate(q.createdAt) }}</span>
                    </div>
                    <h4 class="font-bold text-gray-900 mb-2! text-base">{{ q.title }}</h4>
                    <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ q.content }}</p>
                  </div>
                </div>
              </div>

              <!-- 답변 섹션 -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div class="flex gap-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span class="text-white font-bold text-lg">A</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-800 mb-2!">숙소 답변</p>
                    <div v-if="q.answer" class="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {{ q.answer.content }}
                    </div>
                    <div v-else class="flex items-start gap-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <i class="pi pi-clock text-yellow-600 mt-0.5"></i>
                      <div>
                        <p class="text-sm font-semibold text-yellow-800">답변 대기 중</p>
                        <p class="text-xs text-yellow-700 mt-1">숙소에서 곧 답변을 등록할 예정입니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionTab>
        </Accordion>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
          <Button
            icon="pi pi-chevron-left"
            :disabled="currentPage === 0"
            @click="changePage(currentPage - 1)"
            text
            rounded
            :pt="{
              root: { class: 'w-10 h-10' }
            }"
          />
          <div class="flex items-center gap-1">
            <span class="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-sm">
              {{ currentPage + 1 }}
            </span>
            <span class="text-gray-500 text-sm">/</span>
            <span class="text-gray-500 font-medium text-sm">{{ totalPages }}</span>
          </div>
          <Button
            icon="pi pi-chevron-right"
            :disabled="currentPage >= totalPages - 1"
            @click="changePage(currentPage + 1)"
            text
            rounded
            :pt="{
              root: { class: 'w-10 h-10' }
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* AccordionTab 커스텀 스타일 유지 */
</style>
