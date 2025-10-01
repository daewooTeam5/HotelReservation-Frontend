<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { httpFetcher } from '@/utils/httpFetcher';
import type { ApiResult } from '@/types/ApiResult';
import type { UserInfo } from '@/types/users';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // ✅ 로그인 체크용
import SignInModal from '@/components/auth/SignInModal.vue';

const props = defineProps<{
  orderAmount: number;
  maxUsablePoints?: number;
}>();
const emit = defineEmits<{ (e: 'point-change', value: number): void }>();

// ✅ 로그인 여부 체크
const authStore = useAuthStore();
const isLoggedIn = computed(() => !!authStore.userAuth);

// 사용자 포인트 정보 조회 (로그인 된 경우에만 실행)
const { isLoading, data } = useQuery<ApiResult<UserInfo>>({
  queryKey: ['v1', 'users', 'my'],
  queryFn: httpFetcher,
  enabled: isLoggedIn.value
});

// 사용자 포인트 잔액
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

const validatePointInput = (value: number) => {
  if (value < 0) return 0;
  if (value > maxAvailablePoint.value) return maxAvailablePoint.value;
  return value;
};

const handlePointInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const digits = (target.value || '').replace(/\D/g, '');
  const num = digits.length ? Number(digits) : 0;
  const validated = validatePointInput(num);
  pointToUse.value = validated;
  if (digits !== String(validated)) {
    target.value = String(validated || '');
  }
  if (usePoint.value) emit('point-change', pointToUse.value);
};

const handleUsePointChange = () => {
  if (!usePoint.value) {
    emit('point-change', 0);
  } else {
    emit('point-change', pointToUse.value);
  }
};

const useMaxPoint = () => {
  pointToUse.value = maxAvailablePoint.value;
  if (usePoint.value) emit('point-change', pointToUse.value);
};

watch(() => props.orderAmount, () => {
  if (pointToUse.value > maxAvailablePoint.value) {
    pointToUse.value = maxAvailablePoint.value;
    if (usePoint.value) emit('point-change', pointToUse.value);
  }
});

const canUsePoint = computed(() => userPoint.value >= MIN_POINT_USAGE);
const showLoginModal = ref(false);

// 10% 한도 관련
const maxPointUsageLimit = computed(() => Math.floor(props.orderAmount * 0.1));
watch(pointToUse, (newVal) => {
  if (newVal > maxPointUsageLimit.value) {
    pointToUse.value = maxPointUsageLimit.value;
  }
});
</script>

<template>
  <PrimeCard class="shadow-sm border border-gray-200">
    <template #header>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-wallet text-primary"></i>
          포인트 적용
        </h3>
      </div>
    </template>

    <template #content>
      <div class="p-4 space-y-3">
        <div v-if="!isLoggedIn" class="text-sm text-gray-600">
          <span>
            <button class="login-link" @click="showLoginModal = true">로그인</button>하면 더 많은 혜택을 이용하세요 ✨
          </span>
          <SignInModal :visible="showLoginModal" @close="showLoginModal = false" @success="showLoginModal = false" />
        </div>
        <div v-else>
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
              <Tag severity="info" class="p-1 text-sm">
                {{ userPoint.toLocaleString() }} P 보유
              </Tag>
            </div>

            <!-- 최소 사용 안내 -->
            <div
              v-if="!canUsePoint"
              class="text-sm text-orange-500 mb-3 flex items-center gap-1"
            >
              <i class="pi pi-info-circle"></i>
              <span>1,000P 이상부터 사용 가능합니다.</span>
            </div>

            <!-- 포인트 입력 + 최대 사용 버튼 -->
            <div
              v-if="usePoint && canUsePoint"
              class="flex items-center gap-2 mt-3"
            >
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
              <span class="font-bold text-primary">
                -{{ pointToUse.toLocaleString() }}원
              </span>
            </div>

            <!-- 10% 한도 안내 -->
            <div class="text-xs text-gray-500 mt-1">
              최종 결제금액의 10%까지만 포인트 사용 가능 (최대 {{ maxUsablePoints.toLocaleString() }}P)
            </div>
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
.login-link {
  color: #42b883;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.login-link:hover {
  text-decoration: underline;
  color: #369870;
}
</style>
