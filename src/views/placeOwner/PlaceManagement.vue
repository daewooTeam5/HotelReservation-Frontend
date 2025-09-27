<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { useAuthStore } from '@/stores/authStore.ts';
import { apiClient } from '@/utils/axiosClient.ts';

// --- 인터페이스 정의 ---
interface AddressDTO {
  sido: string;
  sigungu: string;
  town: string;
  roadName: string;
  detailAddress: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

interface Place {
  id: number;
  hotelName: string;
  hotelType: string | null;
  description: string;
  checkIn: string;
  checkOut: string;
  address: AddressDTO | null;
  images: string[];
  categoryId: number | null;
  capacityRoom: number | null;
  isPublic: boolean;
  minPrice: number; // 💡 [수정] 백엔드 데이터와 일치하도록 Price -> minPrice로 변경
}

// --- 스크립트 로직 ---
const loading = ref(true);
const places = ref<Place[]>([]);
const authStore = useAuthStore();

// 숙소 정보 가져오기
const fetchPlaces = async () => {
  loading.value = true;
  try {
    // 💡 [수정] 하드코딩된 ID 대신, 로그인 스토어에서 실제 ownerId를 가져옵니다.(지금은 OwnerId를 null로 써서 하드코딩한 6으로 사용)
    const ownerId=6;
    //const ownerId = authStore.userAuth?.id;
    if (!ownerId) {
      console.error("로그인 정보(ownerId)를 찾을 수 없어 API를 호출하지 않습니다.");
      loading.value = false;
      places.value = [];
      return;
    }

    const response = await apiClient.get<{ data: Place[] }>(`/hotel/publishing/my-list?ownerId=${ownerId}`);
    places.value = response.data.data || [];

  } catch (error) {
    console.error("숙소 정보를 가져오는 데 실패했습니다:", error);
    places.value = [];
  } finally {
    loading.value = false;
  }
};

// 숙소 삭제 (수정할 부분 없음, 정상 동작)
const deletePlace = async (placeId: number) => {
  if (confirm("정말 숙소를 삭제하시겠습니까?")) {
    try {
      await apiClient.delete(`/api/hotel/publishing/list/delete/${placeId}`);
      places.value = places.value.filter(p => p.id !== placeId);
      alert("숙소가 삭제되었습니다.");
    } catch (error) {
      console.error("숙소 삭제에 실패했습니다:", error);
      alert("숙소 삭제 중 오류가 발생했습니다.");
    }
  }
};

// 💡 [수정] onMounted 대신 watch를 사용하여 로그인 정보가 준비된 후 데이터를 안전하게 불러옵니다.
watch(() => authStore.userAuth, (newUserAuth) => {
  if (newUserAuth) {
    fetchPlaces();
  }
}, {
  immediate: true // 컴포넌트 로드 시 즉시 실행
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      내 숙소 관리
      <Button
        label="숙소 등록 요청"
        icon="pi pi-plus"
        style="margin: 10px;"
        class="p-button-primary"
        @click="$router.push('/hotelregister')"
      />
    </h1>

    <div v-if="loading" class="bg-white rounded shadow p-6 text-center">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p class="text-gray-600 mt-4">숙소 목록을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="places.length > 0" class="flex flex-col gap-6">
      <div
        v-for="place in places"
        :key="place.id"
        class="bg-white rounded shadow p-6 flex flex-col md:flex-row gap-6"
      >
        <div class="w-full md:w-1/3 flex flex-col items-center">
          <img
            :src="place.images && place.images.length > 0 ? place.images[0] : 'https://via.placeholder.com/400x400'"
            class="rounded-lg shadow mb-4 w-full h-48 object-cover"
            alt="숙소 이미지"
          />
        </div>

        <div class="w-full md:w-2/3 space-y-3">
          <p><strong>숙소명:</strong> {{ place.hotelName }}</p>
          <p><strong>주소:</strong> {{ place.address?.sido }} {{ place.address?.sigungu }}</p>
          <p><strong>설명:</strong> {{ place.description }}</p>
          <p><strong>체크인:</strong> {{ place.checkIn }}</p>
          <p><strong>체크아웃:</strong> {{ place.checkOut }}</p>
          <p><strong>최저 요금:</strong> {{ place.minPrice?.toLocaleString() ?? '가격 정보 없음' }} 원</p>

          <div class="flex gap-3 mt-4">
            <Button
              label="숙소 정보 수정"
              icon="pi pi-pencil"
              class="p-button-primary"
              @click="$router.push(`/hotelregister?id=${place.id}`)"
            />
            <Button
              label="숙소 삭제"
              icon="pi pi-trash"
              class="p-button-danger"
              @click="deletePlace(place.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded shadow p-6 text-center">
      <p class="text-gray-600 mb-4">등록된 숙소가 없습니다.</p>
    </div>
  </div>
</template>
