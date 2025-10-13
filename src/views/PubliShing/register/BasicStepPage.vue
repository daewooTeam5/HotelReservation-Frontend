<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter,useRoute } from 'vue-router';
import { ref, onMounted, computed, watch } from 'vue';
import HotelRegistrationRestore from '@/components/hotel/HotelRegistrationRestore.vue';
import CategorySelect from '@/components/hotel/CategorySelect.vue';

const store = useRegisterStore();
const router = useRouter();
const route = useRoute();

const fileInput = ref<HTMLInputElement | null>(null);
const hotelImageUrls = ref<string[]>([]);
const showRestoreComponent = ref(true);

// 입력값 변경 시 자동 저장
watch(
  () => [store.name, store.categoryId, store.description],
  () => {
    store.autoSave();
  },
  { deep: true }
);

// 호텔 이미지 URL들을 가져오는 함수
const loadHotelImages = async () => {
  try {
    hotelImageUrls.value = await store.getAllHotelImageUrls();
  } catch (error) {
    console.error('이미지 로딩 실패:', error);
  }
};

const triggerFileInput = () => fileInput.value?.click();

// 호텔 대표 이미지를 위한 별도의 핸들러 함수
const handleHotelImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  try {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      // IndexedDB에 파일 직접 저장
      await store.addHotelImage(file);
    }
    target.value = ''; // 파일 입력 초기화
    // 이미지 목록 새로고침
    await loadHotelImages();
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
  }
};

// 호텔 대표 이미지 삭제를 위한 별도의 함수
const removeHotelImage = async (index: number) => {
  try {
    await store.removeHotelImage(index);
    // 이미지 목록 새로고침
    await loadHotelImages();
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    alert('이미지 삭제에 실패했습니다.');
  }
};

const goHome = () => router.push('/owner/place');

// 유효성 검사 로직이 포함된 함수
const validateAndGoNext = () => {
  if (!store.name.trim()) {
    alert('숙소 이름을 입력해주세요.');
    return;
  }
  if (!store.categoryId) {
    alert('숙소 유형을 선택해주세요.');
    return;
  }

  // 모든 검사를 통과하면 다음 페이지로 이동
  router.push('/publishing/register/address');
};

// 데이터 복원 완료 또는 새로 시작 시 호출
const onDataRestored = () => {
  showRestoreComponent.value = false;
  loadHotelImages();
};

// 새로 시작하기 선택 시 호출
const onStartNew = () => {
  showRestoreComponent.value = false;
  store.clearStoreAndStorage(); // 스토어와 로컬스토리지 모두 삭제
  loadHotelImages();
};

onMounted(async () => {
  const idFromUrl = route.query.id; // URL에서 id 파라미터를 가져옵니다.

  if (idFromUrl) {
    // URL에 id가 있으면 '수정 모드'입니다.
    console.log(`수정 모드로 진입합니다. 숙소 ID: ${idFromUrl}`);
    showRestoreComponent.value = false; // 수정 모드에서는 복원 컴포넌트 숨김

    const success = await store.hydrateStoreForEdit(Number(idFromUrl));
    if (!success) {
      alert("목록 페이지로 돌아갑니다.");
      router.push('/owner/place'); //실패시 돌아가기
    }
  }
  // 신규 등록 모드에서는 HotelRegistrationRestore 컴포넌트가 처리

  // 이미지 로딩
  await loadHotelImages();
});
</script>
<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-4">
    <div class="flex flex-col items-center">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">
        <span class="text-red-500 mr-1">*</span>숙소 이름
      </p>
      <InputText v-model="store.name" placeholder="숙소 이름" class="w-[55%]" />
    </div>

    <div class="flex flex-col items-center">
      <p class="font-semibold my-2 text-gray-700 dark:text-gray-200">
        <span class="text-red-500 mr-1">*</span>숙소 유형
      </p>
      <CategorySelect v-model="store.categoryId" class="w-[55%]" />
    </div>

    <div class="p-4 bg-white dark:bg-gray-100 rounded-md space-y-4 flex flex-col items-center">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-800">
        호텔 이미지 등록
      </p>

      <div @click="triggerFileInput" class="w-[65%] h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
        <input type="file" accept="image/*" multiple ref="fileInput" @change="handleHotelImageUpload" class="hidden" />
        <div class="text-gray-400 text-sm">클릭하여 이미지 추가</div>
      </div>

      <div  style="margin-top:8px; margin-bottom: 8px;" class="grid grid-cols-3 gap-2 mt-4 w-full justify-items-center">
        <div v-for="(img, index) in hotelImageUrls" :key="index" class="relative w-30 h-20 rounded-md overflow-hidden border">
          <img :src="img" alt="uploaded" class="w-full h-full object-cover" />
          <button @click.stop="removeHotelImage(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
        </div>
      </div>

      <div class="w-full pt-4">
        <p class="font-semibold mb-2 text-gray-700 dark:text-gray-800">
          설명
        </p>
        <textarea v-model="store.description" placeholder="숙소에 대한 설명을 입력하세요." class="w-full h-40 border rounded p-2 resize-none dark:bg-gray-200 dark:border-gray-400" />
      </div>

      <div class="flex justify-between pt-4 w-full">
        <Button label="취소" icon="pi pi-home" @click="goHome" severity="secondary" />
        <Button label="다음" icon="pi pi-arrow-right" iconPos="right" @click="validateAndGoNext"/>
      </div>
    </div>

    <HotelRegistrationRestore v-if="showRestoreComponent" @data-restored="onDataRestored" @start-new="onStartNew" />
  </div>
</template>
