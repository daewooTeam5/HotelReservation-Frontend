<script lang="ts">
import { defineComponent } from 'vue';
import LoginForm from '@/components/LoginForm.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  components: { LoginForm },
  setup() {
    const router = useRouter();
    const onLoginSuccess = () => {
      router.push('/');
    };
    return { onLoginSuccess };
  },
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-md p-8">
        <h1 class="text-2xl font-semibold mb-6 text-center">어서와, 다시 만나서 반가워요 👋</h1>
        <LoginForm @success="onLoginSuccess" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 기존 스타일 유지 */
</style>
