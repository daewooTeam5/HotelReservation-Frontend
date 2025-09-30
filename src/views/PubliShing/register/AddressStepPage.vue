<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';
import HotelRegistrationRestore from '@/components/hotel/HotelRegistrationRestore.vue';

const store = useRegisterStore();
const router = useRouter();
const mapContainer = ref<HTMLDivElement | null>(null);
const showRestoreComponent = ref(true);

let map: any;
let marker: any;

// 주소 입력값 변경 시 자동 저장
watch(
  () => [store.address.sido, store.address.sigungu, store.address.town, store.address.postalCode, store.address.detailAddress],
  () => {
    store.autoSave();
  },
  { deep: true }
);

const goPrev = () => router.push('/publishing/register/basic');
const goNext = () => {
  if (!store.address.sido.trim()) {
    alert('지도에서 위치를 클릭하여 주소를 설정해주세요.');
    return;
  }

  if (!store.address.sigungu.trim()) {
    alert('지도에서 위치를 클릭하여 주소를 설정해주세요.');
    return;
  }

  router.push('/publishing/register/amenities');
};

// 데이터 복원 완료 또는 새로 시작 시 호출
const onDataRestored = () => {
  showRestoreComponent.value = false;
};

// 새로 시작하기 선택 시 호출
const onStartNew = () => {
  showRestoreComponent.value = false;
  store.clearStoreAndStorage();
};

// 카카오 지도 SDK 로드
function loadKakaoMapSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).kakao && (window as any).kakao.maps) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=09b7f58876246da1f6c1daa09940837e&autoload=false&libraries=services";
    script.async = true;
    script.onload = () => {
      (window as any).kakao.maps.load(() => {
        resolve();
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  // 첫 페이지에서 넘어온 경우 복원 컴포넌트 숨김
  if (store.name || store.categoryId || store.hotelImages.length > 0) {
    showRestoreComponent.value = false;
  }

  try {
    await loadKakaoMapSdk();

    if (!mapContainer.value) return;

    const container = mapContainer.value;
    const options = {
      center: new (window as any).kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심
      level: 8
    };

    map = new (window as any).kakao.maps.Map(container, options);

    // 마커 생성
    marker = new (window as any).kakao.maps.Marker({
      position: map.getCenter()
    });
    marker.setMap(map);

    // 주소-좌표 변환 객체 생성
    const geocoder = new (window as any).kakao.maps.services.Geocoder();

    // 지도 클릭 이벤트
    (window as any).kakao.maps.event.addListener(map, 'click', function(mouseEvent: any) {
      const latlng = mouseEvent.latLng;

      // 마커 위치 변경
      marker.setPosition(latlng);

      // 좌표를 스토어에 저장
      store.address.latitude = latlng.getLat();
      store.address.longitude = latlng.getLng();

      // 좌표로 주소 검색
      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
        if (status === (window as any).kakao.maps.services.Status.OK) {
          console.log(result);
          const addr = result[0];

          // 도로명주소 우선, 없으면 지번주소 사용
          const address =addr.address;
          const postaddr = addr.road_address;
          console.log(postaddr);

          if (address) {
            // 주소 정보를 스토어에 저장 (카카오 API depth 구조에 맞춰)
            store.address.sido = address.region_1depth_name || '';      // 1depth: 시/도 (서울특별시)
            store.address.sigungu = address.region_2depth_name || '';   // 2depth: 시/군/구 (용산구)
            store.address.town = address.region_3depth_name || '';      // 3depth: 읍/면/동 (용산동2가)
            store.address.postalCode = postaddr?.zone_no || '';

            // 자동 저장
            store.autoSave();

            console.log('주소 정보가 업데이트되었습니다:', {
              sido: address.region_1depth_name,
              sigungu: address.region_2depth_name,
              town: address.region_3depth_name,
              coordinates: {
                lat: latlng.getLat(),
                lng: latlng.getLng()
              }
            });
          }
        }
      });
    });

  } catch (error) {
    console.error('카카오 지도 로드 실패:', error);
    alert('지도를 로드하는데 실패했습니다. 카카오 API 키를 확인해주세요.');
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-4">
      <div class="flex flex-col w-1/2 h-[400px] gap-2">
        <!-- 시/도 입력 (지도 클릭 시 자동 입력, 수동 수정 가능) -->
        <InputText v-model="store.address.sido" placeholder="시/도" class="w-full h-[72px]" />

        <!-- 시/군/구 입력 (지도 클릭 시 자동 입력, 수동 수정 가능) -->
        <InputText v-model="store.address.sigungu" placeholder="시/군/구" class="w-full h-[72px]" />

        <!-- 읍/면/동 입력 (지도 클릭 시 자동 입력, 수동 수정 가능) -->
        <InputText v-model="store.address.town" placeholder="읍/면/동" class="w-full h-[72px]" />


        <!-- 우편번호 (지도 클릭 시 자동 입력, 수동 수정 가능) -->
        <InputText v-model="store.address.postalCode" placeholder="우편번호" class="w-full h-[72px]" />

        <!-- 상세주소 (수동 입력) -->
        <InputText v-model="store.address.detailAddress" placeholder="상세주소" class="w-full h-[72px]" />
      </div>

      <div class="w-1/2">
        <div ref="mapContainer" class="w-full h-[400px] border rounded-lg"></div>
        <p class="text-sm text-gray-600 mt-2 text-center">
          📍 지도를 클릭하면 주소가 자동 입력되며, 직접 수정도 가능합니다
        </p>
      </div>
    </div>

    <!-- 버튼 -->
    <div class="flex justify-between mt-4 w-full max-w-[1200px] mx-auto">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>

    <!-- 데이터 복원 컴포넌트 -->
    <div v-if="showRestoreComponent" class="mt-4">
      <HotelRegistrationRestore @data-restored="onDataRestored" @start-new="onStartNew" />
    </div>
  </div>
</template>
