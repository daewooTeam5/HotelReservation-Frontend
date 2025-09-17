<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">숙소 등록 요청</h1>

    <div class="bg-white rounded shadow p-6 space-y-4">
      <!-- 숙소명 -->
      <div>
        <label class="block mb-1 font-medium">숙소명</label>
        <InputText v-model="form.name" class="w-full" />
      </div>

      <!-- 주소 -->
      <div>
        <label class="block mb-1 font-medium">주소</label>
        <div class="flex gap-2">
          <Button label="주소 검색" class="p-button-outlined" @click="openDaumPostcode" />
          <InputText v-model="form.address" class="flex-1" />
        </div>
      </div>

      <!-- 설명 -->
      <div>
        <label class="block mb-1 font-medium">설명</label>
        <Textarea v-model="form.description" rows="3" class="w-full" />
      </div>

      <!-- 체크인/체크아웃 -->
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block mb-1 font-medium">체크인</label>
          <Dropdown v-model="form.checkIn" :options="timeOptions" class="w-full" />
        </div>
        <div class="flex-1">
          <label class="block mb-1 font-medium">체크아웃</label>
          <Dropdown v-model="form.checkOut" :options="timeOptions" class="w-full" />
        </div>
      </div>

      <!-- 이미지 업로드 -->
      <div>
        <label class="block mb-1 font-medium">이미지</label>
        <FileUpload mode="basic" name="image" url="/upload" accept="image/*" />
      </div>

      <!-- 버튼 -->
      <div class="flex justify-end gap-3 mt-6">
        <Button label="취소" class="p-button-text" @click="$router.push('/owner/place')" />
        <Button label="등록 요청" icon="pi pi-check" class="p-button-primary" @click="submitRequest" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import FileUpload from "primevue/fileupload";
import Button from "primevue/button";

const form = ref({
  name: "",
  address: "",
  description: "",
  checkIn: "15:00",
  checkOut: "11:00",
});

const timeOptions = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

const submitRequest = () => {
  alert("숙소 등록 요청이 제출되었습니다.");
};

const openDaumPostcode = () => {
  new (window as any).daum.Postcode({
    oncomplete: (data: any) => {
      form.value.address = data.address;
    },
  }).open();
};
</script>

<!-- 다음 우편번호 API -->
<script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
