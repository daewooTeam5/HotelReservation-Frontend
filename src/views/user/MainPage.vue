<template>
  <main class="relative flex flex-col items-center bg-white">
    <!-- 상단 이미지 + 검색창 -->
    <img
      src="https://static.yeogi.com/_next/static/media/05_Kv_PC_Light_B.8067bd3b.webp"
      alt="상단 메인 이미지"
      class="absolute inset-0 w-full h-[350px] object-cover"
    />
    <div class="relative z-10 pt-32 flex flex-col gap-35">
      <h1 class="text-4xl font-bold! text-left text-white">대우개발원</h1>
      <SearchBox />
    </div>

    <!-- 최근 검색 -->
    <div v-if="recentSearches.length > 0" class="mt-8! w-full max-w-5xl px-6">
      <h2 class="text-lg font-bold! mb-4">고객님의 최근 검색</h2>
      <div class="flex gap-4 overflow-x-auto">
        <div
          v-for="(item, idx) in recentSearches"
          :key="idx"
          @click="goToSearch(item)"
          class="flex-shrink-0 w-70 p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition"
        >
          <p class="font-semibold! text-gray-800">{{ item.name }}</p>
          <p class="text-sm text-gray-500">
            {{ item.checkIn }} ~ {{ item.checkOut }},
            {{ item.adults }}명
          </p>
        </div>
      </div>
    </div>
    <DomesticCarousel />
  </main>
</template>


<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import SearchBox from "@/components/SearchBox.vue";
import DomesticCarousel from "@/components/DomesticCarousel.vue";

const router = useRouter()
const recentSearches = ref<any[]>([])

onMounted(() => {
  const saved = localStorage.getItem("recentSearches")
  if (saved) {
    recentSearches.value = JSON.parse(saved)
  }
})

const goToSearch = (item: any) => {
  let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]")

  recent.unshift(item)

  recent = recent.filter(
    (search: any, idx: number, self: any[]) =>
      idx === self.findIndex((s) =>
        s.name === search.name &&
        s.checkIn === search.checkIn &&
        s.checkOut === search.checkOut
      )
  )
  recent = recent.slice(0, 3)

  localStorage.setItem("recentSearches", JSON.stringify(recent))

  router.push({
    name: "list",
    query: item,
  })
}
</script>
