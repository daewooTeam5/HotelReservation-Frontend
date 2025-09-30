<template>
  <Menubar class="border-none border-t! border-l! border-r! rounded-0">
    <template #start>
      <div @click="router.push('/')" class="text-4xl font-bold">
        Hotel Reservation
      </div>
    </template>

    <template #end>
      <div class="flex gap-4 items-center">
        <div class="relative inline-flex">

          <Button v-if="!accessToken" variant="outlined" class="mr-4!" @click="router.push('/guest/reservation-search')">
            비회원 예약 조회
          </Button>

          <Button
            @click="router.push('/owner')"
            class="mr-4!"
            variant="outlined" rounded v-if="authStore.userAuth?.role==='hotel_owner'">
            내 호텔 관리
          </Button>
          <Button
            v-if="['admin', 'place_admin', 'user_admin'].includes(authStore.userAuth?.role ?? '')"
            @click="router.push('/admin')"
            class="mr-4!"
            variant="outlined"
            rounded
          >
            관리자 페이지
          </Button>
          <Button
            variant="outlined"
            rounded
            icon="pi pi-shopping-cart"
            @click="router.push('/cart')"
          />
          <PrimeBadge
            v-if="cartCount > 0"
            :value="cartCount"
            severity="danger"
            class="absolute -top-0 -right-0 !rounded-full"
          />
        </div>
        <template v-if="user">
          <div class="flex items-center gap-2">

            <!-- 프로필 클릭 -->
            <UserProfile type="user" />

          </div>
        </template>

        <template v-else>
          <RouterLink to="/auth/signin">
            <Button
              rounded
              variant="outlined"
              label="로그인/회원가입"
              icon="pi pi-sign-in"
              icon-pos="left"
            />
          </RouterLink>
        </template>
      </div>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import Menubar from 'primevue/menubar';
import { useAuthStore } from '@/stores/authStore';
import type { UserDto } from '@/types/users';
import { parseJwt } from '@/utils/jwtUtils';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import UserProfile from '@/components/common/UserProfile.vue';

const router = useRouter();
const authStore = useAuthStore();
const cartCount = ref(0);

// accessToken, user는 computed로 관리
const accessToken = computed(() => authStore.accessToken);
const user = computed<UserDto | null>(() => {
  if (!accessToken.value) return null;
  return parseJwt<UserDto>(accessToken.value);
});

// accessToken 바뀔 때 장바구니 개수 동기화
watch(
  () => accessToken.value,
  async (newToken) => {
    if (newToken) {
      try {
        const res = await apiClient.get('/v1/cart');
        cartCount.value = res.data.data ?? 0;
      } catch (err) {
        console.error('장바구니 개수 불러오기 실패:', err);
      }
    } else {
      cartCount.value = 0;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
