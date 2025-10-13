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
const formTouched = ref(false);

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
  formTouched.value = true;

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
  <div class="space-y-6">
    <!-- 안내 메시지 -->
    <div class="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <i class="pi pi-building text-white text-2xl"></i>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-blue-800 mb-1!">호텔 오너 입점 신청</h3>
          <p class="text-blue-700 text-sm">
            파트너가 되어 비즈니스를 성장시키세요! 필수 정보를 입력하고 관련 서류를 첨부해주세요.
          </p>
        </div>
      </div>
    </div>

    <!-- 입력 폼 -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 입력 필드 그리드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2!">
        <div class="flex flex-col gap-2">
          <label for="hotelName" class="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <i class="pi pi-building text-blue-600"></i>
            사업장 이름
            <span class="text-red-500">*</span>
          </label>
          <PrimeInputText
            id="hotelName"
            v-model="hotelName"
            placeholder="사업장 이름을 입력해주세요"
            class="w-full"
            :invalid="!hotelName && formTouched"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="businessNumber" class="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <i class="pi pi-id-card text-blue-600"></i>
            사업자 등록번호
            <span class="text-red-500">*</span>
          </label>
          <PrimeInputText
            id="businessNumber"
            v-model="businessNumber"
            placeholder="'-' 없이 숫자만 입력"
            class="w-full"
            :invalid="!businessNumber && formTouched"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <i class="pi pi-envelope text-blue-600"></i>
            이메일
            <span class="text-red-500">*</span>
          </label>
          <PrimeInputText
            id="email"
            v-model="email"
            type="email"
            placeholder="예: owner@email.com"
            class="w-full"
            :invalid="!email && formTouched"
          />
        </div>

        <div class="flex flex-col gap-2 ">
          <label for="phone" class="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <i class="pi pi-phone text-blue-600"></i>
            핸드폰 번호
            <span class="text-red-500">*</span>
          </label>
          <PrimeInputText
            id="phone"
            v-model="phone"
            placeholder="예: 010-1234-5678"
            class="w-full"
            :invalid="!phone && formTouched"
          />
        </div>
      </div>

      <!-- 서류 첨부 섹션 -->
      <div class="space-y-3 mt-2!">
        <label class="text-sm font-semibold text-gray-700 flex items-center gap-1">
          <i class="pi pi-paperclip text-blue-600"></i>
          관련 서류 첨부
          <span class="text-red-500">*</span>
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
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
              <div class="flex flex-col items-center justify-center py-6">
                <i class="pi pi-cloud-upload text-5xl text-gray-400 mb-3"></i>
                <p class="text-gray-600 text-sm text-center">
                  사업자 등록증, 통장 사본 등을 드래그하거나<br>
                  파일 선택 버튼을 눌러 첨부해주세요.
                </p>
                <p class="text-xs text-gray-500 mt-2">
                  최대 10MB | 이미지, PDF, HWP 파일 지원
                </p>
              </div>
            </template>
          </FileUpload>
        </div>
        <p v-if="attachedFiles.length > 0" class="text-sm text-gray-600">
          <i class="pi pi-check-circle text-green-600"></i>
          {{ attachedFiles.length }}개의 파일이 첨부되었습니다.
        </p>
      </div>

      <!-- 안내 사항 -->
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-2!">
        <div class="flex items-start gap-2">
          <i class="pi pi-info-circle text-yellow-600 mt-0.5!"></i>
          <div class="text-sm text-yellow-800">
            <p class="font-semibold mb-1">신청 안내</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>모든 필수 항목(*)을 입력해주세요.</li>
              <li>사업자 등록증은 필수 첨부 서류입니다.</li>
              <li>신청 후 영업일 기준 2-3일 이내에 검토 결과를 알려드립니다.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 제출 버튼 -->
      <div class="flex justify-end pt-4">
        <PrimeButton
          type="submit"
          :loading="isPending"
          label="입점 신청하기"
          icon="pi pi-send"
          size="large"
          severity="success"
          class="px-8"
          :disabled="isPending"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
:deep(.p-fileupload) {
  border: none;
  background: transparent;
}

:deep(.p-fileupload-buttonbar) {
  padding: 0.5rem;
  background: transparent;
  border: none;
}

:deep(.p-fileupload-content) {
  padding: 0.5rem;
  background: transparent;
  border: none;
}

:deep(.p-fileupload-choose) {
  background: #3b82f6;
  border-color: #3b82f6;
}

:deep(.p-fileupload-choose:hover) {
  background: #2563eb;
  border-color: #2563eb;
}
</style>
