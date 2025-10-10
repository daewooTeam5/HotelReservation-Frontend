<script lang="ts" setup>
import { ref, computed } from 'vue';

// 약관 동의 상태
const agreements = ref({
  termsOfService: false,
  privacyPolicy: false,
  ageVerification: false,
  marketingConsent: false
});

// 필수 약관 동의 확인 (마케팅 동의는 선택사항)
const isAllRequiredChecked = computed(() => {
  return agreements.value.termsOfService &&
    agreements.value.privacyPolicy &&
    agreements.value.ageVerification;
});

// 모든 약관 한번에 동의하기
const allAgreements = computed({
  get() {
    return agreements.value.termsOfService &&
      agreements.value.privacyPolicy &&
      agreements.value.ageVerification &&
      agreements.value.marketingConsent;
  },
  set(value: boolean) {
    agreements.value.termsOfService = value;
    agreements.value.privacyPolicy = value;
    agreements.value.ageVerification = value;
    agreements.value.marketingConsent = value;
  }
});

// 이벤트 정의
const emit = defineEmits<{
  'update:agreements': [agreements: typeof agreements.value];
  'agreement-change': [isValid: boolean];
}>();

// 약관 동의 상태 변경 시
const handleAgreementChange = () => {
  emit('update:agreements', agreements.value);
  emit('agreement-change', isAllRequiredChecked.value);
};

// 커스텀 모달 상태
const showTermsModal = ref(false);
const showPrivacyModal = ref(false);

const termsContent = `
1. 서비스 이용 목적과 범위에 대해 안내합니다.

2. 회원은 정확한 정보를 입력해야 하며, 허위 입력 시 제한될 수 있습니다.

3. 당사는 서비스 운영을 위해 필요 시 내용 및 기능을 변경할 수 있습니다.

4. 시스템 점검, 기술적 문제 등으로 서비스를 일시 중지할 수 있습니다.

5. 회원은 서비스 이용과 관련한 책임을 부담합니다.

`;

const privacyContent = `
1. 수집 항목: 이름, 이메일, 전화번호 (필수), 요청사항 등

2. 이용 목적: 예약 확인, 고객 문의 처리, 맞춤형 서비스 제공

3. 개인정보 보유 기간:탈퇴 시 또는 법령상 보관기간 이후 안전하게 삭제

4. 파기 방법: 전자적 파일은 복구되지 않도록 안전하게 처리

5. 제3자 제공: 법령에 따라 필요한 경우에 한하여 제공될 수 있습니다.

`;

const openTermsModal = () => showTermsModal.value = true;
const openPrivacyModal = () => showPrivacyModal.value = true;

const closeTermsModal = () => showTermsModal.value = false;
const closePrivacyModal = () => showPrivacyModal.value = false;

const agreeTerms = () => {
  agreements.value.termsOfService = true;
  handleAgreementChange();
  closeTermsModal();
};

const agreePrivacy = () => {
  agreements.value.privacyPolicy = true;
  handleAgreementChange();
  closePrivacyModal();
};
</script>

<template>
  <PrimeCard class="shadow-sm border border-gray-200">
    <template #header>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-check-square text-blue-500"></i>
          약관 동의
        </h3>
      </div>
    </template>

    <template #content>
      <div class="p-4 space-y-4">
        <!-- 전체 동의 -->
        <div class="border-b pb-3">
          <div class="flex items-center">
            <Checkbox
              v-model="allAgreements"
              :binary="true"
              class="mr-2"
              @change="handleAgreementChange"
              style="margin-right: 6px;"
            />
            <label class="font-bold text-gray-800">모든 약관에 동의합니다</label>
          </div>
          <p class="text-xs text-gray-500 mt-1 ml-6">
            예약을 위한 필수 약관 및 마케팅 정보 수신에 동의합니다.
          </p>
        </div>

        <!-- 개별 약관 동의 -->
        <div class="space-y-3">
          <!-- 이용약관 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox
                v-model="agreements.termsOfService"
                :binary="true"
                class="mr-2"
                @change="handleAgreementChange"
                style="margin-right: 6px;"
              />
              <label class="text-gray-700">
                <span class="text-red-500 mr-1">[필수]</span> 이용약관 동의
              </label>
            </div>
            <Button
              label="보기"
              link
              severity="secondary"
              size="small"
              @click="openTermsModal"
            />
          </div>

          <!-- 개인정보 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox
                v-model="agreements.privacyPolicy"
                :binary="true"
                class="mr-2"
                @change="handleAgreementChange"
                style="margin-right: 6px;"
              />
              <label class="text-gray-700">
                <span class="text-red-500 mr-1">[필수]</span> 개인정보 수집 및 이용 동의
              </label>
            </div>
            <Button
              label="보기"
              link
              severity="secondary"
              size="small"
              @click="openPrivacyModal"

            />
          </div>

          <!-- 만 14세 이상 -->
          <div class="flex items-center">
            <Checkbox
              v-model="agreements.ageVerification"
              :binary="true"
              class="mr-2"
              @change="handleAgreementChange"
              style="margin-right: 6px;"
            />
            <label class="text-gray-700">
              <span class="text-red-500 mr-1">[필수]</span> 만 14세 이상 확인
            </label>
          </div>

          <!-- 마케팅 정보 -->
          <div class="flex items-center" style="margin-top: 4px;">
            <Checkbox
              v-model="agreements.marketingConsent"
              :binary="true"
              class="mr-2"
              @change="handleAgreementChange"
              style="margin-right: 6px;"
            />
            <label class="text-gray-700">
              <span class="text-gray-400 mr-1">[선택]</span> 마케팅 정보 수신 동의
            </label>
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>

  <!-- 이용약관 모달 -->
  <form
    v-if="showTermsModal"
    class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
    @submit.prevent="agreeTerms"
  >
    <div class="bg-white rounded-lg shadow-xl w-[600px] p-6">
      <h2 class="text-xl font-semibold mb-4">이용약관</h2>
      <p class="text-gray-700 h-64 y-80 mb-4 whitespace-pre-line">{{ termsContent }}</p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="closeTermsModal"
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          닫기
        </button>

      </div>
    </div>
  </form>

  <!-- 개인정보 모달 -->
  <form
    v-if="showPrivacyModal"
    class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
    @submit.prevent="agreePrivacy"
  >
    <div class="bg-white rounded-lg shadow-xl w-[600px] p-6">
      <h2 class="text-xl font-semibold mb-4">개인정보 처리방침</h2>
      <p class="text-gray-700 h-64 y-50 mb-4 whitespace-pre-line">{{ privacyContent }}</p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="closePrivacyModal"
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          닫기
        </button>

      </div>
    </div>
  </form>
</template>

<style scoped>
/* 스크롤바 스타일 (선택) */
p::-webkit-scrollbar {
  width: 6px;
}
p::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
}
</style>
