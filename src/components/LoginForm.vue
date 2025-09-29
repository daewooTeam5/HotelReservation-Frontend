<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';

export default defineComponent({
  name: 'LoginForm',
  components: { InputText, Password, Button },
  emits: ['success'],
  setup(_, { emit }) {
    const state = reactive({
      username: '',
      password: '',
      error: '',
    });
    const loginApi = async ({ username, password }: { username: string; password: string }) => {
      const data = await apiClient.post('v1/users/login', { username, password });
      return data.data;
    };
    const mutation = useMutation({
      mutationFn: loginApi,
      onSuccess: (data) => {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        emit('success', data);
      },
    });
    const submit = () => {
      state.error = '';
      if (!state.username || !state.password) {
        state.error = '이메일과 비밀번호를 모두 입력해줘~';
        return;
      }
      mutation.mutate(
        { username: state.username, password: state.password },
        {
          onError: (err: unknown) => {
            state.error = (err as Error).message || '로그인 실패';
          },
        },
      );
    };
    return { ...toRefs(state), mutation, submit };
  },
});
</script>

<template>
  <form @submit.prevent="submit">
    <div class="space-y-4">
      <label class="block text-sm text-gray-600">아이디</label>
      <InputText v-model="username" placeholder="아이디" class="w-full p-3 border rounded-lg" />
      <label class="block text-sm text-gray-600">비밀번호</label>
      <Password v-model="password" placeholder="비밀번호를 입력해줘" toggleMask :feedback="false" class="w-full" />
      <p v-if="error" class="text-sm text-red-500 my-1">{{ error }}</p>
      <Button :loading="mutation.isPending.value" label="로그인" class="w-full" @click="submit" />
    </div>
  </form>
</template>

<style scoped>
/* 스타일은 필요시 추가 */
</style>
