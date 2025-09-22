<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Button from 'primevue/button';
import { apiClient } from '@/utils/axiosClient';

interface CartItem {
  cartId: number;
  placeName: string;
  roomName: string;
  startDate: string;
  endDate: string;
  checkIn: string;
  checkOut: string;
  price: number;
  quantity: number;
  capacityPeople: number;
  roadName: string;
  detailAddress: string;
  sido: string;
  sigungu: string;
}

// 장바구니 데이터
const cartItems = ref<CartItem[]>([]);

// 호텔별 그룹핑
const groupedCart = computed(() => {
  const groups: Record<string, CartItem[]> = {};
  cartItems.value.forEach(item => {
    if (!groups[item.placeName]) {
      groups[item.placeName] = [];
    }
    groups[item.placeName].push(item);
  });
  return groups;
});

// 수량 변경 핸들러
const updateQuantity = (cartId: number, delta: number) => {
  const item = cartItems.value.find(i => i.cartId === cartId);
  if (item) {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      item.quantity = newQty;
      // TODO: 서버에 수량 업데이트 API 호출 (예: PATCH /cart/{cartId})
    }
  }
};

// API 호출
onMounted(async () => {
  const res = await apiClient.get('/v1/users/cart');
  cartItems.value = res.data.data;
});
</script>

<template>
  <div class="p-4">
    <div v-for="(rooms, placeName) in groupedCart" :key="placeName" class="mb-6">
      <!-- 호텔 카드 -->
      <PrimeCard>
        <template #title>
          <div class="text-xl font-bold">{{ placeName }}</div>
          <div class="text-sm text-gray-600">
            {{ rooms[0].sido }} {{ rooms[0].sigungu }} {{ rooms[0].roadName }}
          </div>
        </template>

        <template #content>
          <div v-for="room in rooms" :key="room.cartId" class="border-t py-4 flex gap-4">
            <!-- 객실 정보 -->
            <div class="flex-1">
              <div class="font-semibold">{{ room.roomName }}</div>
              <div class="text-sm text-gray-500">
                {{ room.startDate }} ~ {{ room.endDate }} (체크인 {{ room.checkIn }} / 체크아웃 {{ room.checkOut }})
              </div>
              <div class="text-sm">연박 <span class="font-bold">{{ room.price.toLocaleString() }}원</span></div>
              <div class="text-sm text-gray-500">최대 {{ room.capacityPeople }}명</div>
            </div>

            <!-- 수량 조절 -->
            <div class="flex items-center gap-2">
              <Button icon="pi pi-minus" @click="updateQuantity(room.cartId, -1)" />
              <span class="px-3">{{ room.quantity }}</span>
              <Button icon="pi pi-plus" @click="updateQuantity(room.cartId, 1)" />
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>
  </div>
</template>
