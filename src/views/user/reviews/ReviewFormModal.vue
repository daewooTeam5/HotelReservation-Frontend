<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Textarea from 'primevue/textarea';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';

// 주석: 부모 컴포넌트로부터 받을 props 정의 (보일지 여부, 숙소 ID, 예약 ID)
const props = defineProps<{
  visible: boolean;
  placeId: number;
}>();

// 주석: 부모 컴포넌트로 보낼 이벤트를 정의합니다. (모달 닫기, 리뷰 제출 완료)
const emit = defineEmits(['update:visible', 'review-submitted']);

const rating = ref(0);
const comment = ref('');
const toast = useToast();
const queryClient = useQueryClient();

// 주석: 리뷰 생성을 위한 useMutation 훅 설정
const { mutate: submitReview, isPending } = useMutation({
  mutationFn: (newReview: {rating: number; comment: string }) => {
    // 백엔드의 리뷰 생성 API 엔드포인트로 요청을 보냅니다.
    return apiClient.post(`/v1/places/${props.placeId}/reviews`, newReview);
  },
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '리뷰가 등록되었습니다.', life: 3000 });
    // 주석: 리뷰 목록 쿼리를 무효화하여 최신 데이터로 갱신합니다.
    queryClient.invalidateQueries({ queryKey: ['reviews', props.placeId] });
    closeModal();
    emit('review-submitted');
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: '오류', detail: error.message, life: 3000 });
  }
});

// 주석: 모달을 닫는 함수
const closeModal = () => {
  emit('update:visible', false);
  rating.value = 0;
  comment.value = '';
};

// 주석: 폼 제출 핸들러
const handleSubmit = () => {
  if (rating.value > 0 && comment.value.trim() !== '') {
    submitReview({
      rating: rating.value,
      comment: comment.value
    });
  } else {
    toast.add({ severity: 'warn', summary: '알림', detail: '별점과 리뷰 내용을 모두 입력해주세요.', life: 3000 });
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="closeModal"
    modal
    header="리뷰 작성"
    :style="{ width: '30rem' }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col items-center gap-2">
        <label for="rating" class="font-semibold">별점</label>
        <Rating v-model="rating" :cancel="false" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="comment" class="font-semibold">리뷰 내용</label>
        <Textarea id="comment" v-model="comment" rows="5" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="취소" icon="pi pi-times" @click="closeModal" text />
      <Button label="등록" icon="pi pi-check" @click="handleSubmit" :loading="isPending" />
    </template>
  </Dialog>
</template>
