<script setup lang="ts">
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import { useToast } from 'primevue';
import { useAuthStore } from '@/stores/authStore.ts';

const emit = defineEmits<{
  success: []
}>();

// --- 상태 관리 (State) ---
const hotelName = ref('');
const businessNumber = ref('');
const email = ref('');
const phone = ref('');
const authStore = useAuthStore();
const attachedFiles = ref<File[]>([]);
const toast = useToast();

// 초기값 설정
email.value = authStore.getUserAuth?.email ?? '';
phone.value = authStore.getUserAuth?.phone ?? '';
hotelName.value = authStore.getUserAuth?.name ?? '';

// --- 파일 선택 시 호출될 함수 ---
const onFileSelect = (event: FileUploadSelectEvent) => {
  attachedFiles.value = [...attachedFiles.value, ...event.files];
};

// --- 파일 제거 시 호출될 함수 ---
const onFileRemove = (event: any) => {
  attachedFiles.value = attachedFiles.value.filter(file => file.name !== event.file.name);
};

// --- API 요청 함수 ---
const ownerRequestApi = async () => {
  const formData = new FormData();
  formData.append('hotelName', hotelName.value);
  formData.append('businessNumber', businessNumber.value);
  formData.append('email', email.value);
  formData.append('phone', phone.value);

  attachedFiles.value.forEach(file => {
    formData.append('documents', file);
  });

  const { data } = await apiClient.post('v1/users/my/hotel-owner/request', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

// --- 뮤테이션 훅을 통한 비동기 요청 ---
const { mutate: submitApplication, isPending } = useMutation({
  mutationFn: ownerRequestApi,
  onSuccess: async () => {
    toast.add({
      severity: 'success',
      summary: '신청 완료!',
      detail: '성공적으로 입점 신청이 완료되었습니다. 검토 후 연락드리겠습니다.',
      life: 3000
    });

    const result = await apiClient.post('/v1/auth/token');
    authStore.setAccessToken(result.data.data.accessToken);

    // 성공 후 폼 초기화
    hotelName.value = '';
    businessNumber.value = '';
    email.value = '';
    phone.value = '';
    attachedFiles.value = [];

    emit('success');
  },
  onError: () => {
    toast.add({
      severity: 'error',
      summary: '신청 실패',
      detail: '오류가 발생했습니다. 다시 시도해주세요.',
      life: 3000
    });
  }
});

// --- 폼 제출 (신청하기) 함수 ---
const handleSubmit = () => {
  if (!hotelName.value || !businessNumber.value || !email.value || !phone.value) {
    toast.add({ severity: 'warn', summary: '정보 부족', detail: '모든 필수 정보를 입력해주세요!', life: 3000 });
    return;
  }
  if (attachedFiles.value.length === 0) {
    toast.add({ severity: 'warn', summary: '파일 없음', detail: '필요한 서류를 하나 이상 첨부해주세요!', life: 3000 });
    return;
  }

  submitApplication();
};
</script>

<template>
  <PrimeCard class="w-full max-w-2xl shadow-xl rounded-2xl overflow-hidden">
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 to-teal-400 text-white py-6 px-8">
        <h2 class="text-2xl font-bold tracking-wide">🏨 호텔 오너 입점 신청</h2>
        <p class="text-xs mt-1 opacity-90">파트너가 되어 비즈니스를 성장시키세요!</p>
      </div>
    </template>

    <template #content>
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label for="hotelName" class="font-semibold text-gray-700">사업장 이름</label>
            <PrimeInputText
              id="hotelName"
              v-model="hotelName"
              placeholder="이름을 입력해주세요"
              class="focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="businessNumber" class="font-semibold text-gray-700">사업자 등록번호</label>
            <PrimeInputText
              id="businessNumber"
              v-model="businessNumber"
              placeholder="'-' 없이 숫자만 입력"
              class="focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="email" class="font-semibold text-gray-700">이메일</label>
            <PrimeInputText
              id="email"
              v-model="email"
              placeholder="예: owner@email.com"
              class="focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="phone" class="font-semibold text-gray-700">핸드폰 번호</label>
            <PrimeInputText
              id="phone"
              v-model="phone"
              placeholder="예: 010-1234-5678"
              class="focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        <div>
          <label class="font-semibold text-gray-700 mb-2 block">관련 서류 첨부</label>
          <FileUpload
            name="documents[]"
            @select="onFileSelect"
            @remove="onFileRemove"
            :multiple="true"
            accept="image/*,application/pdf,.hwp"
            :maxFileSize="10000000"
            chooseLabel="파일 선택"
            uploadLabel="업로드"
            cancelLabel="취소"
            :showUploadButton="false"
            :showCancelButton="false"
            class="w-full"
          >
            <template #empty>
              <div class="flex flex-col items-center justify-center p-8">
                <i class="pi pi-cloud-upload text-4xl text-gray-400"></i>
                <p class="mt-4 text-gray-600 text-sm">
                  사업자 등록증, 통장 사본 등을 여기에 드래그하거나<br>파일 선택 버튼을 눌러 첨부해주세요.
                </p>
              </div>
            </template>
          </FileUpload>
        </div>

        <div class="mt-8 flex justify-end">
          <PrimeButton
            style="margin-top: 8px;"
            type="submit"
            :loading="isPending"
            label="입점 신청하기"
            icon="pi pi-check"
            class="w-full md:w-auto px-8 py-3 text-lg rounded-lg shadow-lg bg-emerald-500 border-0 hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-400"
            severity="success"
          />
        </div>
      </form>
    </template>
  </PrimeCard>
</template>

<style scoped>
:deep(.p-fileupload-buttonbar) {
  padding: 0.5rem;
}

:deep(.p-fileupload-content) {
  padding: 0.5rem;
}
</style>
