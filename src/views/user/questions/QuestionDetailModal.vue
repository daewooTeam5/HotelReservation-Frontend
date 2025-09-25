<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import type { ApiResult } from '@/types/ApiResult';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import InputText from 'primevue/inputtext';

// ... Question 인터페이스 정의 ...
interface Question {
  questionId: number;
  title: string;
  content: string;
  answer: string | null;
  userName: string;
  createdAt: string;
}

const props = defineProps<{
  visible: boolean;
  placeId: number;
}>();
const emit = defineEmits(['update:visible']);

const filterKeyword = ref('');

const { data: questions } = useQuery<Question[]>({
  queryKey: ['questions', props.placeId], // QuestionSection과 동일한 키를 사용해 캐시된 데이터 활용
  queryFn: async () => {
    const response = await apiClient.get<ApiResult<Question[]>>(`/v1/places/${props.placeId}/questions`);
    return response.data.data || [];
  },
  enabled: computed(() => props.visible && !!props.placeId),
});

const filteredQuestions = computed(() => {
  if (!filterKeyword.value) {
    return questions.value;
  }
  return questions.value?.filter(q =>
    q.title.includes(filterKeyword.value) ||
    q.content.includes(filterKeyword.value) ||
    (q.answer && q.answer.includes(filterKeyword.value))
  );
});

const closeModal = () => {
  emit('update:visible', false);
}
</script>

<template>
  <Dialog :visible="props.visible" @update:visible="closeModal" modal header="전체 문의" :style="{ width: '50vw', height: '80vh' }">
    <div class="flex flex-col h-full">
      <div class="p-4 border-b">
        <InputText v-model="filterKeyword" placeholder="제목, 내용, 답변으로 검색" class="w-full" />
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <Accordion>
          <AccordionTab v-for="q in filteredQuestions" :key="q.questionId" :header="q.title">
          </AccordionTab>
        </Accordion>
      </div>
    </div>
  </Dialog>
</template>
