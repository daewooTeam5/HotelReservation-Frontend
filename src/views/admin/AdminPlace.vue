<template>
  <div class="flex flex-col gap-6">
    <div v-if="!hasPermission" class="text-center text-red-600 text-lg py-10">
      접근 권한이 없습니다.
    </div>
    <div v-else>
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900" style="margin-bottom: 10px;">숙소 관리</h1>
      </div>

      <!-- 검색 필터 -->
      <div class="flex flex-wrap gap-4 items-center">
        <PrimeSelect
          v-model="filters.approvalStatus"
          :options="[{ label: '선택 없음', value: '' }, ...approvalStatusOptions]"
          optionLabel="label"
          optionValue="value"
          placeholder="상태 선택"
          class="w-40"
        />
        <InputText v-model="filters.ownerName" placeholder="숙소 관리자 이름" />
        <InputText v-model="filters.placeName" placeholder="숙소 이름" />

        <PrimeSelect
          v-model="filters.sido"
          :options="[{ label: '선택 없음', value: '' }, ...sidoOptions]"
          optionLabel="label"
          optionValue="value"
          placeholder="시/도 선택"
          class="w-40"
          @change="onSidoChange"
        />

        <PrimeSelect
          v-model="filters.sigungu"
          :options="[{ label: '선택 없음', value: '' }, ...sigunguOptions]"
          optionLabel="label"
          optionValue="value"
          placeholder="시/군/구 선택"
          class="w-40"
          :disabled="!sigunguOptions.length"
        />

        <Button label="검색" @click="fetchPlaces" />
      </div>

      <DataTable :value="places" style="margin-top: 15px;" responsiveLayout="scroll" class="mt-4" @row-click="onRowClick">
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

        <Column field="id" header="숙소 ID" style="min-width: 50px" />
        <Column field="name" header="숙소 이름" style="min-width: 150px" />
        <Column header="주소" style="min-width: 150px">
          <template #body="slotProps">
            {{ slotProps.data.sido }} {{ slotProps.data.sigungu }}
          </template>
        </Column>
        <Column field="ownerId" header="주인 ID" style="min-width: 50px" />
        <Column field="ownerName" header="주인 이름" style="min-width: 150px" />

        <template #empty>
          <div class="text-center text-gray-500 py-6">검색 결과가 없습니다.</div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { parseJwt } from '@/utils/jwtUtils';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const router = useRouter();

const onRowClick = (event: any) => {
  const placeId = event.data.id;
  router.push({ name: 'admin-place-detail', params: { id: placeId } });
};

// authStore에서 토큰 가져오기
const authStore = useAuthStore();
const token = authStore.accessToken;

// 현재 유저 role
const userRole = computed(() => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload.role);
    return payload.role;
  } catch {
    return null;
  }
});

const userStatus = computed(() => {
  if (!token) return null;
  return authStore.userAuth?.status
});

// 권한 체크 (AdminPlace → admin, place_admin만 가능)
const hasPermission = computed(() => {
  return (
    userRole.value &&
    ['admin', 'place_admin'].includes(userRole.value) &&
    userStatus.value === 'active'
  );
});

// 숙소 데이터
const places = ref<any[]>([]);
const filters = ref({
  approvalStatus: '',
  ownerName: '',
  placeName: '',
  sido: '',
  sigungu: '',
});

// 📌 시/도-구/군 데이터
const addressData: Record<string, string[]> = {
  서울특별시: ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '서대문구', '마포구', '양천구', '강서구'],
  부산광역시: ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '강서구', '해운대구'],
  세종특별자치시: [], // 세종시는 구가 없음
  경기도: ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '시흥시', '용인시', '오산시'],
  인천광역시: ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구'],
  대구광역시: ['중구', '동구', '서구', '남구', '북구', '수성구', '달성군'],
  울산광역시: ['중구', '남구', '동구', '북구', '울주군'],
  광주광역시: ['동구', '서구', '남구', '북구', '광산구'],
  대전광역시: ['동구', '중구', '서구', '유성구', '대덕구'],
  강원도: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군'],
  충청북도: ['청주시', '충주시', '제천시', '진천군', '음성군', '단양군'],
  충청남도: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시'],
  전라북도: ['전주시', '익산시', '군산시', '정읍시', '남원시', '김제시', '완주군'],
  전라남도: ['광주시', '목포시', '여수시', '순천시', '나주시', '담양군', '광양시'],
  경상북도: ['포항시', '경산시', '구미시', '안동시', '영천시', '김천시', '상주시'],
  경상남도: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시'],
  제주도: [], // 제주도는 구/군 정보가 없음

  // 👉 전체 데이터 붙이면 완성됨
};



// 시/도 옵션 배열
const sidoOptions = Object.keys(addressData).map((sido) => ({
  label: sido,
  value: sido,
}));

// 시/군/구 옵션
const sigunguOptions = ref<{ label: string; value: string }[]>([]);

const onSidoChange = () => {
  sigunguOptions.value = (addressData[filters.value.sido] || []).map((sigungu) => ({
    label: sigungu,
    value: sigungu,
  }));
  filters.value.sigungu = '';
};

const approvalStatusOptions = [
  { label: '승인', value: 'APPROVED' },
  { label: '대기', value: 'PENDING' },
  { label: '거절', value: 'REJECTED' },
  { label: '정지', value: 'INACTIVE' },
];

const fetchPlaces = async () => {
  try {
    const res = await apiClient.get('/v1/admin/places', {
      params: {
        start: 0,
        approvalStatus: filters.value.approvalStatus || null,
        ownerName: filters.value.ownerName || null,
        placeName: filters.value.placeName || null,
        sido: filters.value.sido || null,
        sigungu: filters.value.sigungu || null,
      },
    });
    places.value = res.data.data.content;
  } catch (err) {
    console.error('숙소 리스트 불러오기 실패:', err);
  }
};

const getApprovalClass = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

const translateApproval = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: '승인',
    PENDING: '대기',
    REJECTED: '거절',
    INACTIVE: '정지',
  };
  return map[status] || status;
};

onMounted(() => {
  if (hasPermission.value) fetchPlaces();
});
// 페이지 로드 시 자동 실행
fetchPlaces();
</script>
