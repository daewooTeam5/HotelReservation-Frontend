<script lang="ts" setup>
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { apiClient } from '@/utils/axiosClient';
import { useRouter, useRoute } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();
const route = useRoute();

// 예: 로그인 후 발급받은 토큰을 로컬스토리지에 저장했다고 가정
const token = localStorage.getItem('accessToken');

const submit = async () => {
  try {
    const payload = {
      hotelName: store.name,
      description: store.description,
      checkIn: store.rooms.checkIn,
      checkOut: store.rooms.checkOut,
      addressList: [store.address],
      images: store.images,
      categoryId: store.categoryId,
      amenities: store.amenities
        .filter(a => a.checked)
        .map(a => a.id),
      discounts: store.discounts,
      rooms: [store.rooms, ...store.addedRooms].map(r => ({
        roomNumber: r.roomNumber,
        roomType: r.roomType || 'STANDARD',
        capacityPeople: r.capacityPeople,
        minPrice: r.price,
        extraPrice: r.extraPrice,
        isPublic: r.isPublic,
        bedType: r.selectedBed,

      }))
    };

    await apiClient.post('/hotel/publishing/register', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    alert('등록 완료');
    router.push({ name: 'owner-dashboard' });

  } catch (e: any) {
    const title = e?.response?.data?.error?.title || '등록 중 오류가 발생했어요';
    const detail = e?.response?.data?.error?.detail || e?.message || '잠시 후 다시 시도해 주세요.';
    router.replace({
      name: 'RegisterError',
      query: { ...route.query, title, detail }
    });
  }
};

const back = () => router.push('/publishing/register/address');
</script>
<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
    <div style="border:1px solid whitesmoke;" class="space-y-2 p-3">
      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">호텔 이름</span>
        <span>{{ store.name }}</span>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">숙소 유형
          <span> (호텔/리조트&비앤비/게스트하우스&아파트/펜션/모텔)</span>
        </span>
        <span>{{ store.categoryId }}</span>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">대표 호실 번호</span>
        <span>{{ store.rooms.roomNumber }}</span>
      </div>

      <div class="border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <p class="font-semibold mb-1 flex items-center">업로드된 사진</p>
        <div class="grid grid-cols-3 gap-2">
          <img
            v-for="(img, idx) in store.images"
            :key="idx"
            :src="img"
            alt="uploaded"
            class="w-20 h-20 object-cover rounded border"
          />
        </div>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">1박당 가격</span>
        <span>{{ store.rooms.price }} 원</span>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">체크인</span>
        <span>{{ store.rooms.checkIn }}</span>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">체크아웃</span>
        <span>{{ store.rooms.checkOut }}</span>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">주소</span>
        <span>
          {{ store.address.sido }}
          {{ store.address.sigungu }}
          {{ store.address.town }}
          {{ store.address.roadName }}
          {{ store.address.postalCode }}
          {{ store.address.detailAddress }}
        </span>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">제공되는 서비스</span>
        <span>{{ store.amenities.filter(a => a.checked).map(a => a.name).join(', ') }}</span>
      </div>

      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">기본 1박 가격</span>
        <span>{{store.rooms.price}}</span>
      </div>
      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-2 pb-2">
        <span class="font-semibold flex items-center">추가 인원 가격/할인율(2인 기준)</span>
        <span>
    {{ store.rooms.extraPrice }}원 / 할인율:
    {{ store.discounts.map(d => `${d.person}명: ${d.discount}%`).join(', ') }}
  </span>
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="back" />
      <Button label="등록" icon="pi pi-check" @click="submit" />
    </div>
  </div>
</template>
<style>
span{
  align-items:center;
  justify-items: center;
  text-align: center;
}

</style>
