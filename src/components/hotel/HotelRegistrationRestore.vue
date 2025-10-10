<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHotelRegistrationStorage } from '@/utils/hotelRegistrationStorage';
import { useToast } from 'primevue';

const toast = useToast();
const { loadAll, clearAll, hasSavedData, getStatus } = useHotelRegistrationStorage();

const showRestoreDialog = ref(false);
const storageStatus = ref({
  register: false,
  address: false,
  images: false,
  rooms: false,
  services: false,
  profile: false
});

const emit = defineEmits<{
  dataRestored: []
  startNew: []
}>();

onMounted(() => {
  // 임시 저장된 데이터가 있는지 확인
  if (hasSavedData()) {
    storageStatus.value = getStatus();
    showRestoreDialog.value = true;
  }
});

const restoreData = () => {
  const success = loadAll();
  if (success) {
    toast.add({
      severity: 'success',
      summary: '데이터 복원 완료',
      detail: '이전에 작성하던 호텔 등록 정보를 불러왔습니다.',
      life: 5000
    });
    emit('dataRestored');
  } else {
    toast.add({
      severity: 'error',
      summary: '데이터 복원 실패',
      detail: '임시 저장된 데이터를 불러오는 중 오류가 발생했습니다.',
      life: 5000
    });
  }
  showRestoreDialog.value = false;
};

const discardData = () => {
  clearAll();
  toast.add({
    severity: 'info',
    summary: '임시 데이터 삭제',
    detail: '이전에 저장된 데이터를 삭제하고 새로 시작합니다.',
    life: 3000
  });
  emit('startNew');
  showRestoreDialog.value = false;
};

const getStorageItemCount = () => {
  return Object.values(storageStatus.value).filter(Boolean).length;
};

const getStorageItemNames = () => {
  const nameMap = {
    register: '기본 정보',
    address: '주소',
    images: '이미지',
    rooms: '객실',
    services: '서비스',
    profile: '프로필'
  };

  return Object.entries(storageStatus.value)
    .filter(([, hasData]) => hasData)
    .map(([key]) => nameMap[key as keyof typeof nameMap])
    .join(', ');
};
</script>

<template>

  <!-- 임시 저장 데이터 복원 다이얼로그 -->
  <Dialog
    v-model:visible="showRestoreDialog"
    modal
    header="임시 저장된 데이터 발견"
    :style="{ width: '32rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :closable="false"
  >
    <div class="py-4">
      <div class="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded mb-4">
        <i class="pi pi-info-circle text-blue-500 text-xl mt-1"></i>
        <div>
          <h4 class="font-semibold text-blue-700 mb-2">이전에 작성하던 데이터가 있습니다</h4>
          <p class="text-gray-700 leading-relaxed mb-2">
            호텔 등록을 진행하다가 중단된 데이터가 {{ getStorageItemCount() }}개 항목 발견되었습니다.
          </p>
          <p class="text-sm text-gray-600">
            <strong>저장된 항목:</strong> {{ getStorageItemNames() }}
          </p>
        </div>
      </div>

      <div class="space-y-3 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <i class="pi pi-check-circle text-green-500"></i>
          <span>복원하기: 이전 작업을 이어서 진행할 수 있습니다</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-trash text-red-500"></i>
          <span>삭제하기: 새로운 호텔 등록을 처음부터 시작합니다</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <PrimeButton
          label="삭제하고 새로 시작"
          icon="pi pi-trash"
          severity="danger"
          outlined
          @click="discardData"
        />
        <PrimeButton
          label="이전 작업 이어하기"
          icon="pi pi-replay"
          severity="success"
          @click="restoreData"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.p-dialog-content {
  padding: 0;
}
</style>
