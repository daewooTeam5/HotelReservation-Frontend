<script setup lang="ts">
import { useRoute } from "vue-router";

import DefaultLayout from "@/layout/DefaultLayout.vue";
import OwnerLayout from "@/layout/OwnerLayout.vue";
import UserLayout from "@/layout/UserLayout.vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import ProfileLayout from '@/layout/ProfileLayout.vue';
import { onBeforeMount, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore.ts';

const route = useRoute();
const authStore = useAuthStore();
onMounted(() => {
  void authStore.issueToken();
});
</script>

<template>
  <div v-if="authStore.isTokenReady" class="flex flex-col h-screen overflow-hidden">
    <!-- Owner Layout -->
    <OwnerLayout v-if="route.meta.layout === 'owner'">
      <router-view />
    </OwnerLayout>

    <!-- User Layout -->
    <UserLayout v-else-if="route.meta.layout === 'user'">
      <router-view />
    </UserLayout>

    <!-- Admin Layout -->
    <AdminLayout v-else-if="route.meta.layout === 'admin'">
      <router-view />
    </AdminLayout>

    <ProfileLayout v-else-if="route.meta.layout === 'profile'">
      <router-view />
    </ProfileLayout>

    <!-- Default Layout -->
    <DefaultLayout v-else>
      <router-view />
    </DefaultLayout>
  </div>
  <div v-else>
    loading
  </div>
</template>
