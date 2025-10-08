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
  if ("Notification" in window) {
    console.log("Current notification permission:", Notification.permission);

    Notification.requestPermission().then((permission) => {
      console.log("알림 허용이 되어있나요:", permission);

      if (permission === "granted") {
        // FCM 토큰 요청
        getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        })
          .then((currentToken) => {
            if (currentToken) {
              console.log("requestForToken 성공!", currentToken);
              console.log(authStore.userAuth);
              apiClient.post("../auth/fcm-token",{
                fcmToken:currentToken
              })
            } else {
              console.log("No registration token available. Request permission to generate one.");
            }
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
          });
      }

      if (permission === "denied") {
        console.log("알림이 거부되었어요");
      }
    });
    if (!isMessageListenerAdded) {
      onMessage(messaging, (payload) => {
        console.log(payload.notification);
        console.log("messageing paymload");
        toast.add({summary: payload.notification?.title, detail: payload.notification?.body,severity:'info'});
      });
      isMessageListenerAdded = true;
    }
  } else {
    console.log("알림이 되지 않아요!!");
  }
});
</script>

<template>
  <Toast/>
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
