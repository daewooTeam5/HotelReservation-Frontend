<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
      <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" @click="$emit('close')">
        <span aria-hidden="true">&times;</span>
      </button>
      <h2 class="text-xl font-bold mb-4 text-center">로그인</h2>
      <SignInForm @success="onSuccess" @close="$emit('close')" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SignInForm from './SignInForm.vue';

export default defineComponent({
  name: 'SignInModal',
  components: { SignInForm },
  props: {
    visible: { type: Boolean, required: true },
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const onSuccess = () => {
      emit('success');
      emit('close');
    };
    return { onSuccess };
  },
});
</script>

<style scoped>
.bg-black {
  background: rgba(0,0,0,0.8) !important;
}
</style>

