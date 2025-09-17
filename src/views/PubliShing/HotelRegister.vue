<template>
  <div class="publishing-container">
    <div class="publishing-card">
      <h1 style="font-size: 24px;">숙소 등록</h1>
      <form class="hregister" @submit.prevent="submitForm">

        <!-- 숙소 이름 -->
        <div class="form-group">
          <label for="hotelName">숙소 이름</label>
          <input type="text" v-model="form.hotelName" id="hotelName" placeholder="숙소 이름 입력"/>
        </div>

        <!-- 주소 -->
        <div class="form-group">
          <button type="button" @click="goToAddressPage" class="full-btn">주소 추가/수정</button>
          <ul>
            <li v-for="(addr, index) in form.addressList" :key="index">
              {{ addr.province }} {{ addr.city }} {{ addr.street }}
            </li>
          </ul>
        </div>

        <!-- 이미지 관리 -->
        <div class="form-group">
          <button type="button" @click="goToImagesPage" class="full-btn">이미지 추가/수정</button>
          <ul>
            <li v-for="(img, index) in form.images" :key="index">{{ img }}</li>
          </ul>
        </div>

        <!-- 객실 -->
        <div class="form-group">
          <button type="button" @click="goToRoomsPage" class="full-btn">객실 추가/수정</button>
          <ul>
            <li v-for="(room, index) in form.rooms" :key="index">
              {{ room.name }} - {{ room.price }}원
            </li>
          </ul>
        </div>

        <!-- 편의시설 관리 -->
        <div class="form-group">
          <button type="button" @click="goToAmenitiesPage" class="full-btn">편의시설 추가/수정</button>
          <ul>
            <li v-for="(amenity, index) in form.amenities" :key="index">{{ amenity }}</li>
          </ul>
        </div>

        <!-- 설명 -->
        <div class="form-group">
          <label for="description">설명</label>
          <textarea v-model="form.description" id="description"></textarea>
        </div>

        <!-- 제출 -->
        <button type="submit" class="submit-btn">등록</button>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// Pinia 스토어 import
import { usePublishingStore } from '@/stores/publishing/AddAddress';
import { useImageStore } from '@/stores/publishing/AddImage';
import { useRoomsStore } from '@/stores/publishing/AddRooms';
import { useServiceStore } from '@/stores/publishing/AddService';

const router = useRouter();

// 메인 form에 기존 필드만 남기고, 리스트들은 스토어에서 가져오도록 computed
const publishingstore = usePublishingStore();
const imagestore = useImageStore();
const roomsstore = useRoomsStore();
const servicestore = useServiceStore();

const form = reactive({
  hotelName: '',
  description: '',
});

// 외부 폼 데이터 연결
const addressList = computed(() => publishingstore.addressList);
const images = computed(() => imagestore.images);
const rooms = computed(() => roomsstore.roomsList);
const amenities = computed(() => servicestore.serviceList);

// 페이지 이동
const goToAddressPage = () => router.push('/publishing/address');
const goToRoomsPage = () => router.push('/publishing/rooms');
const goToImagesPage = () => router.push('/publishing/images');
const goToAmenitiesPage = () => router.push('/publishing/amenities');

// 제출
const submitForm = async () => {
  try {
    // form + 외부 리스트 합쳐서 보내기
    const payload = {
      hotelName: form.hotelName,
      description: form.description,
      addressList: addressList.value,
      images: images.value,
      rooms: rooms.value,
      amenities: amenities.value
    };

    await axios.post('http://localhost:8888/hotel/publishing/register', payload, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    alert('등록 완료!');
  } catch(err) {
    console.error(err);
    alert('등록 실패');
  }
};
</script>


<style scoped>
.publishing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #c4efc8;
}

.publishing-card {
  background: white;
  padding: 40px;
  border-radius: 2px;
  width: 400px;
  max-width: 90%;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

textarea {
  min-height: 80px;
  resize: vertical;

  font-size: 12px;
}

button {
  cursor: pointer;
  border-radius: 6px;
  border: none;
}

.full-btn {
  width: 100%;
  padding: 10px;
  background: #b5abab;
  color: white;
  font-weight: bold;
  margin-top: 5px;
}

.full-btn:hover {
  background: #636363;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background: #dac541;
  color: white;
  font-weight: bold;
  margin-top: 20px;
}

.submit-btn:hover {
  background: #eda500;
}

ul {
  margin: 5px 0 0 0;
  padding-left: 15px;
}
</style>
