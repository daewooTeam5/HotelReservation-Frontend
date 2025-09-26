<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">환경 설정</h1>

    <div class="bg-white rounded shadow p-6 max-w-xl space-y-6">
      <!-- 언어 설정 -->
      <div>
        <label class="block mb-2 font-medium">언어</label>
        <Dropdown v-model="settings.language" :options="languages" class="w-full" />
      </div>

      <!-- 테마 설정 -->
      <div>
        <label class="block mb-2 font-medium">테마</label>
        <Dropdown v-model="settings.theme" :options="themes" class="w-full" />
      </div>

      <!-- 알림 설정 -->
      <div>
        <label class="block mb-2 font-medium">알림 수신</label>
        <div class="flex flex-col gap-2">
          <div>
            <Checkbox inputId="popup" value="팝업" v-model="settings.notifications" />
            <label for="popup" class="ml-2">팝업</label>
          </div>
          <div>
            <Checkbox inputId="email" value="이메일" v-model="settings.notifications" />
            <label for="email" class="ml-2">이메일</label>
          </div>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <div class="flex justify-end gap-3">
        <Button label="취소" class="p-button-text" />
        <Button label="저장" icon="pi pi-check" class="p-button-primary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";

const settings = ref({
  language: "한국어",
  theme: "라이트",
  notifications: ["팝업"],
});

const languages = ["한국어", "영어"];
const themes = ["라이트", "다크"];
</script>


