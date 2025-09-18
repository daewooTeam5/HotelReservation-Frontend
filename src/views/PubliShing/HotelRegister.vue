<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="card w-full max-w-3xl p-6 bg-white dark:bg-gray-800 rounded shadow-lg">
      <!-- Stepper -->
      <Stepper v-model:value="activeStep" class="w-full">
        <Step value="step1" label="이용약관 동의" />
        <Step value="step2" label="숙소 기본정보 제공" />
        <Step value="step3" label="객실 정보 등록" />
        <Step value="step4" label="편의 기능 체크리스트" />
        <Step value="step5" label="숙소 이용수칙 설정" />
        <Step value="step6" label="요금제 설정" />
        <Step value="step7" label="환영합니다" />
      </Stepper>

      <!-- Step Content -->
      <div class="mt-4">
        <!-- Step 1 -->
        <div v-if="activeStep === 'step1'">
          <div class="border p-4 rounded bg-gray-50 dark:bg-gray-700">
            이용약관 내용 표시
          </div>
          <div class="flex justify-end mt-4">
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activeStep='step2'" />
          </div>
        </div>

        <!-- Step 2 -->
        <div v-if="activeStep === 'step2'" class="flex flex-col space-y-4">
          <label>숙소 이름</label>
          <PrimeInputText v-model="form.hotelName" placeholder="숙소 이름 입력" />
          <label>설명</label>
          <textarea v-model="form.description" placeholder="설명 입력" class="border rounded p-2"></textarea>
          <div class="flex justify-between mt-4">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep='step1'" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activeStep='step3'" />
          </div>
        </div>

        <!-- Step 3 -->
        <div v-if="activeStep === 'step3'" class="flex flex-col space-y-4">
          객실 정보 입력 폼
          <div class="flex justify-between mt-4">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep='step2'" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activeStep='step4'" />
          </div>
        </div>

        <!-- Step 4 -->
        <div v-if="activeStep === 'step4'" class="flex flex-col space-y-2">
          <div v-for="(amenity, index) in amenities" :key="index" class="flex items-center space-x-2">
            <input type="checkbox" v-model="amenity.checked" :id="'amenity-' + index" class="w-4 h-4" />
            <label :for="'amenity-' + index">{{ amenity.name }}</label>
          </div>
          <div class="flex justify-between mt-4">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep='step3'" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activeStep='step5'" />
          </div>
        </div>

        <!-- Step 5 -->
        <div v-if="activeStep === 'step5'" class="flex flex-col space-y-4">
          숙소 이용수칙 설정 폼
          <div class="flex justify-between mt-4">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep='step4'" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activeStep='step6'" />
          </div>
        </div>

        <!-- Step 6 -->
        <div v-if="activeStep === 'step6'" class="flex flex-col space-y-4">
          요금제 설정 폼
          <div class="flex justify-between mt-4">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep='step5'" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activeStep='step7'" />
          </div>
        </div>

        <!-- Step 7 -->
        <div v-if="activeStep === 'step7'" class="flex flex-col space-y-4">
          등록 완료 메시지
          <div class="flex justify-between mt-4">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activeStep='step6'" />
            <Button label="Submit" icon="pi pi-check" @click="submitForm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const activeStep = ref('step1');

const form = reactive({
  hotelName: '',
  description: '',
});


const submitForm = async () => {
  alert('폼 제출 (예시)');
};
</script>

<style scoped>
.card {
  max-width: 800px;
}
</style>
