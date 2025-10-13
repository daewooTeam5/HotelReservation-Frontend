<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center px-4 lg:px-6 relative"
  >
    <!-- 모바일 햄버거 메뉴 -->
    <button
      @click="$emit('toggleSidebar')"
      class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors mr-3"
    >
      <i class="pi pi-bars text-xl text-gray-700"></i>
    </button>

    <!-- 가운데 타이틀 -->
    <h1
      class="absolute left-1/2 transform -translate-x-1/2 text-base md:text-2xl lg:text-3xl font-bold
             bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
             cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      @click="router.push('/admin')"
    >
      <span class="hidden md:inline">Hotel Reservation Admin</span>
      <span class="md:hidden">Admin</span>
    </h1>

    <!-- 오른쪽 영역 -->
    <div class="absolute right-4 lg:right-6 flex items-center space-x-3">
      <!-- 전체 공지 버튼 -->
      <button
        @click="showModal = true"
        class="hidden mr-1! md:flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <i class="pi pi-megaphone"></i>
        <span>전체 공지</span>
      </button>

      <!-- 모바일 전체 공지 버튼 (아이콘만) -->
      <button
        @click="showModal = true"
        class="md:hidden mr-1! w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <i class="pi pi-megaphone"></i>
      </button>

      <!-- 프로필 -->
      <UserProfile type="admin" />
    </div>

    <!-- 전체 공지 모달 -->
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
import { ref } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { useToast } from 'primevue';

const router = useRouter();
const toast = useToast();

defineEmits<{
  toggleSidebar: [];
}>();

// 공지 모달 상태
const showModal = ref(false);
const noticeTitle = ref('');
const noticeBody = ref('');

// 전체 공지 전송 함수
const sendNotice = async () => {
  if (!noticeTitle.value || !noticeBody.value) {
    toast.add({
      severity: 'warn',
      summary: '입력 필요',
      detail: '제목과 내용을 입력하세요.',
      life: 3000
    });
    return;
  }

  try {
    await apiClient.post('/v1/admin/notice', {
      title: noticeTitle.value,
      body: noticeBody.value
    });

    toast.add({
      severity: 'success',
      summary: '전송 완료',
      detail: '전체 공지가 전송되었습니다.',
      life: 3000
    });

    showModal.value = false;
    noticeTitle.value = '';
    noticeBody.value = '';
  } catch (error) {
    console.error('공지 전송 실패:', error);
    toast.add({
      severity: 'error',
      summary: '전송 실패',
      detail: '공지 전송에 실패했습니다.',
      life: 3000
    });
  }
};
</script>
