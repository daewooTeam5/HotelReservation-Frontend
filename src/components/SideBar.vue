<template>
  <ConfirmDialog></ConfirmDialog>
  <aside
    class="w-64 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#1e293b] text-white flex flex-col border-r border-gray-700 h-full"
  >
    <!-- 헤더 영역 (모바일 닫기 버튼 포함) -->
    <div class="p-6 text-lg font-bold border-b border-gray-700 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <i class="pi pi-user text-purple-400"></i>
        <span style="margin-left: 5px">안녕하세요 {{ profile.name }}님</span>
      </div>
      <!-- 모바일 닫기 버튼 -->
      <button
        @click="$emit('close')"
        class="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
      >
        <i class="pi pi-times text-white"></i>
      </button>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
      <div
        v-for="item in items"
        :key="item.label"
        @click="handleItemClick(item)"
        class="flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300"
        :style="{
          backgroundColor: activeItem === item.label ? '#4f46e5' : 'transparent',
          boxShadow: activeItem === item.label ? '4 0 10px #6366f1' : 'none',
        }"
        @mouseover="hoverItem = item.label"
        @mouseleave="hoverItem = null"
        @mousedown="activeItem = item.label"
      >
        <i
          :class="[item.icon, 'mr-3', 'transition-all duration-300']"
          :style="{
            marginRight: '6px',
            color: hoverItem === item.label ? '#a5b4fc' : '#9ca3af',
            textShadow: hoverItem === item.label ? '0 0 6px #818cf8' : 'none',
          }"
        ></i>
        <span
          class="transition-all duration-300"
          :style="{
            color: hoverItem === item.label || activeItem === item.label ? '#ffffff' : '#d1d5db',
            textShadow:
              hoverItem === item.label || activeItem === item.label ? '0 0 6px #818cf8' : 'none',
          }"
        >
          {{ item.label }}
        </span>
      </div>
    </nav>

    <!-- 하단 정보 -->
    <span style="font-size: 14px" class="px-5 py-5 border-t border-gray-700 text-xs text-gray-400">
      ⓒ 2025 Hotel Reservation<br />v1.0.0
    </span>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/utils/axiosClient';
import { useProfileStore } from '@/stores/publishing/ProfileStore';
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';

const { profile } = storeToRefs(useProfileStore());
const router = useRouter();
const authStore = useAuthStore();
const confirm = useConfirm();

const hoverItem = ref<string | null>(null);
const activeItem = ref<string | null>(null);

const emit = defineEmits<{
  close: [];
}>();

const handleItemClick = (item: any) => {
  item.command();
  emit('close'); // 모바일에서 메뉴 클릭 시 사이드바 닫기
};

const handleLogout = () => {
  confirm.require({
    message: '정말 로그아웃 하시겠습니까?',
    header: '로그아웃 확인',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '취소',
    acceptLabel: '로그아웃',
    accept: async () => {
      try {
        await apiClient.post('/v1/auth/logout');
        authStore.setAccessToken(null);
        await router.push('/auth/signin');
      } catch (error) {
        console.error('로그아웃 실패:', error);
      }
    },
    reject: () => {
      // 취소 시 아무 동작 안함
    }
  });
};

const items = [
  { label: '계정', icon: 'pi pi-user', command: () => router.push('/profile/account') },
  {
    label: '결제 내역',
    icon: 'pi pi-credit-card',
    command: () => router.push('/profile/payments'),
  },
  { label: '위시리스트', icon: 'pi pi-heart', command: () => router.push('/profile/wishlist') },
  { label: '문의', icon: 'pi pi-comments', command: () => router.push('/profile/comment') },
  { label: '쿠폰', icon: 'pi pi-ticket', command: () => router.push('/auth/coupon') },
  { label: '포인트', icon: 'pi pi-circle', command: () => router.push('/auth/point') },
  {
    label: '내 리뷰 조회',
    icon: 'pi pi-thumbs-up',
    command: () => router.push('/profile/review-list'),
  },
  {
    label: '숙박업소 업주신청',
    icon: 'pi pi-headphones',
    command: () => router.push('/profile/owner-request'),
  },
  { label: '설정', icon: 'pi pi-cog', command: () => router.push('/profile/settings') },
  {
    label: '로그아웃',
    icon: 'pi pi-sign-out',
    command: handleLogout,
  },
];
</script>
<style scoped></style>
