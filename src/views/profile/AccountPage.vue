<template>
  <div class="w-full h-full flex items-center justify-center bg-gray-50 p-6">
    <div v-if="user" class="w-full max-w-2xl">
      <PrimeCard class="shadow-xl border border-gray-200">
        <template #content>
          <div class="flex flex-col items-center text-center py-8">
            <!-- 프로필 이미지 -->
            <Gravatar
              class="rounded-full w-32 h-32 mb-6 border-4 border-blue-100"
              :email="user.email as `${string}@${string}.${string}`"
              :size="1200"
              default="identicon"
            />

            <!-- 사용자 이름 -->
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              {{ profile.name }}
            </h2>

            <!-- 역할 뱃지 -->
            <div class="mb-6">
              <span :class="getRoleStyle(authStore.userAuth?.role || '')" class="inline-block">
                {{ getRoleText(authStore.userAuth?.role || '') }}
              </span>
            </div>

            <!-- 정보 그리드 -->
            <div class="w-full max-w-md space-y-4 mb-8">
              <div class="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                <i class="pi pi-envelope text-blue-600 text-xl"></i>
                <span class="text-gray-700">{{ profile.email }}</span>
              </div>

              <div class="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                <i class="pi pi-phone text-blue-600 text-xl"></i>
                <span class="text-gray-700">{{ profile.phone }}</span>
              </div>
            </div>

            <!-- 수정하기 버튼 -->
            <div v-if="!editMode">
              <Button
                label="프로필 수정하기"
                icon="pi pi-pencil"
                class="px-8 py-3"
                @click="editMode = true"
              />
            </div>
          </div>

          <!-- 수정 모드 -->
          <div v-if="editMode" class="mt-8 pt-8 border-t">
            <h3 class="text-2xl font-semibold text-gray-800 mb-6">프로필 정보 수정</h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2">이름</label>
                <InputText v-model="editProfile.name" class="w-full" />
              </div>
              <div>
                <label class="block text-gray-700 font-medium mb-2">이메일</label>
                <InputText v-model="editProfile.email" class="w-full" />
              </div>
              <div>
                <label class="block text-gray-700 font-medium mb-2">전화번호</label>
                <InputText v-model="editProfile.phone" class="w-full" />
              </div>
              <div>
                <label class="block text-gray-700 font-medium mb-2">유저 권한</label>
                <InputText
                  :value="getRoleText(authStore.userAuth?.role || '')"
                  class="w-full"
                  disabled
                />
              </div>
            </div>
            <div class="mt-8 flex justify-end gap-4">
              <Button
                label="취소"
                severity="secondary"
                outlined
                @click="cancelEdit"
              />
              <Button
                @click="submit"
                label="변경 사항 저장"
                icon="pi pi-check"
              />
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
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

const { profile, images } = store;

const editMode = ref(false);
const editProfile = ref({ name: '', email: '', phone: '' });

onMounted(() => {
  if (user.value?.userId) {
    store.fetchProfileFromApi();
  }
  editProfile.value = { ...profile };
});

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
  return `${styleMap[role] || 'bg-gray-500'} text-white px-4 py-1 rounded-full text-sm font-semibold`;
};

const cancelEdit = () => {
  editProfile.value = { ...profile };
  editMode.value = false;
};

const submit = async () => {
  try {
    const updateDto: UserUpdateDTO = {
      name: editProfile.value.name || '',
      email: editProfile.value.email || '',
      phone: editProfile.value.phone || '',
      images: images,
    };
    await store.updateProfileApi(updateDto);
    store.updateProfile(updateDto);
    alert('성공적으로 저장되었습니다.');
    editMode.value = false;
  } catch (error) {
    console.error('저장 중 에러 발생:', error);
    alert('저장 중 문제가 발생했습니다.');
  }
};
</script>
