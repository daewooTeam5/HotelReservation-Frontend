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

// 약관 상세 보기 모달
const showTermsModal = ref(false);
const showPrivacyModal = ref(false);
const currentModalTitle = ref('');
const currentModalContent = ref('');

const openTermsModal = () => {
  currentModalTitle.value = '이용약관';
  currentModalContent.value = '이용약관 내용...\n\n1. 서비스 이용 약관\n본 약관은 호텔 예약 서비스 이용에 관한 제반사항을 규정합니다.\n\n2. 서비스 변경 및 중지\n당사는 서비스의 내용이나 운영에 관한 사항을 변경할 수 있으며, 시스템 점검, 기술적 문제 등으로 서비스를 일시 중지할 수 있습니다.\n\n3. 책임 제한\n당사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.\n\n4. 약관 변경\n당사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 홈페이지에 공지함으로써 효력이 발생합니다.';
  showTermsModal.value = true;
};

const openPrivacyModal = () => {
  currentModalTitle.value = '개인정보 처리방침';
  currentModalContent.value = '개인정보 처리방침 내용...\n\n1. 수집하는 개인정보 항목\n- 필수항목: 이름, 이메일 주소, 전화번호\n- 선택항목: 특별 요청사항\n\n2. 개인정보의 수집 및 이용목적\n- 서비스 제공 및 예약 관리\n- 고객 응대 및 불만 처리\n\n3. 개인정보의 보유 및 이용기간\n회원 탈퇴 시 또는 법령에 따른 보존기간 동안 보관 후 파기됩니다.\n\n4. 개인정보의 파기절차 및 방법\n전자적 파일 형태로 저장된 개인정보는 기술적 방법을 통해 복구 및 재생되지 않도록 안전하게 삭제합니다.';
  showPrivacyModal.value = true;
};

const closeModal = () => {
  showTermsModal.value = false;
  showPrivacyModal.value = false;
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

          <!-- 개인정보 수집 및 이용 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Checkbox
                v-model="agreements.privacyPolicy"
                :binary="true"
                class="mr-2"
                @change="handleAgreementChange"
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
            />
            <label class="text-gray-700">
              <span class="text-red-500 mr-1">[필수]</span> 만 14세 이상 확인
            </label>
          </div>

          <!-- 마케팅 정보 수신 동의 -->
          <div class="flex items-center">
            <Checkbox
              v-model="agreements.marketingConsent"
              :binary="true"
              class="mr-2"
              @change="handleAgreementChange"
            />
            <label class="text-gray-700">
              <span class="text-gray-400 mr-1">[선택]</span> 마케팅 정보 수신 동의
            </label>
          </div>
        </div>

        <!-- 안내 메시지 -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
          <div class="flex items-start gap-2">
            <i class="pi pi-info-circle text-gray-500 mt-0.5"></i>
            <div class="text-xs text-gray-600">
              <p class="font-medium mb-1">약관 동의 안내</p>
              <p>• 필수 약관에 동의하셔야 예약이 가능합니다.</p>
              <p>• 선택 항목에 동의하지 않으셔도 서비스 이용에 제한은 없습니다.</p>
              <p>• 약관 내용은 '보기' 버튼을 클릭하여 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 약관 상세 모달 -->
    <Dialog
      v-model:visible="showTermsModal"
      modal
      header="약관 상세"
      :style="{ width: '50vw' }"
      :closable="true"
      :closeOnEscape="true"
      @hide="closeModal"
    >
      <h2 class="text-xl font-bold mb-4">{{ currentModalTitle }}</h2>
      <div class="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto whitespace-pre-line">
        {{ currentModalContent }}
      </div>
      <template #footer>
        <Button label="닫기" @click="closeModal" />
      </template>
    </Dialog>
  </PrimeCard>
</template>

<style scoped>
</style>
