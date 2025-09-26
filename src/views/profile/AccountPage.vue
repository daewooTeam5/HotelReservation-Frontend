<template>
  <div class="w-full lg:p-6 bg-gray-50 min-h-screen">

    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl py-6 px-8">

      <div class="flex items-start gap-8 pb-4 mb-6">

        <div class="flex flex-col items-center relative">
          <div
            v-if="store.images.length > 0"
            :style="{
              'background-image': 'url(' + store.images[0] + ')',
              'background-size': 'cover',
              'background-position': 'center',
              'background-repeat': 'no-repeat',
              'border-radius': '50%' // 원형을 만들기 위한 border-radius
            }"
            class="w-40 h-40 border-2 border-solid border-gray-300 flex items-center justify-center relative overflow-hidden"
          >
            <button
              @click.stop="removeImage(0)"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              title="이미지 제거"
            >
              &times;
            </button>
          </div>
          <div
            v-else
            @click="triggerFileInput"
            class="w-40 h-40 border-2 border-dashed rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
            style="border-radius:50%;"
          >
            <input type="file" accept="image/*" ref="fileInput" @change="handleImageUpload" class="hidden" />
            <div class="text-gray-400 text-sm">클릭하여 이미지 추가</div>
          </div>

          <div v-if="store.images.length > 0" @click="triggerFileInput" class="mt-2 text-blue-500 cursor-pointer text-sm hover:underline">
            이미지 변경
          </div>

        </div>

        <div class="flex-1 pt-2">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">{{ profile.name }}</h2>
          <div class="grid grid-cols-2 gap-y-1 text-gray-600">
            <div class="flex items-center">
              <i class="pi pi-envelope mr-2 text-indigo-500"></i>
              <span style="margin-left: 5px;">{{ profile.email }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-phone mr-2 text-indigo-500"></i>
              <span style="margin-left: 5px;">{{ profile.phone }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-lock mr-2 text-indigo-500"></i>
              <span style="margin-left: 5px;">{{ profile.role }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-calendar mr-2 text-indigo-500"></i>
              <span style="margin-left: 5px;">가입일: {{ profile.createDate }}</span>
            </div>
          </div>
        </div>

      </div>

      <h3 class="text-2xl font-semibold text-gray-700 mb-6 border-t pt-6">프로필 정보 수정</h3>
      <div class="grid md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-2">이름</label>
          <InputText v-model="profile.name" class="w-full p-inputtext-lg" />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-2">이메일</label>
          <InputText v-model="profile.email" class="w-full p-inputtext-lg" />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-2">전화번호</label>
          <InputText v-model="profile.phone" class="w-full p-inputtext-lg" />
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-gray-700 font-medium">유저 권한</label>
            <button
              class=" bg-blue-500 hover:bg-blue-600 text-white rounded shadow-md transition"
            >
              권한 요청
            </button>
          </div>

          <InputText
            v-model="profile.role"
            class="w-full p-inputtext-lg"
            disabled
          />
        </div>
      </div>

      <div class="mt-6 pt-6 flex justify-end gap-4">
        <Button label="취소" class="p-button-secondary p-button-outlined" />
        <Button @click="submit" label="변경 사항 저장" icon="pi pi-check" class="p-button-info" />
      </div>

      <h3 class="text-2xl font-semibold text-gray-700 mt-8 mb-6"> 내 리뷰 ({{profile.review}}개)</h3>

      <div style="margin-top:6px;" class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
        최근 작성된 리뷰가 여기에 표시됩니다.
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue"; // onMounted를 import 합니다.
import { useRouter } from 'vue-router';
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useRegisterStore } from '@/stores/publishing/ProfileStore.ts';

const router = useRouter();
const store = useRegisterStore();


const profile = ref({
  name: "",
  email: "",
  phone: "",
  role: "",
  createDate: "",
  review: 0
});

const mockServerData = {//더미데이터
  name: "관리자",
  email: "admin@hotel.com",
  phone: "010-1234-5678",
  role: "admin",
  createDate: "2025-09-26 19:18",
  review: 6
};

onMounted(() => {
  console.log("페이지가 열렸습니다. 서버에서 프로필 데이터를 가져옵니다...");

  profile.value = { ...mockServerData }; // 서버에서 가져온 데이터로 폼을 채웁니다.
});

const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInput.value?.click();
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  store.removeImage(0);
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      store.addImage(e.target.result as string);
    }
  };
  reader.readAsDataURL(target.files[0]);
  target.value = '';
};
const removeImage = (index: number) => {
  store.removeImage(index);
};



const submit = async () => {
  try {
    console.log("서버로 데이터를 전송하여 저장합니다:", profile.value);


    Object.assign(mockServerData, profile.value);

    await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션

    alert('성공적으로 저장되었습니다.');
    router.back();

  } catch (error) {//테스트 단계
    console.error("저장:", error);
    alert('저장.');
    router.back();
  }
}
</script>
