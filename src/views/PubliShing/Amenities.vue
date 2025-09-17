<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceStore } from '@/stores/publishing/AddService.ts';

const servicestore = useServiceStore();
const router = useRouter();
const servicename = ref('');

// 서비스 등록 함수
const addService = () => {
  const name = servicename.value.trim();
  if (name) {
    servicestore.addService({ servicename: name });
    servicename.value = ''; // 입력창 초기화
  } else {
    alert('서비스 이름을 입력해주세요.');
  }
};

// 서비스 삭제
const removeService = (index: number) => {
  servicestore.serviceList.splice(index, 1);
};
</script>

<template>
  <div class="service-container">
    <div class="service-card">
      <h1>서비스 입력</h1>
      <form class="service-form" @submit.prevent="addService">
        <div class="form-group">
          <label for="servicename">서비스 이름</label>
          <input id="servicename" v-model="servicename" placeholder="서비스 이름 입력" />
        </div>

        <div class="button-group">
          <button type="submit" class="submit-btn">서비스 등록</button>
          <button type="button" class="cancel-btn" @click="router.push('/HotelRegister')">
            뒤로가기
          </button>
        </div>

        <ul v-if="servicestore.serviceList.length" class="service-list">
          <li v-for="(s, i) in servicestore.serviceList" :key="i">
            {{ s.servicename }}
            <button @click="removeService(i)" class="delete-btn">삭제</button>
          </li>
        </ul>
      </form>
    </div>
  </div>
</template>

<style scoped>
.service-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20px;
}

.service-card {
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

.service-list {
  margin-top: 20px;
  padding-left: 0;
  list-style: none;
}

.service-list li {
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
