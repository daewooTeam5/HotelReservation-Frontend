<template>
  <Menubar class="border-none border-t! border-l! border-r! rounded-0">
    <template #start>
      <!--누르면 메인 페이지로-->
      <div @click="router.push('/')" class="text-4xl font-bold">
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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import Button from "primevue/button";
import Menubar from "primevue/menubar";
import Menu from "primevue/menu";
import { useAuthStore } from "@/stores/authStore";
import type { UserDto } from "@/types/users";
import { parseJwt } from "@/utils/jwtUtils";
import { Gravatar } from "@sauromates/vue-gravatar";
import { useRouter } from "vue-router";
import { apiClient } from "@/utils/axiosClient.ts";

const router = useRouter();
const menu = ref();
const authStore = useAuthStore();
const { setAccessToken,getAccessToken } = authStore;
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

onMounted(async ()=>{
  console.log(getAccessToken);
  if(!getAccessToken){
    const data = await apiClient.post("../auth/token")
    console.log(data.data.data.accessToken);
    setAccessToken(data.data.data.accessToken);
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
