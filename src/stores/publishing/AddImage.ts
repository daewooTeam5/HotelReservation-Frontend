// src/stores/AddImages.ts
import { defineStore } from 'pinia';
import { imageDB } from '@/utils/indexedDBStorage';

export const useImageStore = defineStore('images', {
  state: () => ({
    images: [] as string[],  // IndexedDB ID들을 저장
    imageUrls: [] as string[]  // 미리보기용 URL 저장 (캐시)
  }),

  actions: {
    // 로컬스토리지에서 데이터 불러오기
    loadFromStorage() {
      try {
        const savedData = localStorage.getItem('hotel-images-draft');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          this.images = parsedData.images || [];
          console.log('이미지 ID 데이터를 로컬스토리지에서 불러왔습니다.');
          // URL 캐시 새로고침
          this.refreshImageUrls();
          return true;
        }
      } catch (error) {
        console.error('이미지 데이터 불러오기 실패:', error);
        this.clearStorage();
      }
      return false;
    },

    // 로컬스토리지에 저장 (ID만 저장)
    saveToStorage() {
      try {
        const dataToSave = {
          images: this.images,
          timestamp: Date.now()
        };
        localStorage.setItem('hotel-images-draft', JSON.stringify(dataToSave));
        console.log('이미지 ID 데이터가 로컬스토리지에 저장되었습니다.');
      } catch (error) {
        console.error('이미지 데이터 저장 실패:', error);
      }
    },

    // 로컬스토리지 삭제
    clearStorage() {
      try {
        localStorage.removeItem('hotel-images-draft');
        console.log('이미지 데이터를 로컬스토리지에서 삭제했습니다.');
      } catch (error) {
        console.error('이미지 데이터 삭제 실패:', error);
      }
    },

    // URL 캐시 새로고침
    async refreshImageUrls() {
      try {
        this.imageUrls = await Promise.all(
          this.images.map(async (id) => {
            const imageData = await imageDB.getImage(id);
            return imageData?.url || '';
          })
        );
        this.imageUrls = this.imageUrls.filter(url => url !== '');
      } catch (error) {
        console.error('이미지 URL 새로고침 실패:', error);
      }
    },

    // 이미지 추가 (IndexedDB 사용)
    async addImage(file: File) {
      try {
        const imageId = await imageDB.saveImage(file, 'room');
        this.images.push(imageId);

        // URL 캐시에도 추가
        const imageData = await imageDB.getImage(imageId);
        if (imageData?.url) {
          this.imageUrls.push(imageData.url);
        }

        this.saveToStorage();
        console.log('이미지가 IndexedDB에 저장되었습니다:', imageId);
        return imageId;
      } catch (error) {
        console.error('이미지 저장 실패:', error);
        throw error;
      }
    },

    // 특정 이미지 삭제
    async removeImage(index: number) {
      try {
        const imageId = this.images[index];
        if (imageId) {
          await imageDB.deleteImage(imageId);
        }

        this.images.splice(index, 1);
        this.imageUrls.splice(index, 1);

        this.saveToStorage();
        console.log('이미지가 삭제되었습니다.');
      } catch (error) {
        console.error('이미지 삭제 실패:', error);
        throw error;
      }
    },

    // 모든 이미지 삭제
    async clearImages() {
      try {
        // IndexedDB에서 모든 이미지 삭제
        await Promise.all(
          this.images.map(id => imageDB.deleteImage(id))
        );

        this.images = [];
        this.imageUrls = [];

        this.clearStorage();
        console.log('모든 이미지가 삭제되었습니다.');
      } catch (error) {
        console.error('이미지 전체 삭제 실패:', error);
      }
    }
  }
});
