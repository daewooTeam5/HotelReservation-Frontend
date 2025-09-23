<script lang="ts" setup>
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { apiClient } from '@/utils/axiosClient';
import { useRouter, useRoute } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();
const route = useRoute();

const submit = async () => {
  const getCategoryIdByType = (type: string): number => {
    const categoryMap: { [key: string]: number } = {
      '호텔': 1,
      '리조트': 2,
      '게스트하우스/비앤비': 3,
      '아파트': 4,
      '펜션': 4,
      '모텔': 5
    };
    return categoryMap[type] || 1;
  };

  try {
    const payload = {
      hotelName: store.name,
      description: store.description,
      checkIn: store.rooms.checkIn,
      checkOut: store.rooms.checkOut,


      addressList: [store.address],
      images: store.images,
      rooms: [store.rooms, ...store.addedRooms].map(r => ({//방마다 다르게 적용할 내용들
        roomNumber: r.roomNumber,
        roomType: r.roomType,
        capacityPeople: r.capacityPeople,//최대 수용가능인원
        minPrice: r.price,  //1인 기본 요금
        extraPrice: r.extraPrice,//1인 더 들어왔을 때 추가 요금
        isPublic: r.isPublic,
        bedType: Array.isArray(r.bedType) ? r.bedType.map(b => ({ type: b.type, width: b.width, count: b.count })) : []
      }))
    };
    // Keep same endpoint used in legacy HotelRegister.vue
    await apiClient.post('../hotel/publishing/register', payload);
    await router.push({ name: 'owner-dashboard' });
    alert('등록 완료');
  } catch (e: any) {
    const title = e?.response?.data?.error?.title || '등록 중 오류가 발생했어요';
    const detail = e?.response?.data?.error?.detail || e?.message || '잠시 후 다시 시도해 주세요.';
    await router.replace({
      name: 'RegisterError',
      query: { ...route.query, title, detail }
    });
  }
};

const back = () => router.push('/publishing/register/address');
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
    <div class="space-y-2">
      <div class="flex justify-between items-center"><span class="font-semibold">호텔 이름</span><span>{{ store.name }}</span></div>
      <div class="flex justify-between items-center"><span class="font-semibold">숙소 유형</span><span>{{ store.hotelType }}</span></div>
      <div class="flex justify-between items-center"><span class="font-semibold">대표 호실 번호</span><span>{{ store.rooms.roomNumber }}</span></div>
      <div>
        <p class="font-semibold mb-1">업로드된 사진</p>
        <div class="grid grid-cols-3 gap-2">
          <img v-for="(img, idx) in store.images" :key="idx" :src="img" alt="uploaded" class="w-20 h-20 object-cover rounded border" />
        </div>
      </div>
      <div class="flex justify-between items-center"><span class="font-semibold">1박당 가격</span><span>{{ store.rooms.price }} 원</span></div>
      <div class="flex justify-between items-center"><span class="font-semibold">체크인</span><span>{{ store.rooms.checkIn }}</span></div>
      <div class="flex justify-between items-center"><span class="font-semibold">체크아웃</span><span>{{ store.rooms.checkOut }}</span></div>
      <div class="flex justify-between items-center"><span class="font-semibold">주소</span>
        <span>{{ store.address.sigungu }} {{ store.address.sido }} {{ store.address.roadName }} {{ store.address.postalCode }} {{ store.address.detailAddress }}</span>
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="back" />
      <Button label="등록" icon="pi pi-check" @click="submit" />
    </div>
  </div>
</template>
