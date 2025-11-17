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
import axios from 'axios';

declare global {
  interface Window {
    // 안드에서 심어준 브리지
    AndroidBridge?: {
      isAndroidApp: () => boolean;
    };
    // 안드에서 호출할 토큰 리스너
    setFCMToken?: (token: string) => void;
  }
}
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();
let isMessageListenerAdded = false;
onMounted(() => {

  void authStore.issueToken();

  if (window.AndroidBridge && typeof window.AndroidBridge.isAndroidApp === 'function' && window.AndroidBridge.isAndroidApp()) {
    window.setFCMToken = (token: string) => {
      apiClient.post('/v1/auth/fcm-token', { fcmToken: token });
    };
    return;
  }
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return;
  }

  if (!isMessageListenerAdded) {
    onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload.notification);
      toast.add({
        summary: payload.notification?.title,
        detail: payload.notification?.body,
        severity: 'info',
        life: 3000
      });
    });
    isMessageListenerAdded = true;
  }

  // FCM 토큰 요청
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted' && messaging) {
      getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      }).then((currentToken) => {
        if (currentToken) {
          apiClient.post('/v1/auth/fcm-token', { fcmToken: currentToken });
        }
      }).catch((err) => {
        console.error('FCM 토큰 가져오기 실패:', err);
      });
    }
  });
});
</script>

<template>
  <Toast />
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
  <div v-else
       class="w-screen h-screen bg-gradient-to-b from-black to-neutral-900 flex items-center justify-center">
    <div class="text-center animate-fadeIn">

      <div class="w-full flex justify-center mb-2">
        <img
          src="/images/logo.png"
          class="w-56 h-56 mx-auto opacity-95 drop-shadow-[0_0_20px_rgba(255,215,0,0.25)] animate-pulse"
        />
      </div>

      <h1
        class="mt-6! text-4xl font-bold tracking-[0.2em] text-[#e5c76b] drop-shadow-[0_0_12px_rgba(229,199,107,0.4)]">
        Hotelly
      </h1>

      <p class="mt-3! text-lg text-neutral-300 font-light">
        여행의 시작을 더 스마트하게, 당신만의 완벽한 스테이를 연결합니다.
      </p>

    </div>
  </div>
</template>
