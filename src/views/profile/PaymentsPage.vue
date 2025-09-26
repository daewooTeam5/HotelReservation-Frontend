<template>
  <div class="w-full bg-gray-50 min-h-screen p-4 sm:p-8 flex justify-center">
    <div class="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 sm:p-10">

      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-800">결제 내역 확인</h1>
      </div>

      <div class="flex border-b">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="handleTabClick(tab.id)"
          class="py-2 px-4 text-sm sm:text-base font-semibold transition-colors duration-200"
          :class="activeTab === tab.id
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-500 hover:text-blue-500'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div v-if="activeTab === 'creditCard'" class="mt-6">
        <div class="border-t border-b border-gray-200">
          <div class="grid grid-cols-[120px_1fr]">
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-r">카드번호</div>
            <div class="p-2 sm:p-4">
              <InputText v-model="formData.cardNumber" placeholder="-없이 숫자만 입력하세요" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r row-span-2">결제구분</div>
            <div class="p-4 border-t row-span-2">
              <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                <div class="flex items-center">
                  <RadioButton v-model="paymentType" inputId="typeCard" name="paymentType" value="card" />
                  <label style="margin-left:4px;" for="typeCard" class="ml-2">카드 결제</label>
                </div>
                <div class="flex items-center">
                  <RadioButton v-model="paymentType" inputId="typeEasy" name="paymentType" value="easy" />
                  <label style="margin-left:4px;" for="typeEasy" class="ml-2">간편결제</label>
                </div>
                <div class="flex items-center">
                  <RadioButton v-model="paymentType" inputId="typeAll" name="paymentType" value="all" />
                  <label style="margin-left:4px;" for="typeAll" class="ml-2">포인트 결제</label>
                </div>
                <div class="flex items-center">
                  <RadioButton v-model="paymentType" inputId="typeEtc" name="paymentType" value="etc" />
                  <label style="margin-left:4px;" for="typeEtc" class="ml-2">기타(쿠폰 등)</label>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">이메일</div>
            <div class="p-2 sm:p-4 border-t">
              <InputText v-model="formData.email" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">거래일자</div>
            <div class="p-2 sm:p-4 border-t">
              <Calendar v-model="formData.date" showIcon iconDisplay="input" placeholder="기간 선택" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">할부개월</div>
            <div class="p-2 sm:p-4 border-t">
              <InputText v-model="formData.installments" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">주문자명</div>
            <div class="p-2 sm:p-4 border-t">
              <InputText v-model="formData.customerName" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">호텔명</div>
            <div class="p-2 sm:p-4 border-t">
              <InputText v-model="formData.hotelName" class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'bankTransfer'" class="mt-6">
        <div class="border-t border-b border-gray-200">
          <div class="grid grid-cols-[120px_1fr]">
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-r">은행</div>
            <div class="p-2 sm:p-4">
              <Dropdown v-model="formData.bank" :options="banks" optionLabel="name" placeholder="은행을 선택하세요" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">계좌번호</div>
            <div class="p-2 sm:p-4 border-t">
              <InputText v-model="formData.accountNumber" placeholder="-없이 숫자만 입력하세요" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">입금자명</div>
            <div class="p-2 sm:p-4 border-t">
              <InputText v-model="formData.depositorName" class="w-full" />
            </div>
            <div class="bg-gray-50 p-4 font-semibold text-gray-700 flex items-center border-t border-r">거래일자</div>
            <div class="p-2 sm:p-4 border-t">
              <Calendar v-model="formData.date" showIcon iconDisplay="input" placeholder="기간 선택" class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="isSearching" class="text-center py-10 text-gray-500">
        조회 중입니다...
      </div>

      <div v-if="searchResults" class="mt-8 border-t-2 border-dashed pt-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">✔️ 조회 결과</h2>
        <pre class="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">{{ JSON.stringify(searchResults, null, 2) }}</pre>
      </div>

      <div style="margin-top: 8px;" class="flex flex-col sm:flex-row justify-center sm:justify-end items-center mt-8 gap-4">
        <div class="flex items-center">
          <Checkbox v-model="formData.consent" binary inputId="consent" />
          <label style="margin-left: 4px;" for="consent" class="ml-2 text-sm text-gray-700">개인정보수집이용 동의</label>
        </div>
        <Button @click="submit" label="조회하기" class="w-full sm:w-auto" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import RadioButton from 'primevue/radiobutton';
import Dropdown from 'primevue/dropdown';

const tabs = ref([
  { id: 'creditCard', name: '신용카드' },
  { id: 'bankTransfer', name: '계좌이체' }
]);

const activeTab = ref('creditCard');
const paymentType = ref('all');

const banks = ref([
  { name: 'KB국민은행', code: '004' },
  { name: '신한은행', code: '088' },
  { name: '우리은행', code: '020' },
  { name: '하나은행', code: '081' },
  { name: 'IBK기업은행', code: '003' },
  { name: '카카오뱅크', code: '090' },
  { name: '농협', code: '094' },
  { name: '토스', code: '141' },
  { name: '케이뱅크', code: '521' },
  { name: '현대은행', code: '142' },
]);

const formData = ref({
  cardNumber: '',
  installments: '',
  customerName: '',
  hotelName: '',
  bank: null,
  accountNumber: '',
  depositorName: '',
  email: '',
  date: null,
  consent: false,
});

const searchResults = ref<object | null>(null);
const isSearching = ref(false);

const handleTabClick = (tabId: string) => {
  activeTab.value = tabId;
  searchResults.value = null;
  isSearching.value = false;
};

const submit = async () => {
  if (!formData.value.consent) {
    alert('개인정보 수집 및 이용에 동의해주세요.');
    return;
  }

  searchResults.value = null;
  isSearching.value = true;

  let payload = {};

  if (activeTab.value === 'creditCard') {
    payload = {
      searchType: '신용카드',
      paymentType: paymentType.value,
      cardNumber: formData.value.cardNumber,
      email: formData.value.email,
      date: formData.value.date,
      customerName: formData.value.customerName,
      hotelName: formData.value.hotelName,
      installments: formData.value.installments,
    };
  } else if (activeTab.value === 'bankTransfer') {
    payload = {
      searchType: '계좌이체',
      bank: formData.value.bank,
      accountNumber: formData.value.accountNumber,
      depositorName: formData.value.depositorName,
      date: formData.value.date,
    };
  }

  console.log('서버로 전송될 조회 데이터:', payload);

  await new Promise(resolve => setTimeout(resolve, 1000));

  isSearching.value = false;

  searchResults.value = {
    status: 'SUCCESS',
    message: '1건의 결제 내역을 찾았습니다.',
    transaction: {
      amount: '123,456원',
      orderId: `ORD-${Date.now()}`,
      paymentDate: '2025-09-26 20:52:04',
      details: payload
    }
  };
}
</script>
