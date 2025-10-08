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

        <div class="flex-1 pt-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">{{ profile.name }}</h2>
          <div class="grid grid-cols-2 gap-y-1 text-gray-600">
            <div class="flex items-center">
              <i class="pi pi-envelope mr-2 text-indigo-500"></i>
              <span>{{ profile.email }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-phone mr-2 text-indigo-500"></i>
              <span>{{ profile.phone }}</span>
            </div>
            <div class="flex items-center">
              <i class="pi pi-lock mr-2 text-indigo-500"></i>
              <span :class="getRoleStyle(authStore.userAuth?.role || '')">
                {{ getRoleText(authStore.userAuth?.role || '') }}
              </span>
            </div>
          </div>

          <div v-if="!editMode" class="mt-6">
            <Button
              label="프로필 수정하기"
              icon="pi pi-pencil"
              class="px-8 py-3"
              @click="editMode = true"
            />
          </div>
        </div>
      </div>

      <!-- 수정 모드일 때 -->
      <div v-if="editMode" class="mt-8">
        <h3 class="text-2xl font-semibold text-gray-700 mb-6">프로필 정보 수정</h3>
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
            <InputText
              :value="getRoleText(authStore.userAuth?.role || '')"
              class="w-full p-inputtext-lg"
              disabled
            />
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <Button label="취소" class="p-button-secondary" @click="cancelEdit" />
          <Button label="저장" class="p-button-success" @click="submit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Gravatar } from '@sauromates/vue-gravatar';
import { useProfileStore } from '@/stores/publishing/ProfileStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const store = useProfileStore();
const authStore = useAuthStore();
const toast = useToast();

const accessToken = computed(() => authStore.accessToken);
const user = computed(() => {
  if (!accessToken.value) return null;
  return authStore.userAuth;
});

// ❌ 구조분해 할당으로 가져오면 반응성이 깨짐
// const { profile, images } = store;

// ✅ store에서 직접 접근
const profile = computed(() => store.profile);
const images = computed(() => store.images);

const editMode = ref(false);
const editProfile = ref({ name: '', email: '', phone: '' });
const previewImage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

onMounted(() => {
  if (user.value?.userId) {
    store.fetchProfileFromApi().then(() => {
      previewImage.value = images.value[0] || null;
      editProfile.value = {
        name: profile.value.name,
        email: profile.value.email,
        phone: profile.value.phone || ''
      };
    });
  }
});

watch(profile, (newVal) => {
  if (!editMode.value) {
    editProfile.value = {
      name: newVal.name,
      email: newVal.email,
      phone: newVal.phone || ''
    };
  }
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

// 이미지 업로드 관련
const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInput.value?.click();

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

const cancelEdit = () => {
  editProfile.value = { ...profile.value };
  editMode.value = false;
};

const submit = async () => {
  try {
    const response = await store.updateProfileApi(editProfile.value, selectedFile.value);
    const updatedUserDto = response.data?.data;

    if (updatedUserDto) {
      store.updateProfile({
        name: updatedUserDto.name,
        email: updatedUserDto.email,
        phone: updatedUserDto.phone,
      });
      previewImage.value = updatedUserDto.profileImageUrl || null;
      store.images = updatedUserDto.profileImageUrl ? [updatedUserDto.profileImageUrl] : [];
    }

    toast.add({
      severity: 'success',
      summary: '저장 완료',
      detail: '프로필이 성공적으로 저장되었습니다.',
      life: 3000
    });
    editMode.value = false;
    selectedFile.value = null;
  } catch (error) {
    console.error('저장 중 에러 발생:', error);
    toast.add({
      severity: 'error',
      summary: '저장 실패',
      detail: '저장 중 문제가 발생했습니다. 다시 시도해주세요.',
      life: 3000
    });
  }
};
</script>
