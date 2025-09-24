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
    <div class=" flex flex-col gap-4">
      <div class=" flex flex-col">
        <p style="margin-bottom: 2px;" class="font-semibold mb-2 text-gray-700 dark:text-gray-200">1박 요금</p>
        <input type="number" v-model.number="store.rooms.price" placeholder="예: 45000" class="w-[50%] border rounded p-2" />
      </div>
      <div>
        <p style="margin-bottom: 2px;" class="font-semibold mb-2 text-gray-700 dark:text-gray-200">추가 인원 요금</p>
        <input type="number" v-model.number="store.rooms.extraPrice" placeholder="예: 30000" class="w-[50%] border rounded p-2" />
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h3 style="margin-bottom:10px;" class=" font-bold mb-8">인원에 따른 할인율 설정</h3>
      <table class="w-full border-collapse text-center text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-100">
            <th class="border border-gray-300 px-2 py-1">인원</th>
            <th class="border border-gray-300 px-2 py-1">할인율(%)</th>
            <th class="border border-gray-300 px-2 py-1">적용 가격</th>
    </tr>
        </thead>
        <tbody>
          <tr v-for="(d, index) in store.discounts" :key="index">
            <td class="border border-gray-300 px-2 py-1">
              <input type="number" v-model.number="d.person" class="w-16 text-center border-gray:50 rounded" min="1" />
            </td>
            <td class="border border-gray-300 px-2 py-1">
              <input type="number" v-model.number="d.discount" class="w-16 text-center border-gray:50 rounded" min="0" max="100" />
            </td>
            <td class="border border-gray-300 px-2 py-1">{{ calcPrice(d) }}</td>

              <Button style="align-items: center; margin-top: 5px; margin-bottom: 5px;" label="삭제" severity="danger" size="small" @click="removeDiscount(index)" />

          </tr>
        </tbody>
      </table>
      <div style="margin-top:8px;" class="mt-2">
        <Button label="할인율 추가" size="small" @click="addDiscount" />
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button label="이전" severity="secondary" @click="goPrev" />
      <Button label="다음" @click="goNext" />
    </div>
  </div>
</template>
