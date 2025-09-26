<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRegisterStore } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();
const mapContainer = ref<HTMLDivElement | null>(null);

let map: google.maps.Map;
let marker: google.maps.Marker;
let infoWindow: google.maps.InfoWindow;

const goPrev = () => router.push('/publishing/register/policy');
const goNext = () => {
  if (!store.address.sido.trim()) {
    alert('시/도를 선택해주세요.');
    return;
  }

  if (!store.address.sigungu.trim()) {
    alert('시/군/구를 선택해주세요.');
    return;
  }

  router.push('/publishing/register/confirm');
};




const addressData = {
  "서울특별시": ["종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구"],
  "부산광역시": ["중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구", "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구", "사상구", "기장군"],
  "대구광역시": ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "군위군", "달성군"],
  "인천광역시": ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
  "광주광역시": ["동구", "서구", "남구", "북구", "광산구"],
  "대전광역시": ["동구", "중구", "서구", "유성구", "대덕구"],
  "울산광역시": ["중구", "남구", "동구", "북구", "울주군"],
  "세종특별자치시": [],
  "경기도": ["수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시", "동두천시", "안산시", "고양시", "과천시", "구리시", "남양주시", "오산시", "시흥시", "군포시", "의왕시", "하남시", "용인시", "파주시", "이천시", "안성시", "김포시", "화성시", "광주시", "양주시", "포천시", "여주시", "연천군", "가평군", "양평군"],
  "강원특별자치도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
  "충청북도": ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
  "충청남도": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
  "전북특별자치도": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
  "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
  "경상북도": ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
  "경상남도": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
  "제주특별자치도": ["제주시", "서귀포시"]
};


const sidos = Object.keys(addressData);
const sigungus = ref<string[]>([]);

// 시/도 선택 시 시/군/구 목록 갱신
watch(
  () => store.address.sido,
  (newSido) => {
    sigungus.value = newSido ? addressData[newSido] || [] : [];
    store.address.sigungu = ''; // 시/군/구 초기화
  }
);

// Google Maps SDK 로드
function loadGoogleMapSdk(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google) return resolve();
    const script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCU23rHwv9wp1TCH5ekcMtd_-aY3A_LZnY&libraries=places&language=ko";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  await loadGoogleMapSdk();
  if (!mapContainer.value) return;

  map = new google.maps.Map(mapContainer.value!, {
    center: { lat: 37.5665, lng: 126.9780 },
    zoom: 8,
  });

  marker = new google.maps.Marker({ map });
  infoWindow = new google.maps.InfoWindow({ maxWidth: 250 });

  const geocoder = new google.maps.Geocoder();

  // 지도 클릭 시 주소 자동 세팅
  map.addListener('click', (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    marker.setPosition(e.latLng);

    geocoder.geocode({ location: e.latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const addr = results[0];
        const components = addr.address_components;

        infoWindow.setContent(`<div>${addr.formatted_address}</div>`);
        infoWindow.open(map, marker);

        store.address.roadName = addr.formatted_address;

        // 시/도
        store.address.sido =
          components.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';

        // 시/군/구
        store.address.sigungu =
          components.find(c => c.types.includes('sublocality_level_1'))?.long_name ||
          components.find(c => c.types.includes('locality'))?.long_name ||
          components.find(c => c.types.includes('administrative_area_level_2'))?.long_name || '';

        store.address.postalCode =
          components.find(c => c.types.includes('postal_code'))?.long_name || '';
      }
    });
  });
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-4">
      <div class="flex flex-col w-1/2 h-[400px] gap-2">
        <!-- 시/도 select -->
        <select v-model="store.address.sido" class="w-full h-[72px] border p-2 rounded">
          <option value="" disabled><span class="text-red-500">*</span>시/도 선택</option>
          <option v-for="sido in sidos" :key="sido" :value="sido">{{ sido }}</option>
        </select>

        <!-- 시/군/구 select -->
        <select v-model="store.address.sigungu" class="w-full h-[72px] border p-2 rounded" :disabled="!store.address.sido">
          <option value="" disabled><span class="text-red-500">*</span>시/군/구 선택</option>
          <option v-for="sigungu in sigungus" :key="sigungu" :value="sigungu">{{ sigungu }}</option>
        </select>

        <!-- 읍/면/동 수동 입력 -->
        <InputText v-model="store.address.town" placeholder="읍/면/동" class="w-full h-[72px]" />

        <!-- 나머지 입력 -->
        <InputText v-model="store.address.roadName" placeholder="도로명" class="w-full h-[72px]" />
        <InputText v-model="store.address.postalCode" placeholder="우편번호" class="w-full h-[72px]" />
        <InputText v-model="store.address.detailAddress" placeholder="상세주소" class="w-full h-[72px]" />
      </div>

      <div class="w-1/2">
        <div ref="mapContainer" class="w-full h-[400px] border"></div>
      </div>
    </div>

    <!-- 버튼 -->
    <div class="flex justify-between mt-4 w-full max-w-[1200px] mx-auto">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>
