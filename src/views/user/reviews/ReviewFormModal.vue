<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Textarea from 'primevue/textarea';
import FileUpload, { type FileUploadUploaderEvent } from 'primevue/fileupload';
import Dropdown from 'primevue/dropdown';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient';
import { useToast } from 'primevue/usetoast';
import type { ReviewableReservation } from '@/types/reservation';
import type { ApiResult } from '@/types/ApiResult';

const props = defineProps<{
  visible: boolean;
  placeId: number;
  reservations: ReviewableReservation[];
}>();

const emit = defineEmits(['update:visible', 'review-submitted']);

const rating = ref(0);
const comment = ref('');
const toast = useToast();
const queryClient = useQueryClient();
const uploadedImageUrls = ref<string[]>([]);
const isUploading = ref(false);
const selectedReservationId = ref<number | null>(null);
const fileUploadRef = ref<any>(null); // [추가] FileUpload 컴포넌트 참조

// ✅ [수정] 이미지 업로드 핸들러
const handleImageUpload = async (event: FileUploadUploaderEvent) => {
  const files = Array.isArray(event.files) ? event.files : [event.files];
  isUploading.value = true;
  console.log("======="+files);

  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await apiClient.post<ApiResult<string[]>>('/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success && response.data.data) {
      uploadedImageUrls.value.push(...response.data.data);
      toast.add({ severity: 'success', summary: '성공', detail: `${files.length}개의 이미지가 업로드되었습니다.`, life: 2000 });
    }
  } catch (error: any) {
    // [개선] 서버에서 보낸 구체적인 오류 메시지를 사용자에게 표시
    const detail = error.response?.data?.error?.detail || '이미지 업로드에 실패했습니다.';
    toast.add({ severity: 'error', summary: '오류', detail: detail, life: 3000 });
  } finally {
    isUploading.value = false;
    // [개선] 업로드 성공/실패와 관계없이 파일 목록을 초기화하여 "pending" 상태 제거
    if (fileUploadRef.value) {
      fileUploadRef.value.clear();
    }
  }
};

const { mutate: submitReview, isPending } = useMutation({
  mutationFn: (newReview: { reservationId: number; rating: number; comment: string; imageUrls: string[] }) => {
    return apiClient.post(`/v1/places/${props.placeId}/reviews`, newReview);
  },
  onSuccess: () => {
    toast.add({ severity: 'success', summary: '성공', detail: '리뷰가 등록되었습니다.', life: 3000 });
    closeModal();
    emit('review-submitted');
  },
  onError: (error: any) => {
    toast.add({ severity: 'error', summary: '오류', detail: error.response?.data?.error?.detail || '리뷰 등록에 실패했습니다.', life: 3000 });
  }
});

const closeModal = () => {
  emit('update:visible', false);
};

watch(() => props.visible, (newValue) => {
  if (!newValue) {
    rating.value = 0;
    comment.value = '';
    uploadedImageUrls.value = [];
    selectedReservationId.value = null;
  }
});

const handleSubmit = () => {
  if (!selectedReservationId.value) {
    toast.add({ severity: 'warn', summary: '알림', detail: '리뷰할 예약을 선택해주세요.', life: 3000 });
    return;
  }
  if (rating.value > 0 && comment.value.trim() !== '') {
    submitReview({
      reservationId: selectedReservationId.value,
      rating: rating.value,
      comment: comment.value,
      imageUrls: uploadedImageUrls.value,
    });
  } else {
    toast.add({ severity: 'warn', summary: '알림', detail: '별점과 리뷰 내용을 모두 입력해주세요.', life: 3000 });
  }
};

const removeImage = (index: number) => {
  uploadedImageUrls.value.splice(index, 1);
}
</script>

<template>
  <Dialog :visible="visible" @update:visible="closeModal" modal header="리뷰 작성" :style="{ width: '35rem' }">
    <div class="flex flex-col gap-6 p-2">
      <div class="flex flex-col gap-2">
        <label for="reservation" class="font-semibold">리뷰할 예약 선택</label>
        <Dropdown
          v-model="selectedReservationId"
          :options="props.reservations"
          optionLabel="roomType"
          optionValue="reservationId"
          placeholder="어떤 숙박에 대한 리뷰인가요?"
          class="w-full"
        >
          <template #option="slotProps">
            <div>{{ slotProps.option.roomType }} ({{ slotProps.option.resevStart }} 체크인)</div>
          </template>
        </Dropdown>
      </div>

      <div class="flex flex-col items-center gap-2">
        <label for="rating" class="font-semibold">별점</label>
        <Rating v-model="rating" :cancel="false" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="comment" class="font-semibold">리뷰 내용</label>
        <Textarea id="comment" v-model="comment" rows="5" class="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="images" class="font-semibold">사진 첨부 (선택)</label>
        <FileUpload
          ref="fileUploadRef"
          name="files"
          :multiple="true"
          accept="image/*"
          :maxFileSize="5000000"
          customUpload
          @select="handleImageUpload"
          :auto="true"
          :showUploadButton="false"
          :showCancelButton="false"
          :disabled="isUploading"
        >
          <template #header></template>
          <template #content></template>
          <template #empty>
            <div @click="() => fileUploadRef.choose()" class="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <i class="pi pi-upload text-4xl text-gray-400"></i>
              <p class="mt-2 text-center">
                소중한 경험을 사진으로 공유해주세요.<br>여기를 클릭하거나 파일을 드래그하여 업로드할 수 있습니다.
              </p>
            </div>
          </template>
        </FileUpload>

        <div v-if="uploadedImageUrls.length > 0" class="mt-4 grid grid-cols-4 gap-2">
          <div v-for="(url, index) in uploadedImageUrls" :key="index" class="relative">
            <img :src="url" class="w-full h-24 object-cover rounded" />
            <Button icon="pi pi-times" class="absolute top-1 right-1 p-button-danger p-button-rounded p-button-sm" @click="removeImage(index)" />
          </div>
        </div>
        <div v-if="isUploading" class="text-center mt-2">
          <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem"></i>
          <p>이미지 업로드 중...</p>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="취소" icon="pi pi-times" @click="closeModal" text />
      <Button label="등록" icon="pi pi-check" @click="handleSubmit" :loading="isPending || isUploading" />
    </template>
  </Dialog>
</template>


