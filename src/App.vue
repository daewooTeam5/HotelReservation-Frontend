<script setup lang="ts">
import { useRoute } from 'vue-router';

import DefaultLayout from '@/layout/DefaultLayout.vue';
import OwnerLayout from '@/layout/OwnerLayout.vue';
import UserLayout from '@/layout/UserLayout.vue';
import AdminLayout from '@/layout/AdminLayout.vue';
import ProfileLayout from '@/layout/ProfileLayout.vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore.ts';
import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useToast } from 'primevue';
import { apiClient } from '@/utils/axiosClient.ts';

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();
let isMessageListenerAdded = false;
onMounted(() => {
  void authStore.issueToken();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("SW 등록 완료", registration);

        if (!messaging) {
          console.warn("Firebase Messaging is not available");
          return;
        }

        if (!isMessageListenerAdded) {
          onMessage(messaging, (payload) => {
            console.log("Foreground message:", payload.notification);
            toast.add({
              summary: payload.notification?.title,
              detail: payload.notification?.body,
              severity: "info",
              life:3000
            });
          });
          isMessageListenerAdded = true;
        }

        // FCM 토큰 요청
        Notification.requestPermission().then((permission) => {
          if (permission === "granted" && messaging) {
            getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            }).then((currentToken) => {
              if (currentToken) {
                apiClient.post("/v1/auth/fcm-token", { fcmToken: currentToken });
              }
            }).catch((err) => {
              console.error("FCM 토큰 가져오기 실패:", err);
            });
          }
        });
      })
      .catch((err) => {
        console.error("SW 등록 실패:", err);
      });
  }
});
</script>

<template>
  <Toast/>
  <div v-if="authStore.isTokenReady" class="flex flex-col h-screen overflow-hidden w-screen">
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
