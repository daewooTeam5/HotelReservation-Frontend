// src/stores/AddImages.ts
import { defineStore } from 'pinia';

export const useImageStore = defineStore('images', {
  state: () => ({
    images: [] as File[]  // 실제 파일 객체를 저장
  }),
  actions: {
    // 이미지 추가
    addImage(file: File) {
      this.images.push(file);
    },

    // 특정 이미지 삭제
    removeImage(index: number) {
      this.images.splice(index, 1);
    }

  }
});
