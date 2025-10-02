<template>
  <div class="card max-w-7xl mx-auto! px-4 sm:px-6 lg:px-8 mt-20!">
    <h2 class="text-xl font-bold! ml-17!">인기 여행지</h2>

    <PrimeCarousel
      :value="domesticCities"
      :numVisible="5"
      :numScroll="1"
      :responsiveOptions="responsiveOptions"
    >
      <template #item="slotProps">
        <div
          class="border border-none! rounded! m-2! p-4! cursor-pointer hover:shadow-md transition"
          @click="goToDomestic(slotProps.data)"
        >
          <div class="mb-3 aspect-square">
            <img
              :src="slotProps.data.image"
              :alt="slotProps.data.name"
              class="w-full h-full object-cover rounded"
            />
          </div>
          <div class="text-center font-semibold! text-gray-800">
            {{ slotProps.data.name }}
          </div>
        </div>
      </template>
    </PrimeCarousel>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 국내 여행지 리스트 (중복 제거 + 이미지 경로 샘플 지정)
const domesticCities = ref([
  { name: "서울", image: "/images/domestic/seoul.jpg" },
  { name: "부산", image: "/images/domestic/busan.jpg" },
  { name: "대구", image: "/images/domestic/seoul.jpg" },
  { name: "인천", image: "/images/domestic/busan.jpg" },
  { name: "광주", image: "/images/domestic/seoul.jpg" },
  { name: "대전", image: "/images/domestic/busan.jpg" },
  { name: "울산", image: "/images/domestic/seoul.jpg" },
  { name: "경기도", image: "/images/domestic/busan.jpg" },
  { name: "강원도", image: "/images/domestic/seoul.jpg" },
  { name: "충청북도", image: "/images/domestic/busan.jpg" },
  { name: "충청남도", image: "/images/domestic/seoul.jpg" },
  { name: "전라북도", image: "/images/domestic/busan.jpg" },
  { name: "전라남도", image: "/images/domestic/seoul.jpg" },
  { name: "경상북도", image: "/images/domestic/busan.jpg" },
  { name: "경상남도", image: "/images/domestic/seoul.jpg" },
  { name: "제주", image: "/images/domestic/seoul.jpg" },
]);

// Carousel 반응형 옵션
const responsiveOptions = ref([
  {
    breakpoint: "1400px",
    numVisible: 4,
    numScroll: 1,
  },
  {
    breakpoint: "1199px",
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: "767px",
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: "575px",
    numVisible: 1,
    numScroll: 1,
  },
]);

// 클릭 시 최근 검색에 저장 + 이동
const goToDomestic = (city: any) => {
  const saved = localStorage.getItem("recentSearches");
  let base = null;

  if (saved) {
    const parsed = JSON.parse(saved);
    base = parsed[0] || null;
  }

  const searchData = {
    address: city.name,
    checkIn: base?.checkIn || "",
    checkOut: base?.checkOut || "",
    rooms: base?.rooms || "1",
    adults: base?.adults || "2",
    children: base?.children || "0",
  };

  let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
  recent.unshift(searchData);
  recent = recent.filter(
    (s: any, idx: number, self: any[]) =>
      idx ===
      self.findIndex(
        (x) =>
          x.name === s.name &&
          x.checkIn === s.checkIn &&
          x.checkOut === s.checkOut
      )
  );
  recent = recent.slice(0, 3);
  localStorage.setItem("recentSearches", JSON.stringify(recent));

  router.push({
    name: "list",
    query: searchData,
  });
};
</script>
