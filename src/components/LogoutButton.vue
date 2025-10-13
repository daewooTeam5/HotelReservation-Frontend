<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { apiClient } from '@/utils/axiosClient.ts';

export default defineComponent({
  name: 'LogoutButton',
  emits: ['logged-out'],
  setup(_, { emit }) {
    const handleLogout = async () => {
      try {
        await apiClient.post('/v1/auth/logout');
        emit('logged-out');
      } catch (err) {
        console.error('로그아웃 실패:', err);
      }
    };
    return {
      handleLogout
    };
  }
});
</script>

<template>
  <div @click="handleLogout">
    <slot>
      <button>Logout</button>
    </slot>
  </div>
</template>

<style scoped>
</style>
