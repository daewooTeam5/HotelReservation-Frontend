<template>
  <div class="flex flex-col gap-6">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">숙소 관리</h1>
    </div>

    <!-- 검색 필터 -->
    <div class="flex flex-wrap gap-4">
      <InputText v-model="filters.placeId" placeholder="숙소 ID" />
      <InputText v-model="filters.approvalStatus" placeholder="상태" />
      <InputText v-model="filters.ownerName" placeholder="숙소 관리자 이름" />
      <InputText v-model="filters.placeName" placeholder="숙소 이름" />
      <Button label="검색" @click="fetchPlaces" />
    </div>

    <!-- 숙소 리스트 -->
    <DataTable :value="places" responsiveLayout="scroll" class="mt-4">
      <!-- 상태 -->
      <Column header="상태">
        <template #body="slotProps">
      <span
        class="px-3 py-1 rounded-full text-xs font-medium"
        :class="getApprovalClass(slotProps.data.status)"
      >
        {{ translateApproval(slotProps.data.status) }}
      </span>
        </template>
      </Column>

      <Column field="id" header="숙소 ID"></Column>
      <Column field="name" header="숙소 이름"></Column>
      <Column header="주소" :body="addrTemplate"></Column>
      <Column field="ownerId" header="주인 ID"></Column>
      <Column field="ownerName" header="주인 이름"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { apiClient } from "@/utils/axiosClient";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const places = ref<any[]>([]);
const filters = ref({
  placeId: "",
  approvalStatus: "",
  ownerName: "",
  placeName: "",
});

const fetchPlaces = async () => {
  try {
    const res = await apiClient.get("/v1/places/admin", {
      params: {
        start: 0,
        placeId: filters.value.placeId || null,
        approvalStatus: filters.value.approvalStatus || null,
        ownerName: filters.value.ownerName || null,
        placeName: filters.value.placeName || null,
      },
    });
    places.value = res.data.data.content;
  } catch (err) {
    console.error("숙소 리스트 불러오기 실패:", err);
  }
};

const getApprovalClass = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    INACTIVE: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const translateApproval = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "승인",
    PENDING: "대기",
    REJECTED: "거절",
    INACTIVE: "리폿",
  };
  return map[status] || status;
};

// 주소 합치기
const addrTemplate = (rowData: any) => {
  return `${rowData.sido} ${rowData.sigungu}`;
};

// 페이지 로드 시 자동 실행
fetchPlaces();
</script>
