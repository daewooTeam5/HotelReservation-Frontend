<template>
  <div class="search-box flex gap-2 mb-6 items-start">
    <!-- 호텔 이름 -->
    <div class="flex flex-col">
      <PrimeInputText v-model="keyword" placeholder="호텔 이름 입력" />
      <span v-if="errorMessage && !keyword" class="text-red-500 text-sm mt-1">
        호텔 이름을 입력해주세요.
      </span>
    </div>

    <!-- 체크인 / 체크아웃 -->
    <div class="flex flex-col">
      <div class="flex gap-2">
        <div ref="checkinWrapperRef">
          <PrimeInputText
            :value="dateRange?.[0] ? formatDate(dateRange[0]) : ''"
            placeholder="체크인"
            readonly
            @click="openCalendar"
          />
        </div>
        <PrimeInputText
          :value="dateRange?.[1] ? formatDate(dateRange[1]) : ''"
          placeholder="체크아웃"
          readonly
          @click="openCalendar"
        />

        <PrimePopover ref="calendarPopover">
          <PrimeDatePicker
            v-model="dateRange"
            selectionMode="range"
            numberOfMonths="2"
            dateFormat="yy-mm-dd"
            inline
          />
        </PrimePopover>
      </div>
      <span
        v-if="errorMessage && (!dateRange || !dateRange[0] || !dateRange[1])"
        class="text-red-500 text-sm mt-1"
      >
        날짜를 선택해주세요.
      </span>
    </div>

    <!-- 인원 / 객실 -->
    <div class="flex flex-col">
      <PrimeInputText
        :value="`성인 ${adults}명 · 아동 ${children}명 · 객실 ${rooms}개`"
        readonly
        @click="toggleGuestPopover"
      />
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
            <span class="font-medium">성인 <span class="text-sm text-gray-500">(18세 이상)</span></span>
            <div class="flex items-center gap-2">
              <PrimeButton icon="pi pi-minus" text @click="adults > 1 && adults--" />
              <span>{{ adults }}</span>
              <PrimeButton icon="pi pi-plus" text @click="adults++" />
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium">아동 <span class="text-sm text-gray-500">(0 ~ 17세)</span></span>
            <div class="flex items-center gap-2">
              <PrimeButton icon="pi pi-minus" text @click="children > 0 && children--" />
              <span>{{ children }}</span>
              <PrimeButton icon="pi pi-plus" text @click="children++" />
            </div>
          </div>
        </div>
      </PrimePopover>
    </div>

    <!-- 검색 버튼 -->
    <PrimeButton label="검색하기" @click="searchPlaces" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const keyword = ref("");
const dateRange = ref<[Date, Date] | null>(null);
const rooms = ref(1);
const adults = ref(1);
const children = ref(0);

const popover = ref();
const calendarPopover = ref();
const checkinWrapperRef = ref();
const errorMessage = ref(false);
const emit = defineEmits(["search"]);

const openCalendar = (e: Event) => {
  popover.value?.hide();
  calendarPopover.value?.show(e, checkinWrapperRef.value);
};

const toggleGuestPopover = (e: Event) => {
  calendarPopover.value?.hide();
  popover.value?.toggle(e);
};

const formatDate = (date: Date | null) => {
  if (!date) return "";
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/. /g, "-")
    .replace(".", "");
};

const searchPlaces = () => {
  emit("search");
  if (
    !keyword.value ||
    !dateRange.value ||
    !dateRange.value[0] ||
    !dateRange.value[1] ||
    adults.value < 1 ||
    rooms.value < 1
  ) {
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

  // ✅ 최근 검색 저장
  localStorage.setItem("recentSearch", JSON.stringify(searchData));

  // ✅ 검색 페이지 이동
  router.push({
    name: "list",
    query: searchData,
  });
};

// ✅ 페이지 진입 시 최근 검색 복원
onMounted(() => {
  const saved = localStorage.getItem("recentSearch");
  if (saved) {
    const parsed = JSON.parse(saved);
    keyword.value = parsed.name || "";
    rooms.value = Number(parsed.rooms) || 1;
    adults.value = Number(parsed.adults) || 1;
    children.value = Number(parsed.children) || 0;

    if (parsed.checkIn && parsed.checkOut) {
      dateRange.value = [new Date(parsed.checkIn), new Date(parsed.checkOut)];
    }
  }
});
</script>
