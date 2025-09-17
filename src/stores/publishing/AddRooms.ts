// src/stores/publishing/AddRooms.ts
import { defineStore } from 'pinia';

export type Room = {
  roomnumber: string;
  capacitypeople: string;
  price: string;
  roomtype: string;
};

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    roomsList: [] as Room[]
  }),
  actions: {
    // 호실 정보 추가
    addrooms(room: Room) {
      this.roomsList.push(room);
    },

    // 특정 호실 삭제
    removeRoom(index: number) {
      this.roomsList.splice(index, 1);
    }

  }
});

