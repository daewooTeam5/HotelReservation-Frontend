<template>
  <div class="mt-8!">
    <div class="mb-6! px-4 md:px-0">
      <h2 class="text-2xl font-bold! text-gray-900">인기 여행지</h2>
    </div>

    <div
      class="flex flex-wrap justify-center gap-4 px-4 md:hidden transition-all duration-300 ease-in-out"
      :class="isMobileExpanded ? 'max-h-none' : 'max-h-28 overflow-hidden'"
    >
      <div
        v-for="city in domesticCities"
        :key="city.name"
        class="flex flex-col items-center w-24 group cursor-pointer"
        @click="goToDomestic(city)"
      >
        <div class="w-20 h-20 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
          <img
            :src="city.image"
            :alt="city.name"
            class="w-full h-full object-cover"
          />
        </div>
        <h3 class="mt-2 text-sm font-semibold text-gray-700 group-hover:text-blue-600">{{ city.name }}</h3>
      </div>
    </div>

    <div class="mt-4 text-center px-4 md:hidden">
      <Button
        :label="isMobileExpanded ? '간략히 보기' : '인기 여행지 더보기'"
        :icon="isMobileExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
        @click="isMobileExpanded = !isMobileExpanded"
        severity="secondary"
        outlined
        class="w-full"
      />
    </div>

    <div class="hidden md:block">
      <div class="flex items-center gap-4">
        <Button
          icon="pi pi-chevron-left"
          rounded
          severity="secondary"
          @click="scrollLeft"
          :disabled="isAtStart"
          class="flex-shrink-0 w-12 h-12 bg-white shadow-lg hover:shadow-xl transition-shadow"
        />

        <div class="relative overflow-hidden flex-1">
          <div
            ref="scrollContainer"
            @scroll="handleScroll"
            class="flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
            style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch;"
          >
            <div
              v-for="city in domesticCities"
              :key="city.name"
              class="flex-shrink-0 w-64 group cursor-pointer"
              @click="goToDomestic(city)"
            >
              <div class="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div class="aspect-square relative">
                  <img
                    :src="city.image"
                    :alt="city.name"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div class="absolute bottom-0 left-0 right-0 p-4">
                    <h3 class="text-white text-xl font-bold drop-shadow-lg">{{ city.name }}</h3>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <i class="pi pi-eye text-blue-600 text-2xl"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="!isAtStart"
            class="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"
          ></div>
          <div
            v-if="!isAtEnd"
            class="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"
          ></div>
        </div>

        <Button
          icon="pi pi-chevron-right"
          rounded
          severity="secondary"
          @click="scrollRight"
          :disabled="isAtEnd"
          class="flex-shrink-0 w-12 h-12 bg-white shadow-lg hover:shadow-xl transition-shadow"
        />
      </div>

      <div class="flex justify-center gap-2 mt-4">
        <div
          v-for="(chunk, index) in Math.ceil(domesticCities.length / 4)"
          :key="index"
          class="w-2 h-2 rounded-full transition-all"
          :class="currentChunk === index ? 'bg-blue-600 w-8' : 'bg-gray-300'"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// (니가 준 코드 그대로)
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();
const scrollContainer = ref<HTMLDivElement | null>(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);
const currentChunk = ref(0);

// 🔥 [수정 3] 모바일 확장/축소 상태 변수 추가
const isMobileExpanded = ref(false);

const domesticCities = ref([
  { name: '서울', image: '/images/domestic/seoul2.png' ,query:'서울'},
  { name: '부산', image: '/images/domestic/busan3.jpg' ,query:'부산'},
  { name: '대구', image: '/images/domestic/daegoo.jpg' ,query:'대구'},
  { name: '인천', image: '/images/domestic/incheon.jpg', query:'인천' },
  { name: '광주', image: '/images/domestic/kwang-jo.jpg', query:'광주' },
  { name: '대전', image: '/images/domestic/daejeon.jpg', query:'대전' },
  { name: '울산', image: '/images/domestic/ulsan2.jpg', query:'울산' },
  { name: '경기', image: '/images/domestic/gyong-gi.jpg', query:'경기' },
  { name: '강원', image: '/images/domestic/kangwon.jpg', query:'강원' },
  { name: '충북', image: '/images/domestic/chongbook.jpg', query:'충북' },
  { name: '충남', image: '/images/domestic/gongju.jpg', query:'충남' },
  { name: '전북', image: '/images/domestic/jeonbook.png', query:'전북' },
  { name: '전남', image: '/images/domestic/jeonam.jpg', query:'전남' },
  { name: '경북', image: '/images/domestic/gyuon-book.png', query:'경북' },
  { name: '경남', image: '/images/domestic/pohang.jpg', query:'경남' },
  { name: '제주', image: '/images/domestic/jeju.jpg', query:'제주' }
]);

const handleScroll = () => {
  if (!scrollContainer.value) return;

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  isAtStart.value = scrollLeft === 0;
  isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 1;

  // 현재 청크 계산
  const cardWidth = 256 + 16; // w-64 (256px) + gap (16px)
  currentChunk.value = Math.floor(scrollLeft / (cardWidth * 4));
};

const scrollLeft = () => {
  if (!scrollContainer.value) return;
  const cardWidth = 256 + 16; // w-64 + gap
  scrollContainer.value.scrollBy({ left: -cardWidth * 3, behavior: 'smooth' });
};

const scrollRight = () => {
  if (!scrollContainer.value) return;
  const cardWidth = 256 + 16;
  scrollContainer.value.scrollBy({ left: cardWidth * 3, behavior: 'smooth' });
};

const goToDomestic = (city: any) => {
  const saved = localStorage.getItem('recentSearches');
  let base = saved ? JSON.parse(saved)[0] : null;
  const today = new Date();

  const defaultCheckIn = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const defaultCheckOut = tomorrow.toISOString().split('T')[0];

  const searchData = {
    address: city.query,
    checkIn: base?.checkIn || defaultCheckIn,
    checkOut: base?.checkOut || defaultCheckOut,
    rooms: base?.rooms || '1',
    adults: base?.adults || '2',
    children: base?.children || '0'
  };

  let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  recent.unshift(searchData);
  recent = recent.filter(
    (s: any, idx: number, self: any[]) =>
      idx ===
      self.findIndex(
        (x) =>
          x.address === s.address &&
          x.checkIn === s.checkIn &&
          x.checkOut === s.checkOut
      )
  );
  recent = recent.slice(0, 3);
  localStorage.setItem('recentSearches', JSON.stringify(recent));

  router.push({
    name: 'list',
    query: searchData
  });
};

onMounted(() => {
  if (scrollContainer.value) {
    handleScroll();
  }
});

onUnmounted(() => {
  // cleanup if needed
});
</script>

<style scoped>
/* 스크롤바 숨기기 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 부드러운 스크롤 */
.scroll-smooth {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
</style>
