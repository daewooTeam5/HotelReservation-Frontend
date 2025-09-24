<script lang="ts" setup>
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

const addRoom = () => store.addRoom();
const removeAddedRoom = (index: number) => store.removeAddedRoom(index);

const goPrev = () => router.push('/publishing/register/basic');
const goNext = () => router.push('/publishing/register/images');

</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-4">
    <div class="m-5">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">방 번호</p>
      <input-text v-model.number="store.rooms.roomNumber"></input-text>
    </div>

    <div class="m-5">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">룸 유형</p>
      <select v-model="store.rooms.roomType" class="w-full border rounded p-2">
        <option value="">선택</option>
        <option value="single">싱글룸</option>
        <option value="double">더블룸</option>
        <option value="twin">트윈룸</option>
        <option value="triple">트리플룸</option>
        <option value="qudruple">쿼드러플룸</option>
        <option value="swite">스위트룸</option>
        <option value="family">패밀리룸</option>
        <option value="apt">아파트룸</option>
      </select>
    </div>

    <div style="margin-top: 8px; margin-bottom: 8px;">
      <p style="margin-top: 5px; margin-bottom: 5px;" class=" font-semibold mb-2 text-gray-700 dark:text-gray-200">이 객실에 숙박 가능한 인원</p>
      <div class="flex items-center gap-2">
        <Button severity="secondary" @click="store.rooms.capacityPeople = Math.max(1, store.rooms.capacityPeople - 1)" >-</Button>
        <span style="margin-left: 3px; font-size: 18px;" class="w-8 text-center">{{ store.rooms.capacityPeople }}</span>
        <Button @click="store.rooms.capacityPeople++" >+</Button>
      </div>
    </div>

    <div style="margin-top: 8px; margin-bottom: 8px;">
      <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">제공되는 침대 선택</p>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="(b, idx) in store.rooms.bedType" :key="idx" class="flex items-center gap-2">
          <input
            type="radio"
            :id="'bed-' + idx"
            name="bedType"
            :value="b.type"
            v-model="store.rooms.selectedBed"
          />
          <label :for="'bed-' + idx" class="text-gray-700 dark:text-gray-200">
            {{ b.type }} ({{ b.width }})
          </label>
        </div>
      </div>
    </div>
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <p>객실 공개여부</p>

      <select v-model="store.rooms.isPublic" class="w-full border rounded p-2">
        <option value="">선택</option>
        <option value="true">공개</option>
        <option value="false">비공개</option>

      </select>
    </div>

    <div class="w-full">
      <Button label="객실 추가" class="!bg-blue-500 !border-blue-500" style="margin-top:6px;" @click="addRoom" />
    </div>

    <div v-if="store.addedRooms.length" class="mt-4 space-y-2">
      <p class="font-semibold text-gray-700 dark:text-gray-200">추가된 객실</p>
      <div v-for="(room, index) in store.addedRooms" :key="index" class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
        <div class="text-sm">
          <p>호실: {{ room.roomNumber }} | 유형: {{ room.roomType || '미정' }} | 최대인원: {{ room.capacityPeople }}
            | 공개여부: {{ room.isPublic }}</p>
        </div>
        <Button label="삭제" severity="danger" size="small" @click="removeAddedRoom(index)" />
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>
