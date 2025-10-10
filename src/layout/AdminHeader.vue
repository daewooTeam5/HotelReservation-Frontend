<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center justify-between px-6 relative"
  >
    <!-- 사이드바 토글 버튼 -->
    <button
      @click="$emit('toggleSidebar')"
      class="p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 group"
    >
      <i
        class="pi pi-bars text-gray-700 group-hover:text-gray-900 transition-colors duration-200"
      ></i>
    </button>

    <!-- 타이틀 (클릭 시 대시보드 이동) -->
    <h1
      class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      @click="router.push('/admin')"
    >
      Hotel Reservation
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="flex items-center space-x-3 relative">
      <!-- 🟦 전체 공지 버튼 추가 -->
      <button
        @click="showModal = true"
        class="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <i class="pi pi-megaphone"></i>
        <span>전체 공지</span>
      </button>

      <!-- 기존 프로필 -->
      <UserProfile type="admin" />
    </div>

    <!-- 📢 전체 공지 모달 -->
    <Dialog
      v-model:visible="showModal"
      header="전체 공지 보내기"
      modal
      class="w-[90%] max-w-md"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="text-sm text-gray-600 font-medium">제목</label>
          <InputText
            v-model="noticeTitle"
            placeholder="공지 제목을 입력하세요"
            class="w-full"
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 font-medium">내용</label>
          <Textarea
            v-model="noticeBody"
            rows="4"
            placeholder="공지 내용을 입력하세요"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button label="취소" class="p-button-text" @click="showModal = false" />
        <Button label="전송" icon="pi pi-send" @click="sendNotice" autofocus />
      </template>
    </Dialog>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import UserProfile from '@/components/common/UserProfile.vue';
import { useAuthStore } from '@/stores/authStore.ts';
import type { UserDto } from '@/types/users.ts';
import { onMounted, ref } from 'vue';
import { parseJwt } from '@/utils/jwtUtils.ts';
import { apiClient } from '@/utils/axiosClient.ts';

// 🟦 PrimeVue UI 추가 import
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

// 🟦 공지 모달 상태
const showModal = ref(false);
const noticeTitle = ref('');
const noticeBody = ref('');

// 🟦 전체 공지 전송 함수
const sendNotice = async () => {
  if (!noticeTitle.value || !noticeBody.value) {
    alert('제목과 내용을 입력하세요.');
    return;
  }

  try {
    await apiClient.post('/admin/notice', {
      title: noticeTitle.value,
      body: noticeBody.value
    });
    alert('전체 공지가 발송되었습니다.');
    showModal.value = false;
    noticeTitle.value = '';
    noticeBody.value = '';
  } catch (e) {
    console.error('공지 발송 실패:', e);
    alert('공지 발송 중 오류가 발생했습니다.');
  }
};

// 🟨 기존 코드 유지
const router = useRouter();
const { setAccessToken, accessToken, userAuth, getAccessToken } = useAuthStore();

// 사용자 정보 추출
const user = ref<UserDto | null>(null);
if (accessToken) {
  user.value = parseJwt<UserDto>(accessToken);
}

// 상태
const isProfileMenuOpen = ref(false);
const profileRef = ref<HTMLElement | null>(null);

// 토글 함수
const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

// 네비게이션 함수
const navigateToProfile = () => {
  router.push('/admin/profile');
  isProfileMenuOpen.value = false;
};

const navigateToSettings = () => {
  router.push('/admin/settings');
  isProfileMenuOpen.value = false;
};

// 로그아웃
const logout = async () => {
  try {
    await apiClient.post('../logout', null, { withCredentials: true });
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('placeId');
    router.push('/login');
  } catch (e) {
    console.error('로그아웃 실패:', e);
  } finally {
    isProfileMenuOpen.value = false;
  }
};

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (profileRef.value && !profileRef.value.contains(target)) {
    isProfileMenuOpen.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('click', handleClickOutside);
});

defineEmits<{
  toggleSidebar: []
}>();
</script>
