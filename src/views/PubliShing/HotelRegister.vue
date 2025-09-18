<template>
  <div class="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
    <div class="w-[600px] h-[700px] p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col gap-6 mt-[15vh]">

      <!-- Step Title -->
      <div style="border-bottom:2px solid black;">
        <h3 style="margin-bottom: 5px;" class="text-center text-xl font-bold text-gray-800 dark:text-gray-100">
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
              v-model="form.hotelName"
              placeholder="숙소 이름 입력"
              unstyled
              class="w-full border-2 border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-300"
            />

          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">호텔 성급</p>
            <select v-model="form.hotelGrade" class="w-full border rounded p-2">
              <option value="">선택</option>
              <option value="1">★</option>
              <option value="2">★★</option>
              <option value="3">★★★</option>
              <option value="4">★★★★</option>
              <option value="5">★★★★★</option>
            </select>
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
              placeholder="숙소 설명 입력"
              class="w-full h-[200px] border-2 border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>
        </div>

        <!-- Step 2 : 객실 정보 -->
        <div v-if="activeStep === 'step2'" class="flex flex-col gap-6">
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">룸 유형</p>
            <select v-model="form.roomType" class="w-full border rounded p-2">
              <option value="">선택</option>
              <option value="single">싱글룸</option>
              <option value="double">더블룸</option>
            </select>
          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">침대 유형</p>
            <select v-model="form.bedType" class="w-full border rounded p-2">
              <option value="">선택</option>
              <option value="single">싱글 (100×200cm, 1인용)</option>
              <option value="superSingle">슈퍼싱글 (120×200cm, 1인용 넉넉)</option>
              <option value="double">더블 (140×200cm, 2인용 기본)</option>
              <option value="queen">퀸 (160×200cm, 호텔 표준 2인)</option>
              <option value="king">킹 (180×200cm, 넓은 2인 또는 가족)</option>
              <option value="family">패밀리 (200cm 이상, 가족 단위)</option>
            </select>
          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">최대 숙박 가능 인원</p>
            <InputText v-model="form.maxGuests" placeholder="예: 4명" class="w-full" />
          </div>
        </div>

        <!-- Step 4 : 편의시설 체크리스트 -->
        <div v-if="activeStep === 'step4'" class="flex flex-col gap-6">
          <div v-for="(amenity, index) in amenities" :key="index" class="flex items-center gap-2">
            <input type="checkbox" v-model="amenity.checked" :id="'amenity-' + index" class="w-5 h-5" />
            <label :for="'amenity-' + index" class="text-gray-700 dark:text-gray-200">
              {{ amenity.name }}
            </label>
          </div>
        </div>

        <!-- Step 5 : 체크인/체크아웃 시간 -->
        <div v-if="activeStep === 'step5'" class="flex flex-col gap-6">
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크인 시간</p>
            <InputText v-model="form.checkIn" placeholder="예: 15:00" class="w-full" />
          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">체크아웃 시간</p>
            <InputText v-model="form.checkOut" placeholder="예: 11:00" class="w-full" />
          </div>
        </div>

        <!-- Step 6 : 요금제 -->
        <div v-if="activeStep === 'step6'" class="flex flex-col gap-6">
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">1박 요금</p>
            <InputText v-model="form.pricePerNight" placeholder="예: 100000원" class="w-full" />
          </div>
          <div>
            <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">추가 인원 요금</p>
            <InputText v-model="form.extraPrice" placeholder="예: 20000원" class="w-full" />
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
          v-if="activeStep !== 'step7'"
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="w-24"
          @click="nextStep"
        />
        <Button
          v-if="activeStep === 'step7'"
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

const activeStep = ref('step1');

const stepTitles: Record<string, string> = {
  step1: '숙소 기본정보',
  step2: '객실 정보',
  step3: '추가 정보',
  step4: '편의 기능 체크리스트',
  step5: '체크인/체크아웃 시간',
  step6: '요금제 설정',
  step7: '완료',
};

const form = reactive({
  hotelName: '',
  hotelGrade: '',
  hotelType: '',
  roomType: '',
  bedType: '',
  maxGuests: '',
  checkIn: '',
  checkOut: '',
  pricePerNight: '',
  extraPrice: '',
  description: ''
});

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
]);

const steps = Object.keys(stepTitles);

const nextStep = () => {
  const idx = steps.indexOf(activeStep.value);
  if (idx < steps.length - 1) activeStep.value = steps[idx + 1];
};

const prevStep = () => {
  const idx = steps.indexOf(activeStep.value);
  if (idx > 0) activeStep.value = steps[idx - 1];
};

const submitForm = () => {
  console.log('폼 데이터:', form, amenities);
  alert('폼 제출 완료!');
};
</script>
