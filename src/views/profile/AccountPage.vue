<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <div class="bg-white w-full p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
      <!-- 헤더 -->
      <div class="mb-6!">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2!">내 계정</h1>
        <p class="text-gray-600 text-sm">프로필 정보를 확인하고 수정하세요.</p>
      </div>

      <div v-if="user" class="space-y-6">
        <!-- 프로필 카드 -->
        <div class="border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
            <!-- 프로필 이미지 -->
            <div
              class="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0"
              :class="{ 'cursor-pointer ring-2 ring-blue-500': editMode }"
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
                :size="400"
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

            <!-- 프로필 정보 -->
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 mb-3!">{{ user.name }}</h2>
              <div class="space-y-2 flex flex-col gap-1">
                <div class="flex items-center gap-2 text-gray-700">
                  <i class="pi pi-envelope text-blue-600"></i>
                  <span>{{ user.email }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-700">
                  <i class="pi pi-phone text-blue-600"></i>
                  <span>{{ user.phone || '전화번호 미등록' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-shield text-blue-600"></i>
                  <span :class="getRoleStyle(user.role || '')">
                    {{ getRoleText(user.role || '') }}
                  </span>
                </div>
              </div>

              <div v-if="!editMode" class="mt-4!">
                <Button
                  label="프로필 수정"
                  icon="pi pi-pencil"
                  severity="info"
                  @click="startEdit"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 수정 모드 -->
        <div v-if="editMode" class="border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
          <h3 class="text-xl font-bold text-gray-800 mb-4!">프로필 정보 수정</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-gray-700">이름 <span class="text-red-500">*</span></label>
              <InputText v-model="editProfile.name" placeholder="이름을 입력하세요" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-gray-700">이메일 <span class="text-red-500">*</span></label>
              <InputText v-model="editProfile.email" type="email" placeholder="이메일을 입력하세요" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-gray-700">전화번호</label>
              <InputText v-model="editProfile.phone" placeholder="전화번호를 입력하세요" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-gray-700">사용자 권한</label>
              <InputText
                :value="getRoleText(user.role || '')"
                disabled
                class="bg-gray-100"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6!">
            <Button label="취소" severity="secondary" outlined @click="cancelEdit" />
            <Button label="저장" severity="success" icon="pi pi-check" @click="submit" :loading="saving" />
          </div>
        </div>
      </div>

      <!-- 로딩/에러 상태 -->
      <div v-else class="text-center py-16">
        <i class="pi pi-spin pi-spinner text-4xl text-gray-400 mb-3!"></i>
        <p class="text-gray-600">프로필 정보를 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Gravatar } from '@sauromates/vue-gravatar';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue/usetoast';
import { apiClient } from '@/utils/axiosClient';

const authStore = useAuthStore();
const toast = useToast();

// authStore.userAuth에서 직접 정보 가져오기
const user = computed(() => authStore.userAuth);

const editMode = ref(false);
const saving = ref(false);
const editProfile = ref({ name: '', email: '', phone: '' });
const previewImage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

// 프로필 이미지 초기화
if (user.value?.profileImageUrl) {
  previewImage.value = user.value.profileImageUrl;
}

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
    customer: 'bg-blue-100 text-blue-800 border border-blue-200',
    hotel_owner: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    admin: 'bg-purple-100 text-purple-800 border border-purple-200',
    place_admin: 'bg-orange-100 text-orange-800 border border-orange-200',
    user_admin: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  };
  return `${styleMap[role] || 'bg-gray-100 text-gray-800 border border-gray-200'} px-3 py-1 rounded-full text-xs font-semibold`;
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

const startEdit = () => {
  if (!user.value) return;
  editProfile.value = {
    name: user.value.name,
    email: user.value.email,
    phone: user.value.phone || ''
  };
  editMode.value = true;
};

const cancelEdit = () => {
  editMode.value = false;
  selectedFile.value = null;
  previewImage.value = user.value?.profileImageUrl || null;
};

const submit = async () => {
  if (!editProfile.value.name || !editProfile.value.email) {
    toast.add({
      severity: 'warn',
      summary: '입력 오류',
      detail: '이름과 이메일은 필수 항목입니다.',
      life: 3000
    });
    return;
  }

  saving.value = true;
  try {
    const dto = {
      name: editProfile.value.name,
      email: editProfile.value.email,
      phone: editProfile.value.phone || '',
    };

    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (selectedFile.value) {
      formData.append('file', selectedFile.value);
    }


    const response = await apiClient.put('/v1/users/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // 액세스 토큰 갱신 (업데이트된 정보가 토큰에 반영됨)
    const tokenResponse = await apiClient.post('/v1/auth/token');
    authStore.setAccessToken(tokenResponse.data.data.accessToken);

    // 프리뷰 이미지 업데이트
    if (response.data.data?.profileImageUrl) {
      previewImage.value = response.data.data.profileImageUrl;
    }

    toast.add({
      severity: 'success',
      summary: '저장 완료',
      detail: '프로필이 성공적으로 저장되었습니다.',
      life: 3000
    });

    editMode.value = false;
    selectedFile.value = null;
  } catch (error: any) {
    console.error('저장 중 에러 발생:', error);
    toast.add({
      severity: 'error',
      summary: '저장 실패',
      detail: error?.response?.data?.message || '저장 중 문제가 발생했습니다. 다시 시도해주세요.',
      life: 3000
    });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
</style>
