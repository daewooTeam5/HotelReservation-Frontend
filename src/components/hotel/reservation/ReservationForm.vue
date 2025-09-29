<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore.ts';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher.ts';
import type { ApiResult } from '@/types/ApiResult';
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

// 폼 데이터
const formData = ref<ReservationUserInfo>({
  lastName: '',
  firstName: '',
  email: userAuth?.email || '',
  phoneNumber: ''
});

// 이름(성/이름) 유효성: 영어 대문자만 허용
const upperNameRegex = /^[A-Z]+$/;
const isLastNameValid = computed(() => !formData.value.lastName || upperNameRegex.test(formData.value.lastName));
const isFirstNameValid = computed(() => !formData.value.firstName || upperNameRegex.test(formData.value.firstName));

// 이메일 유효성 검사
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(formData.value.email);
});

// 전화번호 유효성 검사 (숫자만)
const isPhoneValid = computed(() => {
  const phoneRegex = /^\d+$/;
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

// 전화번호 입력 시 숫자만 허용하도록 정규화
const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  formData.value.phoneNumber = (target?.value || '').replace(/\D/g, '');
  emit('dataChange', { ...formData.value });
};

// useQuery 결과로 초기 데이터 세팅 (있을 때만 덮어쓰기)
watch(
  () => data.value?.data,
  (guest) => {
    if (guest) {
      if (guest.email) {
        formData.value.email = guest.email.slice(0, 60);
      }
      if (guest.firstName) {
        formData.value.firstName = guest.firstName.slice(0, 30);
      }
      if (guest.lastName) {
        formData.value.lastName = guest.lastName.slice(0, 30);
      }
      // 전화번호는 숫자만 유지
      const cleanedPhone = guest.phone ? guest.phone.replace(/\D/g, '') : '';
      if (cleanedPhone) {
        formData.value.phoneNumber = cleanedPhone;
      }
      emit('dataChange', { ...formData.value });
    }
  },
  { immediate: true }
);

// 로그인된 사용자 정보로 자동 입력
if (userAuth) {
  formData.value.email = (userAuth.email || '').slice(0, 60);
}

// 폼 입력 요소 참조
const lastNameRef = ref<any>(null);
const firstNameRef = ref<any>(null);
const emailRef = ref<any>(null);
const phoneRef = ref<any>(null);

// 제출 시 유효성 검사 및 포커스 이동
const validateAndFocus = (): boolean => {
  // 필수값 + 형식 + 길이 검사 순서대로 확인
  if (!formData.value.lastName || !upperNameRegex.test(formData.value.lastName) || formData.value.lastName.length > 30) {
    const el = lastNameRef.value?.$el ?? lastNameRef.value;
    (el?.focus ? el.focus() : el?.querySelector?.('input')?.focus?.());
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    return false;
  }

  if (!formData.value.firstName || !upperNameRegex.test(formData.value.firstName) || formData.value.firstName.length > 30) {
    const el = firstNameRef.value?.$el ?? firstNameRef.value;
    (el?.focus ? el.focus() : el?.querySelector?.('input')?.focus?.());
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.value.email || !emailRegex.test(formData.value.email) || formData.value.email.length > 60) {
    const el = emailRef.value?.$el ?? emailRef.value;
    (el?.focus ? el.focus() : el?.querySelector?.('input')?.focus?.());
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    return false;
  }

  if (!formData.value.phoneNumber || !/^\d+$/.test(formData.value.phoneNumber)) {
    const el = phoneRef.value?.$el ?? phoneRef.value;
    (el?.focus ? el.focus() : el?.querySelector?.('input')?.focus?.());
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    return false;
  }

  return true;
};

// 부모에서 사용할 수 있도록 메서드 노출
defineExpose({ validateAndFocus });
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
      <div class="p-4 space-y-4">
        <!-- 성/이름 입력 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              성 <span class="text-red-500">*</span>
            </label>
            <InputText
              id="lastName"
              ref="lastNameRef"
              v-model="formData.lastName"
              placeholder="예: HONG"
              maxlength="30"
              class="w-full"
              :class="{ 'border-red-500': formData.lastName && !isLastNameValid }"
              @input="handleInputChange"
            />
            <small v-if="formData.lastName && !isLastNameValid" class="text-red-500">
              영어 대문자만 입력 가능합니다. (A-Z)
            </small>
          </div>

          <div class="space-y-2">
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              이름 <span class="text-red-500">*</span>
            </label>
            <InputText
              id="firstName"
              ref="firstNameRef"
              v-model="formData.firstName"
              placeholder="예: JIHYE"
              maxlength="30"
              class="w-full"
              :class="{ 'border-red-500': formData.firstName && !isFirstNameValid }"
              @input="handleInputChange"
            />
            <small v-if="formData.firstName && !isFirstNameValid" class="text-red-500">
              영어 대문자만 입력 가능합니다. (A-Z)
            </small>
          </div>
        </div>

        <!-- 이메일 입력 -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">
            이메일 주소 <span class="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            ref="emailRef"
            v-model="formData.email"
            type="email"
            placeholder="example@email.com"
            maxlength="60"
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
            ref="phoneRef"
            v-model="formData.phoneNumber"
            type="tel"
            inputmode="numeric"
            placeholder="숫자만 입력"
            class="w-full"
            :class="{ 'border-red-500': formData.phoneNumber && !isPhoneValid }"
            @input="handlePhoneInput"
          />
          <small v-if="formData.phoneNumber && !isPhoneValid" class="text-red-500">
            숫자만 입력해주세요.
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
