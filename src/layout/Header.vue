<template>
  <Menubar class="border-none border-t! border-l! border-r! rounded-0">
    <template #start>
      <!--누르면 메인 페이지로-->
      <div onclick="location.href='/'" class="text-4xl font-bold">
        Hotel Reservation
      </div>
    </template>

    <template #end>
      <div class="flex gap-4 items-center">
        <div class="relative inline-flex">
          <Button
            variant="outlined"
            rounded
            icon="pi pi-shopping-cart"
            @click="router().push('/cart')"
          />
          <PrimeBadge
            v-if="cartCount > 0"
            :value="cartCount"
            severity="danger"
            class="absolute -top-0 -right-0 !rounded-full"
          />
        </div>
        <template v-if="user?.email">
          <div class="flex items-center gap-2">
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
import { defineComponent, ref, watch } from "vue";
import Button from "primevue/button";
import Menubar from "primevue/menubar";
import Menu from "primevue/menu";
import { useAuthStore } from "@/stores/authStore";
import type { UserDto } from "@/types/users";
import { parseJwt } from "@/utils/jwtUtils";
import { Gravatar } from "@sauromates/vue-gravatar";
import { useRouter } from "vue-router";
import { apiClient } from "@/utils/axiosClient.ts";
import router from "@/router";

export default defineComponent({
  name: "Header",
  methods: {
    router() {
      return router;
    },
  },
  components: { Gravatar, Button, Menubar, Menu },
  computed: {
    accessToken(): string | null {
      // ref는 computed 내부에서는 자동 언래핑됨
      return useAuthStore().accessToken;
    },
    user(): UserDto | null {
      if (!this.accessToken) return null;
      return parseJwt<UserDto>(this.accessToken);
    },
  },
  setup() {
    const menu = ref();
    const router = useRouter();
    const { setAccessToken } = useAuthStore();
    const authStore = useAuthStore();
    const cartCount = ref(0);

    watch(
      () => authStore.accessToken,
      async (newToken) => {
        if (newToken) {
          try {
            const res = await apiClient.get("/v1/cart");
            cartCount.value = res.data.data ?? 0;
          } catch (err) {
            console.error("장바구니 개수 불러오기 실패:", err);
          }
        } else {
          cartCount.value = 0;
        }
      },
      { immediate: true }
    );

    const profileItems = [
      {
        label: "계정",
        icon: "pi pi-user",
        command: () => router.push("/account"),
      },
      {
        label: "결제 내역",
        icon: "pi pi-credit-card",
        command: () => router.push("/payments"),

      },
      {
        label: "위시리스트",
        icon: "pi pi-heart-fill",
        command: () => router.push("/wishlist"),
      },
      {
        label: "설정",
        icon: "pi pi-cog",
        command: () => router.push("/settings"),
      },
      { separator: true },
      {
        label: "로그아웃",
        icon: "pi pi-sign-out",
        command: async () => {
          await apiClient.post("../logout");
          setAccessToken(null);
          await router.push("/auth/signin");
        },
      },
    ];

    const toggleMenu = (event: MouseEvent) => {
      menu.value.toggle(event);
    };

    return { menu, profileItems, toggleMenu, cartCount };
  },
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
