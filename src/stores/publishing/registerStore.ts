// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/stores/publishing/registerStore.ts
import { defineStore } from 'pinia';

export type BedOption = {
  type: string;
  width: string;
  count: number;
};

export type DiscountOption = {
  person: number; // 인원수
  discount: number; // %
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
  isPublic: boolean;  //방 공개 여부
};

export type Address = {
  sigungu: string;
  sido: string;
  roadName: string;
  postalCode: string;
  detailAddress: string;
};

export type Amenity = { name: string; checked: boolean };
export type Language = { types: string; checked: boolean };

export type RegisterState = {
  name: string;
  hotelType: string;
  description: string;
  rooms: RoomForm; // 현재 편집중인 룸
  addedRooms: RoomForm[]; // 추가된 룸 목록
  discounts: DiscountOption[];
  amenities: Amenity[];
  languages: Language[];
  images: string[]; // data URL (base64)
  address: Address;
};

export const defaultBeds: BedOption[] = [
  { type: '싱글침대', width: '90~130cm', count: 0 },
  { type: '더블침대', width: '131~150cm', count: 0 },
  { type: '대형침대(킹사이즈)', width: '151~180cm', count: 0 },
  { type: '초대형 더블침대(수퍼킹사이즈)', width: '181~210cm', count: 0 }
];

export const useRegisterStore = defineStore('registerStore', {
  state: (): RegisterState => ({
    name: '',
    hotelType: '',
    description: '',

    rooms: {
      capacityPeople: 1,
      price: 0,
      extraPrice: 0,
      roomNumber: 1,
      roomType: '',
      bedType: defaultBeds.map(b => ({ ...b })),
      checkIn: '',
      checkOut: '',
      isPublic: true
    },
    addedRooms: [],
    discounts: [],
    amenities: [
      { name: '무료 Wi-Fi', checked: false },
      { name: '주차장', checked: false },
      { name: '조식 제공', checked: false },
      { name: '수영장', checked: false },
      { name: '피트니스', checked: false },
      { name: '금연실', checked: false },
      { name: '바비큐 그릴', checked: false },
      { name: '테라스', checked: false },
      { name: '정원', checked: false },
      { name: '룸서비스', checked: false },
    ],
    languages: [
      { types: '한국어', checked: true },
      { types: '영어', checked: false },
      { types: '중국어', checked: false },
      { types: '일본어', checked: false }
    ],
    images: [],
    address: {
      sigungu: '',
      sido: '',
      roadName: '',
      postalCode: '',
      detailAddress: ''
    }
  }),
  actions: {
    resetBeds() {
      this.rooms.bedType = defaultBeds.map(b => ({ ...b }));
    },
    addRoom() {
      this.addedRooms.push(JSON.parse(JSON.stringify(this.rooms)) as RoomForm);
      this.rooms.roomNumber++;
    },
    removeAddedRoom(index: number) {
      this.addedRooms.splice(index, 1);
    },
    addLanguage(name: string) {
      if (!name.trim()) return;
      this.languages.push({ types: name.trim(), checked: false });
    },
    addImage(dataUrl: string) {
      this.images.push(dataUrl);
    },
    removeImage(index: number) {
      this.images.splice(index, 1);
    }
  }
});

