// src/stores/AddService.ts
import { defineStore } from 'pinia';

export type Service = {//
  servicename: string;
};

export const useServiceStore = defineStore('service', {
  state: () => ({
    // 등록된 서비스 리스트
    serviceList: [] as Service[]
  }),

  actions: {
    // 로컬스토리지에서 데이터 불러오기
    loadFromStorage() {
      try {
        const savedData = localStorage.getItem('hotel-services-draft');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          this.serviceList = parsedData.serviceList || [];
          console.log('서비스 데이터를 로컬스토리지에서 불러왔습니다.');
          return true;
        }
      } catch (error) {
        console.error('서비스 데이터 불러오기 실패:', error);
        this.clearStorage();
      }
      return false;
    },

    // 로컬스토리지에 저장
    saveToStorage() {
      try {
        const dataToSave = {
          serviceList: this.serviceList,
          timestamp: Date.now()
        };
        localStorage.setItem('hotel-services-draft', JSON.stringify(dataToSave));
        console.log('서비스 데이터가 로컬스토리지에 저장되었습니다.');
      } catch (error) {
        console.error('서비스 데이터 저장 실패:', error);
      }
    },

    // 로컬스토리지 삭제
    clearStorage() {
      try {
        localStorage.removeItem('hotel-services-draft');
        console.log('서비스 데이터를 로컬스토리지에서 삭제했습니다.');
      } catch (error) {
        console.error('서비스 데이터 삭제 실패:', error);
      }
    },

    // 서비스 추가
    addService(service: Service) {
      this.serviceList.push(service);
      this.saveToStorage();
    },

    // 서비스 삭제
    removeService(index: number) {
      this.serviceList.splice(index, 1);
      this.saveToStorage();
    }
  }
});
