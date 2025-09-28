<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';
import type { UserInfo } from '@/types/users';
import { ref, computed, watch } from 'vue';

const props = defineProps<{ orderAmount: number }>();
const emit = defineEmits<{ (e: 'point-change', value: number): void }>();

// 사용자 포인트 정보 조회
const { isLoading, data } = useQuery<ApiResult<UserInfo>>({
  queryKey: ['v1', 'users', 'my'],
  queryFn: httpFetcher
});

// 사용자 포인트 잔액 계산 (UserInfo 타입 안전 처리)
const userPoint = computed(() => {
  const info = data.value?.data as any;
  const pt = info?.point;
  return typeof pt === 'number' ? pt : 0;
});

// 포인트 사용 상태
const usePoint = ref(false);
const pointToUse = ref(0);
const maxAvailablePoint = computed(() => Math.min(userPoint.value, props.orderAmount));
const MIN_POINT_USAGE = 1000;

// 입력값 검증
const validatePointInput = (value: number) => {
  if (value < 0) return 0;
  if (value > maxAvailablePoint.value) return maxAvailablePoint.value;
  return value;
};

// 원시 입력 처리: 숫자만 허용하고 최대치로 클램프
const handlePointInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  // 숫자만 허용
  const digits = (target.value || '').replace(/\D/g, '');
  const num = digits.length ? Number(digits) : 0;
  const validated = validatePointInput(num);
  pointToUse.value = validated;
  // 입력 필드 표시 값 동기화 (선행 0 방지)
  if (digits !== String(validated)) {
    target.value = String(validated || '');
  }
  if (usePoint.value) emit('point-change', pointToUse.value);
};

// 체크박스 변경 (이벤트 객체에 의존하지 않음)
const handleUsePointChange = () => {
  if (!usePoint.value) {
    emit('point-change', 0);
  } else {
    emit('point-change', pointToUse.value);
  }
};

// 최대 포인트 사용
const useMaxPoint = () => {
  pointToUse.value = maxAvailablePoint.value;
  if (usePoint.value) emit('point-change', pointToUse.value);
};

// 주문 금액 변경 시 포인트 재검증
watch(() => props.orderAmount, () => {
  if (pointToUse.value > maxAvailablePoint.value) {
    pointToUse.value = maxAvailablePoint.value;
    if (usePoint.value) emit('point-change', pointToUse.value);
  }
});

// 포인트 사용 가능 여부
const canUsePoint = computed(() => userPoint.value >= MIN_POINT_USAGE);
</script>

<template>
  <Card class="shadow-md p-4">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-wallet text-primary text-xl"></i>
        <span class="text-xl font-bold">포인트 적용</span>
      </div>
    </template>

    <template #content>
      <!-- 로딩 -->
      <div v-if="isLoading" class="space-y-2">
        <Skeleton height="3rem" class="rounded-md" />
        <Skeleton width="70%" height="1.5rem" class="rounded-md" />
      </div>

      <div v-else>
        <!-- 체크박스 + 보유 포인트 -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Checkbox
              :disabled="!canUsePoint"
              v-model="usePoint"
              binary
              :inputId="'use-point'"
              @change="handleUsePointChange()"
            />
            <label :for="'use-point'" class="cursor-pointer">포인트 사용</label>
          </div>
          <Tag severity="info" class="p-1 text-sm">{{ userPoint.toLocaleString() }} P 보유</Tag>
        </div>

        <!-- 최소 사용 안내 -->
        <div v-if="!canUsePoint" class="text-sm text-orange-500 mb-3 flex items-center gap-1">
          <i class="pi pi-info-circle"></i>
          <span>1,000P 이상부터 사용 가능합니다.</span>
        </div>

        <!-- 포인트 입력 + 최대 사용 버튼 -->
        <div v-if="usePoint && canUsePoint" class="flex items-center gap-2 mt-3">
          <input
            :value="pointToUse"
            @input="handlePointInput"
            :disabled="!usePoint"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            class="w-32 p-inputtext p-component text-right"
          />
          <span class="text-sm">P</span>
          <Button
            type="button"
            size="small"
            label="최대 사용"
            class="p-button-outlined"
            @click="useMaxPoint"
            :disabled="!usePoint"
          />
        </div>

        <!-- 적용 포인트 표시 -->
        <div v-if="usePoint && pointToUse > 0" class="mt-3 flex justify-between">
          <span class="text-sm">적용 포인트</span>
          <span class="font-bold text-primary">-{{ pointToUse.toLocaleString() }}원</span>
        </div>
      </div>
    </template>
  </Card>
</template>
