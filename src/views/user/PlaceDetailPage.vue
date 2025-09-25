<template>
  <div class="flex justify-center mt-4!">
    <WishSearchBox @search="onSearch" />
  </div>

  <div v-if="loading" class="text-center py-10">로딩 중...</div>
  <div v-else-if="error" class="text-red-500 text-center py-10">{{ error }}</div>

  <div v-else class="w-full flex flex-col items-center px-6">
    <PrimeCard class="w-full max-w-7xl border-none! shadow-none!">
      <template #content>
        <h1 class="text-3xl! font-black! mb-2! flex items-center justify-between">
          <span class="font-semibold!">{{ place.name }}</span>
          <div class="flex items-center gap-2">
            <PrimeButton
              variant="text"
              @click="toggleWish"
              class="w-10 h-10 rounded-full! border! border-gray-200! flex items-center justify-center"
            >
              <i
                class="pi text-2xl"
                :class="place.isLiked ? 'pi-heart-fill text-red-500' : 'pi-heart text-gray-400'"
              ></i>
            </PrimeButton>

            <PrimeButton
              variant="text"
              @click="sharePlace(place)"
              class="w-10 h-10 rounded-full! border! border-gray-200! flex items-center justify-center"
            >
              <i class="pi pi-share-alt text-2xl text-gray-600"></i>
            </PrimeButton>
          </div>
        </h1>
        <p class="text-sm text-gray-600 flex items-center gap-1">
          <i class="pi pi-map-marker"></i>
          {{ place.sido }} {{ place.sigungu }} {{ place.roadName }} {{ place.detailAddress }}
        </p>
        <p v-if="place.avgRating" class="mb-4!">{{ place.avgRating.toFixed(1) }} / 5</p>
        <div v-if="place.fileUrls?.length > 0" class="mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
            <div class="aspect-[4/3]">
              <img
                v-if="place.fileUrls[0]"
                :src="place.fileUrls[0]"
                alt="숙소 대표 이미지"
                class="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div class="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
              <div
                v-for="(img, index) in place.fileUrls.slice(1, 5)"
                :key="index"
                class="relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <img
                  :src="img"
                  :alt="`숙소 이미지 ${index + 2}`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-if="index === place.fileUrls.slice(1, 5).length - 1"
                  class="absolute bottom-2 right-2 z-10"
                >
                  <button
                    @click="openModal"
                    class="text-white font-semibold text-sm px-4 py-2 rounded-full bg-black/70 hover:bg-black/80"
                  >
                    사진 모두 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </PrimeCard>

    <div
      ref="tabContainer"
      class="sticky top-0 z-40 w-full max-w-7xl bg-white border-b transition-all duration-300"
      :class="{ 'shadow-md': isSticky }"
    >
      <div class="flex">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="scrollToSection(tab.id)"
          class="flex-1 px-6 py-3 text-lg font-bold! text-gray-600 border-b-2 text-center"
          :class="
        activeTab === tab.id
          ? 'border-gray-800 text-gray-800'
          : 'border-transparent hover:bg-gray-100'
      "
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <section id="rooms" ref="roomsSection" class="w-full max-w-7xl!">
      <PrimeCard class="border-none! shadow-none! pt-4!">
        <template #content>
          <div
            v-for="(room, idx) in place.rooms"
            :key="idx"
            class="flex flex-col md:flex-row border-b py-6 gap-6"
          >
            <div class="w-full md:w-1/3">
              <PrimeGalleria
                :value="room.images"
                :numVisible="4"
                thumbnailsPosition="bottom"
                :showItemNavigators="true"
                :showItemNavigatorsOnHover="true"
                :responsiveOptions="responsiveOptions"
                class="h-full"
              >
                <template #item="slotProps">
                  <div class="w-full aspect-[4/3] overflow-hidden rounded-md">
                    <img
                      :src="slotProps.item.itemImageSrc"
                      :alt="slotProps.item.alt"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </template>
                <template #thumbnail="slotProps">
                  <img
                    :src="slotProps.item.thumbnailImageSrc"
                    :alt="slotProps.item.alt"
                    class="w-full h-full object-cover rounded-md aspect-square"
                  />
                </template>
              </PrimeGalleria>
            </div>

            <!-- 오른쪽: 텍스트 + 가격/버튼 -->
            <div class="flex-1 flex flex-col justify-between">
              <!-- 위: 방 정보 -->
              <div>
                <h3 class="text-2xl font-semibold! text-gray-800 mb-2">{{ room.roomType }}</h3>
                <p class="text-sm text-gray-500">
                  {{ room.bedType }}베드 1개 / 최대 {{ room.capacityPeople }}명
                </p>
                <p class="text-xs text-gray-400">남은 객실 수: {{ room.availableRoom }}</p>
                <p v-if="room.status !== 'AVAILABLE'" class="text-red-500 font-semibold mt-2">
                  선택하신 날짜의 객실이 판매 완료되었습니다.
                </p>
              </div>
              <!-- 아래: 가격 + 버튼 (row) -->
              <div class="flex items-center justify-between mt-4">
                <p v-if="room.price" class="text-2xl font-semibold! text-gray-700">
                  {{ Number(room.price).toLocaleString() }}원
                </p>
                <div class="flex gap-2">
                  <PrimeButton
                    v-if="room.status === 'AVAILABLE'"
                    @click="addToCart(room)"
                    icon="pi pi-shopping-cart"
                    class="px-4 py-2"
                  >
                  </PrimeButton>
                  <div class="flex items-center gap-4">
                    <PrimeButton
                      v-if="room.status === 'AVAILABLE'"
                      class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      @click="handleReservation(room.id)"
                    >
                      예약하기
                    </PrimeButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>
    </section>

    <section id="info" ref="infoSection" class="w-full max-w-7xl!">
      <PrimeCard class="border-none! shadow-none! pt-4!">
        <template #content>
          <h2 class="text-2xl font-bold! mb-4!">숙박 시설 정보</h2>
          <p class="text-gray-600 mb-6!">{{ place.description }}</p>

          <div v-if="place.services && place.services.length > 0" class="pt-6 border-t">
            <h3 class="text-lg font-semibold! mb-4!">편의시설</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
              <div
                v-for="service in place.services"
                :key="service.id"
                class="flex items-center gap-3"
              >
                <img :src="service.icon" :alt="service.name" class="w-6 h-6" />
                <span class="text-gray-700">{{ service.name }}</span>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>
    </section>

    <section
      id="map"
      ref="mapSection"
      v-show="place.sido"
      class="w-full flex flex-col items-center"
    >
      <PrimeCard class="w-full max-w-7xl border-none! shadow-none!">
        <template #content>
          <h2 class="text-xl font-bold! mb-4">위치</h2>
          <div ref="mapContainer" class="w-full h-96 rounded-lg shadow mb-2!"></div>
          <p class="mt-2 text-gray-600 flex gap-1">
            <i class="pi pi-map-marker"></i>
            {{ place.sido }} {{ place.sigungu }} {{ place.roadName }} {{ place.detailAddress }}
          </p>
        </template>
      </PrimeCard>
    </section>

    <section id="reviews" ref="reviewsSection" class="w-full max-w-7xl!">
      <ReviewSection :place-id="parseInt(id)"/>
    </section>
    <section id="questions" ref="questionsSection" class="w-full max-w-7xl!">
      <QuestionSection :place-id="parseInt(id)" />
    </section>
  </div>

  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex justify-center items-center bg-black/60"
    @click="closeModal"
  >
    <div class="relative bg-white w-full max-w-4xl h-[90vh] rounded-lg p-4" @click.stop>
      <button
        @click="closeModal"
        class="absolute top-2 right-2 text-black bg-white rounded-full p-1 leading-none text-2xl z-10"
      >
        &times;
      </button>
      <div class="h-full overflow-y-auto grid grid-cols-3 gap-2">
        <div v-for="(img, index) in place.fileUrls" :key="`modal-${index}`" class="aspect-square">
          <img
            :src="img"
            :alt="`숙소 전체 이미지 ${index + 1}`"
            class="w-full h-full object-cover rounded-md"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import WishSearchBox from '@/components/WishSearchBox.vue';

import ReviewSection from '@/views/user/reviews/ReviewSection.vue';
import QuestionSection from './questions/QuestionSection.vue'; // 👈 [추가]
import { useAuthStore } from '@/stores/authStore.ts';


// 기존 상태 변수
const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const place = ref<any>({});
const loading = ref(true);
const error = ref('');
const mapContainer = ref<HTMLDivElement | null>(null);
const isModalOpen = ref(false);

// 탭 및 스크롤 관련 상태 변수
const tabs = [
  { id: 'rooms', label: '객실' },
  { id: 'info', label: '정보' },
  { id: 'map', label: '지도' },
  { id: 'reviews', label: '리뷰' },
  { id: 'questions', label: '문의' },
];
const activeTab = ref('rooms');
const isSticky = ref(false);

const responsiveOptions = [
  {
    breakpoint: '1024px',
    numVisible: 3,
  },
  {
    breakpoint: '768px',
    numVisible: 2,
  },
  {
    breakpoint: '560px',
    numVisible: 1,
  },
];
const toggleWish = async () => {
  try {
    if (place.value.isLiked) {
      await apiClient.delete(`/v1/wishlist/${id}`);
      place.value.isLiked = false;
    } else {
      await apiClient.post(`/v1/wishlist/${id}`);
      place.value.isLiked = true;
    }
  } catch (err) {
    console.error('찜 토글 실패:', err);
  }
};

const sharePlace = (place: any) => {
  const shareData = {
    title: place.name,
    text: `${place.name} 숙소를 확인해보세요!`,
    url: window.location.href,
  };

  if (navigator.share) {
    navigator.share(shareData).catch((err) => console.error('공유 실패:', err));
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다.');
  }
};

// 각 섹션의 ref
const tabContainer = ref<HTMLDivElement | null>(null);
const roomsSection = ref<HTMLElement | null>(null);
const infoSection = ref<HTMLElement | null>(null);
const mapSection = ref<HTMLElement | null>(null);
const reviewsSection = ref<HTMLElement | null>(null);
const questionsSection = ref<HTMLElement | null>(null);

const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};

const addToCart = async (room: any) => {
  try {
    let startDate = route.query.checkIn as string | undefined;
    let endDate = route.query.checkOut as string | undefined;
    if (!startDate || !endDate) {
      const saved = localStorage.getItem('recentSearch');
      if (saved) {
        const parsed = JSON.parse(saved);
        startDate = parsed.checkIn;
        endDate = parsed.checkOut;
      }
    }
    if (!startDate || !endDate) {
      alert('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    const res = await apiClient.post(`http://localhost:8080/api/v1/cart/${room.roomId}`, null, {
      params: { startDate, endDate, quantity: 1 },
    });
    console.log('장바구니 추가 성공:', res.data);
  } catch (e) {
    console.error('장바구니 추가 실패:', e);
  }
};

const onSearch = (payload: {
  checkIn?: string;
  checkOut?: string;
  rooms: number;
  adults: number;
  children: number;
}) => {
  router.push({ query: { ...route.query, ...payload } });
};

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    // 복잡한 로직 없이 이 한 줄만 남깁니다.
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  activeTab.value = sectionId;
};

onMounted(async () => {
  try {
    // ⭐️ 데이터 로딩 로직
    let checkIn = route.query.checkIn as string | undefined;
    let checkOut = route.query.checkOut as string | undefined;
    let rooms = route.query.rooms as string | undefined;
    let adults = route.query.adults as string | undefined;
    let children = route.query.children as string | undefined;

    if (checkIn && checkOut) {
      localStorage.setItem(
        'detailSearch',
        JSON.stringify({
          checkIn,
          checkOut,
          rooms,
          adults,
          children,
        }),
      );
    } else {
      const saved = localStorage.getItem('detailSearch');
      if (saved) {
        const parsed = JSON.parse(saved);
        checkIn = parsed.checkIn;
        checkOut = parsed.checkOut;
        rooms = parsed.rooms;
        adults = parsed.adults;
        children = parsed.children;
      }
    }
    const res = await apiClient.get(`/v1/places/${id}`, {
      params: { startDate: checkIn, endDate: checkOut, rooms, adults, children },
    });
    const rawData = res.data.data;
    rawData.rooms = rawData.rooms.map((room: any) => {
      // DB에서 넘어온 images가 배열처럼 보여도 실제로는 문자열
      let images: string[] = [];
      if (Array.isArray(room.images)) {
        // 혹시나 배열일 경우 그대로
        images = room.images.flatMap((img: string) => img.split(','));
      } else if (typeof room.images === 'string') {
        // 문자열일 경우 split 처리
        images = room.images.split(',');
      }

      return {
        ...room,
        images: images.map((img: string) => ({
          itemImageSrc: img,
          thumbnailImageSrc: img,
          alt: room.roomType || '객실 이미지',
        })),
        imageUrl: images[0] || null, // 대표 이미지
      };
    });
    place.value = rawData;
    const {getAccessToken} = useAuthStore()
    if(getAccessToken){
      const wishRes = await apiClient.get(`/v1/wishlist/${id}`);
      place.value.isLiked = wishRes.data.data;
    }

  } catch (e: any) {
    error.value = e.message || '숙소 데이터를 불러오는 데 실패했습니다.';
  } finally {
    loading.value = false;
    await nextTick();

    if (tabContainer.value) {
      const tabHeight = tabContainer.value.offsetHeight;
      document.documentElement.style.setProperty('--tab-bar-height', `${tabHeight}px`);
      if (tabHeight > 0) {
        const topOffset = tabHeight + 40;
        const options = {
          root: null,
          threshold: 0, // 교차 비율 0%만 감지
          rootMargin: `-${topOffset}px 0px -${window.innerHeight - topOffset - 1}px 0px`,
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activeTab.value = entry.target.id;
            }
          });
        }, options);

        // ⭐️ ref가 제대로 연결되었는지 확인하는 로그
        console.log('[확인] roomsSection ref:', roomsSection.value);

        // 관찰 시작
        if (roomsSection.value) observer.observe(roomsSection.value);
        if (infoSection.value) observer.observe(infoSection.value);
        if (mapSection.value) observer.observe(mapSection.value);
        if (reviewsSection.value) observer.observe(reviewsSection.value);
        if (questionsSection.value) observer.observe(questionsSection.value);
      }
    }
    // --- 지도 초기화 로직 (DOM이 준비되어야 하므로 이 위치가 적절합니다) ---
    if (place.value.sido && mapContainer.value) {
      const waitForGoogleMaps = () =>
        new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(check);
              resolve();
            }
          }, 100);
        });

      await waitForGoogleMaps();

      const map = new google.maps.Map(mapContainer.value, {
        center: { lat: 37.5665, lng: 126.978 },
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        mapId: '7a9f228f2f427f0087b53bb2',
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
    }
  }
});
// 예약 검색 조건 (쿼리 or localStorage)
const checkInDate = ref(route.query.checkIn as string || '');
const checkOutDate = ref(route.query.checkOut as string || '');
const adults = ref(route.query.adults as string || '');
const children = ref(route.query.children as string || '');
const rooms = ref(route.query.rooms as string || '');

const handleReservation = (roomId: number) => {
  if (!checkInDate.value || !checkOutDate.value) {
    alert('체크인/체크아웃 날짜 정보가 없습니다.');
    return;
  }
  router.push({
    path: '/places/order',
    query: {
      hotelId: id,
      roomId,
      checkIn: checkInDate.value,
      checkOut: checkOutDate.value,
      adults: adults.value,
      children: children.value,
      rooms: rooms.value,
    },
  });
};

</script>
<style scoped>
section[id] {
  scroll-margin-top: var(--tab-bar-height);
}
</style>
