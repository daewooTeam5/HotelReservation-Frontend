// src/stores/AddAddress.ts
import { defineStore } from 'pinia';

export type Address = {
  province: string;
  city: string;
  town: string;
  road: string;
  detail_post: string;
};

export const usePublishingStore = defineStore('publishing', {
  state: () => ({
    form: {
      addressList: [] as Address[]
    }
  }),

  actions: {
    // 로컬스토리지에서 데이터 불러오기
    loadFromStorage() {
      try {
        const savedData = localStorage.getItem('hotel-address-draft');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          this.form.addressList = parsedData.addressList || [];
          console.log('주소 데이터를 로컬스토리지에서 불러왔습니다.');
          return true;
        }
      } catch (error) {
        console.error('주소 데이터 불러오기 실패:', error);
        this.clearStorage();
      }
      return false;
    },

    // 로컬스토리지에 저장
    saveToStorage() {
      try {
        const dataToSave = {
          addressList: this.form.addressList,
          timestamp: Date.now()
        };
        localStorage.setItem('hotel-address-draft', JSON.stringify(dataToSave));
        console.log('주소 데이터가 로컬스토리지에 저장되었습니다.');
      } catch (error) {
        console.error('주소 데이터 저장 실패:', error);
      }
    },

    // 로컬스토리지 삭제
    clearStorage() {
      try {
        localStorage.removeItem('hotel-address-draft');
        console.log('주소 데이터를 로컬스토리지에서 삭제했습니다.');
      } catch (error) {
        console.error('주소 데이터 삭제 실패:', error);
      }
    },

    // 주소 추가
    addAddress(address: Address) {
      this.form.addressList.push(address);
      this.saveToStorage();
    },

    // 주소 삭제
    removeAddress(index: number) {
      this.form.addressList.splice(index, 1);
      this.saveToStorage();
    }
  }
});
