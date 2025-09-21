<script lang="ts" setup>
import { ref } from 'vue';

// 요청사항 데이터
const specialRequest = ref('');

// 이벤트 정의
const emit = defineEmits<{
  requestChange: [request: string];
}>();

// 데이터 변경 감지
const handleInputChange = () => {
  emit('requestChange', specialRequest.value);
};
</script>

<template>
  <PrimeCard class="shadow-sm border border-gray-200">
    <template #header>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-comment text-blue-500"></i>
          요청사항
        </h3>
      </div>
    </template>

    <template #content>
      <div class="p-4 space-y-4">
        <!-- 요청사항 입력 -->
        <div class="space-y-2">
          <label for="specialRequest" class="block text-sm font-medium text-gray-700">
            호텔 요청사항
          </label>
          <Textarea
            id="specialRequest"
            v-model="specialRequest"
            placeholder="호텔에 전달할 요청사항을 입력하세요 (늦은 체크인, 높은 층 요청, 침구류 추가 등)"
            class="w-full"
            rows="5"
            @input="handleInputChange"
          />
          <small class="text-gray-500 text-xs">최대 200자까지 입력 가능합니다.</small>
        </div>

        <!-- 요청사항 안내 메시지 -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <i class="pi pi-info-circle text-gray-500 mt-0.5"></i>
            <div class="text-xs text-gray-600">
              <p class="font-medium mb-1">요청사항 안내</p>
              <p>• 요청사항은 호텔 상황에 따라 수용이 불가능할 수 있습니다.</p>
              <p>• 특별 요청은 보장되지 않으며, 별도의 요금이 부과될 수 있습니다.</p>
              <p>• 중요한 요청은 호텔에 직접 연락하시는 것이 좋습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PrimeCard>
</template>

<style scoped>
</style>
