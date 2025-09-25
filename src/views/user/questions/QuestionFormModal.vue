<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';

const props = defineProps<{
  visible: boolean;
  placeId: number;
}>();

const emit = defineEmits(['update:visible', 'question-submitted']);

const title = ref('');
const content = ref('');
const toast = useToast();

const { mutate: submitQuestion, isPending } = useMutation({
  mutationFn: (newQuestion: { title: string; content: string }) => {
    return apiClient.post(`/v1/places/${props.placeId}/questions`, newQuestion);
  },
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '문의가 등록되었습니다.', life: 3000 });
    closeModal();
    emit('question-submitted');
  },
  onError: (error: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: error.response?.data?.error?.detail || '문의 등록에 실패했습니다.', life: 3000 });
  }
});

const closeModal = () => {
  emit('update:visible', false);
};

// 모달이 닫힐 때 입력 내용 초기화
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    title.value = '';
    content.value = '';
  }
});

const handleSubmit = () => {
  if (title.value.trim() !== '' && content.value.trim() !== '') {
    submitQuestion({ title: title.value, content: content.value });
  } else {
    toast.add({ severity: 'warn', summary: '알림', detail: '제목과 내용을 모두 입력해주세요.', life: 3000 });
  }
};
</script>

<template>
  <Dialog :visible="visible" @update:visible="closeModal" modal header="숙소에 문의하기" :style="{ width: '35rem' }">
    <div class="flex flex-col gap-6 p-2">
      <div class="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4" role="alert">
        <p class="font-bold">주의사항</p>
        <p class="text-sm">질문하신 내용에 대한 답변을 즉시 받지 못하시는 경우, 숙소로 문의사항을 전달하실 수 있습니다. 입력하시는 내용에 개인정보가 포함되지 않도록 주의해 주세요.</p>
      </div>
      <div class="flex flex-col gap-2">
        <label for="title" class="font-semibold">제목</label>
        <InputText id="title" v-model="title" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="content" class="font-semibold">내용</label>
        <Textarea id="content" v-model="content" rows="8" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="취소" icon="pi pi-times" @click="closeModal" text />
      <Button label="등록" icon="pi pi-check" @click="handleSubmit" :loading="isPending" />
    </template>
  </Dialog>
</template>
