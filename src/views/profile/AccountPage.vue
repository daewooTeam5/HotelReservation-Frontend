<template>
  <div class="w-full lg:p-7 bg-gray-50 min-h-screen">
    <div class="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl py-6 px-8">
      <div v-if="user" class="flex items-center gap-2">
        <!-- 프로필 클릭 -->
        <div
          class="w-40 h-40 rounded-full overflow-hidden border border-gray-300"
          :class="{ 'cursor-pointer ring-2 ring-indigo-500': editMode }"
          @click="editMode ? triggerFileInput() : null"
        >
        <img
          v-if="previewImage"
          :src="previewImage"
          :size="1200"
          alt="프로필 이미지"
          class="w-full h-full object-cover"

        />
        <Gravatar
          v-else
          :email="user.email as `${string}@${string}.${string}`"
          :size="1200"
          default="identicon"
        />

        </div>
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          @change="handleFileChange"
          accept="image/*"
        />

        <div class="flex flex-col"></div>
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
              <i class="pi pi-lock mr-2 text-indigo-500 mr-2! "></i>
              <span :class="getRoleStyle(authStore.userAuth?.role || '')">
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
        </div>
      </div>

      <!-- 수정 모드가 아닐 때: 프로필 카드만, 수정하기 버튼만 노출 -->
      <div v-if="!editMode" class="flex justify-end mt-6 ">
        <Button label="수정하기" class="p-button-info  hover:shadow-[0_0_12px_rgba(99,102,241,0.7)] transition-all duration-200" @click="editMode = true" />
      </div>

      <!-- 수정 모드일 때: 인풋 폼 노출 -->
      <div v-if="editMode">
        <h3 style="margin-bottom: 6px;" class="text-2xl font-semibold text-gray-700 mb-6 pt-6">프로필 정보 수정</h3>
        <div class="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">이름</label>
            <InputText v-model="editProfile.name" class="w-full p-inputtext-lg" />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">이메일</label>
            <InputText v-model="editProfile.email" class="w-full p-inputtext-lg" />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">전화번호</label>
            <InputText v-model="editProfile.phone" class="w-full p-inputtext-lg" />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">유저 권한</label>
            <InputText :value="getRoleText(authStore.userAuth?.role || '')" class="w-full p-inputtext-lg" disabled />
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
    store.fetchProfileFromApi().then(() => {
      previewImage.value = images.value[0] || null;
      editProfile.value = { ...profile.value };
    });
  }
});
watch(profile, (newVal) => {
  if (!editMode.value) {
    editProfile.value = { ...newVal };
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

const selectedFile = ref<File | null>(null);

const previewImage = ref<string | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;

  selectedFile.value = target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target?.result as string;
  };
  reader.readAsDataURL(target.files[0]);
};


const removeImage = (index: number) => store.removeImage(index);

const cancelEdit = () => {
  editProfile.value = { ...profile };
  editMode.value = false;
};

const submit = async () => {
  try {
    // API 함수로 수정된 프로필 정보와 선택된 파일을 전달합니다.
    const response = await store.updateProfileApi(editProfile.value, selectedFile.value);

    // 1. API 응답으로 받은 최신 사용자 데이터(DTO)를 가져옵니다.
    const updatedUserDto = response.data?.data;

    if (updatedUserDto) {
      // 2. Pinia 스토어의 상태를 업데이트합니다. (이름, 이메일 등 텍스트 정보)
      store.updateProfile({
        name: updatedUserDto.name,
        email: updatedUserDto.email,
        phone: updatedUserDto.phone,
      });

      // 3. 컴포넌트의 미리보기 이미지(previewImage)를 새로 받은 URL로 교체합니다.
      //    이 코드가 화면의 이미지를 즉시 변경해줍니다.
      previewImage.value = updatedUserDto.profileImageUrl;

      // 4. (선택) Pinia 스토어의 이미지 리스트 상태도 업데이트
      if (updatedUserDto.profileImageUrl) {
        store.images = [updatedUserDto.profileImageUrl];
      } else {
        store.images = [];
      }
    }

    alert('성공적으로 저장되었습니다.');
    editMode.value = false;
    selectedFile.value = null; // 파일 선택 상태 초기화

  } catch (error) {
    console.error('저장 중 에러 발생:', error);
    alert('저장 중 문제가 발생했습니다.');
  }
};
</script>
