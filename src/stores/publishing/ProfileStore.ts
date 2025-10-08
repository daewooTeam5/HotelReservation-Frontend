// src/stores/ProfileStore.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { apiClient } from '@/utils/axiosClient.ts';
import type { User } from '@/types/users';
import { useAuthStore } from '@/stores/authStore';

export interface UserUpdateDTO {
  name: string;
  email: string;
  phone: string;
  images?: string[];
}


export const useProfileStore = defineStore('profile', () => {
  const profile = ref<User>({
    id: 0,
    userId: '',
    email: '',
    name: '',
    role: 'customer',
    status: 'active',
    updatedAt: '',
    createdAt: '',
    phone: '',
    review: 0,

  });

  const images = ref<string[]>([]);
  const authStore = useAuthStore();

  // --- 로컬스토리지 관련 ---
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

  function saveToStorage() {
    try {
      const dataToSave = {
        images: images.value,
        profile: profile.value,
        timestamp: Date.now(),
      };
      localStorage.setItem('hotel-profile-draft', JSON.stringify(dataToSave));
      console.log('프로필 데이터가 로컬스토리지에 저장되었습니다.');
    } catch (error) {
      console.error('프로필 데이터 저장 실패:', error);
    }
  }

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

  async function updateProfileApi(profileData: UserUpdateDTO, file: File | null) {
    const token = authStore.accessToken;
    const formData = new FormData();

    formData.append('dto', new Blob([JSON.stringify(profileData)], {
      type: 'application/json'
    }));

    if (file) {
      formData.append('file', file);
    }

    return await apiClient.put('/v1/users/update', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // --- ✅ 백엔드 연동 함수 ---
  async function fetchProfileFromApi() {
    try {
      const token = authStore.accessToken;
      if (!token) return;

      const response = await apiClient.get('/v1/users/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data;

      // profile 정보 업데이트 (이 부분은 문제 없습니다)
      profile.value = {
        ...profile.value,
        id: data.id,
        userId: data.userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        review: data.review ?? 0,
      };

      if (data.profileImageUrl) {
        images.value = [data.profileImageUrl];
      } else {
        images.value = [];
      }

      saveToStorage();
      console.log('프로필 데이터를 서버에서 불러왔습니다.');

    } catch (error) {
      console.error('프로필 조회 실패:', error);
    }
  }
  return {
    images,
    profile,
    addImage,
    removeImage,
    updateProfile,
    loadFromStorage,
    saveToStorage,
    clearStorage,
    fetchProfileFromApi,
    updateProfileApi,
  };
});
