<template>
  <div class="search-box flex gap-2 mb-6 items-start">
    <!-- 체크인/체크아웃 -->
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
            <span class="font-medium">성인</span>
            <div class="flex items-center gap-2">
              <PrimeButton icon="pi pi-minus" text @click="adults > 1 && adults--" />
              <span>{{ adults }}</span>
              <PrimeButton icon="pi pi-plus" text @click="adults++" />
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium">아동</span>
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
    <PrimeButton icon="pi pi-search" @click="doSearch" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

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

const formatDate = (date: Date | null) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
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
  emit("search", {
    checkIn: dateRange.value?.[0] ? formatDate(dateRange.value[0]) : undefined,
    checkOut: dateRange.value?.[1] ? formatDate(dateRange.value[1]) : undefined,
    rooms: rooms.value,
    adults: adults.value,
    children: children.value,
  });
};
</script>
