<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Menu from 'primevue/menu';
import { Gravatar } from '@sauromates/vue-gravatar';
import { useAuthStore } from '@/stores/authStore';
import type { UserDto } from '@/types/users';
import { parseJwt } from '@/utils/jwtUtils';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import { useProfileStore } from '@/stores/publishing/ProfileStore.ts';
const profileStore = useProfileStore();

onMounted(async () => {
  if (user.value?.userId) {
    await profileStore.fetchProfileFromApi(); // 서버에서 최신 프로필 가져오기
  }
});
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

const profileImageUrl = computed(() => profileStore.images?.[0]);
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
      await apiClient.post('/v1/auth/logout');
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
    command: () => router.push('/profile/comment')
  },
  {
    label: '리뷰 조회',
    icon: 'pi pi-thumbs-up',
    command: () => router.push('/profile/review-list')
  },
  {
    label: '포인트',
    icon: 'pi pi-circle',
    command: () => router.push('/auth/point')

  },
  authStore.userAuth?.role!=="admin" && {
    label: '업주 신청',
    icon: 'pi pi-headphones',
    command: () => router.push('profile/owner-request')

  },
  { separator: true },
  {
    label: '로그아웃',
    icon: 'pi pi-sign-out',
    command: async () => {
      await apiClient.post('/v1/auth/logout');
      authStore.setAccessToken(null);
      await router.push('/auth/signin');
    }
  }
].filter(Boolean);



const toggleMenu = (event: MouseEvent) => {
  menu.value.toggle(event);
};
</script>

<template>
  <div v-if="user" class="flex items-center gap-2">
    <div
      @click="toggleMenu"
      class="cursor-pointer flex items-center gap-2"
    >
      <div class="rounded-full w-10 h-10 overflow-hidden flex-shrink-0 bg-gray-200">
        <img
          v-if="profileImageUrl"
          :src="profileImageUrl"
          alt="프로필 이미지"
          class="w-full h-full object-cover"
        />
        <Gravatar
          v-else
          class="w-full h-full"
          :email="user.email as `${string}@${string}.${string}`"
          :size="80"
          default="identicon"
        />
      </div>

      <div class="flex flex-col">
        <span>{{ profileStore.profile.name }}</span>
        <span
          v-if="authStore.userAuth?.role !== 'customer'"
          :class="getRoleStyle(authStore.userAuth?.role || '')"
        >
          {{ getRoleText(authStore.userAuth?.role || '') }}
        </span>
      </div>
    </div>

    <Menu ref="menu" :model="props.type==='user'?profileItems:adminItems" :popup="true" />
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
