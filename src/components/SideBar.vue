<template>
  <aside
    class="w-64 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#1e293b]
           text-white flex flex-col border-r border-gray-700"
  >

    <div class="p-6 text-lg font-bold border-b border-gray-700 flex items-center space-x-2">
      <i class="pi pi-user text-purple-400"></i>
      <span style="margin-left: 5px">안녕하세요 {{ profile.name }}님</span>
    </div>


    <PrimeMenu
      nostyled
      :model="items" style="font-size: 17px;" class="flex-1" />


    <span style="font-size: 14px;" class="px-5 py-5 border-t border-gray-700 text-xs text-gray-400">
      ⓒ 2025 Hotel Reservation<br />v1.0.0
    </span>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore.ts';
import { apiClient } from '@/utils/axiosClient.ts';
import { useProfileStore} from '@/stores/publishing/ProfileStore';
import { storeToRefs } from 'pinia';

const store = useProfileStore();
const { profile } = storeToRefs(store);

const router = useRouter();
const authStore = useAuthStore();
const items = ref([
  {
    label: '내 계정',
    items: [
      {
        label: '계정',
        icon: 'pi pi-user',
        command: () => router.push('/profile/account'),
      },
      {
        label: '결제 내역',
        icon: 'pi pi-credit-card',
        command: () => router.push('/profile/payments'),
      },
      {
        label: '위시리스트',
        icon: 'pi pi-heart',
        command: () => router.push('/profile/wishlist'),
      },
      {
        label: '문의',
        icon: 'pi pi-comments',
        command: () => router.push('/profile/comment'),
      },
      {
        label: '쿠폰',
        icon: 'pi pi-ticket',
        command: () => router.push('/auth/coupon'),
      },
      {
        label: '포인트',
        icon: 'pi pi-circle',
        command: () => router.push('/auth/point'),
      },
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
      {
        label: '설정',
        icon: 'pi pi-cog',
        command: () => router.push('/profile/settings'),
      },
      {
        label: '로그아웃',
        icon: 'pi pi-sign-out',
        command: async () => {
          await apiClient.post('../logout');
          authStore.setAccessToken(null);
          await router.push('/auth/signin');
        },
      },
    ],
  },
]);
</script>
<style scoped>
::v-deep(.p-menuitem-link) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  font-size: 17px !important;
}
</style>
