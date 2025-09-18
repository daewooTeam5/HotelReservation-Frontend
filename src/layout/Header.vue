<template>
  <Menubar class="border-none border-t! border-l! border-r! rounded-0">
    <template #start>
      <div class="text-4xl font-bold">Hotel Reservation</div>
    </template>

    <template #end>
      <div class="flex gap-2 items-center">
        <Button variant="outlined" rounded icon="pi pi-shopping-cart" />

        <template v-if="user?.email">
          <div class="flex items-center gap-2">
            <!-- 프로필 클릭 -->
            <div @click="toggleMenu" class="cursor-pointer flex items-center gap-2">
              <Gravatar
                class="rounded-full w-10 h-10"
                :email="user.email as `${string}@${string}.${string}`"
                :size="80"
                default="identicon"
              />
              <span>{{ user.name }}</span>
            </div>

            <!-- 드롭다운 메뉴 -->
            <Menu ref="menu" :model="profileItems" :popup="true" />
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

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Button from 'primevue/button';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import { useAuthStore } from '@/stores/authStore';
import type { UserDto } from '@/types/users';
import { parseJwt } from '@/utils/jwtUtils';
import { Gravatar } from '@sauromates/vue-gravatar';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';

export default defineComponent({
  name: 'Header',
  components: { Gravatar, Button, Menubar, Menu },
  computed: {
    accessToken(): string | null {
      return useAuthStore().accessToken;
    },
    user(): UserDto | null {
      if (!this.accessToken) return null;
      return parseJwt<UserDto>(this.accessToken);
    }
  },
  setup() {
    const menu = ref();
    const router = useRouter();
    const { setAccessToken } = useAuthStore();

    const profileItems = [
      {
        label: '계정',
        icon: 'pi pi-user',
        command: () => router.push('/account')
      },
      {
        label: '결제 내역',
        icon: 'pi pi-credit-card',
        command: () => router.push('/payments')
      },
      {
        label: '위시리스트',
        icon: 'pi pi-heart-fill',
        command: () => router.push('/wishlist')
      },
      {
        label: '설정',
        icon: 'pi pi-cog',
        command: () => router.push('/settings')
      },

      { separator: true },
      {
        label: '로그아웃',
        icon: 'pi pi-sign-out',
        command: async () => {
          await apiClient.post('../logout');
          setAccessToken(null);
          await router.push('/auth/signin');
        }
      }
    ];

    const toggleMenu = (event: MouseEvent) => {
      menu.value.toggle(event);
    };

    return { menu, profileItems, toggleMenu };
  }
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
