<script setup lang="ts">
import { ref } from 'vue';
import { useRoomsStore } from '@/stores/publishing/AddRooms.ts';
import { useRouter } from 'vue-router';

const roomsstore = useRoomsStore();
const router = useRouter();

const roomnumber = ref('');
const capacitypeople = ref('');
const price = ref('');
const roomType = ref('');

// 호실 등록 함수
const addRoom = () => {
  if (!roomnumber.value.trim() || !capacitypeople.value.trim() || !price.value.trim() || !roomType.value.trim()) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  roomsstore.addrooms({
    roomnumber: roomnumber.value.trim(),
    capacitypeople: capacitypeople.value.trim(),
    price: price.value.trim(),
    roomtype: roomType.value.trim()
  });

  // 입력 필드 초기화
  roomnumber.value = '';
  capacitypeople.value = '';
  price.value = '';
  roomType.value = '';
};

// 취소 버튼 클릭 함수
const cancel = () => {
  router.push('/HotelRegister');
};
</script>

<template>
  <div class="room-container">
    <div class="room-card">
      <h1>호실 등록</h1>
      <form class="room-form" @submit.prevent="addRoom">
        <div class="form-group">
          <label for="roomnumber">호실 번호</label>
          <input id="roomnumber" v-model="roomnumber" placeholder="호실 번호 입력" />
        </div>

        <div class="form-group">
          <label for="capacitypeople">최대 수용 인원</label>
          <input id="capacitypeople" v-model="capacitypeople" placeholder="최대 수용 가능 인원" />
        </div>

        <div class="form-group">
          <label for="price">가격</label>
          <input id="price" v-model="price" placeholder="가격 입력" />
        </div>

        <div class="form-group">
          <label for="roomType">숙소 형식</label>
          <input id="roomType" v-model="roomType" placeholder="숙소 형식 입력" />
        </div>

        <div class="button-group">
          <button type="submit" class="submit-btn">등록</button>
          <button type="button" class="cancel-btn" @click="cancel">뒤로가기</button>
        </div>

        <ul v-if="roomsstore.roomsList.length" class="room-list">
          <li v-for="(room, index) in roomsstore.roomsList" :key="index">
            {{ room.roomnumber }}호 - {{ room.roomtype }} ({{ room.capacitypeople }}명) - {{ room.price }}원
          </li>
        </ul>
      </form>
    </div>
  </div>
</template>

<style scoped>
.room-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20px;
}

.room-card {
  background: #fff;
  width: 400px;
  max-width: 100%;
  border-radius: 10px;
  padding: 30px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.submit-btn {
  flex: 1;
  background: #4caf50;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
}

.cancel-btn {
  flex: 1;
  background: #f44336;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #45a049;
}

.cancel-btn:hover {
  background: #e53935;
}

.room-list {
  margin-top: 20px;
  padding-left: 0;
  list-style: none;
}

.room-list li {
  display: flex;
  justify-content: space-between;
  background: #f1f1f1;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}
</style>
