<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner"; // [개선] 로딩 스피너 import
import axios from "axios";

// --- 인터페이스 정의 (기존과 동일) ---
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
  minPrice: number;
}

// --- 스크립트 로직 수정 ---
const loading = ref(true);
const places = ref<Place[]>([]);
// [개선] hasPlace 변수 제거 -> places.length로 대체하여 코드 단순화

// 숙소 정보 가져오기
const fetchPlaces = async () => {
  loading.value = true;
  try {
    // [참고] 현재는 ownerId 없이 모든 숙소를 가져오는 API로 보입니다.
    // 백엔드 API가 준비되면 '/api/hotel/publishing/my-list?ownerId=...' 와 같이 변경될 수 있습니다.
    const onerid=6;
    const response = await axios.get<Place[]>(` '/api/hotel/publishing/my-list?ownerId=${onerid}'`);

    // API 응답이 ApiResult<{data: Place[]}> 형태일 경우:
    // places.value = response.data.data || [];

    // API 응답이 Place[] 형태일 경우:
    places.value = response.data || [];

  } catch (error) {
    console.error("숙소 정보를 가져오는 데 실패했습니다:", error);
    places.value = []; // 에러 발생 시 빈 배열로 초기화
  } finally {
    loading.value = false;
  }
};

// 숙소 삭제
const deletePlace = async (placeId: number) => {
  if (confirm("정말 숙소를 삭제하시겠습니까?")) {
    try {
      // [수정] 하드코딩된 placeId=6 제거, 파라미터로 받은 placeId 사용
      await axios.delete(`/api/hotel/publishing/list/delete/${placeId}`);

      // 화면에서 즉시 삭제된 숙소 제거
      places.value = places.value.filter(p => p.id !== placeId);

      alert("숙소가 삭제되었습니다.");
    } catch (error) {
      console.error("숙소 삭제에 실패했습니다:", error);
      alert("숙소 삭제 중 오류가 발생했습니다.");
    }
  }
};

onMounted(() => {
  fetchPlaces();
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
          <Button
            label="숙소 이미지 변경"
            icon="pi pi-image"
            class="p-button-outlined w-full"
            @click="$router.push(`/hotelregister?id=${place.id}`)"
          />
        </div>

        <div class="w-full md:w-2/3 space-y-3">
          <p><strong>숙소명:</strong> {{ place.hotelName }}</p>
          <p><strong>주소:</strong> {{ place.address?.sido }} {{ place.address?.sigungu }}</p>
          <p><strong>설명:</strong> {{ place.description }}</p>
          <p><strong>체크인:</strong> {{ place.checkIn }}</p>
          <p><strong>체크아웃:</strong> {{ place.checkOut }}</p>
          <p><strong>최저 요금:</strong> {{ place.minPrice.toLocaleString() }} 원</p>

          <div class="flex gap-3 mt-4">
            <Button
              label="숙소 정보 수정"
              icon="pi pi-pencil"
              class="p-button-primary"
              @click="$router.push(`/hotelregister?id=${place.id}`)"
              petch
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
