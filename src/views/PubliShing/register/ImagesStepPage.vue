<script lang="ts" setup>
import Button from 'primevue/button';
import { ref } from 'vue';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

//여기 사용 안 함
const store = useRegisterStore();
const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => fileInput.value?.click();

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  for (let i = 0; i < target.files.length; i++) {
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) store.addImage(e.target.result as string);
    };
    reader.readAsDataURL(target.files[i]);
  }
  target.value = '';
};

const removeImage = (index: number) => store.removeImage(index);

const goPrev = () => router.push('/publishing/register/rooms');
const goNext = () => router.push('/publishing/register/amenities');
</script>

<template>
  <div class=" p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-4">
    <p style="margin-bottom:8px;" class="text-center justify-items-center font-semibold text-gray-700 dark:text-gray-200">객실 이미지 등록</p>

    <div @click="triggerFileInput" class="w-full h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
      <input type="file" accept="image/*" multiple ref="fileInput" @change="handleImageUpload" class="hidden" />
      <div class="text-gray-400 text-sm">클릭하여 이미지 추가</div>
    </div>

    <div style="margin-top: 12px;" class="grid grid-cols-5 gap-2 mt-4 w-full justify-items-center">
      <div v-for="(img, index) in store.images" :key="index" class="relative w-30 h-20 rounded-md overflow-hidden border">
        <img :src="img" alt="uploaded" class="w-full h-full object-cover" />
        <button @click.stop="removeImage(index)" class="absolute top-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>
