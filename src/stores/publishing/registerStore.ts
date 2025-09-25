// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/stores/publishing/registerStore.ts
import { defineStore } from 'pinia';

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
  checkIn: string;
  checkOut: string;
  isPublic: boolean;
  selectedBed: string;
  width: number;
  images: string[]; // 각 객실에 대한 이미지 배열
};

export type Address = {
  sigungu: string;
  sido: string;
  town: string;
  roadName: string;
  postalCode: string;
  detailAddress: string;
};

export type Amenity = { id:number; name: string; checked: boolean };


export type RegisterState = {
  name: string;
  categoryId: number | string;
  description: string;
  hotelImages: string[]; // 기본 정보 페이지용 이미지 배열
  rooms: RoomForm;
  addedRooms: RoomForm[];
  discounts: DiscountOption[];
  amenities: Amenity[];
  images: string[]; // 객실 등록 페이지용 임시 이미지 배열
  address: Address;
};

export const defaultBeds: BedOption[] = [
  { type: '싱글침대', width: '90~130cm', count: 0 },
  { type: '더블침대', width: '131~150cm', count: 0 },
  { type: '대형침대', width: '151~180cm', count: 0 },
  { type: '초대형 침대', width: '181~210cm', count: 0 }
];

const initialRoomState = (): RoomForm => ({
  capacityPeople: 1,
  price: 0,
  extraPrice: 0,
  roomNumber: 1,
  roomType: '',
  bedType: defaultBeds.map(b => ({ ...b })),
  checkIn: '',
  checkOut: '',
  isPublic: true,
  selectedBed: '',
  width: 0,
  images: [],
});


export const useRegisterStore = defineStore('registerStore', {
  state: (): RegisterState => ({
    name: '',
    categoryId: '',
    description: '',
    hotelImages: [], // hotelImages 초기 상태 정의
    rooms: initialRoomState(),
    addedRooms: [],
    discounts: [],
    amenities: [
      { id: 1, name: '냉방', checked: false },
      { id: 2, name: '주차 가능', checked: false },
      { id: 3, name: '난방', checked: false },
      { id: 4, name: '와인바', checked: false },
      { id: 5, name: '식당', checked: false },
      { id: 6, name: 'Wi-Fi', checked: false },
      { id: 7, name: '빨래', checked: false },
      { id: 8, name: '동물 동반 가능', checked: false },

    ],
    images: [],
    address: {
      sigungu: '', sido: '', town: '', roadName: '',
      postalCode: '', detailAddress: ''
    }
  }),
  actions: {
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
    // hotelImages를 위한 액션 정의
    addHotelImage(dataUrl: string) {
      this.hotelImages.push(dataUrl);
    },
    removeHotelImage(index: number) {
      this.hotelImages.splice(index, 1);
    }
  }
});
