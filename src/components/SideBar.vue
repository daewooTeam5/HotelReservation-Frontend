<template>
  <div class="sidebar">
    <PrimeMenu :model="items" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const items = ref([
  {
    label: "Documents",
    items: [
      { label: "계정", icon: "pi pi-user", to: "/account" },
      { label: "결제 내역", icon: "pi pi-credit-card", to: "/payments" },
      { label: "위시리스트", icon: "pi pi-heart", to: "/wishlist" },
      { label: "설정", icon: "pi pi-cog", to: "/settings" },
      { label: "로그아웃", icon: "pi pi-sign-out", to: "/logout" }
    ],
  },
]);
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  padding: 1rem 0;
}
</style>
