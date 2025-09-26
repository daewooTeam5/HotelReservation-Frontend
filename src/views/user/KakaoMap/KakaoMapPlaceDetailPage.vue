<template>
  <div v-if="error" class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
    <div class="text-center">
      <p class="text-red-500 font-semibold">지도 로딩 실패</p>
      <p class="text-xs text-gray-500">{{ error }}</p>
    </div>
  </div>
  <div v-else ref="mapContainer" class="w-full h-full rounded-lg shadow no-padding"></div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { apiClient } from '@/utils/axiosClient.ts';

declare global {
  interface Window {
    kakao: any;
  }
}

const props = defineProps({
  // ⭐️ [추가] 부모로부터 렌더링 준비 신호를 받을 prop
  isReady: { type: Boolean, default: false },
  address: { type: String, required: true },
  placeName: { type: String, default: '숙소' },
  placeCategory: { type: String, default: '숙박' },
  placeRating: { type: Number, default: 0 }
});

const emit = defineEmits(['coords-updated']);

const mapContainer = ref<HTMLDivElement | null>(null);
const mapInstance = ref<any>(null);
// ⭐️ [추가] 에러 메시지를 저장할 상태
const error = ref<string | null>(null);

const initKakaoMap = () => {
  if (!props.address || !mapContainer.value) return;

  const { kakao } = window;
  const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 5,
  };
  const map = new kakao.maps.Map(mapContainer.value, mapOption);
  mapInstance.value = map;
  const geocoder = new kakao.maps.services.Geocoder();

  geocoder.addressSearch(props.address, (result: any, status: any) => {
    if (status === kakao.maps.services.Status.OK) {
      const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      emit('coords-updated', { lat: result[0].y, lng: result[0].x });
      const marker = new kakao.maps.Marker({ map, position: coords });
      const content = `
        <div style="padding:10px; background:white; border:1px solid #ccc; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 4px;">
          <div style="font-weight:bold; font-size: 14px;">${props.placeName}</div>
          <div>
            <span style="color: #FFD700; font-size: 12px;">★</span>
            <span style="font-size: 12px; font-weight: 600;">${props.placeRating ? props.placeRating.toFixed(1) : 'N/A'}</span>
            <span style="color: #888; margin-left: 8px; font-size: 12px;">${props.placeCategory}</span>
          </div>
        </div>
      `;
      const customOverlay = new kakao.maps.CustomOverlay({
        position: coords,
        content: content,
        yAnchor: 2.2
      });
      let isOpen = false;
      kakao.maps.event.addListener(marker, 'click', () => {
        if (isOpen) {
          customOverlay.setMap(null);
        } else {
          customOverlay.setMap(map);
        }
        isOpen = !isOpen;
      });
      map.setCenter(coords);
    }
  });
};

const loadKakaoMapScript = async () => {
  if (window.kakao && window.kakao.maps) {
    initKakaoMap();
    return;
  }
  try {
    // ⭐️ [수정] API 엔드포인트 확인
    const response = await apiClient.get('/v1/kakao/map-key');
    const KAKAO_API_KEY = response.data.data.apiKey;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false&libraries=services`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        initKakaoMap();
      });
    };
  } catch (err: any) {
    console.error('카카오 API 키를 가져오는 데 실패했습니다.', err);
    // ⭐️ [수정] 에러 상태를 업데이트하여 사용자에게 알림
    if (err.response) {
      error.value = `서버 통신 오류 (코드: ${err.response.status})`;
    } else {
      error.value = '네트워크 연결을 확인해주세요.';
    }
  }
};

watch(() => props.isReady, (newVal) => {
  if (newVal) {
    // [수정] nextTick으로 감싸서 DOM이 준비된 후 스크립트를 로드하도록 보장합니다.
    nextTick(() => {
      loadKakaoMapScript();
    });
  }
}, { immediate: true });
defineExpose({
  relayout: () => {
    if (mapInstance.value) {
      mapInstance.value.relayout();
    }
  }
});
</script>

<style>
.no-padding .p-card-content, .no-padding .p-card-body {
  padding: 0 !important;
}
</style>
