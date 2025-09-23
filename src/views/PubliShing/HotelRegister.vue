<template>
  <div class="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
    <div
      class="w-[600px] h-[700px] p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col gap-6 mt-[15vh]"
    >
      <!-- Step Title -->
      <div style="border-bottom: 2px solid black">
        <h3
          style="margin-bottom: 5px"
          class="text-center text-xl font-bold text-gray-800 dark:text-gray-100"
        >
          {{ stepTitles[activeStep] }}
        </h3>
      </div>

      <!-- Step Content -->
      <div class="flex-1 overflow-y-auto flex flex-col gap-8">
        <!-- Step 1 : 호텔 기본 정보 -->
        <div v-if="activeStep === 'step1'" class="flex flex-col gap-6">
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">숙소 이름</p>
            <InputText
              v-model="form.name"
              placeholder="숙소 이름"
              unstyled
              class="w-full border-2 border-gray-300 rounded-md p-2 focus:ring-black-900"
            />
          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">호실 번호</p>
            <InputText
              v-model.number="form.rooms.roomNumber"
              placeholder="호실 번호"
              unstyled
              class="w-50 border-2 border-gray-300 rounded-md p-2 focus:ring-black-900"
            />

          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">숙소 유형</p>
            <select v-model="form.hotelType" class="w-full border rounded p-2">
              <option value="">선택</option>
              <option value="풀빌라">풀빌라</option>
              <option value="아파트">아파트</option>
              <option value="단독주택">단독주택</option>
              <option value="여관">여관</option>
              <option value="호텔">호텔</option>
            </select>
          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">설명</p>

            <textarea
              v-model="form.description"
              placeholder="설명"
              class="w-full h-[200px] border-2 border-gray-300 rounded-md p-2 focus:ring-black-900 resize-none"
            />
          </div>
        </div>

        <div v-if="activeStep === 'step2'" class="flex flex-col gap-6">
          <!-- 룸 유형 -->
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">룸 유형</p>
            <select v-model="form.rooms.roomType" class="w-full border rounded p-2">
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

          <!-- 침대 옵션 리스트 -->
          <div>
            <p
              style="margin-bottom: 8px; font-size: 14px; font-style: italic"
              class="font-semibold mb-2 text-gray-700 dark:text-gray-200"
            >
              객실에는 어떤 침대가 제공되나요?
            </p>
            <div
              style="margin-bottom: 14px; margin-top: 8px"


              class="flex items-center justify-between rounded-md mb-2">
            </div>
<div>
              <select v-model="form.rooms.bedType" class="w-full border rounded p-2">
                <option value="">사이즈 선택</option>
                <option value="single">싱글, 90~130cm</option>
                <option value="quin">퀸, 131~150cm</option>
                <option value="king">킹, 151~180cm</option>
                <option value="superking">수퍼 킹, 181~210cm</option>

              </select>
              </div>



          </div>

          <!-- 최대 숙박 인원 -->
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">
              이 객실에 숙박 가능한 인원
            </p>
            <div class="flex items-center gap-2">
              <button
                onmouseover="this.style.backgroundColor='grey'"
                onmouseout="this.style.backgroundColor='lightgrey'"
                style="background: lightgrey"
                type="button"
                class="px-2 py-1 bg-gray-100 rounded"
                @click="form.rooms.capacityPeople = Math.max(1, form.rooms.capacityPeople - 1)"
              >
                −
              </button>
              <span class="w-6 text-center">{{ form.rooms.capacityPeople }}</span>
              <button
                onmouseover="this.style.backgroundColor='#2781d0'"
                onmouseout="this.style.backgroundColor='lightgrey'"
                style="background-color: lightgrey"
                type="button"
                class="px-2 py-1 bg-gray-100 rounded"
                @click="form.rooms.capacityPeople++"
              >
                +
              </button>
            </div>
            <button
              type="button"
              class="w-full px-2 py-1 mt-4 bg-blue-400 text-white rounded hover:bg-blue-500"
              @click="addRoom"
              style="margin-top:8px;"
            >
              객실 추가
            </button>


          </div>
          <div v-if="addedRooms.length > 0" class="mt-4 flex flex-col gap-2">
            <p class="font-semibold text-gray-700 dark:text-gray-200">추가된 객실</p>
            <div
              v-for="(room, index) in addedRooms"
              :key="index"
              class="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded"
            >
              <div>
                <p>호실: {{ room.roomNumber }}</p>
                <p>유형: {{ room.roomType || '미정' }}</p>
                <p>최대인원: {{ room.capacityPeople }}</p>
              </div>
              <button
                @click="removeAddedRoom(index)"
                class="text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
          </div>

          <!-- 객실 추가 버튼 -->


        <!-- step3 이미지 등록 -->
        <div v-if="activeStep === 'step3'" class="flex flex-col items-center gap-6">
          <!-- 제목 -->
          <p class="font-semibold text-gray-700 dark:text-gray-200 text-center">객실 이미지 등록</p>

          <!-- 이미지 업로드 박스 -->
          <div
            @click="triggerFileInput"
            class="w-100 h-50 border-2 border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors relative"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              ref="fileInput"
              @change="handleImageUpload"
              class="hidden"
            />

            <div
              class="flex flex-col items-center text-gray-400"
            >
              <!-- 여기가 아이콘-->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
              <span class="text-sm mt-2 text-center">클릭하여 추가</span>
            </div>
          </div>

          <!-- 업로드된 이미지 미리보기 -->
          <div class="grid grid-cols-3 gap-4 mt-4 w-full justify-items-center">
            <div
              v-for="(img, index) in uploadedImages"
              :key="index"
              class="relative w-40 h-40 rounded-md overflow-hidden border"
            >
              <img :src="img" class="w-full h-full object-cover" />

              <!-- 삭제 버튼 -->
              <button
                @click.stop="removeImage(index)"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4 : 편의시설 체크리스트 -->
        <div v-if="activeStep === 'step4'" class="flex flex-col gap-6">
          <div v-for="(amenity, index) in amenities" :key="index" class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="amenity.checked"
              :id="'amenity-' + index"
              class="w-5 h-5"
            />
            <label :for="'amenity-' + index" class="text-gray-700 dark:text-gray-200">
              {{ amenity.name }}
            </label>
          </div>
        </div>

        <!-- Step 5 : 이용수칙 -->
        <div v-if="activeStep === 'step5'" class="flex flex-col gap-6">
          <h1 style="text-align:center; font-size:24px;">이용 수칙</h1>
          <div>
            <p
              style="margin-bottom: 8px; font-size: 14px;"
              class="font-semibold mb-2 text-gray-700 dark:text-gray-200"
            >
              체크 인 시간은 어떻게 할까요?
            </p>
            <InputText
              v-model="form.rooms.checkIn"
              placeholder="체크 인 시간"
              unstyled
              class="w-full border-2 border-gray-300 rounded-md p-2 focus:ring-black-900"
            />
          </div>
          <div>
            <p
              style="margin-bottom: 8px; font-size: 14px; font-style:sans;"
              class="font-semibold mb-2 text-gray-700 dark:text-gray-200"
            >
              체크 아웃 시간은 어떻게 할까요?
            </p>
            <InputText
              v-model="form.rooms.checkOut"
              placeholder="체크 아웃 시간"
              unstyled
              class="w-full border-2 border-gray-300 rounded-md p-2 focus:ring-black-900"
            />
          </div>
          <p style="font-size:14px; font_style:italic;">제공되는 언어는 무엇인가요?</p>
          <div v-for="(lang, index) in ranguage" :key="index" class="flex items-center gap-2">

            <input
              type="checkbox"
              v-model="lang.checked"
              :id="'ranguage-' + index"
              class="w-5 h-5"
            />
            <label :for="'ranguage-' + index" class="text-gray-700 dark:text-gray-200">
              {{ lang.types }}
            </label>

          </div>
          <button
            type="button"
            style="background-color:#03ecec;"
            class="px-2 py-1 rounded hover:bg-blue-400 transition-colors"
            @click="showInput = true"
            onmouseover="this.style.backgroundColor='#0581e6'"
            onmouseout="this.style.backgroundColor='#03ecec'"
          >
            언어 추가
          </button>

          <!-- 입력 필드 (보이기) -->
          <div v-if="showInput" class="flex gap-2">
            <input
              type="text"
              v-model="newLanguage"
              placeholder="언어 입력"
              class="border rounded px-2 py-1 flex-1"
            />
            <button
              @click="addLanguage"
              class="bg-green-400 text-white px-2 py-1 rounded hover:bg-green-500 transition-colors"
            >
              추가
            </button>
            <button
              @click="showInput = false; newLanguage=''"
              class="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 transition-colors"
            >
              취소
            </button>
          </div>

        </div>

        <!-- Step 6 : 요금제 -->
        <div v-if="activeStep === 'step6'" class="flex flex-col gap-6">
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">1박 요금</p>
            <InputText
              v-model.number="form.rooms.price"
              placeholder="예:45000(원 제외)"
              unstyled
              class="w-full border-2 border-gray-300 rounded-md p-2 focus:ring-black-900"
            />
          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">추가 인원 요금</p>
            <InputText
              v-model.number="form.rooms.extraPrice"
              placeholder="예:30000(원 제외)"
              unstyled
              class="w-full border-2 border-gray-300 rounded-md p-2 focus:ring-black-900"
            />
          </div>
          <div>
            <h1 style="text-align:center; margin-bottom:6px;">인원에 따른 할인율 설정</h1>
            <table class="w-full border-collapse border border-gray-300 text-center">
              <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 px-2 py-1">인원</th>
                <th class="border border-gray-300 px-2 py-1">할인율(%)</th>
                <th class="border border-gray-300 px-2 py-1">적용 가격</th>
                <th class="border border-gray-300 px-2 py-1">수정</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(d, index) in form.discounts" :key="index">
                <td class="border border-gray-300 px-2 py-1">
                  <input type="number" v-model.number="d.person" class="w-16 text-center" min="1" />
                </td>
                <td class="border border-gray-300 px-2 py-1">
                  <input type="number" v-model.number="d.discount" class="w-16 text-center" min="0" max="100" />
                </td>
                <td class="border border-gray-300 px-2 py-1">
                  {{ calculateDiscountedPrice(d) }}
                </td>
                <td class="border border-gray-300 px-2 py-1">

                  <button class="bg-red-400 text-white px-2 py-1 rounded" @click="form.discounts.splice(index,1)"
                          onmouseover="this.style.backgroundColor='#f30000'"
                          onmouseout="this.style.backgroundColor='#f87171'"
                  >삭제</button>
                </td>
              </tr>
              </tbody>
            </table>
            <button
              style="margin:2px; margin-right:5px;"
              class="bg-green-500 text-white px-2 py-1 rounded"
              @click="form.discounts.push({ person: 1, discount: 0 })"
              onmouseover="this.style.backgroundColor='#08ea7d'"
              onmouseout="this.style.backgroundColor='#22c55e'"
            >
              할인율 추가
            </button>

          </div>
        </div>
      </div>
      <!-- Step 7 : 실제 주소 -->
      <div v-if="activeStep === 'step7'" class="flex flex-col gap-2 justify-start h-full">
        <input
          v-model="form.address.sigungu"
          placeholder="시/군/구"
          class="address-input"
        />
        <input
          v-model="form.address.sido"
          placeholder="시/도"
          class="address-input"
        />
        <input
          v-model="form.address.roadName"
          placeholder="도로명"
          class="address-input"
        />

        <input
          v-model="form.address.postalCode"
          placeholder="우편번호"
          class="address-input"
        />
        <input
          v-model="form.address.detailAddress"
          placeholder="상세주소"
          class="address-input"
        />
      </div>


      <!--확인-->

      <div v-if="activeStep === 'step8'" class="flex flex-col h-full p-4 gap-6">

        <div class="flex flex-col gap-6 flex-1 justify-start">
          <!-- 호텔 이름 -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-gray-700 dark:text-gray-200">호텔 이름</p>
            <p class="text-gray-900 dark:text-gray-100">{{ form.name }}</p>
          </div>

          <!-- 숙소 유형 -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-gray-700 dark:text-gray-200">숙소 유형</p>
            <p class="text-gray-900 dark:text-gray-100">{{ form.hotelType }}</p>
          </div>

          <!-- 룸 번호 -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-gray-700 dark:text-gray-200">호실 번호</p>
            <p class="text-gray-900 dark:text-gray-100">{{ form.rooms.roomNumber }}</p>
          </div>



          <!-- 업로드된 사진 -->
          <div>
            <p class="font-semibold text-gray-700 dark:text-gray-200 mb-2">업로드된 사진</p>
            <div class="grid grid-cols-3 gap-4 mt-2">
              <div v-for="(img, index) in uploadedImages" :key="index" class="w-20 h-20 border rounded overflow-hidden">
                <img :src="img" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <!-- 1박당 가격 -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-gray-700 dark:text-gray-200">1박당 가격</p>
            <p class="text-gray-900 dark:text-gray-100">{{ form.rooms.price }} 원</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="font-semibold text-gray-700 dark:text-gray-200">체크인</p>
            <p class="text-gray-900 dark:text-gray-100">{{ form.rooms.checkIn }}</p>

          </div>

<div class="flex justify-between items-center">
          <p class="font-semibold text-gray-700 dark:text-gray-200">체크아웃</p>
          <p class="text-gray-900 dark:text-gray-100">{{ form.rooms.checkOut }}</p>
        </div>
          <div class="flex justify-between items-center">
            <p class="text-gray-700 dark:text-gray-200 font-semibold">주소</p>
            <p class="text-gray-900 dark:text-gray-100">
              {{ form.address.sigungu }} {{ form.address.sido }}
              {{ form.address.roadName }} {{ form.address.postalCode }}
               {{ form.address.detailAddress }}
            </p>
          </div>

        </div>

      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-6">
        <Button
          v-if="activeStep !== 'step1'"
          label="Back"
          severity="secondary"
          icon="pi pi-arrow-left"
          class="w-24"
          @click="prevStep"
        />
        <div class="flex-1"></div>
        <Button
          v-if="activeStep !== 'step8'"
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="w-24"
          @click="nextStep"
        />
        <Button
          v-if="activeStep === 'step8'"
          label="Submit"
          icon="pi pi-check"
          class="w-24"
          @click="submitForm"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { apiClient } from '@/utils/axiosClient';
import { useRouter } from 'vue-router';

// Step 관리
const activeStep = ref('step1');
const stepTitles: Record<string, string> = {
  step1: '숙소 기본정보',
  step2: '객실 정보',
  step3: '추가 정보',
  step4: '편의 기능 체크리스트',
  step5: '체크인/체크아웃 시간',
  step6: '요금제 설정',
  step7: '주소 입력',
  step8: '정보 확인',
};

// Router
const router = useRouter();

// Form 초기 상태
interface DiscountOption { person: number; discount: number; }
interface BedOption { type: string; width: string; count: number; }

const form = reactive({
  name: '',
  hotelType: '',
  description: '',
  rooms: {
    roomNumber: 1,
    roomType: '',
    capacityPeople: 1,
    price: 1,
    extraPrice: 1,
    checkIn: '',
    checkOut: '',
    bedType: [] as BedOption[],
  },
  discounts: [] as DiscountOption[],
  address: {
    sigungu: '',
    sido: '',
    roadName: '',
    postalCode: '',
    detailAddress: '',
  }
});

// Bed 기본 옵션 초기화
const availableBeds: BedOption[] = [
  { type: '싱글침대', width: '90~130cm', count: 0 },
  { type: '더블침대', width: '131~150cm', count: 0 },
  { type: '대형침대(킹사이즈)', width: '151~180cm', count: 0 },
  { type: '초대형 더블침대(수퍼킹사이즈)', width: '181~210cm', count: 0 },
];
form.rooms.bedType = availableBeds.map(b => ({ ...b }));

const incrementBed = (index: number) => { form.rooms.bedType[index].count++; };
const decrementBed = (index: number) => { if (form.rooms.bedType[index].count > 0) form.rooms.bedType[index].count--; };

// Step 이동
const nextStep = () => {
  const steps = Object.keys(stepTitles);
  const idx = steps.indexOf(activeStep.value);
  if (idx < steps.length - 1) activeStep.value = steps[idx + 1];
};
const prevStep = () => {
  const steps = Object.keys(stepTitles);
  const idx = steps.indexOf(activeStep.value);
  if (idx > 0) activeStep.value = steps[idx - 1];
};

// 객실 추가/삭제
const addedRooms = ref<typeof form.rooms[]>([]);
const addRoom = () => {
  addedRooms.value.push(JSON.parse(JSON.stringify(form.rooms)));
  form.rooms.roomNumber++;
};
const removeAddedRoom = (index: number) => { addedRooms.value.splice(index, 1); };

// 편의시설 체크리스트
const amenities = reactive([
  { name: 'Wi-Fi', checked: false },
  { name: '주차장', checked: false },
  { name: '수영장', checked: false },
  { name: '조식 제공', checked: false },
  { name: '스파', checked: false },
  { name: '피트니스 센터', checked: false },
  { name: '정원', checked: false },
  { name: '금연 객실', checked: false },
  { name: '에어컨', checked: false },
  { name: '바비큐 그릴', checked: false },
  { name: '사우나', checked: false },
]);

// 이미지 업로드
const uploadedImages = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => { fileInput.value?.click(); };
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = (e) => { uploadedImages.value.push(e.target?.result as string); };
    reader.readAsDataURL(files[i]);
  }
  target.value = null;
};
const removeImage = (index: number) => { uploadedImages.value.splice(index, 1); };

// 언어 체크리스트
const ranguage = reactive([
  { types: '영어', checked: false },
  { types: '중국어', checked: false },
  { types: '일본어', checked: false },
  { types: '프랑스어', checked: false },
  { types: '독일어', checked: false },
  { types: '러시아어', checked: false },
]);
const showInput = ref(false);
const newLanguage = ref('');
const addLanguage = () => {
  if (newLanguage.value.trim() !== '') {
    ranguage.push({ types: newLanguage.value.trim(), checked: false });
    newLanguage.value = '';
    showInput.value = false;
  }
};
const removeLanguage = (index: number) => { ranguage.splice(index, 1); };

// 할인 적용 계산
const calculateDiscountedPrice = (d: DiscountOption) => {
  const basePrice = Number(form.rooms.price || 0);
  const extraPrice = Number(form.rooms.extraPrice || 0);
  const persons = d.person || 1;
  const discount = d.discount || 0;
  const totalBeforeDiscount = basePrice + extraPrice * Math.max(0, persons - 1);
  return Math.round(totalBeforeDiscount * (1 - discount / 100));
};

// 제출
const submitForm = async () => {
  try {
    const payload = {
      hotelName: form.name,
      description: form.description,
      addressList: [{
        sido: form.address.sido,
        sigungu: form.address.sigungu,
        roadName: form.address.roadName,
        detailAddress: form.address.detailAddress,
        postalCode: form.address.postalCode
      }],
      images: uploadedImages.value,
      amenities: amenities.filter(a => a.checked).map(a => a.name),
      rooms: [form.rooms, ...addedRooms.value].flat().map(r => ({
        roomType: r.roomType,
        CapacityPeople: r.capacityPeople,
        price: r.price,
        extraPrice: r.extraPrice,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        bedType: Array.isArray(r.bedType)
          ? r.bedType.map(b => ({ type: b.type, width: b.width, count: b.count }))
          : r.bedType
            ? [{ type: r.bedType, width: '', count: 1 }]
            : []
      }))
    };
    // 프록시 적용
    await apiClient.post('/hotel/publishing/register', payload);
    alert('호텔 등록 완료!');
    router.push('/');
  } catch (error) {
    console.error(error);
    alert('호텔 등록 완료');
  }
};
</script>

<style>
.thead{
margin: 10px;
  gap:5px;
}

.address-input {
  margin: 5px 0; /* 위아래 5px */
  padding: 8px;
  border: 1px solid lightgrey;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.address-input:hover {
  border-color: grey;
}

.address-input:focus {
  outline: none;
  border-color: grey;
}
</style>
