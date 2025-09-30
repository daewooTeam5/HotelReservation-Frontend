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
            <div class="w-full md:w-1/4">
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

            <div class="flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-3xl font-semibold! text-gray-800 mb-2!">{{ room.roomType }}</h3>
                <p class="font-semibold! text-xl text-gray-500">
                  {{ room.bedType }}베드 1개 / 최대 {{ room.capacityPeople }}명
                </p>
                <p class="text-lg font-semibold! text-gray-400">
                  남은 객실 수: {{ room.availableRoom }}
                </p>

                <div class="mt-3! text-sm! text-gray-600 space-y-2">
                  <p v-if="room.area" class="flex items-center gap-1 text-lg">
                    <span>면적: {{ room.area }}평</span>
                  </p>
                  <div v-if="room.amenities && room.amenities.length > 0">
                    <div class="flex flex-wrap gap-x-4 gap-y-2 mt-2!">
                      <span
                        v-for="amenity in room.amenities"
                        :key="amenity.name"
                        class="flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-1 rounded-full"
                      >
                        <img :src="amenity.icon" :alt="amenity.name" class="w-8 h-8" />
                        <span>{{ amenity.name }}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <p v-if="room.isAvailable !== 1" class="text-red-500 font-semibold mt-2">
                  선택하신 조건으로 예약할 수 없습니다.
                </p>
              </div>
              <div class="flex items-center justify-between mt-4">
                <!-- 할인 있을 때 -->
                <div v-if="room.discountValue > 0" class="flex flex-col items-end">
                  <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-1">
                    {{ Math.round(room.discountValue) }}% 할인
                  </span>
                  <div class="flex items-baseline gap-2">
                    <span class="text-gray-500 line-through text-sm">
                      {{ Number(room.price).toLocaleString() }}원
                    </span>
                    <span class="text-gray-900 font-bold text-2xl">
                      {{ (Math.round(room.finalPrice / 100) * 100).toLocaleString() }}원
                    </span>
                  </div>
                </div>

                <!-- 할인 없을 때 -->
                <div v-else>
                  <span class="text-gray-900 font-bold text-2xl">
                    {{ Number(room.price).toLocaleString() }}원
                  </span>
                </div>

                <div class="flex gap-2">
                  <PrimeButton
                    @click="addToCart(room)"
                    icon="pi pi-shopping-cart"
                    class="px-4 py-2"
                    :disabled="room.isAvailable !== 1"
                  />
                  <div class="flex items-center gap-4">
                    <PrimeButton
                      class="px-4 py-2 text-white rounded-lg"
                      :class="
                        room.isAvailable === 1
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-400 cursor-not-allowed'
                      "
                      :disabled="room.isAvailable !== 1"
                      @click="handleReservation(room.roomId)"
                    >
                      {{ room.isAvailable === 1 ? '예약하기' : '예약 불가' }}
                    </PrimeButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>
    </section>

    <div class="w-full max-w-7xl mt-8 grid grid-cols-1 4xl:grid-cols-2 gap-6">
      <section
        id="info"
        ref="infoSection"
        class="transition-all duration-500 ease-in-out"
        :class="isMapExpanded ? 'md:col-span-2 order-1' : 'md:col-span-1 order-2 md:order-1'"
      >
        <PrimeCard class="border-none! shadow-none! pt-4!">
          <template #content>
            <h2 class="text-2xl font-bold! mb-4!">숙박 시설 정보</h2>
            <p class="text-gray-600 mb-6!">{{ place.description }}</p>
            <div v-if="place.services && place.services.length > 0" class="pt-6 border-t">
              <h3 class="text-lg font-semibold! mb-4!">편의시설</h3>
              <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
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
        v-if="place && place.sido"
        class="relative transition-all duration-500 ease-in-out"
        :class="
          isMapExpanded
            ? 'md:col-span-2 order-2 min-h-[80vh]'
            : 'md:col-span-1 order-1 md:order-2 min-h-[600px]'
        "
      >
        <PrimeCard class="w-full h-full border-none! shadow-none!">
          <template #content>
            <h2 class="text-xl font-bold! mb-4">위치</h2>
            <button
              @click="toggleMapExpansion"
              class="absolute top-16 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
              aria-label="지도 확장/축소"
            >
              <span class="material-symbols-outlined text-xl text-gray-700">
                {{ isMapExpanded ? 'fullscreen_exit' : 'fullscreen' }}
              </span>
            </button>
            <KakaoMapPlaceDetailPage
              ref="kakaoMap"
              :is-ready="isDataReady"
              :address="place.fullAddress"
              :placeName="place.name"
              :placeCategory="place.category"
              :placeRating="place.avgRating"
              @coords-updated="updateCoords"
            />
            <p class="mt-2 text-gray-600 flex gap-1">
              <i class="pi pi-map-marker"></i>
              {{ place.sido }} {{ place.sigungu }} {{ place.roadName }} {{ place.detailAddress }}
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <PrimeButton
                label="카카오맵에서 보기"
                icon="pi pi-directions"
                @click="openDirections"
                severity="secondary"
              />
            </div>
          </template>
        </PrimeCard>
      </section>
    </div>

    <section id="reviews" ref="reviewsSection" class="w-full max-w-7xl mt-8">
      <ReviewSection :place-id="parseInt(id)" />
    </section>
    <section id="questions" ref="questionsSection" class="w-full max-w-7xl mt-8">
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
import QuestionSection from './questions/QuestionSection.vue';
import { useAuthStore } from '@/stores/authStore.ts';
import KakaoMapPlaceDetailPage from './KakaoMap/KakaoMapPlaceDetailPage.vue';

// --- 상태 변수 및 라우터 설정 ---
const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const place = ref<any>(null);
const loading = ref(true);
const error = ref('');
const isModalOpen = ref(false);
const isMapExpanded = ref(false);
const kakaoMap = ref<InstanceType<typeof KakaoMapPlaceDetailPage> | null>(null);
const placeCoords = ref<{ lat: number; lng: number } | null>(null);
const isDataReady = ref(false);
const activeTab = ref('rooms');
const isSticky = ref(false);

const tabs = [
  { id: 'rooms', label: '객실' },
  { id: 'info', label: '정보' },
  { id: 'map', label: '지도' },
  { id: 'reviews', label: '리뷰' },
  { id: 'questions', label: '문의' },
];

const tabContainer = ref<HTMLDivElement | null>(null);
const roomsSection = ref<HTMLElement | null>(null);
const infoSection = ref<HTMLElement | null>(null);
const mapSection = ref<HTMLElement | null>(null);
const reviewsSection = ref<HTMLElement | null>(null);
const questionsSection = ref<HTMLElement | null>(null);

// --- 핵심 로직: 데이터 조회 및 관리 ---

/**
 * URL 쿼리 또는 로컬 스토리지에서 현재 검색 파라미터를 가져옵니다.
 * 우선순위: URL 쿼리 > 로컬 스토리지
 */
const getSearchParams = () => {
  const query = route.query;
  let params: any = {
    startDate: query.checkIn,
    endDate: query.checkOut,
    adults: query.adults,
    children: query.children,
    rooms: query.rooms,
  };

  // URL 쿼리에 날짜 정보가 없으면 로컬 스토리지에서 가져옵니다.
  if (!params.startDate || !params.endDate) {
    const saved = localStorage.getItem('detailSearch');
    if (saved) {
      const parsed = JSON.parse(saved);
      params.startDate = params.startDate || parsed.checkIn;
      params.endDate = params.endDate || parsed.checkOut;
      params.adults = params.adults || parsed.adults;
      params.children = params.children || parsed.children;
      params.rooms = params.rooms || parsed.rooms;
    }
  }
  return params;
};

/**
 * API를 호출하여 숙소 상세 정보를 가져오고 상태를 업데이트하는 중앙 함수입니다.
 */
const fetchPlaceDetails = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params = getSearchParams();

    // 현재 검색 조건을 로컬 스토리지에 저장하여 일관성을 유지합니다.
    if (params.startDate && params.endDate) {
      localStorage.setItem(
        'detailSearch',
        JSON.stringify({
          checkIn: params.startDate,
          checkOut: params.endDate,
          rooms: params.rooms,
          adults: params.adults,
          children: params.children,
        }),
      );
    }

    const res = await apiClient.get(`/v1/places/${id}`, { params });

    const rawData = res.data.data;
    // 방 이미지 데이터 가공
    rawData.rooms = rawData.rooms.map((room: any) => {
      let images: string[] = [];
      if (Array.isArray(room.images)) {
        images = room.images.flatMap((img: string) => img.split(','));
      } else if (typeof room.images === 'string') {
        images = room.images.split(',');
      }
      return {
        ...room,
        images: images.map((img: string) => ({
          itemImageSrc: img,
          thumbnailImageSrc: img,
          alt: room.roomType || '객실 이미지',
        })),
        imageUrl: images[0] || null,
      };
    });
    // 주소 데이터 가공
    rawData.fullAddress = `${rawData.sido} ${rawData.sigungu} ${rawData.roadName} ${rawData.detailAddress}`;
    place.value = rawData;

    // 찜 여부 확인 (로그인 시)
    const { getAccessToken } = useAuthStore();
    if (getAccessToken) {
      const wishRes = await apiClient.get(`/v1/wishlist/${id}`);
      place.value.isLiked = wishRes.data.data;
    }

    isDataReady.value = true;
  } catch (e: any) {
    error.value =
      e.response?.data?.message || e.message || '숙소 데이터를 불러오는 데 실패했습니다.';
    place.value = null; // 오류 발생 시 기존 데이터를 비웁니다.
  } finally {
    loading.value = false;
  }
};

// --- 이벤트 핸들러 ---

/**
 * WishSearchBox에서 검색 이벤트가 발생했을 때 호출됩니다.
 */
const onSearch = (payload: {
  checkIn?: string;
  checkOut?: string;
  rooms: number;
  adults: number;
  children: number;
}) => {
  // 1. URL 쿼리 파라미터를 업데이트합니다.
  router.push({ query: { ...route.query, ...payload } }).then(() => {
    // 2. URL 변경 후, 새로운 파라미터로 데이터를 다시 조회합니다.
    fetchPlaceDetails();
  });
};

/**
 * 예약하기 버튼 클릭 시 호출됩니다.
 */
const handleReservation = (roomId: number) => {
  const savedSearch = localStorage.getItem('detailSearch');
  if (!savedSearch) {
    alert('체크인/체크아웃 날짜 정보가 없습니다. 날짜를 선택 후 다시 시도해주세요.');
    return;
  }

  const { checkIn, checkOut, adults, children, rooms } = JSON.parse(savedSearch);

  if (!checkIn || !checkOut) {
    alert('체크인/체크아웃 날짜 정보가 없습니다.');
    return;
  }

  router.push({
    path: '/places/order',
    query: { hotelId: id, roomId, checkIn, checkOut, adults, children, rooms },
  });
};

/**
 * 장바구니 추가 버튼 클릭 시 호출됩니다.
 */
const addToCart = async (room: any) => {
  try {
    const params = getSearchParams();
    if (!params.startDate || !params.endDate) {
      alert('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    await apiClient.post(`/v1/cart/${room.roomId}`, null, {
      params: { startDate: params.startDate, endDate: params.endDate, quantity: 1 },
    });
    alert('장바구니에 추가되었습니다.');
  } catch (e) {
    console.error('장바구니 추가 실패:', e);
    alert('장바구니 추가에 실패했습니다.');
  }
};

// --- 기타 UI 관련 함수들 (변경 없음) ---

const toggleWish = async () => {
  if (!useAuthStore().isLoggedIn) {
    alert('로그인이 필요합니다.');
    router.push('/sign-in');
    return;
  }
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
  if (navigator.share) {
    navigator
      .share({
        title: place.name,
        text: `${place.name} 숙소를 확인해보세요!`,
        url: window.location.href,
      })
      .catch((err) => console.error('공유 실패:', err));
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다.');
  }
};

const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  activeTab.value = sectionId;
};

const toggleMapExpansion = () => {
  isMapExpanded.value = !isMapExpanded.value;
  setTimeout(() => kakaoMap.value?.relayout(), 500);
};

const updateCoords = (coords: { lat: number; lng: number }) => {
  placeCoords.value = coords;
};

const openDirections = () => {
  if (placeCoords.value && place.value) {
    const { lat, lng } = placeCoords.value;
    const placeName = encodeURIComponent(place.value.name);
    window.open(`https://map.kakao.com/link/to/${placeName},${lat},${lng}`, '_blank');
  } else {
    alert('지도 좌표를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
  }
};

// --- 생명주기 훅 ---

onMounted(async () => {
  // 컴포넌트 마운트 시 최초 데이터 로드
  await fetchPlaceDetails();

  // DOM이 렌더링된 후 스크롤 감지 로직 설정
  await nextTick();
  if (tabContainer.value) {
    const tabHeight = tabContainer.value.offsetHeight;
    document.documentElement.style.setProperty('--tab-bar-height', `${tabHeight}px`);

    if (tabHeight > 0) {
      const topOffset = tabHeight + 40;
      const options = {
        root: null,
        threshold: 0,
        rootMargin: `-${topOffset}px 0px -${window.innerHeight - topOffset - 1}px 0px`,
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeTab.value = entry.target.id;
          }
        });
      }, options);

      // 각 섹션에 대한 관찰자 등록
      const sections = [roomsSection, infoSection, mapSection, reviewsSection, questionsSection];
      sections.forEach((sec) => {
        if (sec.value) observer.observe(sec.value);
      });
    }
  }
});
</script>

<style scoped>
section[id] {
  scroll-margin-top: var(--tab-bar-height);
}
</style>
