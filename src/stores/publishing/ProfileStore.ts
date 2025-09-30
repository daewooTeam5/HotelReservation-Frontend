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

  // 로컬스토리지에서 데이터 불러오기
  function loadFromStorage() {
    try {
      const savedData = localStorage.getItem('hotel-profile-draft');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        images.value = parsedData.images || [];
        profile.value = { ...profile.value, ...parsedData.profile };
        console.log('프로필 데이터를 로컬스토리지에서 불러왔습니다.');
        return true;
      }
    } catch (error) {
      console.error('프로필 데이터 불러오기 실패:', error);
      clearStorage();
    }
    return false;
  }

  // 로컬스토리지에 저장
  function saveToStorage() {
    try {
      const dataToSave = {
        images: images.value,
        profile: profile.value,
        timestamp: Date.now()
      };
      localStorage.setItem('hotel-profile-draft', JSON.stringify(dataToSave));
      console.log('프로필 데이터가 로컬스토리지에 저장되었습니다.');
    } catch (error) {
      console.error('프로필 데이터 저장 실패:', error);
    }
  }

  // 로컬스토리지 삭제
  function clearStorage() {
    try {
      localStorage.removeItem('hotel-profile-draft');
      console.log('프로필 데이터를 로컬스토리지에서 삭제했습니다.');
    } catch (error) {
      console.error('프로필 데이터 삭제 실패:', error);
    }
  }

  function addImage(imageUrl: string) {
    if (images.value.length > 0) {
      images.value.splice(0, 1);
    }
    images.value.push(imageUrl);
    saveToStorage();
  }

  function removeImage(index: number) {
    if (index > -1 && index < images.value.length) {
      images.value.splice(index, 1);
    }
    saveToStorage();
  }

  function updateProfile(newProfile: any) {
    profile.value = { ...profile.value, ...newProfile };
    saveToStorage();
  }

  return {
    images,
    profile,
    addImage,
    removeImage,
    updateProfile,
    loadFromStorage,
    saveToStorage,
    clearStorage
  };
});
