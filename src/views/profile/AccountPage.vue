<template>
  <div class="w-full lg:p-6 bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl py-6 px-8">
      <div v-if="user" class="flex items-center gap-2">
        <!-- 프로필 클릭 -->

        <Gravatar
          class="rounded-full w-30 h-30"
          :email="user.email as `${string}@${string}.${string}`"
          :size="1200"
          default="identicon"
        />
        <div class="flex flex-col">
          <span
            v-if="authStore.userAuth?.role !== 'customer'"
            :class="getRoleStyle(authStore.userAuth?.role || '')"
          >
            {{ getRoleText(authStore.userAuth?.role || '') }}
          </span>
        </div>

        <div class="flex-1 pt-8">
          <h2 style="margin-bottom: 5px" class="text-3xl font-bold text-gray-800 mb-2">
            {{ profile.name }}
          </h2>
          <div class="grid grid-cols-2 gap-y-1 text-gray-600">
            <div class="flex items-center">
              <i class="pi pi-envelope mr-2 text-indigo-500"></i>
              <span style="margin-left: 8px">{{ profile.email }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-phone mr-2 text-indigo-500"></i>
              <span style="margin-left: 8px">{{ profile.phone }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-lock mr-2 text-indigo-500"></i>
              <span style="margin-left: 8px">{{ profile.role }}</span>
            </div>
            <div class="flex items-center"><!--여기는 jwt토큰 번역됨-->
              <i class="pi pi-info-circle mr-2 text-indigo-500"></i>
              <span style="margin-left: 8px">유저 아이디: {{ profile.id }}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 class="text-2xl font-semibold text-gray-700 mb-6 pt-6">프로필 정보 수정</h3>
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
        <div>
          <label class="block text-gray-700 font-medium mb-2">유저 권한</label>
          <InputText v-model="profile.role" class="w-full p-inputtext-lg" disabled />
        </div>
      </div>

      <div class="mt-6 pt-6 flex justify-end gap-4">
        <Button label="취소" class="p-button-secondary p-button-outlined" @click="router.back()" />
        <Button @click="submit" label="변경 사항 저장" icon="pi pi-check" class="p-button-info" />
      </div>

      <h3 class="text-2xl font-semibold text-gray-700 mt-8 mb-6">
        내 리뷰 ({{ profile.review }}개)
      </h3>
      <div class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
        최근 작성된 리뷰가 여기에 표시됩니다.
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import { Gravatar } from '@sauromates/vue-gravatar';

import { useProfileStore, type UserUpdateDTO } from '@/stores/publishing/ProfileStore';
import { useAuthStore } from '@/stores/authStore';
import { parseJwt } from '@/utils/jwtUtils';

const router = useRouter();
const store = useProfileStore();
const authStore = useAuthStore();

const accessToken = computed(() => authStore.accessToken);
const user = computed(() => {
  if (!accessToken.value) return null;
  return parseJwt<{ userId: string }>(accessToken.value);
});

const { profile, images } = storeToRefs(store);

onMounted(() => {
  if (user.value?.userId) {
    store.fetchProfileFromApi(); // userId 기준으로 DB에서 불러오기
  }
});

// Role 한국어 변환
const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    customer: '고객',
    hotel_owner: '호텔 오너',
    admin: '관리자',
    place_admin: '장소 관리자',
    user_admin: '사용자 관리자',
  };
  return roleMap[role] || role;
};

const getRoleStyle = (role: string) => {
  const styleMap: Record<string, string> = {
    customer: 'bg-blue-500',
    hotel_owner: 'bg-emerald-500',
    admin: 'bg-purple-600',
    place_admin: 'bg-orange-500',
    user_admin: 'bg-indigo-600',
  };
  return `${styleMap[role] || 'bg-gray-500'} text-white px-2 py-0.5 rounded text-[10px] w-fit`;
};

// 이미지 업로드
const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInput.value?.click();

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      store.addImage(e.target.result as string);
    }
  };
  reader.readAsDataURL(target.files[0]);
  target.value = '';
};

const removeImage = (index: number) => store.removeImage(index);

// 저장
const submit = async () => {
  try {
    const updateDto: UserUpdateDTO = {
      name: profile.value.name || '',
      email: profile.value.email || '',
      phone: profile.value.phone || '',
      images: images.value,
    };

    await store.updateProfileApi(updateDto);

    // 로컬 스토리지에도 반영
    store.updateProfile(updateDto);

    alert('성공적으로 저장되었습니다.');
    router.back();
  } catch (error) {
    console.error('저장 중 에러 발생:', error);
    alert('저장 중 문제가 발생했습니다.');
  }
};

</script>
