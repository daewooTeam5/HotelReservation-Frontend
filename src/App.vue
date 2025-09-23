<script setup lang="ts">
import { useRoute } from "vue-router";

import DefaultLayout from "@/layout/DefaultLayout.vue";
import OwnerLayout from "@/layout/OwnerLayout.vue";
import UserLayout from "@/layout/UserLayout.vue";
import AdminLayout from "@/layout/AdminLayout.vue";

const route = useRoute();
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
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

    <!-- Default Layout -->
    <DefaultLayout v-else>
      <router-view />
    </DefaultLayout>
  </div>
</template>
