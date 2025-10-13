<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- 404 애니메이션 -->
      <div class="mb-8!">
        <div class="relative inline-block">
          <h1 class="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </h1>
          <div class="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        </div>
      </div>


      <!-- 메시지 -->
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4!">
        페이지를 찾을 수 없습니다
      </h2>
      <p class="text-lg text-gray-600 mb-8! mx-auto">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.<br>
        주소를 다시 확인해주세요.
      </p>

      <!-- 액션 버튼들 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          label="홈으로 돌아가기"
          icon="pi pi-home"
          size="large"
          severity="info"
          @click="router.push('/')"
          class="w-full sm:w-auto"
        />
        <Button
          label="이전 페이지"
          icon="pi pi-arrow-left"
          size="large"
          outlined
          severity="secondary"
          @click="router.back()"
          class="w-full sm:w-auto"
        />
      </div>

      <!-- 추천 링크 -->
      <div class="mt-12! pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-500 mb-4!">이런 페이지는 어떠세요?</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <button
            @click="router.push('/list')"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-all"
          >
            <i class="pi pi-search mr-2"></i>
            숙소 찾기
          </button>
          <button
            @click="router.push('/profile/payments')"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-all"
          >
            <i class="pi pi-credit-card mr-2"></i>
            내 예약
          </button>
          <button
            @click="router.push('/profile/wishlist')"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-all"
          >
            <i class="pi pi-heart mr-2"></i>
            위시리스트
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>

