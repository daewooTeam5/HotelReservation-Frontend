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
    // 주소 추가
    addAddress(address: Address) {
      this.form.addressList.push(address);
    },

    // 주소 삭제
    removeAddress(index: number) {
      this.form.addressList.splice(index, 1);
    }


  }
});
