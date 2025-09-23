<script lang="ts" setup>
import Button from 'primevue/button';
import { useRegisterStore, type DiscountOption } from '@/stores/publishing/registerStore';
import { useRouter } from 'vue-router';

const store = useRegisterStore();
const router = useRouter();

const addDiscount = () => store.discounts.push({ person: 1, discount: 0 });
const removeDiscount = (index: number) => store.discounts.splice(index, 1);

const calcPrice = (d: DiscountOption) => {
  const base = Number(store.rooms.price || 0);
  const extra = Number(store.rooms.extraPrice || 0);
  const persons = d.person || 1;
  const discount = d.discount || 0;
  const before = base + extra * Math.max(0, persons - 1);
  return Math.round(before * (1 - discount / 100));
};

const goPrev = () => router.push('/publishing/register/policy');
const goNext = () => router.push('/publishing/register/address');
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">1박 요금</p>
        <input type="number" v-model.number="store.rooms.price" placeholder="예: 45000" class="w-full border rounded p-2" />
      </div>
      <div>
        <p class="font-semibold mb-2 text-gray-700 dark:text-gray-200">추가 인원 요금</p>
        <input type="number" v-model.number="store.rooms.extraPrice" placeholder="예: 30000" class="w-full border rounded p-2" />
      </div>
    </div>

    <div>
      <h3 class="font-semibold mb-3">인원에 따른 할인율 설정</h3>
      <table class="w-full border-collapse border border-gray-300 text-center text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700">
            <th class="border border-gray-300 px-2 py-1">인원</th>
            <th class="border border-gray-300 px-2 py-1">할인율(%)</th>
            <th class="border border-gray-300 px-2 py-1">적용 가격</th>
            <th class="border border-gray-300 px-2 py-1">수정</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, index) in store.discounts" :key="index">
            <td class="border border-gray-300 px-2 py-1">
              <input type="number" v-model.number="d.person" class="w-16 text-center border rounded" min="1" />
            </td>
            <td class="border border-gray-300 px-2 py-1">
              <input type="number" v-model.number="d.discount" class="w-16 text-center border rounded" min="0" max="100" />
            </td>
            <td class="border border-gray-300 px-2 py-1">{{ calcPrice(d) }}</td>
            <td class="border border-gray-300 px-2 py-1">
              <Button label="삭제" severity="danger" size="small" @click="removeDiscount(index)" />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mt-2">
        <Button label="할인율 추가" size="small" @click="addDiscount" />
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>
