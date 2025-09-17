<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePublishingStore } from '@/stores/publishing/AddAddress.ts';

const publishingstore = usePublishingStore();
const router = useRouter();

const province = ref('');
const city = ref('');
const town = ref('');
const road = ref('');
const detail_post = ref('');

// 목록 표시 여부를 위한 상태 변수
const showAddressList = ref(false);

const addAddress = () => {
  if (province.value && city.value && town.value && road.value && detail_post.value) {
    publishingstore.addAddress({
      province: province.value,
      city: city.value,
      town: town.value,
      road: road.value,
      detail_post: detail_post.value
    });

    // 주소 등록 후 입력 필드 초기화
    province.value = '';
    city.value = '';
    town.value = '';
    road.value = '';
    detail_post.value = '';
    alert('주소가 등록되었습니다!');

    // 주소 등록 후 목록을 바로 보이게 함
    showAddressList.value = true;
  } else {
    alert('모든 항목을 입력해주세요.');
  }
};

const removeAddress = (index: number) => {
  publishingstore.form.addressList.splice(index, 1);
};
</script>

<template>
  <div class="address-container">
    <div class="address-card">
      <h1>주소 입력</h1>
      <form class="address-form" @submit.prevent="addAddress">
        <div class="form-group">
          <label for="province">시/도</label>
          <input id="province" v-model="province" placeholder="시/도 입력" />
        </div>

        <div class="form-group">
          <label for="city">시/군/구</label>
          <input id="city" v-model="city" placeholder="시/군/구 입력" />
        </div>

        <div class="form-group">
          <label for="town">동/읍/면</label>
          <input id="town" v-model="town" placeholder="읍/면/동 입력" />
        </div>

        <div class="form-group">
          <label for="road">도로명</label>
          <input id="road" v-model="road" placeholder="도로명 입력" />
        </div>

        <div class="form-group">
          <label for="detail_post">상세주소</label>
          <input id="detail_post" v-model="detail_post" placeholder="상세주소 입력" />
        </div>

        <div class="button-group">
          <button type="submit" class="submit-btn">주소 등록</button>
          <button type="button" class="cancel-btn" @click="router.push('/HotelRegister')">뒤로가기</button>
        </div>

        <button
          v-if="publishingstore.form.addressList.length > 0"
          type="button"
          class="toggle-btn"
          @click="showAddressList = !showAddressList"
        >
          {{ showAddressList ? '주소 목록 숨기기' : '등록된 주소 보기' }}
        </button>

        <ul v-if="publishingstore.form.addressList.length && showAddressList" class="address-list"><li v-for="(addr, index) in publishingstore.form.addressList" :key="index">
            {{ addr.province }} {{ addr.city }} {{ addr.town }} {{ addr.road }} {{ addr.detail_post }}
            <button @click="removeAddress(index)" class="delete-btn">삭제</button>
          </li>
        </ul>
      </form>
    </div>
  </div>
</template>

<style scoped>
.address-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20px;
}

.address-card {
  background: #fff;
  width: 400px;
  max-width: 100%;
  border-radius: 10px;
  padding: 30px 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
  background: #4CAF50;
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

/* 새로 추가된 토글 버튼 스타일 */
.toggle-btn {
  width: 100%;
  background: #007BFF;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  margin-top: 10px;
}

.toggle-btn:hover {
  background: #0056b3;
}

.submit-btn:hover {
  background: #45a049;
}

.cancel-btn:hover {
  background: #e53935;
}

.address-list {
  margin-top: 20px;
  padding-left: 0;
  list-style: none;
}

.address-list li {
  display: flex;
  justify-content: space-between;
  background: #f1f1f1;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.delete-btn {
  background: #e53935;
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c62828;
}
</style>
