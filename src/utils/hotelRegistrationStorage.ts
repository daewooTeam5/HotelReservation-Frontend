// utils/hotelRegistrationStorage.ts
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { usePublishingStore } from '@/stores/publishing/AddAddress';
import { useImageStore } from '@/stores/publishing/AddImage';
import { useRoomsStore } from '@/stores/publishing/AddRooms';
import { useServiceStore } from '@/stores/publishing/AddService';
import { useProfileStore } from '@/stores/publishing/ProfileStore';

/**
 * 호텔 등록 과정의 모든 임시 저장 데이터를 관리하는 유틸리티
 */
export class HotelRegistrationStorageManager {

  /**
   * 모든 호텔 등록 스토어에서 로컬스토리지 데이터를 불러옵니다.
   * 앱 시작 시 또는 호텔 등록 페이지 진입 시 호출하세요.
   */
  static loadAllFromStorage() {
    console.log('🔄 호텔 등록 임시 저장 데이터를 불러오는 중...');

    const results = {
      register: false,
      address: false,
      images: false,
      rooms: false,
      services: false,
      profile: false
    };

    try {
      // 각 스토어에서 데이터 불러오기
      const registerStore = useRegisterStore();
      const addressStore = usePublishingStore();
      const imageStore = useImageStore();
      const roomsStore = useRoomsStore();
      const serviceStore = useServiceStore();
      const profileStore = useProfileStore();

      results.register = registerStore.loadFromStorage();
      results.address = addressStore.loadFromStorage();
      results.images = imageStore.loadFromStorage();
      results.rooms = roomsStore.loadFromStorage();
      results.services = serviceStore.loadFromStorage();
      results.profile = profileStore.loadFromStorage();

      const loadedCount = Object.values(results).filter(Boolean).length;

      if (loadedCount > 0) {
        console.log(`✅ ${loadedCount}개의 호텔 등록 임시 저장 데이터를 성공적으로 불러왔습니다.`);
        return true;
      } else {
        console.log('ℹ️ 불러올 임시 저장 데이터가 없습니다.');
        return false;
      }
    } catch (error) {
      console.error('❌ 호텔 등록 데이터 불러오기 중 오류 발생:', error);
      return false;
    }
  }

  /**
   * 모든 호텔 등록 관련 로컬스토리지 데이터를 삭제합니다.
   * 호텔 등록 완료 시 또는 데이터를 초기화하고 싶을 때 호출하세요.
   */
  static clearAllStorage() {
    console.log('🗑️ 모든 호텔 등록 임시 저장 데이터를 삭제하는 중...');

    try {
      const registerStore = useRegisterStore();
      const addressStore = usePublishingStore();
      const imageStore = useImageStore();
      const roomsStore = useRoomsStore();
      const serviceStore = useServiceStore();
      const profileStore = useProfileStore();

      // 각 스토어의 로컬스토리지 데이터 삭제
      registerStore.clearStorage();
      addressStore.clearStorage();
      imageStore.clearStorage();
      roomsStore.clearStorage();
      serviceStore.clearStorage();
      profileStore.clearStorage();

      console.log('✅ 모든 호텔 등록 임시 저장 데이터가 삭제되었습니다.');
      return true;
    } catch (error) {
      console.error('❌ 임시 저장 데이터 삭제 중 오류 발생:', error);
      return false;
    }
  }

  /**
   * 모든 스토어의 현재 상태를 로컬스토리지에 저장합니다.
   * 수동으로 전체 저장이 필요할 때 호출하세요.
   */
  static saveAllToStorage() {
    console.log('💾 모든 호텔 등록 데이터를 로컬스토리지에 저장하는 중...');

    try {
      const registerStore = useRegisterStore();
      const addressStore = usePublishingStore();
      const imageStore = useImageStore();
      const roomsStore = useRoomsStore();
      const serviceStore = useServiceStore();
      const profileStore = useProfileStore();

      // 각 스토어의 데이터 저장
      registerStore.saveToStorage();
      addressStore.saveToStorage();
      imageStore.saveToStorage();
      roomsStore.saveToStorage();
      serviceStore.saveToStorage();
      profileStore.saveToStorage();

      console.log('✅ 모든 호텔 등록 데이터가 로컬스토리지에 저장되었습니다.');
      return true;
    } catch (error) {
      console.error('❌ 데이터 저장 중 오류 발생:', error);
      return false;
    }
  }

  /**
   * 임시 저장된 데이터가 있는지 확인합니다.
   * UI에서 "임시 저장된 데이터가 있습니다" 알림을 표시할 때 사용하세요.
   */
  static hasSavedData() {
    const storageKeys = [
      'hotel-register-draft',
      'hotel-address-draft',
      'hotel-images-draft',
      'hotel-rooms-draft',
      'hotel-services-draft',
      'hotel-profile-draft'
    ];

    return storageKeys.some(key => {
      try {
        const data = localStorage.getItem(key);
        return data !== null;
      } catch {
        return false;
      }
    });
  }

  /**
   * 각 스토어별 임시 저장 데이터 존재 여부를 상세히 확인합니다.
   */
  static getStorageStatus() {
    return {
      register: localStorage.getItem('hotel-register-draft') !== null,
      address: localStorage.getItem('hotel-address-draft') !== null,
      images: localStorage.getItem('hotel-images-draft') !== null,
      rooms: localStorage.getItem('hotel-rooms-draft') !== null,
      services: localStorage.getItem('hotel-services-draft') !== null,
      profile: localStorage.getItem('hotel-profile-draft') !== null
    };
  }
}

/**
 * Vue 컴포지션 API용 훅
 * 컴포넌트에서 쉽게 사용할 수 있도록 제공합니다.
 */
export function useHotelRegistrationStorage() {
  return {
    loadAll: HotelRegistrationStorageManager.loadAllFromStorage,
    clearAll: HotelRegistrationStorageManager.clearAllStorage,
    saveAll: HotelRegistrationStorageManager.saveAllToStorage,
    hasSavedData: HotelRegistrationStorageManager.hasSavedData,
    getStatus: HotelRegistrationStorageManager.getStorageStatus
  };
}
