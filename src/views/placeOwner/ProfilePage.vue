<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">내 프로필</h1>

    <div class="bg-white rounded shadow p-6 max-w-xl">
      <!-- 프로필 이미지 -->
      <div class="flex items-center gap-6 mb-6">
        <img
          src="https://via.placeholder.com/100"
          alt="프로필 이미지"
          class="w-24 h-24 rounded-full shadow"
        />
        <div>
          <h2 class="text-xl font-semibold">{{ profile.name }}</h2>
          <p class="text-gray-600">{{ profile.email }}</p>
          <p class="text-gray-600">{{ profile.phone }}</p>
        </div>
      </div>

      <!-- 수정 폼 -->
      <div class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">이름</label>
          <InputText v-model="profile.name" class="w-full" />
        </div>
        <div>
          <label class="block mb-1 font-medium">이메일</label>
          <InputText v-model="profile.email" class="w-full" />
        </div>
        <div>
          <label class="block mb-1 font-medium">전화번호</label>
          <InputText v-model="profile.phone" class="w-full" />
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <Button label="취소" class="p-button-text" />
        <Button label="저장" icon="pi pi-check" class="p-button-primary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const profile = ref({
  name: "관리자",
  email: "admin@hotel.com",
  phone: "010-1234-5678",
});
</script>
