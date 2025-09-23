<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox'; // ✅ 체크박스 추가
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
  fileUrl: string;
  sido: string;
  sigungu: string;
}

const cartItems = ref<CartItem[]>([]);
const selectedItems = ref<number[]>([]); // ✅ 선택된 cartId 저장

// 호텔별 그룹핑
const groupedCart = computed(() => {
  const groups: Record<string, CartItem[]> = {};
  cartItems.value.forEach((item) => {
    if (!groups[item.placeName]) {
      groups[item.placeName] = [];
    }
    groups[item.placeName].push(item);
  });
  return groups;
});

const totalPrice = computed(() => {
  if (selectedItems.value.length === 0) {
    return 0;
  }
  return cartItems.value
    .filter((item) => selectedItems.value.includes(item.cartId))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// 수량 변경 핸들러
const updateQuantity = async (cartId: number, delta: number) => {
  const item = cartItems.value.find((i) => i.cartId === cartId);
  if (item) {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      try {
        await apiClient.patch(`/v1/cart/${cartId}`, null, {
          params: { quantity: newQty },
        });
        item.quantity = newQty;
      } catch (error) {
        console.error('수량 변경 실패:', error);
      }
    }
  }
};

// 장바구니 삭제
const removeFromCart = async (cartId: number) => {
  try {
    await apiClient.delete(`/v1/cart/${cartId}`);
    cartItems.value = cartItems.value.filter((i) => i.cartId !== cartId);
    selectedItems.value = selectedItems.value.filter((id) => id !== cartId); // ✅ 선택에서도 제거
  } catch (error) {
    console.error('장바구니 삭제 실패:', error);
  }
};

// API 호출
onMounted(async () => {
  const res = await apiClient.get('/v1/users/cart');
  cartItems.value = res.data.data;
});
</script>

<template>
  <div class="p-4 flex justify-center">
    <div class="p-4 w-full max-w-5xl mx-auto">
      <h1 class="font-bold! text-3xl mb-5! ml-5!">장바구니</h1>
      <div v-for="(rooms, placeName) in groupedCart" :key="placeName" class="mb-6!">
        <PrimeCard>
          <template #title>
            <div class="text-xl font-bold!">{{ placeName }}</div>
            <div class="text-sm! text-gray-600">
              {{ rooms[0].sido }} {{ rooms[0].sigungu }} {{ rooms[0].roadName }}
            </div>
          </template>

          <template #content>
            <div v-for="room in rooms" :key="room.cartId" class="border-t py-4 flex gap-4">
              <Checkbox
                v-model="selectedItems"
                :inputId="'chk-' + room.cartId"
                :value="room.cartId"
              />

              <div class="w-32 h-24 flex-shrink-0">
                <img
                  :src="room.fileUrl"
                  alt="room image"
                  class="w-full h-full object-cover rounded"
                />
              </div>

              <!-- 객실 정보 -->
              <div class="flex-1">
                <div class="font-semibold!">{{ room.roomName }}</div>
                <div class="text-sm text-gray-500">
                  {{ room.startDate }} ~ {{ room.endDate }} (체크인 {{ room.checkIn }} / 체크아웃
                  {{ room.checkOut }})
                </div>
                <div class="text-sm">
                  연박 <span class="font-bold">{{ room.price.toLocaleString() }}원</span>
                </div>
                <div class="text-sm text-gray-500">최대 {{ room.capacityPeople }}명</div>
              </div>

              <!-- 수량 조절 + 삭제 -->
              <div class="flex items-center gap-2">
                <div class="flex items-center -space-x-1">
                  <Button icon="pi pi-minus" class="text-gray-500!" text @click="updateQuantity(room.cartId, -1)" />
                  <span class="inline-block text-center w-8">{{ room.quantity }}</span>
                  <Button icon="pi pi-plus" class="text-gray-500!" text @click="updateQuantity(room.cartId, 1)" />
                </div>
                <Button icon="pi pi-times" class="text-gray-500!" text @click="removeFromCart(room.cartId)" />
              </div>
            </div>
          </template>
        </PrimeCard>
      </div>
      <div
        class="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t px-6 py-4 flex justify-between items-center text-lg font-bold! z-50"
      >
        <span>총 금액</span>
        <span class="text-blue-600">{{ totalPrice.toLocaleString() }}원</span>
      </div>
    </div>
  </div>
</template>
