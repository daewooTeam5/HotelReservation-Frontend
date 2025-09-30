<script setup lang="ts">
import { ref, computed } from 'vue';
import Menu from 'primevue/menu';
import { Gravatar } from '@sauromates/vue-gravatar';
import { useAuthStore } from '@/stores/authStore';
import type { UserDto } from '@/types/users';
import { parseJwt } from '@/utils/jwtUtils';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';

const router = useRouter();
const menu = ref();
const authStore = useAuthStore();

const props = defineProps<{
  type: 'user' | 'admin'
}>()

const accessToken = computed(() => authStore.accessToken);
const user = computed<UserDto | null>(() => {
  if (!accessToken.value) return null;
  return parseJwt<UserDto>(accessToken.value);
});

// Role 한국어 변환 함수
const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    'customer': '고객',
    'hotel_owner': '호텔 오너',
    'admin': '관리자',
    'place_admin': '장소 관리자',
    'user_admin': '사용자 관리자'
  };
  return roleMap[role] || role;
};

// Role에 따른 색상 설정
const getRoleStyle = (role: string) => {
  const styleMap: Record<string, string> = {
    'customer': 'bg-blue-500',
    'hotel_owner': 'bg-emerald-500',
    'admin': 'bg-purple-600',
    'place_admin': 'bg-orange-500',
    'user_admin': 'bg-indigo-600'
  };
  return `${styleMap[role] || 'bg-gray-500'} text-white px-2 py-0.5 rounded text-[10px] w-fit`;
};
const adminItems=[
  {
    label: '로그아웃',
    icon: 'pi pi-sign-out',
    command: async () => {
      await apiClient.post('../logout');
      authStore.setAccessToken(null);
      await router.push('/auth/signin');
    }
  }
]

const profileItems = [
  {
    label: '계정',
    icon: 'pi pi-user',
    command: () => router.push('/profile/account')
  },
  {
    label: '결제 내역',
    icon: 'pi pi-credit-card',
    command: () => router.push('/profile/payments')
  },
  {
    label: '위시리스트',
    icon: 'pi pi-heart-fill',
    command: () => router.push('/profile/wishlist')
  },
  {
    label: '설정',
    icon: 'pi pi-cog',
    command: () => router.push('/profile/settings')
  },
  {
    label: '쿠폰',
    icon: 'pi pi-ticket',
    command: () => router.push('/auth/coupon?type=all')
  },
  {
    label: '문의',
    icon: 'pi pi-comments',
    command: () => router.push('/profile/comments')
  },
  { separator: true },
  {
    label: '로그아웃',
    icon: 'pi pi-sign-out',
    command: async () => {
      await apiClient.post('../logout');
      authStore.setAccessToken(null);
      await router.push('/auth/signin');
    }
  }
];

const toggleMenu = (event: MouseEvent) => {
  menu.value.toggle(event);
};
</script>

<template>
  <div v-if="user" class="flex items-center gap-2">
    <!-- 프로필 클릭 -->
    <div
      @click="toggleMenu"
      class="cursor-pointer flex items-center gap-2"
    >
      <Gravatar
        class="rounded-full w-10 h-10"
        :email="user.email as `${string}@${string}.${string}`"
        :size="80"
        default="identicon"
      />
      <div class="flex flex-col">
        <span>{{ user.name }}</span>
        <span
          v-if="authStore.userAuth?.role !== 'customer'"
          :class="getRoleStyle(authStore.userAuth?.role || '')"
        >
          {{ getRoleText(authStore.userAuth?.role || '') }}
        </span>
      </div>
    </div>

    <!-- 드롭다운 메뉴 -->
    <Menu  ref="menu" :model="props.type==='user'?profileItems:adminItems" :popup="true" />
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
