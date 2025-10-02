<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';
import type { Amenity } from '@/types/amenity';
import { apiClient } from '@/utils/axiosClient';

const props = defineProps<{ room?: any; visible: boolean }>();
const emits = defineEmits(['close', 'save']);

// 폼 데이터
const pyeongWidth = ref<string | number>('');
const roomType = ref<string>('');
const capacityPeople = ref<number>(1);
const capacityRoom = ref<number>(1);
const price = ref<number>(0);
const selectedBed = ref<string>('');
const selectedRoomAmenities = ref<number[]>([]);

// 이미지 파일들 (File 객체 직접 관리)
const imageFiles = ref<File[]>([]);
const imageUrls = ref<string[]>([]);

// 편의시설 데이터
const { data: roomAmenitiesData, isLoading, isError } = useQuery<ApiResult<Amenity[]>>({
  queryKey: ['v1', 'amenities', 'room'],
  queryFn: httpFetcher
});

// 초기값 세팅
onMounted(() => {
  if (props.room) {
    pyeongWidth.value = Math.round(props.room.width / 3.3);
    roomType.value = props.room.roomType;
    capacityPeople.value = props.room.capacityPeople;
    capacityRoom.value = props.room.capacityRoom;
    price.value = props.room.price;
    selectedBed.value = props.room.bedType;
    selectedRoomAmenities.value = props.room.amenityIds || [];
    // 기존 이미지 URL들 (수정 모드일 때)
    imageUrls.value = props.room.images || [];
  }
});

// 이미지 업로드/삭제
const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInput.value?.click();

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  for (let i = 0; i < target.files.length; i++) {
    const file = target.files[i];
    imageFiles.value.push(file);

    // 미리보기를 위한 URL 생성
    const url = URL.createObjectURL(file);
    imageUrls.value.push(url);
  }
  target.value = '';
};

const removeImage = (index: number) => {
  // URL 해제 (메모리 누수 방지)
  if (imageUrls.value[index].startsWith('blob:')) {
    URL.revokeObjectURL(imageUrls.value[index]);
  }

  imageFiles.value.splice(index, 1);
  imageUrls.value.splice(index, 1);
};

// 저장
const saveRoom = async () => {
  if (!roomType.value || !pyeongWidth.value) {
    alert("필수 항목을 입력해주세요.");
    return;
  }

  const payload = {
    roomNumber: 1,
    roomType: roomType.value,
    capacityPeople: capacityPeople.value,
    minPrice: price.value,
    extraPrice: 0,
    bedType: selectedBed.value,
    capacityRoom: capacityRoom.value,
    amenityIds: [...selectedRoomAmenities.value],
  };

  console.log('selectedRoomAmenities:', selectedRoomAmenities.value);
  console.log('payload.amenityIds:', payload.amenityIds);

  // FormData 생성
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  // 이미지 파일들을 FormData에 직접 추가
  imageFiles.value.forEach((file) => {
    formData.append("roomImages", file);
  });

  try {
    if (props.room) {
      await apiClient.put(`/v1/owner/rooms/${props.room.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await apiClient.post(`/v1/owner/rooms/register`, formData, {
        headers: { "Content-Type": "multipart/form-data"}
      });
    }

    // 성공 시 이미지 URL들 정리 (메모리 누수 방지)
    imageUrls.value.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    emits("save");
    emits("close");
  } catch (e) {
    console.error(e);
    alert("저장 실패");
  }
};

</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    modal
    :header="props.room ? '객실 수정' : '객실 등록'"
    style="width: 60vw"
    @hide="$emit('close')"
  >
  <div class="p-2 space-y-4">
    <!-- 방 면적 -->
    <div class="flex flex-col">
      <p class="font-semibold mb-2">방 면적</p>
      <InputText v-model="pyeongWidth" type="number" placeholder="평 단위" class="w-1/2" />
    </div>

    <!-- 룸 유형 -->
    <div class="flex flex-col">
      <p class="font-semibold mb-2">룸 유형</p>
      <select v-model="roomType" class="w-1/2 border rounded p-2">
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

    <!-- 인원 / 객실 수 -->
    <div class="flex gap-6">
      <div>
        <p class="font-semibold mb-2">정원</p>
        <InputText v-model.number="capacityPeople" type="number" />
      </div>
      <div>
        <p class="font-semibold mb-2">객실 개수</p>
        <InputText v-model.number="capacityRoom" type="number" />
      </div>
    </div>

    <!-- 침대 선택 -->
    <div class="flex flex-col">
      <p class="font-semibold mb-2">제공되는 침대 선택</p>
      <select v-model="selectedBed" class="w-1/2 border rounded p-2">
        <option value="">선택</option>
        <option value="싱글침대 (90~130cm)">싱글침대 (90~130cm)</option>
        <option value="더블침대 (131~150cm)">더블침대 (131~150cm)</option>
        <option value="대형침대 (151~180cm)">대형침대 (151~180cm)</option>
        <option value="초대형 침대 (181~210cm)">초대형 침대 (181~210cm)</option>
      </select>
    </div>

    <!-- 이미지 업로드 -->
    <div>
      <p class="font-semibold mb-2">객실 이미지</p>
      <div
        @click="triggerFileInput"
        class="w-full h-40 border-2 border-dashed flex items-center justify-center cursor-pointer"
      >
        <input type="file" accept="image/*" multiple ref="fileInput" @change="handleImageUpload" class="hidden" />
        <span class="text-gray-400">클릭하여 업로드</span>
      </div>
      <div class="grid grid-cols-3 gap-2 mt-2">
        <div v-for="(img, idx) in imageUrls" :key="idx" class="relative border rounded">
          <img :src="img" class="w-full h-24 object-cover" />
          <button
            @click.stop="removeImage(idx)"
            class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- 요금 -->
    <div>
      <p class="font-semibold mb-2">1박 요금</p>
      <InputText v-model.number="price" type="number" class="w-1/2" />
    </div>

    <!-- 편의시설 -->
    <div>
      <p class="font-semibold mb-2">편의시설</p>
      <div v-if="isLoading">불러오는 중...</div>
      <div v-else-if="isError">불러오기 실패</div>
      <div v-else class="grid grid-cols-4 gap-2">
        <div
          v-for="a in roomAmenitiesData?.data"
          :key="a.id"
          @click="selectedRoomAmenities.includes(a.id) ? selectedRoomAmenities.splice(selectedRoomAmenities.indexOf(a.id), 1) : selectedRoomAmenities.push(a.id)"
          class="p-2 border rounded cursor-pointer"
          :class="selectedRoomAmenities.includes(a.id) ? 'border-blue-500 bg-blue-100' : 'border-gray-300'"
        >
          {{ a.name }}
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <template #footer>
    <Button label="취소" severity="secondary" @click="$emit('close')" />
    <Button label="저장" @click="saveRoom" />
  </template>
  </Dialog>
</template>
