// utils/indexedDBStorage.ts
export interface ImageData {
  id: string;
  file: File;
  url: string;
  uploadedAt: number;
  category: 'hotel' | 'room' | 'profile';
}

export class IndexedDBImageManager {
  private dbName = 'HotelImageStorage';
  private version = 1;
  private storeName = 'images';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 기존 스토어가 있으면 삭제
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // 새 스토어 생성
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      };
    });
  }

  async saveImage(file: File, category: 'hotel' | 'room' | 'profile'): Promise<string> {
    if (!this.db) await this.init();

    const id = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = URL.createObjectURL(file);

    const imageData: ImageData = {
      id,
      file,
      url,
      uploadedAt: Date.now(),
      category
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(imageData);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getImage(id: string): Promise<ImageData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // URL이 유효하지 않으면 새로 생성
          if (!result.url || result.url.startsWith('blob:')) {
            result.url = URL.createObjectURL(result.file);
          }
        }
        resolve(result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllImages(category?: 'hotel' | 'room' | 'profile'): Promise<ImageData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      let request: IDBRequest;
      if (category) {
        const index = store.index('category');
        request = index.getAll(category);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const results = request.result.map((item: ImageData) => {
          // URL이 유효하지 않으면 새로 생성
          if (!item.url || item.url.startsWith('blob:')) {
            item.url = URL.createObjectURL(item.file);
          }
          return item;
        });
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) await this.init();

    // 기존 URL 해제
    const imageData = await this.getImage(id);
    if (imageData?.url) {
      URL.revokeObjectURL(imageData.url);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearCategory(category: 'hotel' | 'room' | 'profile'): Promise<void> {
    const images = await this.getAllImages(category);
    const deletePromises = images.map(img => this.deleteImage(img.id));
    await Promise.all(deletePromises);
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    // 모든 URL 해제
    const allImages = await this.getAllImages();
    allImages.forEach(img => {
      if (img.url) URL.revokeObjectURL(img.url);
    });

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 30일 이상 된 이미지 자동 정리
  async cleanupOldImages(): Promise<void> {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const allImages = await this.getAllImages();

    const oldImages = allImages.filter(img => img.uploadedAt < thirtyDaysAgo);
    const deletePromises = oldImages.map(img => this.deleteImage(img.id));

    await Promise.all(deletePromises);
    console.log(`${oldImages.length}개의 오래된 이미지를 정리했습니다.`);
  }

  // 스토리지 사용량 확인
  async getStorageUsage(): Promise<{ used: number; total: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0
      };
    }
    return { used: 0, total: 0 };
  }
}

// 싱글톤 인스턴스
export const imageDB = new IndexedDBImageManager();
