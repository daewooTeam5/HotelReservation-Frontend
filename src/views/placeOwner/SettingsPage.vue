<template>
  <div class="p-6 flex flex-col gap-6">
    <h1 class="text-2xl font-bold mb-6">
      {{ t("settingsTitle") }}
    </h1>

    <div class="bg-white dark:bg-gray-800 rounded shadow p-6 max-w-xl space-y-6 flex flex-col gap-6">
      <!-- 언어 설정 -->
      <div>
        <label class="block mb-2 font-medium">{{ t("language") }}</label>
        <Dropdown
          v-model="settings.language"
          :options="languages"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <!-- 테마 설정 -->
      <div>
        <label class="block mb-2 font-medium">{{ t("theme") }}</label>
        <Dropdown
          v-model="settings.theme"
          :options="themes"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <!-- 저장 버튼 -->
      <div class="flex justify-end gap-3">
        <Button :label="t('cancel')" class="p-button-text" @click="resetSettings" />
        <Button :label="t('save')" icon="pi pi-check" class="p-button-primary" @click="saveSettings" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";

// 상태
const settings = ref({
  language: "ko", // 기본값 한국어
  theme: "light", // 기본값 라이트
});

// 옵션
const languages = [
  { label: "한국어", value: "ko" },
  { label: "English", value: "en" },
];
const themes = [
  { label: "라이트", value: "light" },
  { label: "다크", value: "dark" },
];

// 번역 딕셔너리
const translations: Record<string, Record<string, string>> = {
  ko: {
    settingsTitle: "환경 설정",
    language: "언어",
    theme: "테마",
    cancel: "취소",
    save: "저장",
  },
  en: {
    settingsTitle: "Settings",
    language: "Language",
    theme: "Theme",
    cancel: "Cancel",
    save: "Save",
  },
};

// 번역 함수
function t(key: string) {
  return translations[settings.value.language][key] || key;
}

// 테마 적용
function applyTheme(theme: string) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// 저장
function saveSettings() {
  localStorage.setItem("userSettings", JSON.stringify(settings.value));
  applyTheme(settings.value.theme);
  alert(t("save") + " 완료!");
}

// 취소(저장된 값 복원)
function resetSettings() {
  const saved = localStorage.getItem("userSettings");
  if (saved) {
    settings.value = JSON.parse(saved);
  } else {
    settings.value = { language: "ko", theme: "light" };
  }
  applyTheme(settings.value.theme);
}

// watch: 언어/테마 변경 즉시 적용
watch(
  () => settings.value.theme,
  (newTheme) => applyTheme(newTheme),
  { immediate: true }
);

onMounted(() => {
  resetSettings();
});
</script>
