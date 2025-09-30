<script lang="ts" setup>
import { categoryMap, useRegisterStore } from '@/stores/publishing/registerStore';
import { apiClient } from '@/utils/axiosClient';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore.ts';
import { computed, ref, onMounted } from 'vue';
import Button from 'primevue/button';

const store = useRegisterStore();
const authstore = useAuthStore();
const router = useRouter();
const route = useRoute();

const token = localStorage.getItem('accessToken');

// 이미지 URL들을 저장할 반응형 데이터
const hotelImageUrls = ref<string[]>([]);
const roomImageUrls = ref<{ [key: number]: string[] }>({});

// 💡 [추가] 수정/등록 모드에 따라 버튼의 라벨을 동적으로 변경합니다.
const submitButtonLabel = computed(() => store.editingPlaceId ? '수정 완료' : '등록 완료');

// 이미지 URL들을 로드하는 함수
const loadImages = async () => {
  try {
    // 호텔 이미지 URL 로드
    hotelImageUrls.value = await store.getAllHotelImageUrls();

    // 각 객실의 이미지 URL 로드
    for (let i = 0; i < store.addedRooms.length; i++) {
      const room = store.addedRooms[i];
      const urls = await Promise.all(
        room.images.map(async (id) => {
          return await store.getRoomImageUrl(id) || '';
        })
      );
      roomImageUrls.value[i] = urls.filter(url => url !== '');
    }
  } catch (error) {
    console.error('이미지 로딩 실패:', error);
  }
};

// 💡 [수정] 멀티파트 형식으로 수정/등록을 분기 처리하는 submit 함수
const submit = async () => {
  if (store.addedRooms.length === 0) {
    alert('등록된 객실이 없습니다.');
    return;
  }
  try {
    // FormData 객체 생성
    const formData = new FormData();

    // 1. JSON 데이터 준비
    const jsonData = {
      hotelName: store.name,
      description: store.description,
      checkIn: store.checkIn,
      checkOut: store.checkOut,
      addressList: [store.address],
      categoryId: store.categoryId,
      amenityIds: store.amenities.filter((a) => a.checked).map((a) => a.id),
      discounts: store.discounts,
      rooms: store.addedRooms.map((r) => ({
        roomNumber: r.roomNumber,
        roomType: r.roomType || 'STANDARD',
        capacityPeople: r.capacityPeople,
        minPrice: r.price,
        extraPrice: r.extraPrice,
        isPublic: r.isPublic,
        bedType: r.selectedBed,
        roomImageCount: r.images.length, // 각 객실의 이미지 개수
        capacityRoom: r.capacityRoom
      })),
      userId: authstore.userAuth?.id
    };

    // JSON 데이터를 FormData에 추가
    formData.append('data', JSON.stringify(jsonData));

    // 2. 호텔 이미지 파일들 추가
    const hotelImageFiles = await store.getAllHotelImageFiles();
    hotelImageFiles.forEach((file) => {
      formData.append(`hotelImages`, file);
    });

    // 3. 각 객실의 이미지 파일들 추가
    for (let roomIndex = 0; roomIndex < store.addedRooms.length; roomIndex++) {
      const room = store.addedRooms[roomIndex];
      const roomImageFiles = await store.getRoomImageFiles(room.images);
      roomImageFiles.forEach((file) => {
        formData.append(`roomImages_${roomIndex}`, file);
      });
    }


    if (store.editingPlaceId) {
      // 수정 모드: PUT 요청
      await apiClient.put(`/hotel/publishing/update/${store.editingPlaceId}`, formData, config);
      alert('수정이 완료되었습니다.');
    } else {
      // 등록 모드: POST 요청
      await apiClient.post('/v1/hotel/publishing/register', formData, {
        headers:{
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('등록이 완료되었습니다.');
    }

    // 등록/수정 완료 후 IndexedDB와 로컬스토리지 정리
    await store.clearAllImages();
    store.clearStoreAndStorage();
    router.push({ name: 'owner-dashboard' }); // 성공 후 대시보드로 이동

  } catch (e: any) {
    const title = e?.response?.data?.error?.title || '작업 중 오류가 발생했어요';
    const detail = e?.response?.data?.error?.detail || e?.message || '잠시 후 다시 시도해 주세요.';
    router.replace({
      name: 'RegisterError',
      query: { ...route.query, title, detail },
    });
  }
};

const back = () => router.push('/publishing/register/rooms');

onMounted(async () => {
  await loadImages();
});
</script>
<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
    <div style="border: 1px solid whitesmoke" class="space-y-2 p-3">
      <h2 class="text-lg font-bold mb-2">호텔 정보</h2>
      <div class="flex justify-between items-center border-b pb-2">
        <span class="font-semibold">호텔 이름</span>
        <span>{{ store.name }}</span>
      </div>
      <div class="flex justify-between items-center border-b pb-2">
        <span class="font-semibold">숙소 유형</span>
        <span>{{ categoryMap[Number(store.categoryId)] || '선택 안됨' }}</span>
      </div>
      <div class="border-b pb-2">
        <p class="font-semibold mb-1">업로드된 호텔 대표 사진</p>
        <div class="grid grid-cols-3 gap-2">
          <img
            v-for="(img, imgIdx) in hotelImageUrls"
            :key="imgIdx"
            :src="img"
            alt="hotel image"
            class="w-20 h-20 object-cover rounded border"
          />
        </div>
      </div>
      <div class="flex justify-between items-center border-b pb-2">
        <span class="font-semibold">체크인</span>
        <span>{{ store.checkIn }}</span>
      </div>
      <div class="flex justify-between items-center border-b pb-2">
        <span class="font-semibold">체크아웃</span>
        <span>{{ store.checkOut }}</span>
      </div>
      <div class="flex justify-between items-center border-b pb-2">
        <span class="font-semibold">주소</span>
        <span class="text-right">
          {{ store.address.sido }} {{ store.address.sigungu }} {{ store.address.town }}

         {{ store.address.roadName }}
          {{ store.address.detailAddress }}<br/>
          우편번호:{{ store.address.postalCode }}


        </span>
      </div>
      <div class="flex justify-between items-center">
        <span class="font-semibold">제공되는 서비스</span>
        <span>{{ store.amenities.filter((a) => a.checked).map((a) => a.name).join(', ') }}</span>
      </div>
    </div>

    <div class="space-y-2 p-3">
      <h2 class="text-lg font-bold mb-2">추가된 객실 목록</h2>
      <div v-for="(room, idx) in store.addedRooms" :key="idx" class="border p-4 rounded-md">
        <div class="flex justify-between items-center mb-2 pb-2 border-b">
          <span class="font-semibold">객실 {{ idx + 1 }}. {{ room.roomType }}</span>
          <span>1박당 {{ room.price }} 원</span>
        </div>
        <div>
          <p class="font-semibold mb-1">객실 사진</p>
          <div class="grid grid-cols-5 gap-2">
            <img
              v-for="(img, imgIdx) in roomImageUrls[idx]"
              :key="imgIdx"
              :src="img"
              :alt="`객실 ${idx + 1} 이미지 ${imgIdx + 1}`"
              class="w-20 h-20 object-cover rounded border"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
      <div class="flex justify-between pt-4">
        <Button label="이전" severity="secondary" @click="back" />
        <Button :label="submitButtonLabel" icon="pi pi-check" @click="submit" />
      </div>
    </div>
  </div>
</template>

<style scoped> /* 💡 scoped를 추가하여 이 컴포넌트에만 스타일이 적용되도록 합니다. */
span {
  text-align: right;
}
.font-semibold {
  text-align: left;
}
</style>
