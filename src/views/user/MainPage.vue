<template>
  <main class="relative flex flex-col items-center bg-white">
    <div class="relative w-full h-[400px] flex flex-col justify-center items-center text-white">
      <img
        src="https://static.yeogi.com/_next/static/media/05_Kv_PC_Light_B.8067bd3b.webp"
        alt="상단 메인 이미지"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/30"></div>
      <div class="relative z-10 flex flex-col gap-6 items-center text-center">
        <h1 class="text-4xl font-black tracking-tight">다음엔 어디로 떠나세요?</h1>
        <SearchBox />
      </div>
    </div>

    <div class="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="recentSearches.length > 0" class="mt-8 mb-12">
        <h2 class="text-2xl font-bold mb-4">최근 검색</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(item, idx) in recentSearches"
            :key="idx"
            @click="goToSearch(item)"
            class="p-4 bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition-shadow border border-gray-100 flex items-center gap-4"
          >
            <i class="pi pi-history text-xl text-blue-500"></i>
            <div>
              <p class="font-semibold text-gray-800">{{ item.name }}</p>
              <p class="text-sm text-gray-500">
                {{ item.checkIn }} ~ {{ item.checkOut }},
                {{ item.adults }}명
              </p>
            </div>
          </div>
        </div>
      </div>
      <DomesticCarousel />
    </div>
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
