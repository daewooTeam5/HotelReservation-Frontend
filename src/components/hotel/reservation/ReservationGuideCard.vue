<script lang="ts" setup>
import { useAuthStore } from '@/stores/authStore.ts';
import { ref } from 'vue';
import SignInModal from '@/components/auth/SignInModal.vue';

const { userAuth } = useAuthStore();
const showLoginModal = ref(false);
</script>

<template>
  <div class="flex-2">
    <PrimeCard class="shadow-sm border border-gray-200">
      <template #content>
        <div class="flex items-center gap-2 p-3 text-sm text-gray-700">
          <template v-if="!userAuth">
            <i class="pi pi-user text-blue-500"></i>
            <span>
              로그인하면 더 간편하게 예약할 수 있어요 ✨
              <span>
                <button class="login-link ml-1" @click="showLoginModal = true">로그인</button>
              </span>
            </span>
            <SignInModal :visible="showLoginModal" @close="showLoginModal = false" @success="showLoginModal = false" />
          </template>
          <template v-else>
            <i class="pi pi-check-circle text-green-500"></i>
            <span>{{ userAuth.name }}님, 환영합니다!</span>
          </template>
        </div>
      </template>
    </PrimeCard>
  </div>
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
