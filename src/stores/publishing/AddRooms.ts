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
    // 로컬스토리지에서 데이터 불러오기
    loadFromStorage() {
      try {
        const savedData = localStorage.getItem('hotel-rooms-draft');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          this.roomsList = parsedData.roomsList || [];
          console.log('객실 데이터를 로컬스토리지에서 불러왔습니다.');
          return true;
        }
      } catch (error) {
        console.error('객실 데이터 불러오기 실패:', error);
        this.clearStorage();
      }
      return false;
    },

    // 로컬스토리지에 저장
    saveToStorage() {
      try {
        const dataToSave = {
          roomsList: this.roomsList,
          timestamp: Date.now()
        };
        localStorage.setItem('hotel-rooms-draft', JSON.stringify(dataToSave));
        console.log('객실 데이터가 로컬스토리지에 저장되었습니다.');
      } catch (error) {
        console.error('객실 데이터 저장 실패:', error);
      }
    },

    // 로컬스토리지 삭제
    clearStorage() {
      try {
        localStorage.removeItem('hotel-rooms-draft');
        console.log('객실 데이터를 로컬스토리지에서 삭제했습니다.');
      } catch (error) {
        console.error('객실 데이터 삭제 실패:', error);
      }
    },

    // 호실 정보 추가
    addrooms(room: Room) {
      this.roomsList.push(room);
      this.saveToStorage();
    },

    // 특정 호실 삭제
    removeRoom(index: number) {
      this.roomsList.splice(index, 1);
      this.saveToStorage();
    }
  }
});
