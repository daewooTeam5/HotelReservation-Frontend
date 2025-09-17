<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">내 숙소 관리</h1>

    <!-- 숙소가 등록된 경우 -->
    <div v-if="hasPlace" class="bg-white rounded shadow p-6 flex flex-col md:flex-row gap-6">
      <!-- 숙소 이미지 -->
      <div class="w-full md:w-1/3 flex flex-col items-center">
        <img
          :src="place.image || 'https://via.placeholder.com/300x200'"
          alt="숙소 이미지"
          class="rounded-lg shadow mb-4"
        />
        <Button
          label="숙소 이미지 변경"
          icon="pi pi-image"
          class="p-button-outlined w-full"
        />
      </div>

      <!-- 숙소 기본 정보 -->
      <div class="w-full md:w-2/3 space-y-3">
        <p><strong>숙소명:</strong> {{ place.name }}</p>
        <p><strong>주소:</strong> {{ place.address }}</p>
        <p><strong>설명:</strong> {{ place.description }}</p>
        <p><strong>상태:</strong> {{ place.status }}</p>
        <p><strong>체크인:</strong> {{ place.checkIn }}</p>
        <p><strong>체크아웃:</strong> {{ place.checkOut }}</p>

        <!-- 버튼 -->
        <div class="flex gap-3 mt-4">
          <Button
            label="숙소 정보 수정"
            icon="pi pi-pencil"
            class="p-button-primary"
          />
          <Button
            label="숙소 삭제"
            icon="pi pi-trash"
            class="p-button-danger"
            @click="deletePlace"
          />
        </div>
      </div>
    </div>

    <!-- 숙소가 없는 경우 -->
    <div v-else class="bg-white rounded shadow p-6 text-center">
      <p class="text-gray-600 mb-4">등록된 숙소가 없습니다.</p>
      <Button
        label="숙소 등록 요청"
        icon="pi pi-plus"
        class="p-button-primary"
        @click="$router.push('/owner/place/request')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";

const hasPlace = ref(true); // 더미: 숙소 등록 여부 (false로 바꿔 테스트 가능)
const place = ref({
  name: "Seoil Hotel",
  address: "서울특별시 강남구 역삼동 ...",
  description: "비즈니스 중심의 4성급 호텔",
  status: "공개 (승인됨)",
  checkIn: "15:00",
  checkOut: "11:00",
  image: "",
});

// 숙소 삭제 함수 (더미)
const deletePlace = () => {
  if (confirm("정말 숙소를 삭제하시겠습니까?")) {
    hasPlace.value = false;
    alert("숙소가 삭제되었습니다.");
  }
};
</script>
