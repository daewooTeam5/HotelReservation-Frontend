// filepath: src/stores/publishing/registerStore.ts

import { defineStore } from 'pinia';
import { apiClient } from '@/utils/axiosClient';

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
};

export type Address = {
  sigungu: string; sido: string; town: string; roadName: string;
  postalCode: string; detailAddress: string;
};

export type Amenity = { id: number; name: string; checked: boolean };

export type RegisterState = {
  editingPlaceId: number | null; // 💡 수정 모드인지 확인하기 위한 ID
  name: string;
  categoryId: number | string;
  description: string;
  hotelImages: string[];
  rooms: RoomForm;
  addedRooms: RoomForm[];
  discounts: DiscountOption[];
  amenities: Amenity[];
  checkIn: string;
  checkOut: string;
  images: string[]; // 객실 등록 페이지용 임시 이미지 배열
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
  width: 0, images: [],
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
  actions: {
    // 💡 [추가] 수정 모드를 위해 서버에서 데이터를 불러와 state를 채우는 액션
    async hydrateStoreForEdit(placeId: number) {
      this.clearStore();
      try {
        const response = await apiClient.get(`/hotel/publishing/get/${placeId}`);
        const data = response.data.data;

        this.editingPlaceId = placeId;
        this.name = data.hotelName;
        this.description = data.description;
        this.categoryId = data.CategoryId; // 백엔드 DTO 필드명 'CategoryId'와 일치
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

    // 💡 [추가] 스토어를 초기 상태로 되돌리는 액션
    clearStore() {
      this.$reset();
    },

    // --- 기존 액션들 ---
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
    },
    removeAddedRoom(index: number) {
      this.addedRooms.splice(index, 1);
    },
    addImage(dataUrl: string) {
      this.images.push(dataUrl);
    },
    removeImage(index: number) {
      this.images.splice(index, 1);
    },
    addHotelImage(dataUrl: string) {
      this.hotelImages.push(dataUrl);
    },
    removeHotelImage(index: number) {
      this.hotelImages.splice(index, 1);
    }
  }
});
