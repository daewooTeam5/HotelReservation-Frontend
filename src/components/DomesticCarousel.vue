<template>
  <div  class="mt-8!">
    <div class="mb-6!">
      <h2 class="text-2xl font-bold! text-gray-900">인기 여행지</h2>
    </div>

    <div class="flex items-center gap-4">
      <!-- 좌측 네비게이션 버튼 -->
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
                <!-- 오버레이 그라데이션 -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                <!-- 도시 이름 -->
                <div class="absolute bottom-0 left-0 right-0 p-4">
                  <h3 class="text-white text-xl font-bold drop-shadow-lg">{{ city.name }}</h3>
                </div>

                <!-- Hover 효과 아이콘 -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div class="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <i class="pi pi-eye text-blue-600 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 좌측 그라데이션 페이드 -->
        <div
          v-if="!isAtStart"
          class="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"
        ></div>

        <!-- 우측 그라데이션 페이드 -->
        <div
          v-if="!isAtEnd"
          class="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"
        ></div>
      </div>

      <!-- 우측 네비게이션 버튼 -->
      <Button
        icon="pi pi-chevron-right"
        rounded
        severity="secondary"
        @click="scrollRight"
        :disabled="isAtEnd"
        class="flex-shrink-0 w-12 h-12 bg-white shadow-lg hover:shadow-xl transition-shadow"
      />
    </div>

    <!-- 스크롤 인디케이터 -->
    <div class="flex justify-center gap-2 mt-4">
      <div
        v-for="(chunk, index) in Math.ceil(domesticCities.length / 4)"
        :key="index"
        class="w-2 h-2 rounded-full transition-all"
        :class="currentChunk === index ? 'bg-blue-600 w-8' : 'bg-gray-300'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();
const scrollContainer = ref<HTMLDivElement | null>(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);
const currentChunk = ref(0);

const domesticCities = ref([
  { name: '서울', image: '/images/domestic/seoul2.png' },
  { name: '부산', image: '/images/domestic/busan3.jpg' },
  { name: '대구', image: '/images/domestic/daegoo.jpg' },
  { name: '인천', image: '/images/domestic/incheon.jpg' },
  { name: '광주', image: '/images/domestic/kwang-jo.jpg' },
  { name: '대전', image: '/images/domestic/daejeon.jpg' },
  { name: '울산', image: '/images/domestic/ulsan2.jpg' },
  { name: '경기', image: '/images/domestic/gyong-gi.jpg' },
  { name: '강원', image: '/images/domestic/kangwon.jpg' },
  { name: '충북', image: '/images/domestic/chongbook.jpg' },
  { name: '충남', image: '/images/domestic/gongju.jpg' },
  { name: '전북', image: '/images/domestic/jeonbook.png' },
  { name: '전남', image: '/images/domestic/jeonam.jpg' },
  { name: '경북', image: '/images/domestic/gyuon-book.png' },
  { name: '경남', image: '/images/domestic/pohang.jpg' },
  { name: '제주', image: '/images/domestic/jeju.jpg' }
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
    address: city.name,
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
