<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
      <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-700" @click="$emit('close')">
        <span aria-hidden="true">&times;</span>
      </button>
      <h2 class="text-xl font-bold mb-4 text-center">로그인</h2>
      <LoginForm @success="onSuccess" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LoginForm from './LoginForm.vue';

export default defineComponent({
  name: 'LoginModal',
  components: { LoginForm },
  props: {
    visible: { type: Boolean, required: true },
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const onSuccess = (data: any) => {
      emit('success', data);
      emit('close');
    };
    return { onSuccess };
  },
});
</script>

<style scoped>
/* 필요시 스타일 추가 */
</style>

