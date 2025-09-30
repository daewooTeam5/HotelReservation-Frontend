<template>
  <div
    ref="searchContainerRef"
    class="search-box flex items-center p-2 bg-white rounded-full shadow-lg relative"
  >
    <div class="flex items-center flex-grow">
      <!-- 도시/호텔 검색 -->
      <div class="flex flex-col flex-grow relative">
        <PrimeIconField>
          <PrimeInputIcon class="pi pi-map-marker" />
          <PrimeInputText
            v-model="keyword"
            placeholder="도시, 호텔, 지하철역"
            @focus="openSuggestions"
            @input="fetchSuggestions($event)"
            autocomplete="off"
            ref="inputRef"
            class="border-0! focus:ring-0! shadow-none! bg-transparent w-full"
          />
        </PrimeIconField>
        <span
          v-if="errorMessage && !keyword"
          class="text-red-500 text-sm mt-1 absolute -bottom-6"
        >
          호텔 이름을 입력해주세요.
        </span>

        <!-- 자동완성 팝오버 -->
        <PrimePopover ref="suggestionPopover" :dismissable="false">
          <div v-if="regions.length > 0 || places.length > 0" class="w-64 max-h-96 overflow-y-auto p-2">
            <!-- 도시/지역 -->
            <div v-if="regions.length > 0" class="mb-3">
              <h4 class="font-bold text-gray-600 text-sm mb-2 px-2">도시/지역</h4>
              <ul>
                <li
                  v-for="(region, idx) in regions"
                  :key="`region-${idx}`"
                  class="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
                  @click="selectSuggestion(region)"
                >
                  <i class="pi pi-map-marker text-blue-500 bg-blue-50 p-2 rounded-full"></i>
                  <div>
                    <span class="font-medium text-gray-800">{{ region }}</span>
                    <p class="text-xs text-gray-400">대한민국</p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 숙소 -->
            <div v-if="places.length > 0">
              <h4 class="font-bold text-gray-600 text-sm mb-2 px-2">숙소</h4>
              <ul>
                <li
                  v-for="(place, idx) in places"
                  :key="`place-${idx}`"
                  class="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-md"
                  @click="selectSuggestion(place)"
                >
                  <i class="pi pi-thumbs-up text-pink-500 bg-pink-50 p-2 rounded-full"></i>
                  <span class="font-medium text-gray-800">{{ place }}</span>
                </li>
              </ul>
            </div>
          </div>
        </PrimePopover>
      </div>

      <!-- 구분선 -->
      <div class="border-l h-8 mx-4"></div>

      <!-- 체크인/체크아웃 -->
      <div class="flex flex-col relative">
        <div class="flex items-center">
          <div ref="checkinWrapperRef">
            <PrimeIconField>
              <PrimeInputIcon class="pi pi-calendar" />
              <PrimeInputText
                :value="dateRange?.[0] ? formatDate(dateRange[0]) : ''"
                placeholder="체크인"
                readonly
                @click="openCalendar"
                class="border-0! focus:ring-0! shadow-none! bg-transparent w-42"
              />
            </PrimeIconField>
          </div>
          <span class="mr-5! text-gray-400">-</span>
          <PrimeInputText
            :value="dateRange?.[1] ? formatDate(dateRange[1]) : ''"
            placeholder="체크아웃"
            readonly
            @click="openCalendar"
            class="border-0! focus:ring-0! shadow-none! bg-transparent w-32"
          />
          <PrimePopover ref="calendarPopover">
            <PrimeDatePicker
              v-model="dateRange"
              selectionMode="range"
              numberOfMonths="2"
              :min-date="minDate"
              dateFormat="yy-mm-dd"
              inline
            />
          </PrimePopover>
        </div>
        <span
          v-if="errorMessage && (!dateRange || !dateRange[0] || !dateRange[1])"
          class="text-red-500 text-sm mt-1 absolute -bottom-6"
        >
          날짜를 선택해주세요.
        </span>
      </div>

      <!-- 구분선 -->
      <div class="border-l h-8 mx-4"></div>

      <!-- 인원/객실 -->
      <div class="flex flex-col relative">
        <PrimeIconField>
          <PrimeInputIcon class="pi pi-user" />
          <PrimeInputText
            :value="`성인 ${adults}명 · 아동 ${children}명 · 객실 ${rooms}개`"
            readonly
            @click="toggleGuestPopover"
            class="border-0! focus:ring-0! shadow-none! bg-transparent w-64 whitespace-nowrap"
          />
        </PrimeIconField>
        <PrimePopover ref="popover">
          <div class="space-y-4 w-56">
            <div class="flex justify-between items-center">
              <span class="font-medium">객실</span>
              <div class="flex items-center gap-2">
                <PrimeButton icon="pi pi-minus" text @click="rooms > 1 && rooms--" />
                <span>{{ rooms }}</span>
                <PrimeButton icon="pi pi-plus" text @click="rooms++" />
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-medium">
                성인 <span class="text-sm text-gray-500">(18세 이상)</span>
              </span>
              <div class="flex items-center gap-2">
                <PrimeButton icon="pi pi-minus" text @click="adults > 1 && adults--" />
                <span>{{ adults }}</span>
                <PrimeButton icon="pi pi-plus" text @click="adults++" />
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-medium">
                아동 <span class="text-sm text-gray-500">(0 ~ 17세)</span>
              </span>
              <div class="flex items-center gap-2">
                <PrimeButton icon="pi pi-minus" text @click="children > 0 && children--" />
                <span>{{ children }}</span>
                <PrimeButton icon="pi pi-plus" text @click="children++" />
              </div>
            </div>
          </div>
        </PrimePopover>
      </div>
    </div>

    <!-- 검색 버튼 -->
    <PrimeButton
      icon="pi pi-search"
      @click="searchPlaces"
      class="rounded-full! !w-12 !h-12"
    />
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { apiClient } from '@/utils/axiosClient.ts';

const router = useRouter()

// 상태 변수
const keyword = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const rooms = ref(1)
const adults = ref(1)
const children = ref(0)
const popover = ref()
const calendarPopover = ref()
const checkinWrapperRef = ref()
const errorMessage = ref(false)
const emit = defineEmits(['search'])

// 자동완성 상태
const inputRef = ref()
const suggestionPopover = ref()
const regions = ref<string[]>([])
const places = ref<string[]>([])

// 함수들
const openCalendar = (e: Event) => {
  popover.value?.hide()
  calendarPopover.value?.show(e, checkinWrapperRef.value)
}

const toggleGuestPopover = (e: Event) => {
  calendarPopover.value?.hide()
  popover.value?.toggle(e)
}

const formatDate = (date: Date | null) => {
  if (!date) return ''
  return date
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/. /g, '-')
    .replace('.', '')
}
const minDate = ref(new Date());
// 자동완성
const openSuggestions = async (e: Event) => {
  await fetchSuggestions(e)
}

const fetchSuggestions = async (e?: Event) => {
  try {
    // keyword 없을 때도 API 호출 → 전체 리스트 가져오기
    const res = await apiClient.get(`/v1/autocomplete?keyword=${keyword.value || ''}`)
    const data = res.data.data || {}
    regions.value = data.regions || []
    places.value = data.places || []

    if (regions.value.length > 0 || places.value.length > 0) {
      suggestionPopover.value?.show(e, inputRef.value.$el)
    } else {
      suggestionPopover.value?.hide()
    }
  } catch (err) {
    console.error('자동완성 데이터 fetching 실패:', err)
    suggestionPopover.value?.hide()
  }
}

const selectSuggestion = (value: string) => {
  keyword.value = value
  suggestionPopover.value?.hide()
}

// 메인 리스트 페이지
const searchPlaces = () => {
  if (!keyword.value || !dateRange.value?.[0] || !dateRange.value?.[1]) {
    errorMessage.value = true;
    return;
  }
  errorMessage.value = false;

  const searchData = {
    name: keyword.value,
    checkIn: formatDate(dateRange.value[0]),
    checkOut: formatDate(dateRange.value[1]),
    rooms: rooms.value.toString(),
    adults: adults.value.toString(),
    children: children.value.toString(),
  };

  // recentSearches 업데이트
  let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
  recent.unshift(searchData);
  recent = recent.slice(0, 3); // 최대 3개
  localStorage.setItem("recentSearches", JSON.stringify(recent));

  router.push({ name: "list", query: searchData });
};

onMounted(() => {
  // 1. 키 이름을 'recentSearches' (복수형)로 수정
  const saved = localStorage.getItem('recentSearches')
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed && parsed.length > 0) {
      const latestSearch = parsed[0]

      keyword.value = latestSearch.name || ''
      rooms.value = Number(latestSearch.rooms) || 1
      adults.value = Number(latestSearch.adults) || 1
      children.value = Number(latestSearch.children) || 0
      if (latestSearch.checkIn && latestSearch.checkOut) {
        dateRange.value = [new Date(latestSearch.checkIn), new Date(latestSearch.checkOut)]
      }
    }
  }
})
</script>
