<template>
  <div class="search-box flex gap-2 mb-6 items-start">
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
    </div>

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
              <PrimeButton icon="pi pi-plus" text @click="(adults + children) > rooms && rooms++" />
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium">성인</span>
            <div class="flex items-center gap-2">
              <PrimeButton icon="pi pi-minus" text @click="decreaseAdults" />
              <span>{{ adults }}</span>
              <PrimeButton icon="pi pi-plus" text @click="adults++" />
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium">아동</span>
            <div class="flex items-center gap-2">
              <PrimeButton icon="pi pi-minus" text @click="decreaseChildren" />
              <span>{{ children }}</span>
              <PrimeButton icon="pi pi-plus" text @click="children++" />
            </div>
          </div>
        </div>
      </PrimePopover>
    </div>

    <PrimeButton icon="pi pi-search" @click="doSearch" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { apiClient } from '@/utils/axiosClient.ts';
import router from '@/router';

const dateRange = ref<[Date, Date] | null>(null);
const rooms = ref(1);
const adults = ref(1);
const children = ref(0);

const popover = ref();
const calendarPopover = ref();
const checkinWrapperRef = ref();

const emit = defineEmits<{
  (e: "search", payload: {
    checkIn?: string,
    checkOut?: string,
    rooms: number,
    adults: number,
    children: number
  }): void
}>();

// 날짜 포맷 (yyyy-mm-dd)
const formatDate = (date: Date | null) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

// [ADD] 성인 인원 감소 및 객실 수 유효성 검사
const decreaseAdults = () => {
  if (adults.value > 1) {
    adults.value--;
    // 총 인원수보다 객실 수가 많으면 객실 수를 총 인원수에 맞춤
    if (rooms.value > adults.value + children.value) {
      rooms.value = adults.value + children.value;
    }
  }
};

// [ADD] 아동 인원 감소 및 객실 수 유효성 검사
const decreaseChildren = () => {
  if (children.value > 0) {
    children.value--;
    // 총 인원수보다 객실 수가 많으면 객실 수를 총 인원수에 맞춤
    if (rooms.value > adults.value + children.value) {
      rooms.value = adults.value + children.value;
    }
  }
};

const saveSearchData = () => {
  const searchData = {
    checkIn: dateRange.value?.[0] ? formatDate(dateRange.value[0]) : undefined,
    checkOut: dateRange.value?.[1] ? formatDate(dateRange.value[1]) : undefined,
    rooms: rooms.value.toString(),
    adults: adults.value.toString(),
    children: children.value.toString(),
  };
  localStorage.setItem("detailSearch", JSON.stringify(searchData));
};

onMounted(() => {
  const detail = localStorage.getItem("detailSearch");
  if (detail) {
    const parsed = JSON.parse(detail);
    rooms.value = Number(parsed.rooms) || 1;
    adults.value = Number(parsed.adults) || 1;
    children.value = Number(parsed.children) || 0;
    if (parsed.checkIn && parsed.checkOut) {
      dateRange.value = [new Date(parsed.checkIn), new Date(parsed.checkOut)];
    }
  } else {
    const recent = localStorage.getItem("recentSearches");
    if (recent) {
      const parsed = JSON.parse(recent);
      if (parsed.length > 0) {
        const latest = parsed[0];
        localStorage.setItem("detailSearch", JSON.stringify(latest));

        rooms.value = Number(latest.rooms) || 1;
        adults.value = Number(latest.adults) || 1;
        children.value = Number(latest.children) || 0;
        if (latest.checkIn && latest.checkOut) {
          dateRange.value = [new Date(latest.checkIn), new Date(latest.checkOut)];
        }
      }
    }
  }
});

const handleWishSearchClick = async (id: number) => {
  const checkIn = localStorage.getItem("checkIn");
  const checkOut = localStorage.getItem("checkOut");
  const rooms = localStorage.getItem("rooms");
  const adults = localStorage.getItem("adults");
  const children = localStorage.getItem("children");

  const res = await apiClient.get(`/v1/places/${id}`, {
    params: { startDate: checkIn, endDate: checkOut, rooms, adults, children },
  });

  const rawData = res.data.data;
  rawData.rooms = rawData.rooms.map((room: any) => {
    let images: string[] = [];
    if (Array.isArray(room.images)) {
      images = room.images.flatMap((img: string) => img.split(","));
    } else if (typeof room.images === "string") {
      images = room.images.split(",");
    }
    return {
      ...room,
      images: images.map((img: string) => ({
        itemImageSrc: img,
        thumbnailImageSrc: img,
        alt: room.roomType || "객실 이미지",
      })),
      imageUrl: images[0] || null,
    };
  });

  router.push({
    name: "PlaceDetail",
    params: { id },
    state: { placeData: rawData },
  });
};

const openCalendar = (e: Event) => {
  popover.value?.hide();
  calendarPopover.value?.show(e, checkinWrapperRef.value);
};

const toggleGuestPopover = (e: Event) => {
  calendarPopover.value?.hide();
  popover.value?.toggle(e);
};

const doSearch = () => {
  const searchData = {
    checkIn: dateRange.value?.[0] ? formatDate(dateRange.value[0]) : undefined,
    checkOut: dateRange.value?.[1] ? formatDate(dateRange.value[1]) : undefined,
    rooms: rooms.value,
    adults: adults.value,
    children: children.value,
  };

  localStorage.setItem("detailSearch", JSON.stringify(searchData));

  emit("search", searchData);
};

onBeforeUnmount(() => {
  localStorage.removeItem("detailSearch");
});
</script>
