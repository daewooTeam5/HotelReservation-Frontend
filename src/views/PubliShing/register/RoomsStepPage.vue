<script lang="ts" setup>
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, watch, onMounted } from 'vue';
import { useRegisterStore, type DiscountOption } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';
import type { Amenity } from '@/types/amenity';
import HotelRegistrationRestore from '@/components/hotel/HotelRegistrationRestore.vue';

const store = useRegisterStore();
const router = useRouter();

// 방 면적
const pyeongWidth = ref<string | number>('');

// 객실 이미지 URL들을 위한 반응형 데이터
const roomImageUrls = ref<string[]>([]);
const showRestoreComponent = ref(true);

// 수정 모드 관련
const editingRoomIndex = ref<number | null>(null);
const selectedRoomAmenities = ref<number[]>([]);

// 서버에서 객실 편의시설 데이터 가져오기
const { data: roomAmenitiesData, isLoading: isAmenitiesLoading, isError: isAmenitiesError } = useQuery<ApiResult<Amenity[]>>({
  queryKey: ['v1', 'amenities', 'room'],
  queryFn: httpFetcher
});

// 객실 편의시설 선택/해제 함수
const toggleRoomAmenity = (amenityId: number) => {
  const index = selectedRoomAmenities.value.indexOf(amenityId);
  if (index > -1) {
    selectedRoomAmenities.value.splice(index, 1);
  } else {
    selectedRoomAmenities.value.push(amenityId);
  }
};

// 객실 편의시설이 선택되었는지 확인하는 함수
const isRoomAmenitySelected = (amenityId: number) => {
  return selectedRoomAmenities.value.includes(amenityId);
};

// 객실 편의시설 이름들을 가져오는 함수
const getRoomAmenityNames = (amenityIds: number[]) => {
  if (!roomAmenitiesData.value?.data) return [];
  return roomAmenitiesData.value.data
    .filter(amenity => amenityIds.includes(amenity.id))
    .map(amenity => amenity.name);
};

// 객실 수정 모드 시작
const startEditRoom = (index: number) => {
  const room = store.addedRooms[index];
  editingRoomIndex.value = index;

  // 기존 객실 정보를 현재 입력 폼에 채우기
  pyeongWidth.value = Math.round(room.width / 3.3);
  store.rooms.roomType = room.roomType;
  store.rooms.capacityPeople = room.capacityPeople;
  store.rooms.capacityRoom = room.capacityRoom; // capacityRoom 복원
  store.rooms.price = room.price;
  store.rooms.selectedBed = room.selectedBed;
  store.images = [...room.images];

  // 객실 편의시설 선택 상태 복원
  selectedRoomAmenities.value = room.amenityIds || [];

  // 이미지 새로고침
  loadRoomImages();
};

// 객실 수정 완료
const updateRoom = () => {
  if (editingRoomIndex.value === null) return;

  if (!store.rooms.roomType) {
    alert('룸 유형을 선택해주세요.');
    return;
  }
  if (!pyeongWidth.value || Number(pyeongWidth.value) <= 0) {
    alert('방 면적을 입력해주세요.');
    return;
  }
  if (!store.rooms.capacityRoom || store.rooms.capacityRoom <= 0) {
    alert('객실 개수를 1개 이상 입력해주세요.');
    return;
  }
  if (!store.rooms.price || store.rooms.price <= 0) {
    alert('1박 요금을 입력해주세요.');
    return;
  }

  // 수정된 객실 정보로 업데이트
  const updatedRoom = {
    ...store.rooms,
    width: Number(pyeongWidth.value) * 3.3,
    images: [...store.images],
    amenityIds: [...selectedRoomAmenities.value]   // ✅ amenityIds로 저장
  };

  store.addedRooms[editingRoomIndex.value] = updatedRoom;

  // 수정 모드 종료 및 폼 초기화
  editingRoomIndex.value = null;
  pyeongWidth.value = '';
  store.rooms.price = 0;
  store.rooms.roomType = '';
  store.rooms.capacityPeople = 1;
  store.rooms.capacityRoom = 1; // capacityRoom 초기화
  store.rooms.selectedBed = '';
  store.images = [];
  selectedRoomAmenities.value = [];

  // 이미지 새로고침
  loadRoomImages();
  store.autoSave();
};

// 객실 수정 취소
const cancelEditRoom = () => {
  editingRoomIndex.value = null;
  pyeongWidth.value = '';
  store.rooms.price = 0;
  store.rooms.roomType = '';
  store.rooms.capacityPeople = 1;
  store.rooms.selectedBed = '';
  store.images = [];
  selectedRoomAmenities.value = [];
  loadRoomImages();
};

// 객실 이미지 URL들을 가져오는 함수
const loadRoomImages = async () => {
  try {
    roomImageUrls.value = await store.getAllRoomImageUrls();
  } catch (error) {
    console.error('이미지 로딩 실패:', error);
  }
};

// 데이터 복원 완료 또는 새로 시작 시 호출
const onDataRestored = () => {
  showRestoreComponent.value = false;
  loadRoomImages();
};

// 새로 시작하기 선택 시 호출
const onStartNew = () => {
  showRestoreComponent.value = false;
  store.clearStoreAndStorage(); // 스토어와 로컬스토리지 모두 삭제
  loadRoomImages();
};

watch(pyeongWidth, (newValue) => {
  const numericValue = Number(newValue);
  if (!isNaN(numericValue) && numericValue > 0) {
    store.rooms.width = numericValue * 3.3;
  } else {
    store.rooms.width = 0;
  }
});

// 이미지 업로드
const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInput.value?.click();

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  try {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      // IndexedDB에 파일 직접 저장
      await store.addRoomImage(file);
    }
    target.value = ''; // 파일 입력 초기화
    // 이미지 목록 새로고침
    await loadRoomImages();
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
  }
};

const removeImage = async (index: number) => {
  try {
    await store.removeRoomImage(index);
    // 이미지 목록 새로고침
    await loadRoomImages();
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    alert('이미지 삭제에 실패했습니다.');
  }
};
const removeAddedRoom = (index: number) => store.removeAddedRoom(index);

// 객실 추가
const addRoom = () => {
  if (!store.rooms.roomType) {
    alert('룸 유형을 선택해주세요.');
    return;
  }
  if (!pyeongWidth.value || Number(pyeongWidth.value) <= 0) {
    alert('방 면적을 입력해주세요.');
    return;
  }
  if (!store.rooms.capacityRoom || store.rooms.capacityRoom <= 0) {
    alert('객실 개수를 1개 이상 입력해주세요.');
    return;
  }
  if (!store.rooms.price || store.rooms.price <= 0) {
    alert('1박 요금을 입력해주세요.');
    return;
  }

  // 현재 객실 정보에 편의시설 추가
  const roomToAdd = {
    ...JSON.parse(JSON.stringify(store.rooms)),
    images: [...store.images],
    amenityIds: [...selectedRoomAmenities.value],   // ✅ amenityIds로 저장
    width: Number(pyeongWidth.value) * 3.3
  };

  store.addedRooms.push(roomToAdd);

  // 다음 객실 번호 설정
  const nextRoomNumber = store.rooms.roomNumber + 1;

  // 폼 초기화
  store.rooms = {
    capacityPeople: 1,
    price: 0,
    extraPrice: 0,
    roomNumber: nextRoomNumber,
    roomType: '',
    bedType: [...store.rooms.bedType],
    isPublic: true,
    selectedBed: '',
    width: 0,
    images: [],
    capacityRoom: 1 // capacityRoom 초기화
  };

  pyeongWidth.value = '';
  store.images = [];
  selectedRoomAmenities.value = [];

  // 이미지 새로고침
  loadRoomImages();
  store.autoSave();
};

// 이전/다음
const goPrev = () => router.push('/publishing/register/policy');
const goNext = () => {
  if (store.addedRooms.length === 0) {
    alert('객실을 한 개 이상 추가해야 다음 단계로 진행할 수 있습니다.');
    return;
  }

  router.push('/publishing/register/confirm');
};

// 할인율 추가/삭제
const addDiscount = () => store.discounts.push({ person: 1, discount: 0 });
const removeDiscount = (index: number) => store.discounts.splice(index, 1);
const calcPrice = (d: DiscountOption) => {
  const base = Number(store.rooms.price || 0);
  const extra = Number(store.rooms.extraPrice || 0);
  const persons = d.person || 1;
  const discount = d.discount || 0;
  const before = base + extra * Math.max(0, persons - 1);
  return Math.round(before * (1 - discount / 100));
};

onMounted(async () => {
  // 첫 페이지에서 넘어온 경우 복원 컴포넌트 숨김
  if (store.name || store.categoryId || store.hotelImages.length > 0) {
    showRestoreComponent.value = false;
  }

  // 이미지 로딩
  await loadRoomImages();
});
</script>

<template>
  <div class="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-4">

    <!-- 방 면적 -->
    <div class="flex flex-col px-5">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200"><span class="text-red-500">*</span>방 면적</p>
      <InputText v-model="pyeongWidth" type="number" placeholder="평 단위" class="w-[55%]" />
    </div>

    <!-- 룸 유형 -->
    <div class="flex flex-col px-5">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200"><span class="text-red-500">*</span>룸 유형</p>
      <select v-model="store.rooms.roomType" class="w-full md:w-3/4 border rounded p-2 dark:bg-gray-700 dark:border-gray-600">
        <option value="">선택</option>
        <option value="single">싱글룸</option>
        <option value="double">더블룸</option>
        <option value="twin">트윈룸</option>
        <option value="triple">트리플룸</option>
        <option value="qudruple">쿼드러플룸</option>
        <option value="swite">스위트룸</option>
        <option value="family">패밀리룸</option>
        <option value="apt">아파트룸</option>
      </select>
    </div>

    <!-- 최대 인원 -->
    <div class="flex flex-col px-5">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">이 객실에 숙박 가능한 인원</p>
      <div class="flex items-center gap-2">
        <Button severity="secondary" @click="store.rooms.capacityPeople = Math.max(1, store.rooms.capacityPeople - 1)">-</Button>
        <span class="w-8 text-center text-lg">{{ store.rooms.capacityPeople }}</span>
        <Button @click="store.rooms.capacityPeople++">+</Button>
      </div>
    </div>

    <!-- 객실 개수 -->
    <div class="flex flex-col px-5">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200"><span class="text-red-500">*</span>이 타입의 객실 개수</p>
      <div class="flex items-center gap-2">
        <Button severity="secondary" @click="store.rooms.capacityRoom = Math.max(1, store.rooms.capacityRoom - 1)">-</Button>
        <span class="w-8 text-center text-lg">{{ store.rooms.capacityRoom }}</span>
        <Button @click="store.rooms.capacityRoom++">+</Button>
      </div>
    </div>

    <div class="flex flex-row gap-6 px-5">
      <!-- 침대 선택 -->
      <div class="w-1/2 flex flex-col justify-start h-[40%]">
        <p class="font-semibold mb-4 text-gray-700 dark:text-gray-200">제공되는 침대 선택</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 justify-start h-[150%]">
          <div v-for="(b, idx) in store.rooms.bedType" :key="idx" class="flex items-center gap-2 justify-start h-[150%]">
            <input type="radio" :id="'bed-' + idx" name="bedType" :value="b.type" v-model="store.rooms.selectedBed" class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
            <label :for="'bed-' + idx" class="text-gray-700 dark:text-gray-200" style="margin-top: 8px; margin-bottom: 8px">{{ b.type }} ({{ b.width }})</label>
          </div>
        </div>
      </div>

      <!-- 이미지 업로드 -->
      <div class="w-1/2 flex flex-col items-center">
        <p style="margin-top:8px; margin-bottom: 8px;" class="font-semibold text-gray-700 dark:text-gray-200 mb-2">객실 이미지 등록</p>
        <div @click="triggerFileInput" class="w-full h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
          <input type="file" accept="image/*" multiple ref="fileInput" @change="handleImageUpload" class="hidden" />
          <div class="text-gray-400 text-sm">클릭하여 이미지 추가</div>
        </div>
        <div style="margin-top:8px; margin-bottom: 8px;" class="grid md:grid-cols-3 gap-2 w-full">
          <div v-for="(img, idx) in roomImageUrls" :key="idx" class="relative w-full aspect-square rounded-md overflow-hidden border">
            <img :src="img" class="w-full h-full object-cover" />
            <button @click.stop="removeImage(idx)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 요금 입력 -->
    <div class="px-5 py-2 flex flex-col gap-4">
      <div class="flex flex-col">
        <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200"><span class="text-red-500">*</span>1박 요금</p>
        <input type="number" v-model.number="store.rooms.price" placeholder="예: 45000" class="w-full border rounded p-2" />
      </div>
    </div>

    <!-- 객실 편의시설 선택 -->
    <div class="px-5 py-2">
      <p class="font-semibold mb-4 text-gray-700 dark:text-gray-200">객실 편의시설</p>

      <!-- 로딩 상태 -->
      <div v-if="isAmenitiesLoading" class="text-center py-4">
        <i class="pi pi-spinner pi-spin text-lg text-blue-500"></i>
        <p class="mt-2 text-sm text-gray-600">편의시설을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="isAmenitiesError" class="text-center py-4">
        <i class="pi pi-exclamation-triangle text-lg text-red-500"></i>
        <p class="mt-2 text-sm text-red-600">편의시설을 불러오는데 실패했습니다.</p>
      </div>

      <!-- 객실 편의시설 목록 -->
      <div v-else-if="roomAmenitiesData?.data" class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        <div
          v-for="amenity in roomAmenitiesData.data"
          :key="amenity.id"
          @click="toggleRoomAmenity(amenity.id)"
          class="flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
          :class="{
            'border-blue-500 bg-blue-50': isRoomAmenitySelected(amenity.id),
            'border-gray-200 hover:border-gray-300': !isRoomAmenitySelected(amenity.id)
          }"
        >
          <!-- 편의시설 아이콘 -->
          <img
            :src="amenity.icon"
            :alt="amenity.name"
            class="w-6 h-6 mb-1 object-contain"
            @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
          />

          <!-- 편의시설 이름 -->
          <p class="text-center text-[10px] font-medium text-gray-700 dark:text-gray-200">
            {{ amenity.name }}
          </p>

          <!-- 선택 체크 표시 -->
          <div
            class="mt-1 w-3 h-3 rounded-full border flex items-center justify-center"
            :class="{
              'border-blue-500 bg-blue-500': isRoomAmenitySelected(amenity.id),
              'border-gray-300': !isRoomAmenitySelected(amenity.id)
            }"
          >
            <i
              v-if="isRoomAmenitySelected(amenity.id)"
              class="pi pi-check text-white text-[8px]"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 객실 추가/수정 버튼 -->
    <div class="px-5 py-2 flex justify-center gap-2">
      <Button
        v-if="editingRoomIndex === null"
        label="객실 추가"
        class="!bg-blue-500 !border-blue-500 flex-1"
        @click="addRoom"
      />
      <template v-else>
        <Button
          label="수정 완료"
          class="!bg-green-500 !border-green-500 flex-1"
          @click="updateRoom"
        />
        <Button
          label="수정 취소"
          severity="secondary"
          class="flex-1"
          @click="cancelEditRoom"
        />
      </template>
    </div>

    <!-- 추가된 객실 -->
    <div v-if="store.addedRooms.length" class="px-5 py-2 space-y-2">
      <p class="font-semibold text-gray-700 dark:text-gray-400">추가된 객실</p>
      <div v-for="(room, idx) in store.addedRooms" :key="idx" class="bg-gray-100 dark:bg-gray-700 p-3 rounded">
        <div class="flex justify-between items-start mb-2">
          <div class="text-sm flex-1">
            <div class="font-medium mb-1">객실 {{ room.roomNumber }} - {{ room.roomType }} ({{ room.capacityRoom }}개)</div>
            <div class="text-gray-600">면적: {{ room.width.toFixed(2) }}m² | 최대인원: {{ room.capacityPeople }}명 | 1박: {{ room.price }}원</div>
            <div class="text-gray-600">침대: {{ room.selectedBed }}</div>
            <div v-if="room.amenityIds && room.amenityIds.length > 0" class="text-gray-600 mt-1">
              편의시설: {{ getRoomAmenityNames(room.amenityIds).join(', ') }}
            </div>
          </div>
          <div class="flex gap-1 ml-2">
            <Button
              label="수정"
              severity="info"
              size="small"
              @click="startEditRoom(idx)"
              :disabled="editingRoomIndex !== null"
            />
            <Button
              label="삭제"
              severity="danger"
              size="small"
              @click="removeAddedRoom(idx)"
              :disabled="editingRoomIndex !== null"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 이전/다음 -->
    <div class="px-5 py-4 flex justify-between">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>

    <!-- 데이터 복원 컴포넌트 -->
    <div v-if="showRestoreComponent" class="px-5 py-4">
      <HotelRegistrationRestore @data-restored="onDataRestored" @start-new="onStartNew" />
    </div>
  </div>
</template>
