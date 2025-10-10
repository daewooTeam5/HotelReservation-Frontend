<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import type { ApiResult } from '@/types/ApiResult';
import type { NonMemberReservationDetail } from '@/types/reservation';
import ReservationDetailCard from '@/components/guest/ReservationDetailCard.vue';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PrimeCard from 'primevue/card';

const route = useRoute();

const reservationId = ref<number | null>(null);
const lastName = ref('');
const firstName = ref('');
const email = ref('');

const reservationInfo = ref<NonMemberReservationDetail | null>(null);
const isLoading = ref(false);
const error = ref('');
const showForm = ref(true);

const searchReservation = async () => {
  if (!reservationId.value || !lastName.value || !firstName.value || !email.value) {
    error.value = '모든 정보를 입력해주세요.';
    return;
  }

  isLoading.value = true;
  error.value = '';
  reservationInfo.value = null;

  try {
    const response = await apiClient.post<ApiResult<NonMemberReservationDetail>>('/v1/reservations/non-member', {
      reservationId: reservationId.value,
      lastName: lastName.value,
      firstName: firstName.value,
      email: email.value
    });

    if (response.data.success && response.data.data) {
      // API 응답에 이메일 정보가 없으므로, 조회 시 사용한 이메일을 직접 추가해줍니다.
      reservationInfo.value = { ...response.data.data, email: email.value };
      showForm.value = false;
    } else {
      throw new Error(response.data.error?.detail || '예약 정보를 찾을 수 없습니다.');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error?.detail || err.message || '조회 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

// 페이지 로드 시 URL 쿼리 파라미터로 자동 조회
onMounted(() => {
  const { reservationId: id, lastName: lName, firstName: fName, email: mail } = route.query;
  if (id && lName && fName && mail) {
    reservationId.value = Number(id);
    lastName.value = String(lName);
    firstName.value = String(fName);
    email.value = String(mail);
    searchReservation();
  }
});
</script>

<template>
  <div class="flex justify-center items-start min-h-screen bg-gray-50 p-4">
    <div class="w-full max-w-2xl">
      <div v-if="reservationInfo">
        <h2 class="text-center text-2xl font-bold mb-6">비회원 예약 내역</h2>
        <ReservationDetailCard :reservation="reservationInfo" />
        <Button @click="showForm = true; reservationInfo = null; error = ''" label="다른 예약 조회하기" class="w-full mt-6" outlined />
      </div>

      <PrimeCard v-else class="shadow-md">
        <template #title>
          <h2 class="text-center text-2xl font-bold">비회원 예약 조회</h2>
        </template>
        <template #content>
          <form @submit.prevent="searchReservation" class="space-y-6">
            <div style="margin-top: 6px; margin-bottom: 6px;">
              <label for="reservationId" class="block text-sm font-medium text-gray-700">예약 번호</label>
              <InputNumber id="reservationId" v-model="reservationId" class="w-full mt-1" placeholder="예약 번호를 입력하세요" :useGrouping="false" />
            </div>
            <div style="margin-top: 6px; margin-bottom: 6px;" class="flex gap-4">
              <div style="margin-top: 6px; margin-bottom: 6px;" class="flex-1">
                <label for="lastName" class="block text-sm font-medium text-gray-700">성 (Last Name)</label>
                <InputText id="lastName" v-model="lastName" class="w-full mt-1" placeholder="예약자 성" />
              </div>
              <div style="margin-top: 6px; margin-bottom: 6px;" class="flex-1">
                <label for="firstName" class="block text-sm font-medium text-gray-700">이름 (First Name)</label>
                <InputText id="firstName" v-model="firstName" class="w-full mt-1" placeholder="예약자 이름" />
              </div>
            </div>
            <div style="margin-top: 6px; margin-bottom: 6px;">
              <label for="email" class="block text-sm font-medium text-gray-700">이메일</label>
              <InputText id="email" type="email" v-model="email" class="w-full mt-1" placeholder="예약 시 입력한 이메일을 입력하세요" />
            </div>
            <Button style="margin-top: 10px;" type="submit" label="예약 조회" class="w-full" :loading="isLoading" />
          </form>

          <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {{ error }}
          </div>
        </template>
      </PrimeCard>
    </div>
  </div>
</template>
