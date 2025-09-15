<template>
  <main class="p-6">
    <div v-if="loading">로딩 중...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-2">{{ place.name }}</h1>
      <p class="text-gray-600 mb-2">{{ place.description }}</p>
      <p class="text-sm text-gray-500 mb-2">
        {{ place.sido }} {{ place.sigungu }} {{ place.roadName }} {{ place.detailAddress }}
      </p>
      <p v-if="place.avgRating" class="mb-4">⭐ {{ place.avgRating.toFixed(1) }} / 5.0</p>

      <div v-if="place.fileUrls && place.fileUrls.length > 0" class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden h-[400px]">
          <div class="h-full">
            <img
              v-if="place.fileUrls[0]"
              :src="place.fileUrls[0]"
              alt="숙소 대표 이미지"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="hidden md:grid grid-cols-2 grid-rows-2 gap-2 h-full">
            <div
              v-for="(img, index) in place.fileUrls.slice(1, 5)"
              :key="index"
              class="relative"
            >
              <img
                :src="img"
                :alt="`숙소 이미지 ${index + 2}`"
                class="w-full h-full object-cover"
              />
              <div
                v-if="index === 3 && place.fileUrls.length > 5"
                class="absolute inset-0 flex items-end justify-end p-3"
              >
                <button
                  @click="openModal"
                  class="bg-black bg-opacity-70 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-opacity-80"
                >
                  전체 사진 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="place.rooms && place.rooms.length > 0">
        <h2 class="text-xl font-semibold mb-4">잔여 객실</h2>
        <div
          v-for="(room, idx) in place.rooms"
          :key="idx"
          class="flex justify-between items-center border-b py-4"
          :class="room.status !== 'AVAILABLE' ? 'opacity-50 pointer-events-none' : ''"
        >
          <div>
            <p class="font-semibold">{{ room.roomType }}</p>
            <p class="text-sm text-gray-500">
              침대: {{ room.bedType }} / 수용인원: {{ room.capacityPeople }}명
            </p>
            <p class="text-sm text-gray-500">남은 객실 수: {{ room.capacityRoom }}</p>

            <p v-if="room.status !== 'AVAILABLE'" class="text-red-500 font-semibold mt-2">
              선택하신 날짜의 객실이 판매 완료되었습니다.
            </p>
          </div>
          <div class="text-right">
            <p v-if="room.price" class="text-red-500 font-bold">
              ₩{{ Number(room.price).toLocaleString() }}
            </p>
            <button
              v-if="room.status === 'AVAILABLE'"
              class="ml-4 px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500"
            >
              예약
            </button>
          </div>
        </div>
      </div>
    </div>

    <section v-show="mapLoaded" class="mt-10">
      <h2 class="text-xl font-semibold mb-4">지도보기</h2>
      <div ref="mapContainer" class="w-full h-96 rounded-lg shadow"></div>
      <p class="mt-2 text-gray-600 flex items-center gap-2">
        <i class="pi pi-map-marker"></i>
        {{ place.sido }} {{ place.sigungu }} {{ place.roadName }} {{ place.detailAddress }}
      </p>
    </section>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex justify-center items-center bg-black/60"
      @click="closeModal"
    >
      <div
        class="relative bg-white w-full max-w-4xl h-[90vh] rounded-lg p-4"
        @click.stop
      >
        <button
          @click="closeModal"
          class="absolute top-2 right-2 text-black bg-white rounded-full p-1 leading-none text-2xl z-10"
        >
          &times;
        </button>
        <div class="h-full overflow-y-auto grid grid-cols-3 gap-2">
          <div
            v-for="(img, index) in place.fileUrls"
            :key="`modal-${index}`"
            class="aspect-square"
          >
            <img
              :src="img"
              :alt="`숙소 전체 이미지 ${index + 1}`"
              class="w-full h-full object-cover rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
/// <reference types="google.maps" />

import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id as string;
const place = ref<any>({});
const loading = ref(true);
const error = ref('');
const mapContainer = ref<HTMLDivElement | null>(null);
const mapLoaded = ref(false);

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/places/${id}`);
    if (!res.ok) throw new Error('숙소 정보를 불러오지 못했습니다.');
    const data = await res.json();
    place.value = data.data;

    const waitForGoogleMaps = () =>
      new Promise<void>((resolve) => {
        if (window.google && window.google.maps) {
          resolve();
        } else {
          const check = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(check);
              resolve();
            }
          }, 100);
        }
      });

    await waitForGoogleMaps();

    if (mapContainer.value) {
      const map = new google.maps.Map(mapContainer.value, {
        center: { lat: 37.5665, lng: 126.978 },
        zoom: 15,
        mapId: '7a9f228f2f427f0087b53bb2',
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
      });

      const geocoder = new google.maps.Geocoder();
      const fullAddress = `${place.value.sido} ${place.value.sigungu} ${place.value.roadName} ${place.value.detailAddress}`;

      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);

          new google.maps.marker.AdvancedMarkerElement({
            map,
            position: location,
            title: place.value?.name ?? '',
          });
        } else {
          console.error('지오코딩 실패:', status);
        }
      });
      mapLoaded.value = true;
    }
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>
