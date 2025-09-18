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
    // 서비스 추가
    addService(service: Service) {
      this.serviceList.push(service);
    },

    // 서비스 삭제
    removeService(index: number) {
      this.serviceList.splice(index, 1);
    }

  }
});
