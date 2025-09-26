<template>
  <div class="sidebar">
    <PrimeMenu :model="items" class="gap-y-8" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const items = ref([
  {
    label: "내 계정",
    items: [
      {
        label: "계정",
        icon: "pi pi-user",
        command: () => router.push("/profile/account")
      },
      {
        label: "결제 내역",
        icon: "pi pi-credit-card",
        command: () => router.push("/profile/payments")
      },
      {
        label: "위시리스트",
        icon: "pi pi-heart",
        command: () => router.push("/profile/wishlist")
      },
      {
        label: "설정",
        icon: "pi pi-cog",
        command: () => router.push("/profile/settings")
      },
      {
        label: "로그아웃",
        icon: "pi pi-sign-out",
        command: () => router.push("/auth/signin")
      },
      {

        label: "쿠폰함",
        icon: "pi pi-sign-out",
        command: () => router.push("/profile/coupon")
      },
      {
        label: "문의",
        icon: "pi pi-comments",
        command: () => router.push("/profile/comment")
      },
      {
        label:"쿠폰",
        icon: "pi pi-ticket",
        command: () => router.push("/auth/coupon")
      }
    ],
  },
]);
</script>
