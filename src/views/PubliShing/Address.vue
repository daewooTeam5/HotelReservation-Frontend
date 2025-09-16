<script setup>
import { usePublishingStore } from '@/stores/publishing';
import { ref } from 'vue';
const publishingStore = usePublishingStore();

const province = ref('');
const city = ref('');
const road = ref('');

const addAddress = () => {
  if(province.value && city.value && road.value){
    publishingStore.form.addressList.push({
      province: province.value,
      city: city.value,
      road: road.value
    });
    province.value = '';
    city.value = '';
    road.value = '';
  }
};
</script>

<template>
  <div>
    <input v-model="province" placeholder="시/도">
    <input v-model="city" placeholder="시/군/구">
    <input v-model="road" placeholder="도로명">
    <button @click="addAddress">주소 등록</button>
    <button on-click="/HotelRegister">취소</button>
  </div>
</template>
