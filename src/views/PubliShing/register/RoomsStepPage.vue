<script lang="ts" setup>
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';
import { useRegisterStore, type DiscountOption } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

// 방 면적
const pyeongWidth = ref<string | number>('');

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
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  for (let i = 0; i < target.files.length; i++) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) store.addImage(e.target.result as string);
    };
    reader.readAsDataURL(target.files[i]);
  }
  target.value = '';
};
const removeImage = (index: number) => store.removeImage(index);
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
  if (!store.rooms.price || store.rooms.price <= 0) {
    alert('1박 요금을 입력해주세요.');
    return;
  }
  store.addRoom();
  pyeongWidth.value = '';
  store.rooms.price = 0;
};

// 이전/다음
const goPrev = () => router.push('/publishing/register/basic');
const goNext = () => {
  if (store.addedRooms.length === 0) {
    alert('객실을 한 개 이상 추가해야 다음 단계로 진행할 수 있습니다.');
    return;
  }


  router.push('/publishing/register/amenities');
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
          <div v-for="(img, idx) in store.images" :key="idx" class="relative w-full aspect-square rounded-md overflow-hidden border">
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

    <!-- 할인율 -->


    <!-- 객실 추가 버튼 -->
    <div class="px-5 py-2 flex justify-center">
      <Button label="객실 추가" class="!bg-blue-500 !border-blue-500 w-full" @click="addRoom" />
    </div>

    <!-- 추가된 객실 -->
    <div v-if="store.addedRooms.length" class="px-5 py-2 space-y-2">
      <p class="font-semibold text-gray-700 dark:text-gray-400">추가된 객실</p>
      <div v-for="(room, idx) in store.addedRooms" :key="idx" class="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
        <div class="text-sm overflow-x-auto">
          <span>면적: {{ room.width.toFixed(2) }}m² | 유형: {{ room.roomType || '미정' }} | 최대인원: {{ room.capacityPeople }} | 1박 요금: {{ room.price }}원</span>
        </div>
        <Button label="삭제" severity="danger" size="small" @click="removeAddedRoom(idx)" />
      </div>
    </div>

    <!-- 이전/다음 -->
    <div class="px-5 py-4 flex justify-between">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>

  </div>
</template>
