<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
    <h2 class="text-xl font-bold! mb-4" style="margin-bottom: 10px;margin-top: 10px;">인기 여행지</h2>

    <div class="overflow-x-auto scroll-smooth">
      <div class="flex gap-8">
        <div
          style="margin-bottom: 10px; margin-top: 10px;"
          v-for="city in domesticCities"
          :key="city.name"
          class="flex-shrink-0 w-60 cursor-pointer rounded-lg hover:shadow-md transition"
          @click="goToDomestic(city)"
        >
          <div class="aspect-square mb-2">
            <img
              :src="city.image"

              :alt="city.name"
              class="w-full h-full object-cover rounded font-bold!"
            />
          </div>
          <div class="text-center font-semibold text-gray-800">
            {{ city.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

const goToDomestic = (city: any) => {
  const saved = localStorage.getItem('recentSearches');
  let base = saved ? JSON.parse(saved)[0] : null;
  const today = new Date();

// checkIn: 오늘 날짜 (YYYY-MM-DD)
  const defaultCheckIn = today.toISOString().split('T')[0];

// checkOut: 오늘 + 1일
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
</script>

<style scoped>
/* 부드러운 스크롤 */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
</style>
