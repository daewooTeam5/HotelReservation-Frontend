<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore.ts';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import { ApiResult } from '@/types/ApiResult';
import type { Guest } from '@/types/users.ts';

// 예약자 정보 인터페이스
interface ReservationUserInfo {
  lastName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
}

const { userAuth } = useAuthStore();
const { isLoading, data, isError, error } = useQuery<ApiResult<Guest>>({
  queryKey: ['v1', 'users', 'my', 'guest'],
  queryFn: httpFetcher,
  enabled: !!userAuth
});
const lastNameModel = computed({
  get: () => data.value?.data?.lastName ?? formData.value.lastName,
  set: (val: string) => {
    if (data.value?.data) {
      data.value.data.lastName = val; // vue-query 데이터 덮어쓰기
    } else {
      formData.value.lastName = val;
    }
  }
});
// 폼 데이터
const formData = ref<ReservationUserInfo>({
  lastName: '',
  firstName: '',
  email: userAuth?.email || '',
  phoneNumber: ''
});

// 이메일 유효성 검사
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(formData.value.email);
});

// 전화번호 유효성 검사
const isPhoneValid = computed(() => {
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(formData.value.phoneNumber);
});

// 이벤트 정의
const emit = defineEmits<{
  submit: [data: ReservationUserInfo];
  dataChange: [data: ReservationUserInfo];
}>();

// 데이터 변경 감지
const handleInputChange = () => {
  emit('dataChange', { ...formData.value });
};


// 로그인된 사용자 정보로 자동 입력
if (userAuth) {
  formData.value.email = userAuth.email || '';
  // 이름이 있다면 성/이름으로 분리 (간단한 처리)
  if (userAuth.name) {
    const names = userAuth.name.split(' ');
    if (names.length >= 2) {
      formData.value.lastName = names[0];
      formData.value.firstName = names.slice(1).join(' ');
    } else {
      formData.value.firstName = userAuth.name;
    }
  }
}
</script>

<template>
  <PrimeCard class="shadow-sm border border-gray-200">
    <template #header>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-user text-blue-500"></i>
          예약자 정보
        </h3>
      </div>
    </template>

    <template #content>
      <div  class="p-4 space-y-4">
        <!-- 성/이름 입력 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              성 <span class="text-red-500">*</span>
            </label>
            <InputText
              v-model="formData.lastName"
              placeholder="성을 입력하세요"
              class="w-full"
              @input="handleInputChange"
            />

          </div>

          <div class="space-y-2">
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              이름 <span class="text-red-500">*</span>
            </label>
            <InputText
              id="firstName"
              v-model="formData.firstName"
              placeholder="이름을 입력하세요"
              class="w-full"
              @input="handleInputChange"
            />
          </div>
        </div>

        <!-- 이메일 입력 -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">
            이메일 주소 <span class="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="example@email.com"
            class="w-full"
            :class="{ 'border-red-500': formData.email && !isEmailValid }"
            @input="handleInputChange"
          />
          <small v-if="formData.email && !isEmailValid" class="text-red-500">
            올바른 이메일 형식이 아닙니다.
          </small>
        </div>

        <!-- 전화번호 입력 -->
        <div class="space-y-2">
          <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
            전화번호 <span class="text-red-500">*</span>
          </label>
          <InputText
            id="phoneNumber"
            v-model="formData.phoneNumber"
            placeholder="010-1234-5678"
            class="w-full"
            :class="{ 'border-red-500': formData.phoneNumber && !isPhoneValid }"
            @input="handleInputChange"
          />
          <small v-if="formData.phoneNumber && !isPhoneValid" class="text-red-500">
            올바른 전화번호 형식이 아닙니다. (010-1234-5678)
          </small>
        </div>

        <!-- 안내 메시지 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <i class="pi pi-info-circle text-blue-500 mt-0.5"></i>
            <div class="text-sm text-blue-700">
              <p class="font-medium">예약 확인서는 입력하신 이메일로 발송됩니다.</p>
              <p class="text-xs mt-1">전화번호는 예약 관련 연락용으로만 사용됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </template>

  </PrimeCard>
</template>

<style scoped>
</style>
