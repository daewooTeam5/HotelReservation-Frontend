// filepath: src/stores/publishing/registerStore.ts

import { defineStore } from 'pinia';
import { apiClient } from '@/utils/axiosClient';
import { imageDB } from '@/utils/indexedDBStorage';

// --- 타입 정의 ---
export type BedOption = {
  type: string;
  width: string;
  count: number;
};

export type DiscountOption = {
  person: number;
  discount: number;
};

export type RoomForm = {
  capacityPeople: number;
  price: number;
  extraPrice: number;
  roomNumber: number;
  roomType: string;
  bedType: BedOption[];
  isPublic: boolean;
  selectedBed: string;
  width: number;
  images: string[]; // 각 객실에 대한 이미지 배열
  capacityRoom: number; // 해당 타입의 객실 개수
};

export type Address = {
  sigungu: string; sido: string; town: string; roadName: string;
  postalCode: string; detailAddress: string;
  latitude?: number; // 위도 추가
  longitude?: number; // 경도 추가
};

export type Amenity = { id: number; name: string; checked: boolean };

export type RegisterState = {
  editingPlaceId: number | null;
  name: string;
  categoryId: number | string;
  description: string;
  hotelImages: string[]; // IndexedDB ID들을 저장
  rooms: RoomForm;
  addedRooms: RoomForm[];
  discounts: DiscountOption[];
  amenities: Amenity[];
  checkIn: string;
  checkOut: string;
  images: string[]; // IndexedDB ID들을 저장
  address: Address;
};

export type CategoryMap = Record<number, string>;

export const categoryMap: CategoryMap = {
  1: '호텔', 2: '리조트', 3: '게스트하우스/비앤비',
  4: '아파트/펜션', 5: '모텔',
};

export const defaultBeds: BedOption[] = [
  { type: '싱글침대', width: '90~130cm', count: 0 },
  { type: '더블침대', width: '131~150cm', count: 0 },
  { type: '대형침대', width: '151~180cm', count: 0 },
  { type: '초대형 침대', width: '181~210cm', count: 0 }
];

const initialRoomState = (): RoomForm => ({
  capacityPeople: 1, price: 0, extraPrice: 0, roomNumber: 1, roomType: '',
  bedType: defaultBeds.map(b => ({ ...b })), isPublic: true, selectedBed: '',
  width: 0, images: [], capacityRoom: 0
});


export const useRegisterStore = defineStore('registerStore', {
  state: (): RegisterState => ({
    editingPlaceId: null,
    name: '', categoryId: '', description: '',
    checkIn: '15:00', checkOut: '11:00',
    hotelImages: [],
    rooms: initialRoomState(),
    addedRooms: [],
    discounts: [],
    amenities: [
      { id: 1, name: '냉방', checked: false }, { id: 2, name: '주차 가능', checked: false },
      { id: 3, name: '난방', checked: false }, { id: 4, name: '와인바', checked: false },
      { id: 5, name: '식당', checked: false }, { id: 6, name: 'Wi-Fi', checked: false },
      { id: 7, name: '빨래', checked: false }, { id: 8, name: '동물 동반 가능', checked: false },
    ],
    images: [],
    address: { sigungu: '', sido: '', town: '', roadName: '', postalCode: '', detailAddress: '' }
  }),

  // 로컬스토리지 관련 getter와 action 추가
  getters: {
    // 현재 상태를 로컬스토리지용 객체로 변환
    getStateForStorage: (state) => {
      return {
        name: state.name,
        categoryId: state.categoryId,
        description: state.description,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        hotelImages: state.hotelImages,
        rooms: state.rooms,
        addedRooms: state.addedRooms,
        discounts: state.discounts,
        amenities: state.amenities,
        images: state.images,
        address: state.address,
        timestamp: Date.now() // 저장 시점 기록
      };
    }
  },

  actions: {
    // 로컬스토리지에서 상태 불러오기
    loadFromStorage() {
      try {
        const savedData = localStorage.getItem('hotel-register-draft');
        if (savedData) {
          const parsedData = JSON.parse(savedData);

          // 저장된 데이터가 24시간 이내인지 확인 (옵션)
          const oneDay = 24 * 60 * 60 * 1000;
          if (parsedData.timestamp && (Date.now() - parsedData.timestamp) > oneDay) {
            console.log('저장된 데이터가 24시간이 지나 삭제됩니다.');
            this.clearStorage();
            return false;
          }

          // 상태 복원
          this.name = parsedData.name || '';
          this.categoryId = parsedData.categoryId || '';
          this.description = parsedData.description || '';
          this.checkIn = parsedData.checkIn || '15:00';
          this.checkOut = parsedData.checkOut || '11:00';
          this.hotelImages = parsedData.hotelImages || [];
          this.rooms = parsedData.rooms || initialRoomState();
          this.addedRooms = parsedData.addedRooms || [];
          this.discounts = parsedData.discounts || [];
          this.amenities = parsedData.amenities || this.amenities;
          this.images = parsedData.images || [];
          this.address = parsedData.address || this.address;

          console.log('로컬스토리지에서 호텔 등록 데이터를 불러왔습니다.');
          return true;
        }
      } catch (error) {
        console.error('로컬스토리지에서 데이터 불러오기 실패:', error);
        this.clearStorage();
      }
      return false;
    },

    // 로컬스토리지에 현재 상태 저장
    saveToStorage() {
      try {
        const dataToSave = this.getStateForStorage;
        localStorage.setItem('hotel-register-draft', JSON.stringify(dataToSave));
        console.log('호텔 등록 데이터가 로컬스토리지에 저장되었습니다.');
      } catch (error) {
        console.error('로컬스토리지 저장 실패:', error);
      }
    },

    // 로컬스토리지 데이터 삭제
    clearStorage() {
      try {
        localStorage.removeItem('hotel-register-draft');
        console.log('로컬스토리지에서 호텔 등록 데이터를 삭제했습니다.');
      } catch (error) {
        console.error('로컬스토리지 삭제 실패:', error);
      }
    },

    // 자동 저장 기능 (상태 변경 시 호출)
    autoSave() {
      // 중요한 필드가 있을 때만 저장 (빈 상태는 저장하지 않음)
      if (this.name || this.description || this.addedRooms.length > 0 || this.hotelImages.length > 0 || this.address.sido) {
        this.saveToStorage();
      }
    },

    // 💡 [추가] 수정 모드를 위해 서버에서 데이터를 불러와 state를 채우는 액션
    async hydrateStoreForEdit(placeId: number) {
      this.clearStore();
      try {
        const response = await apiClient.get(`v1/hotel/publishing/get/${placeId}`);
        const data = response.data.data;

        this.editingPlaceId = placeId;
        this.name = data.hotelName;
        this.description = data.description;
        this.categoryId = data.CategoryId;
        this.checkIn = data.checkIn;
        this.checkOut = data.checkOut;
        this.hotelImages = data.hotelImages?.map((img: any) => img.url) || [];
        this.address = data.addressList?.[0] || this.address;

        const checkedAmenityIds = new Set(data.amenityIds || []);
        this.amenities.forEach(amenity => {
          amenity.checked = checkedAmenityIds.has(amenity.id);
        });

        this.addedRooms = data.rooms?.map((room: any) => ({
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          bedType: defaultBeds.map(b => ({ ...b })),
          selectedBed: room.bedType,
          price: room.minPrice,
          capacityPeople: room.capacityPeople,
          images: room.images?.map((img: any) => img.url) || [],
          width: 0, extraPrice: 0, isPublic: true,
        })) || [];

        return true;
      } catch (error) {
        console.error("수정할 데이터를 불러오는 데 실패했습니다:", error);
        return false;
      }
    },

    // 💡 [수정] 스토어를 초기 상태로 되돌리는 액션 (로컬스토리지는 삭제하지 않음)
    clearStore() {
      this.$reset();
      // 로컬스토리지는 삭제하지 않음 - 사용자가 명시적으로 선택할 때만 삭제
    },

    // 💡 [추가] 스토어와 로컬스토리지를 모두 초기화하는 액션
    clearStoreAndStorage() {
      this.$reset();
      this.clearStorage(); // 로컬스토리지도 함께 삭제
    },

    // --- 기존 액션들 (자동 저장 기능 추가) ---
    addRoom() {
      const roomToAdd: RoomForm = {
        ...JSON.parse(JSON.stringify(this.rooms)),
        images: [...this.images]
      };
      this.addedRooms.push(roomToAdd);
      const nextRoomNumber = this.rooms.roomNumber + 1;
      this.rooms = initialRoomState();
      this.rooms.roomNumber = nextRoomNumber;
      this.images = [];
      this.autoSave(); // 자동 저장
    },
    removeAddedRoom(index: number) {
      this.addedRooms.splice(index, 1);
      this.autoSave(); // 자동 저장
    },

    // 상태 업데이트 메서드들에 자동 저장 추가
    updateName(name: string) {
      this.name = name;
      this.autoSave();
    },

    updateDescription(description: string) {
      this.description = description;
      this.autoSave();
    },

    updateCategoryId(categoryId: number | string) {
      this.categoryId = categoryId;
      this.autoSave();
    },

    updateCheckTime(checkIn: string, checkOut: string) {
      this.checkIn = checkIn;
      this.checkOut = checkOut;
      this.autoSave();
    },

    updateHotelImages(images: string[]) {
      this.hotelImages = images;
      this.autoSave();
    },

    updateAddress(address: Address) {
      this.address = address;
      this.autoSave();
    },

    updateAmenities(amenities: Amenity[]) {
      this.amenities = amenities;
      this.autoSave();
    },

    updateDiscounts(discounts: DiscountOption[]) {
      this.discounts = discounts;
      this.autoSave();
    },

    // 호텔 이미지 관련 함수들 (IndexedDB 사용)
    async addHotelImage(file: File) {
      try {
        const imageId = await imageDB.saveImage(file, 'hotel');
        this.hotelImages.push(imageId);
        this.autoSave();
        console.log('호텔 이미지가 IndexedDB에 저장되었습니다:', imageId);
        return imageId;
      } catch (error) {
        console.error('호텔 이미지 저장 실패:', error);
        throw error;
      }
    },

    async removeHotelImage(index: number) {
      try {
        const imageId = this.hotelImages[index];
        if (imageId) {
          await imageDB.deleteImage(imageId);
        }
        this.hotelImages.splice(index, 1);
        this.autoSave();
        console.log('호텔 이미지가 삭제되었습니다.');
      } catch (error) {
        console.error('호텔 이미지 삭제 실패:', error);
        throw error;
      }
    },

    // 호텔 이미지 URL 가져오기
    async getHotelImageUrl(imageId: string): Promise<string | null> {
      try {
        const imageData = await imageDB.getImage(imageId);
        return imageData?.url || null;
      } catch (error) {
        console.error('호텔 이미지 URL 가져오기 실패:', error);
        return null;
      }
    },

    // 모든 호텔 이미지 URL 가져오기
    async getAllHotelImageUrls(): Promise<string[]> {
      try {
        const urls = await Promise.all(
          this.hotelImages.map(async (id) => {
            const url = await this.getHotelImageUrl(id);
            return url || '';
          })
        );
        return urls.filter(url => url !== '');
      } catch (error) {
        console.error('호텔 이미지 URL들 가져오기 실패:', error);
        return [];
      }
    },

    // 객실 이미지 관련 함수들 (IndexedDB 사용)
    async addRoomImage(file: File) {
      try {
        const imageId = await imageDB.saveImage(file, 'room');
        this.images.push(imageId);
        this.autoSave();
        console.log('객실 이미지가 IndexedDB에 저장되었습니다:', imageId);
        return imageId;
      } catch (error) {
        console.error('객실 이미지 저장 실패:', error);
        throw error;
      }
    },

    async removeRoomImage(index: number) {
      try {
        const imageId = this.images[index];
        if (imageId) {
          await imageDB.deleteImage(imageId);
        }
        this.images.splice(index, 1);
        this.autoSave();
        console.log('객실 이미지가 삭제되었습니다.');
      } catch (error) {
        console.error('객실 이미지 삭제 실패:', error);
        throw error;
      }
    },

    // 객실 이미지 URL 가져오기
    async getRoomImageUrl(imageId: string): Promise<string | null> {
      try {
        const imageData = await imageDB.getImage(imageId);
        return imageData?.url || null;
      } catch (error) {
        console.error('객실 이미지 URL 가져오기 실패:', error);
        return null;
      }
    },

    // 모든 객실 이미지 URL 가져오기
    async getAllRoomImageUrls(): Promise<string[]> {
      try {
        const urls = await Promise.all(
          this.images.map(async (id) => {
            const url = await this.getRoomImageUrl(id);
            return url || '';
          })
        );
        return urls.filter(url => url !== '');
      } catch (error) {
        console.error('객실 이미지 URL들 가져오기 실패:', error);
        return [];
      }
    },

    // 모든 이미지 정리 (호텔 등록 완료 시 호출)
    async clearAllImages() {
      try {
        await imageDB.clearCategory('hotel');
        await imageDB.clearCategory('room');
        this.hotelImages = [];
        this.images = [];
        this.autoSave();
        console.log('모든 이미지가 정리되었습니다.');
      } catch (error) {
        console.error('이미지 정리 실패:', error);
      }
    },

    // 💡 [추가] 실제 이미지 파일을 가져오는 메서드들
    // 호텔 이미지 파일 가져오기
    async getHotelImageFile(imageId: string): Promise<File | null> {
      try {
        const imageData = await imageDB.getImage(imageId);
        return imageData?.file || null;
      } catch (error) {
        console.error('호텔 이미지 파일 가져오기 실패:', error);
        return null;
      }
    },

    // 모든 호텔 이미지 파일 가져오기
    async getAllHotelImageFiles(): Promise<File[]> {
      try {
        const files = await Promise.all(
          this.hotelImages.map(async (id) => {
            const file = await this.getHotelImageFile(id);
            return file;
          })
        );
        return files.filter(file => file !== null) as File[];
      } catch (error) {
        console.error('호텔 이미지 파일들 가져오기 실패:', error);
        return [];
      }
    },

    // 객실 이미지 파일 가져오기
    async getRoomImageFile(imageId: string): Promise<File | null> {
      try {
        const imageData = await imageDB.getImage(imageId);
        return imageData?.file || null;
      } catch (error) {
        console.error('객실 이미지 파일 가져오기 실패:', error);
        return null;
      }
    },

    // 특정 객실의 모든 이미지 파일 가져오기
    async getRoomImageFiles(imageIds: string[]): Promise<File[]> {
      try {
        const files = await Promise.all(
          imageIds.map(async (id) => {
            const file = await this.getRoomImageFile(id);
            return file;
          })
        );
        return files.filter(file => file !== null) as File[];
      } catch (error) {
        console.error('객실 이미지 파일들 가져오기 실패:', error);
        return [];
      }
    }
  }
});
