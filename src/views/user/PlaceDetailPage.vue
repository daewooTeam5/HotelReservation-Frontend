<template>
  <div class="flex justify-center mt-4! w-full">
    <WishSearchBox @search="onSearch" />
  </div>

  <div v-if="loading" class="text-center py-10">로딩 중...</div>
  <div v-else-if="error" class="text-red-500 text-center py-10">{{ error }}</div>

  <div v-else class="w-full flex flex-col items-center px-4 md:px-6 pb-20 ">
    <PrimeCard class="w-full max-w-7xl border-none! shadow-none!">
      <template #content>
        <h1
          class="text-xl! md:text-3xl! font-black! mb-2! flex items-start md:items-center justify-between gap-4">
          <span class="font-semibold! break-keep">{{ place.name }}</span>
          <div class="flex items-center gap-2 shrink-0">
            <PrimeButton
              variant="text"
              @click="toggleWish"
              class="w-10 h-10 rounded-full! border! border-gray-200! flex items-center justify-center"
            >
              <i
                class="pi text-xl md:text-2xl"
                :class="place.isLiked ? 'pi-heart-fill text-red-500' : 'pi-heart text-gray-400'"
              ></i>
            </PrimeButton>

            <PrimeButton
              variant="text"
              @click="sharePlace(place)"
              class="w-10 h-10 rounded-full! border! border-gray-200! flex items-center justify-center"
            >
              <i class="pi pi-share-alt text-xl md:text-2xl text-gray-600"></i>
            </PrimeButton>
          </div>
        </h1>

        <p class="text-sm text-gray-600 flex items-start md:items-center gap-1 mb-2">
          <i class="pi pi-map-marker text-red-500 mt-0.5 md:mt-0"></i>
          <span class="break-keep">{{ place.detailAddress }}</span>
        </p>
        <p v-if="place.avgRating" class="mb-4! text-sm md:text-base font-bold">⭐
          {{ place.avgRating.toFixed(1) }} / 5</p>

        <div v-if="place.fileUrls?.length > 0" class="mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden relative">
            <div class="aspect-[4/3]">
              <img
                v-if="place.fileUrls[0]"
                :src="place.fileUrls[0]"
                alt="숙소 대표 이미지"
                class="w-full h-full object-cover rounded-lg cursor-pointer"
                @click="openModal"
              />
              <div class="absolute bottom-3 right-3 md:hidden">
                <button
                  @click.stop="openModal"
                  class="text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/70 backdrop-blur-sm"
                >
                  사진 모두 보기
                </button>
              </div>
            </div>
            <div class="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
              <div
                v-for="(img, index) in place.fileUrls.slice(1, 5)"
                :key="index"
                class="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                @click="openModal"
              >
                <img
                  :src="img"
                  :alt="`숙소 이미지 ${index + 2}`"
                  class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div
                  v-if="index === place.fileUrls.slice(1, 5).length - 1"
                  class="absolute bottom-2 right-2 z-10"
                >
                  <button
                    @click.stop="openModal"
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
      class="sticky top-0 z-40 w-full md:max-w-7xl bg-white border-b transition-all duration-300"
      :class="{ 'shadow-md': isSticky }"
    >
      <div class="flex overflow-x-auto no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="scrollToSection(tab.id)"
          class="flex-none md:flex-1 px-4 md:px-6 py-3 text-base md:text-lg font-bold! text-gray-600 border-b-2 text-center whitespace-nowrap transition-colors"
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

    <section id="rooms" ref="roomsSection" class="w-full md:max-w-7xl!">
      <PrimeCard class="border-none! shadow-none! p-0! md:pt-4!">
        <template #content>
          <div
            v-for="(room, idx) in place.rooms"
            :key="idx"
            class="flex flex-col md:flex-row border-b py-6 gap-6"
          >
            <!-- 모바일용 : 썸네일 없는 Galleria -->
            <div class="block md:hidden w-full ">
              <PrimeGalleria
                :value="room.images"
                :numVisible="1"
                :showThumbnails="false"
                :showItemNavigators="true"
                :showItemNavigatorsOnHover="true"
                class="w-full"
                containerClass="custom-galleria-mobile"
              >
                <template #item="slotProps">
                  <div class="w-full h-[300px] overflow-hidden relative">
                    <img
                      :src="slotProps.item.itemImageSrc"
                      :alt="slotProps.item.alt"
                      class="w-full h-full object-cover block"
                    />
                  </div>
                </template>
              </PrimeGalleria>
            </div>

            <!-- 데스크탑용 : 썸네일 있는 Galleria -->
            <div class="hidden md:block w-full md:w-1/4 aspect-[4/3] md:aspect-auto">
              <PrimeGalleria
                :value="room.images"
                :numVisible="4"
                thumbnailsPosition="bottom"
                :showItemNavigators="true"
                :showItemNavigatorsOnHover="true"
                :responsiveOptions="responsiveOptions"
                class="h-full w-full"
                containerClass="custom-galleria-desktop"
              >
                <template #item="slotProps">
                  <div class="w-full h-full overflow-hidden rounded-md">
                    <img
                      :src="slotProps.item.itemImageSrc"
                      :alt="slotProps.item.alt"
                      class="w-full h-full object-cover aspect-[4/3]"
                    />
                  </div>
                </template>

                <template #thumbnail="slotProps">
                  <div class="hidden md:block">
                    <img
                      :src="slotProps.item.thumbnailImageSrc"
                      :alt="slotProps.item.alt"
                      class="w-full h-full object-cover rounded-md aspect-square"
                    />
                  </div>
                </template>
              </PrimeGalleria>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-xl md:text-3xl font-semibold! text-gray-800 mb-2!">{{ room.roomName }}</h3>
                <p class="font-semibold! text-sm md:text-xl text-gray-500">
                  {{ room.bedType }}베드 1개 / 최대 {{ room.capacityPeople }}명
                </p>
                <p class="text-sm md:text-lg font-semibold! text-gray-400 mt-1">
                  남은 객실 수: <span class="text-indigo-600">{{ room.availableRoom }}</span>
                </p>

                <div class="mt-3! text-sm! text-gray-600 space-y-2">
                  <p v-if="room.area" class="flex items-center gap-1 text-sm md:text-lg">
                    <span><i class="pi pi-warehouse"></i> 객실크기: {{ room.area }}m<sup>2</sup></span>
                  </p>
                  <div v-if="room.amenities && room.amenities.length > 0">
                    <div class="flex flex-wrap gap-x-2 gap-y-2 mt-2!">
                      <span
                        v-for="amenity in room.amenities"
                        :key="amenity.name"
                        class="flex items-center gap-1 text-[10px] md:text-xs bg-gray-100 px-2 py-1 rounded-full"
                      >
                        <img :src="amenity.icon" :alt="amenity.name"
                             class="w-4 h-4 md:w-6 md:h-6" />
                        <span>{{ amenity.name }}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <p v-if="room.isAvailable !== 1" class="text-red-500 font-semibold mt-3 text-sm">
                  <i class="pi pi-exclamation-circle mr-1"></i>선택하신 조건으로 예약할 수 없습니다.
                </p>
              </div>

              <div
                class="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 gap-4">

                <div class="w-full md:w-auto flex justify-between md:block items-center">
                  <div v-if="room.discountValue > 0" class="flex flex-col items-start md:items-end">
                      <span
                        class="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded mb-1">
                        {{ Math.round(room.discountValue) }}% 할인
                      </span>
                    <div class="flex flex-col md:flex-row items-baseline gap-1 md:gap-2">
                        <span class="text-gray-500 line-through text-xs md:text-sm">
                          {{ Number(room.price).toLocaleString() }}원
                        </span>
                      <span class="text-gray-900 font-bold text-xl md:text-2xl">
                          {{ (Math.round(room.finalPrice / 100) * 100).toLocaleString() }}원
                        </span>
                    </div>
                  </div>
                  <div v-else>
                      <span class="text-gray-900 font-bold text-xl md:text-2xl">
                        {{ Number(room.price).toLocaleString() }}원
                      </span>
                  </div>
                </div>

                <div class="w-full md:w-auto">
                  <PrimeButton
                    class="w-full md:w-auto px-6 py-3 text-white rounded-lg font-bold text-sm md:text-base justify-center"
                    :class="
                        room.isAvailable === 1
                          ? 'bg-green-500 hover:bg-green-600 shadow-md'
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
        </template>
      </PrimeCard>
    </section>

    <div class="w-full max-w-7xl mt-8  gap-6">

      <section id="info" ref="infoSection">
        <PrimeCard class="border-none! shadow-none! pt-4!">
          <template #content>
            <h2 class="text-2xl font-bold! mb-4!">숙박 시설 정보</h2>
            <p class="text-gray-600 mb-6! whitespace-pre-line leading-relaxed">{{ place.description
              }}</p>
            <div v-if="place.services && place.services.length > 0" class="pt-6 border-t pb-6">
              <h3 class="text-lg font-semibold! mb-4!">편의시설</h3>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="service in place.services"
                  :key="service.id"
                  class="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <img
                    :src="service.icon"
                    :alt="service.name"
                    class="w-6 h-6 mr-3 object-contain"
                  />
                  <span class="text-gray-800 font-medium text-sm">{{ service.name }}</span>
                </div>
              </div>
            </div>

            <OwnerInfo :place-id="id" />
          </template>
        </PrimeCard>
      </section>

      <section id="map" ref="mapSection" v-if="place && place.sido">
        <PrimeCard class="w-full h-full border-none! shadow-none!">
          <template #content>
            <h2 class="text-xl font-bold! mb-4">위치</h2>

            <div class="w-full h-[300px] lg:h-[500px] rounded-lg overflow-hidden">
              <KakaoMapPlaceDetailPage
                ref="kakaoMap"
                :is-ready="isDataReady"
                :address="place.fullAddress"
                :placeName="place.name"
                :placeCategory="place.category"
                :placeRating="place.avgRating"
                :latitude="place.latitude"
                :longitude="place.longitude"
                @coords-updated="updateCoords"
                class="w-full h-full"
              />
            </div>

            <p class="mt-3 text-gray-600 flex gap-1 items-start text-sm md:text-base">
              <i class="pi pi-map-marker mt-1"></i>
              <span>{{ place.sido }} {{ place.sigungu }} {{ place.roadName }} {{ place.detailAddress
                }}</span>
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <PrimeButton
                label="카카오맵에서 보기"
                icon="pi pi-directions"
                @click="openDirections"
                severity="secondary"
                class="w-full md:w-auto"
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
    class="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm"
    @click="closeModal"
  >
    <div
      class="relative bg-white w-full max-w-5xl h-[100vh] md:h-[90vh] rounded-none md:rounded-lg p-4 md:p-8"
      @click.stop>
      <button
        @click="closeModal"
        class="absolute top-4 right-4 md:top-4 md:right-4 text-black bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-2xl z-20 shadow-lg"
      >
        &times;
      </button>
      <h3 class="text-xl font-bold mb-4 md:mb-6">숙소 사진 전체보기</h3>
      <div
        class="h-[calc(100%-3rem)] overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 pb-10">
        <div v-for="(img, index) in place.fileUrls" :key="`modal-${index}`"
             class="aspect-video md:aspect-square">
          <img
            :src="img"
            :alt="`숙소 전체 이미지 ${index + 1}`"
            class="w-full h-full object-cover rounded-md hover:opacity-95 transition-opacity"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 스크립트 부분은 로직이라 스타일 변경에 영향이 없으므로 그대로 유지하면 돼!
// (기존 코드와 동일)
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient.ts';
import WishSearchBox from '@/components/WishSearchBox.vue';
import ReviewSection from '@/views/user/reviews/ReviewSection.vue';
import QuestionSection from './questions/QuestionSection.vue';
import { useAuthStore } from '@/stores/authStore.ts';
import KakaoMapPlaceDetailPage from './KakaoMap/KakaoMapPlaceDetailPage.vue';
import { useToast } from 'primevue';
import OwnerInfo from '@/components/place/OwnerInfo.vue';

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
const toast = useToast();
const tabs = [
  { id: 'rooms', label: '객실' },
  { id: 'info', label: '정보' },
  { id: 'map', label: '지도' },
  { id: 'reviews', label: '리뷰' },
  { id: 'questions', label: '문의' }
];

const tabContainer = ref<HTMLDivElement | null>(null);
const roomsSection = ref<HTMLElement | null>(null);
const infoSection = ref<HTMLElement | null>(null);
const mapSection = ref<HTMLElement | null>(null);
const reviewsSection = ref<HTMLElement | null>(null);
const questionsSection = ref<HTMLElement | null>(null);

const responsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 4
  },
  {
    breakpoint: '768px',
    numVisible: 4
  },
  {
    breakpoint: '560px',
    numVisible: 4
  }
]);

// --- 핵심 로직: 데이터 조회 및 관리 ---

const getSearchParams = () => {
  const query = route.query;
  let params: any = {
    startDate: query.checkIn,
    endDate: query.checkOut,
    adults: query.adults,
    children: query.children,
    rooms: query.rooms
  };

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

const fetchPlaceDetails = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params = getSearchParams();

    if (params.startDate && params.endDate) {
      localStorage.setItem(
        'detailSearch',
        JSON.stringify({
          checkIn: params.startDate,
          checkOut: params.endDate,
          rooms: params.rooms,
          adults: params.adults,
          children: params.children
        })
      );
    }

    const res = await apiClient.get(`/v1/places/${id}`, { params });

    const rawData = res.data.data;
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
          alt: room.roomType || '객실 이미지'
        })),
        imageUrl: images[0] || null
      };
    });
    rawData.fullAddress = `${rawData.sido} ${rawData.sigungu} ${rawData.roadName} ${rawData.detailAddress}`;
    place.value = rawData;

    const { getAccessToken } = useAuthStore();
    if (getAccessToken) {
      const wishRes = await apiClient.get(`/v1/wishlist/${id}`);
      place.value.isLiked = wishRes.data.data;
    }

    isDataReady.value = true;
  } catch (e: any) {
    error.value =
      e.response?.data?.message || e.message || '숙소 데이터를 불러오는 데 실패했습니다.';
    place.value = null;
  } finally {
    loading.value = false;
  }
};

const onSearch = (payload: {
  checkIn?: string;
  checkOut?: string;
  rooms: number;
  adults: number;
  children: number;
}) => {
  router.push({ query: { ...route.query, ...payload } }).then(() => {
    fetchPlaceDetails();
  });
};

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
    query: { hotelId: id, roomId, checkIn, checkOut, adults, children, rooms }
  });
};

const addToCart = async (room: any) => {
  try {
    const params = getSearchParams();
    if (!params.startDate || !params.endDate) {
      alert('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    await apiClient.post(`/v1/cart/${room.roomId}`, null, {
      params: { startDate: params.startDate, endDate: params.endDate, quantity: 1 }
    });
    alert('장바구니에 추가되었습니다.');
  } catch (e) {
    console.error('장바구니 추가 실패:', e);
    alert('장바구니 추가에 실패했습니다.');
  }
};

const toggleWish = async () => {
  if (!useAuthStore().userAuth) {
    toast.add({
      summary: '로그인이 필요합니다.',
      detail: '로그인후 이용해주세요',
      severity: 'warn',
      life: 3000
    });
    await router.push('/auth/signin');
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
        url: window.location.href
      })
      .catch((err) => console.error('공유 실패:', err));
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다.');
  }
};

const openModal = () => {
  isModalOpen.value = true;
  // 모달 열릴 때 바디 스크롤 막기 (선택사항)
  document.body.style.overflow = 'hidden';
};
const closeModal = () => {
  isModalOpen.value = false;
  document.body.style.overflow = '';
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

onMounted(async () => {
  await fetchPlaceDetails();

  await nextTick();
  if (tabContainer.value) {
    const tabHeight = tabContainer.value.offsetHeight;
    document.documentElement.style.setProperty('--tab-bar-height', `${tabHeight}px`);

    if (tabHeight > 0) {
      const topOffset = tabHeight + 40;
      const options = {
        root: null,
        threshold: 0,
        rootMargin: `-${topOffset}px 0px -${window.innerHeight - topOffset - 1}px 0px`
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeTab.value = entry.target.id;
          }
        });
      }, options);

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

/* 스크롤바 숨기기 유틸리티 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* PrimeGalleria 커스텀 스타일 */
:deep(.custom-galleria .p-galleria-item-nav) {
  background: rgba(0, 0, 0, 0.1);
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin: 0 0.5rem;
}

</style>
