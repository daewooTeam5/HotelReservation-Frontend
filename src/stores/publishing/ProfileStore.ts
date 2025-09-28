// src/stores/ProfileStore.ts

import { ref } from 'vue';
import { defineStore } from 'pinia';


export const useProfileStore = defineStore('profile', () => {
  const images = ref<string[]>([]);

  const profile = ref({
    name: "관리자",
    email: "admin@hotel.com",
    phone: "010-1234-5678",
    role: "admin",
    createDate: "2025-09-27 21:21",
    review: 6

  });

  function addImage(imageUrl: string) {
    if (images.value.length > 0) {
      images.value.splice(0, 1);
    }
    images.value.push(imageUrl);
  }

  function removeImage(index: number) {
    if (index > -1 && index < images.value.length) {
      images.value.splice(index, 1);
    }
  }

  function updateProfile(newProfile: any) {
    profile.value = { ...profile.value, ...newProfile };
  }

  return {
    images,
    profile,
    addImage,
    removeImage,
    updateProfile,
  };
});
