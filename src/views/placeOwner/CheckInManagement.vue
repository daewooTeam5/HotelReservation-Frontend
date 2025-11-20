<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import QrScanner from 'qr-scanner';
import { httpFetcher } from '@/utils/httpFetcher';
import { apiClient } from '@/utils/axiosClient';
import type { ApiResult } from '@/types/ApiResult';
import type { CheckInReservation, CheckInDetail } from '@/types/reservation';

const toast = useToast();
const qc = useQueryClient();
const videoElement = ref<HTMLVideoElement | null>(null);
const qrScanner = ref<QrScanner | null>(null);
const scannedData = ref<string>('');
const isScanning = ref(false);
const scanDialogVisible = ref(false);
const confirmDialogVisible = ref(false);
const checkInDetailData = ref<CheckInDetail | null>(null);
const pendingReservationId = ref<string>('');


// 오늘 체크인 예정 목록 조회
const { data, isLoading, isError, refetch } = useQuery<ApiResult<CheckInReservation[]>>({
  queryKey: ['v1', 'reservations', 'today'],
  queryFn: httpFetcher
});

const reservations = computed(() => data.value?.data ?? []);

// 체크인 검증 mutation (정보 조회용)
const checkInMutation = useMutation({
  mutationFn: async (reservationId: string) => {
    console.log('체크인 검증 요청:', reservationId);
    const res = await apiClient.patch<ApiResult<CheckInDetail>>(`/v1/reservations/${reservationId}/validate/checkin`);
    console.log('체크인 검증 응답:', res.data);
    return res.data;
  },
  onSuccess: (res) => {
    console.log('onSuccess 호출됨:', res);
    if (res?.success && res.data) {
      checkInDetailData.value = res.data;
      confirmDialogVisible.value = true;
      console.log('모달 표시 설정:', confirmDialogVisible.value);
    } else {
      toast.add({
        severity: 'error',
        summary: '조회 실패',
        detail: res?.message || '예약 정보를 불러올 수 없습니다',
        life: 3000
      });
    }
  },
  onError: (err: any) => {
    console.error('체크인 검증 에러:', err);
    toast.add({
      severity: 'error',
      summary: '조회 실패',
      life: 3000
    });
  }
});

// 실제 체크인 처리 mutation
const actualCheckInMutation = useMutation({
  mutationFn: async (reservationId: string) => {
    const res = await apiClient.patch<ApiResult<CheckInDetail>>(`/v1/reservations/${reservationId}/checkin`);
    return res.data;
  },
  onSuccess: (res) => {
    console.log("체크인 완료:", res);
    if (res.success) {
      confirmDialogVisible.value = false;
      checkInDetailData.value = null;
      pendingReservationId.value = '';

      toast.add({
        severity: 'success',
        summary: '체크인 완료',
        detail: `체크인이 완료되었습니다`,
        life: 3000
      });

      qc.invalidateQueries({ queryKey: ['v1', 'reservations', 'today'] });
    } else {
      toast.add({
        severity: 'error',
        summary: '체크인 실패',
        detail: res?.message || '체크인 처리에 실패했습니다',
        life: 3000
      });
    }
  },
  onError: (err: any) => {
    toast.add({
      severity: 'error',
      summary: '체크인 실패',
      detail: err?.response?.data?.message || '체크인 처리에 실패했습니다',
      life: 3000
    });
  }
});

const handleCheckIn = (reservationId: string) => {
  pendingReservationId.value = reservationId;
  checkInMutation.mutate(reservationId);
};

const confirmCheckIn = () => {
  if (pendingReservationId.value) {
    actualCheckInMutation.mutate(pendingReservationId.value);
  }
};

const closeResultModal = () => {
  confirmDialogVisible.value = false;
  checkInDetailData.value = null;
  pendingReservationId.value = '';
};

const openScanner = () => {
  if (window.AndroidBridge && typeof window.AndroidBridge.isAndroidApp === 'function' && window.AndroidBridge.isAndroidApp()) {
    // Android 네이티브 카메라로 QR 스캔
    openAndroidQRScanner();
  } else {
    // 웹 기반 QR 스캐너
    scanDialogVisible.value = true;
    setTimeout(() => {
      startScanner();
    }, 300);
  }
};

// Android QR 스캐너 열기 (실시간 스캔)
const openAndroidQRScanner = () => {
  // Android에서도 다이얼로그로 실시간 스캔
  scanDialogVisible.value = true;
  setTimeout(() => {
    startScanner();
  }, 300);
};

const closeScanner = () => {
  stopScanner();
  scanDialogVisible.value = false;
  scannedData.value = '';
};

const startScanner = async () => {
  if (!videoElement.value) return;

  try {
    qrScanner.value = new QrScanner(
      videoElement.value,
      (result) => {
        scannedData.value = result.data;

        toast.add({
          severity: 'success',
          summary: 'QR 코드 인식 성공',
          detail: `예약번호: ${result.data}`,
          life: 3000
        });

        // QR 코드로 바로 체크인 처리
        handleCheckIn(result.data);

        // 즉시 스캐너 중지 및 닫기
        stopScanner();
        scanDialogVisible.value = false;
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    await qrScanner.value.start();
    isScanning.value = true;

    toast.add({
      severity: 'info',
      summary: '스캐너 시작',
      detail: 'QR 코드를 스캔해주세요',
      life: 2000
    });
  } catch (error) {
    console.error('카메라 시작 실패:', error);
    toast.add({
      severity: 'error',
      summary: '카메라 오류',
      detail: '카메라를 시작할 수 없습니다. 권한을 확인해주세요.',
      life: 3000
    });
  }
};

const stopScanner = () => {
  if (qrScanner.value) {
    qrScanner.value.stop();
    qrScanner.value.destroy();
    qrScanner.value = null;
    isScanning.value = false;
  }
};

const getStatusSeverity = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'confirmed') return 'info';
  if (s === 'checked_in') return 'success';
  if (s === 'checked_out') return 'secondary';
  return 'warning';
};

const getStatusLabel = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'confirmed') return '예약 확정';
  if (s === 'checked_in') return '체크인 완료';
  if (s === 'checked_out') return '체크아웃 완료';
  return status;
};
</script>

<template>
  <div class="mx-auto p-6">

    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">체크인 관리</h1>
        <p class="text-gray-600">오늘 체크인 예정인 예약을 확인하세요</p>
      </div>
      <Button
        @click="openScanner"
        icon="pi pi-qrcode"
        label="QR 스캔"
        severity="success"
        size="large"
        class="shadow-lg"
      />
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="space-y-4">
      <Skeleton height="100px" v-for="i in 3" :key="i" />
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="isError" class="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
      데이터를 불러오는데 실패했습니다.
    </div>

    <!-- 예약 목록 -->
    <div v-else-if="reservations.length === 0" class="text-center py-20">
      <i class="pi pi-calendar text-6xl text-gray-300 mb-4"></i>
      <p class="text-xl text-gray-500">오늘 체크인 예정인 예약이 없습니다</p>
    </div>

    <div v-else class="space-y-4">
      <Card
        v-for="reservation in reservations"
        :key="reservation.id"
        class="shadow-md hover:shadow-lg transition-shadow"
      >
        <template #content>
          <div class="flex items-center justify-between gap-6">
            <!-- 예약 정보 -->
            <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div class="text-xs text-gray-500 mb-1">예약번호</div>
                <div class="font-semibold text-gray-900">{{ reservation.reservationId }}</div>
              </div>

              <div>
                <div class="text-xs text-gray-500 mb-1">투숙객명</div>
                <div class="font-semibold text-gray-900">{{reservation.guest.lastName}} {{ reservation.guest.firstName }}</div>
                <div class="text-xs text-gray-600 mt-1">{{ reservation.guest.phone }}</div>
              </div>

              <div>
                <div class="text-xs text-gray-500 mb-1">객실</div>
                <div class="font-semibold text-gray-900">{{ reservation.room.roomType }} {{reservation.room.bedType}}</div>
                <div class="text-xs text-gray-600 mt-1">{{ reservation.resevAmount }}명</div>
              </div>

              <div>
                <div class="text-xs text-gray-500 mb-1">숙박기간</div>
                <div class="text-sm text-gray-900">
                  {{ new Date(reservation.resevStart).toLocaleDateString() }}
                </div>
                <div class="text-xs text-gray-600">
                  ~ {{ new Date(reservation.resevEnd).toLocaleDateString() }}
                </div>
              </div>
            </div>

            <!-- 상태 및 액션 -->
            <div class="flex items-center gap-3">
              <Tag
                :value="getStatusLabel(reservation.status)"
                :severity="getStatusSeverity(reservation.status)"
                rounded
              />

              <Button
                v-if="reservation.status.toLowerCase() === 'confirmed'"
                @click="handleCheckIn(reservation.reservationId)"
                label="체크인"
                icon="pi pi-check"
                severity="success"
                :loading="checkInMutation.isPending.value"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 체크인 확인 모달 -->
    <Dialog
      v-model:visible="confirmDialogVisible"
      modal
      header="체크인 확인"
      :style="{ width: '600px' }"
      :closable="!actualCheckInMutation.isPending.value"
    >
      <div v-if="checkInDetailData" class="space-y-6">
        <!-- 투숙객 정보 -->
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-user text-3xl text-blue-600"></i>
            <div>
              <h3 class="text-lg font-bold text-gray-900">
                {{ checkInDetailData.guest.firstName }} {{ checkInDetailData.guest.lastName }}
              </h3>
              <p class="text-sm text-gray-600">투숙객 정보</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">이메일</div>
              <div class="text-sm font-medium text-gray-900">{{ checkInDetailData.guest.email }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">연락처</div>
              <div class="text-sm font-medium text-gray-900">{{ checkInDetailData.guest.phone }}</div>
            </div>
          </div>
        </div>

        <!-- 예약 정보 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between py-3 border-b">
            <span class="text-gray-600">숙소</span>
            <span class="font-semibold text-gray-900">{{ checkInDetailData.placeName }}</span>
          </div>

          <div class="flex items-center justify-between py-3 border-b">
            <span class="text-gray-600">객실 타입</span>
            <span class="font-semibold text-gray-900">{{ checkInDetailData.roomType }}</span>
          </div>

          <div class="flex items-center justify-between py-3 border-b">
            <span class="text-gray-600">침대 타입</span>
            <span class="font-semibold text-gray-900">{{ checkInDetailData.roomBedType }}</span>
          </div>

          <div class="flex items-center justify-between py-3 border-b">
            <span class="text-gray-600">체크인 날짜</span>
            <span class="font-semibold text-blue-600">{{ new Date(checkInDetailData.checkInDate).toLocaleDateString() }}</span>
          </div>

          <div class="flex items-center justify-between py-3">
            <span class="text-gray-600">체크아웃 날짜</span>
            <span class="font-semibold text-gray-900">{{ new Date(checkInDetailData.checkOutDate).toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- 확인 메시지 -->
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-yellow-600 text-xl mt-0.5"></i>
            <div>
              <p class="text-sm font-medium text-yellow-900">체크인을 진행하시겠습니까?</p>
              <p class="text-xs text-yellow-700 mt-1">
                확인 후 체크인 처리가 완료됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="취소"
            icon="pi pi-times"
            severity="secondary"
            @click="closeResultModal"
            :disabled="actualCheckInMutation.isPending.value"
          />
          <Button
            label="체크인 확인"
            icon="pi pi-check"
            severity="success"
            @click="confirmCheckIn"
            :loading="actualCheckInMutation.isPending.value"
          />
        </div>
      </template>
    </Dialog>

    <!-- QR 스캐너 다이얼로그 (웹 + Android) -->
    <Dialog
      v-model:visible="scanDialogVisible"
      modal
      header="QR 코드 스캔"
      :style="{ width: '600px' }"
      @hide="closeScanner"
    >
      <div class="space-y-4">
        <div class="relative bg-gray-900 rounded-lg overflow-hidden" style="min-height: 400px;">
          <video
            ref="videoElement"
            class="w-full h-full object-cover rounded-lg"
            style="min-height: 400px;"
          ></video>

          <div v-if="!isScanning" class="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90">
            <div class="text-center text-white">
              <i class="pi pi-camera text-6xl mb-4 opacity-50"></i>
              <p class="text-lg">카메라 준비 중...</p>
            </div>
          </div>
        </div>

        <div class="text-center text-sm text-gray-600">
          <i class="pi pi-info-circle mr-2"></i>
          예약 QR 코드를 카메라에 맞춰주세요
        </div>
      </div>

      <template #footer>
        <Button label="취소" icon="pi pi-times" @click="closeScanner" severity="secondary" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
video {
  width: 100%;
  height: auto;
  display: block;
}
</style>
