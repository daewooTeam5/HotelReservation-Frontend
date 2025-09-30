<script setup lang="ts">
// [정리] import 구문을 그룹화하여 정리합니다.
import { ref, watch, computed } from "vue";
import { useRouter } from 'vue-router';
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Dropdown from 'primevue/dropdown';
import { useAuthStore } from '@/stores/authStore.ts';
import { apiClient } from '@/utils/axiosClient.ts';
import { categoryMap } from '@/stores/publishing/registerStore.ts';

// --- 인터페이스 정의 ---
// [정리] 코드 상단에 인터페이스를 먼저 정의하여 타입을 명확히 합니다.
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
  categoryId: number | null; // [수정] string 대신 number | null로 타입을 더 명확히 합니다.
  categoryName: string; // [추가] 화면 표시에 사용할 카테고리 이름을 추가합니다.
  capacityRoom: number | null;
  isPublic: boolean;
  minPrice: number;
}

// --- 스크립트 로직 ---
const router = useRouter();
const authStore = useAuthStore();


const loading = ref(true);
const places = ref<Place[]>([]); // 서버에서 가져온 원본 데이터
const selectedCategory = ref<number | null>(null); // 필터링을 위한 선택된 카테고리 ID


const categoryOptions = Object.entries(categoryMap).map(([id, name]) => ({
  id: Number(id),
  name
}));


const filteredPlaces = computed(() => {
  // 선택된 카테고리가 없으면 (null 이면) 전체 목록을 반환합니다.
  if (!selectedCategory.value) {
    return places.value;
  }
  // 선택된 카테고리가 있으면, 해당 ID와 일치하는 숙소만 필터링하여 반환합니다.
  return places.value.filter(p => p.categoryId === selectedCategory.value);
});

// --- 함수 정의 ---
// 숙소 정보 가져오기
const fetchPlaces = async () => {

  loading.value = true;
  try {

    const response = await apiClient.get<{ data: Place[] }>(`v1/hotel/publishing/my-list`);
    const rawPlaces = response.data.data || [];

    // [수정] 데이터를 가져온 직후, 화면 표시에 필요한 categoryName을 추가하여 가공합니다.
    places.value = rawPlaces.map(place => ({
      ...place,
      categoryName: categoryMap[place.categoryId] || '정보 없음'
    }));

  } catch (error) {
    console.error("숙소 정보를 가져오는 데 실패했습니다:", error);
    places.value = [];
  } finally {
    loading.value = false;
  }
};

// 숙소 삭제
const deletePlace = async (placeId: number) => {
  if (confirm("정말 숙소를 삭제하시겠습니까?")) {
    try {
      await apiClient.delete(`/v1/hotel/publishing/delete/${placeId}`);
      // [개선] API 재호출 대신, 프론트엔드 목록에서 직접 제거하여 즉각적인 피드백을 줍니다.
      places.value = places.value.filter(p => p.id !== placeId);
      alert("숙소가 삭제되었습니다.");
    } catch (error) {
      console.error("숙소 삭제에 실패했습니다:", error);
      alert("숙소 삭제 중 오류가 발생했습니다.");
    }
  }
};

// --- Lifecycle & Watchers ---
// [정리] 로그인 정보가 준비되면 데이터를 안전하게 불러옵니다.
watch(() => authStore.userAuth, (newUserAuth) => {
  // 로그인 되었고, 아직 숙소 목록이 비어있을 때만 데이터를 불러옵니다.
  if (newUserAuth && places.value.length === 0) {
    fetchPlaces();
  }
}, {
  immediate: true // 컴포넌트 로드 시 즉시 실행하여 초기 로그인 상태를 확인합니다.
});
</script>
<template>

  <ConfirmDialog></ConfirmDialog>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-4">
      <span  style="margin-left: 3px; margin-bottom: 12px;">내 숙소 관리</span>
      <Button
        label="숙소 등록 요청"
        icon="pi pi-plus"
        class="p-button-primary"
        @click="router.push('/hotelregister')"
        style="margin-left: 3px; margin-bottom: 12px;"
      />
      <Dropdown
        v-model="selectedCategory"
        :options="categoryOptions"
        optionLabel="name"
        optionValue="id"
        placeholder="카테고리별 보기"
        class="w-60"
        showClear
        style="margin-left: 3px; margin-bottom: 12px;"
      />
    </h1>

    <div v-if="loading" class="bg-white rounded shadow p-6 text-center">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p class="text-gray-600 mt-4">숙소 목록을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="filteredPlaces.length > 0" class="flex flex-col gap-6">
      <div
        v-for="place in filteredPlaces"
        :key="place.id"
        class="bg-white rounded shadow p-4 flex flex-col md:flex-row gap-6"
      >
        <div class="w-full md:w-1/3 flex flex-col items-center">
          <img
            :src="place.images && place.images.length > 0 ? place.images[0] : 'https://via.placeholder.com/400x400'"
            class="rounded-lg shadow mb-4 w-full h-60 object-cover"
            alt="숙소 이미지"
          />
        </div>

        <div style="margin-top: 10px;" class="w-full md:w-2/3 space-y-4">
          <p><strong>숙소명:</strong> {{ place.hotelName }}</p>
          <p><strong>주소:</strong> {{ place.address?.sido }} {{ place.address?.sigungu }}</p>
          <p><strong>설명:</strong> {{ place.description }}</p>
          <p><strong>체크인:</strong> {{ place.checkIn }}</p>
          <p><strong>체크아웃:</strong> {{ place.checkOut }}</p>
          <p><strong>최저 요금:</strong> {{ place.minPrice?.toLocaleString() ?? '가격 정보 없음' }} 원</p>
          <p><strong>숙소 유형:</strong> {{ place.categoryName }}</p>

          <div style="margin-top: 10px;" class="flex gap-3 mt-4">
            <Button
              label="숙소 정보 수정"
              icon="pi pi-pencil"
              class="p-button-primary"
              @click="router.push(`/hotelregister?id=${place.id}`)"
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
