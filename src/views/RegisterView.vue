<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';

export default defineComponent({
  name: 'UserForm',
  components: { InputText, Password, Button },
  setup() {
    const username = ref('');
    const password = ref('');
    const role = ref('ROLE_USER'); // 기본값
    const error = ref('');

    // 회원가입 API 흉내 (실제로는 axios/fetch로 MariaDB 연동)
    const registerApi = async ({
      username,
      password,
      role,
    }: {
      username: string;
      password: string;
      role: string;
    }) => {
      const data = await apiClient.post('/v1/users', {
        username,
        password,
        role,
      });
      return data.data;
    };

    const mutation = useMutation({
      mutationFn: registerApi,
      onSuccess: (data) => {
        console.log('회원 등록 성공', data);
      },
      onError: (err: unknown) => {
        error.value = (err as Error).message || '등록 실패';
      },
    });

    const submit = () => {
      error.value = '';
      mutation.mutate({ username: username.value, password: password.value, role: role.value });
    };

    const state = reactive({ mutation });

    return { username, password, role, error, submit, state };
  },
});
</script>

<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md space-y-4">
    <h1 class="text-xl font-semibold text-center">사용자 등록</h1>

    <!-- 유저네임 -->
    <label class="block text-sm text-gray-600">아이디</label>
    <InputText v-model="username" placeholder="아이디 입력" class="w-full p-3 border rounded-lg" />

    <!-- 비밀번호 -->
    <label class="block text-sm text-gray-600">비밀번호</label>
    <Password
      v-model="password"
      placeholder="비밀번호 입력"
      toggleMask
      :feedback="false"
      class="w-full"
    />

    <!-- 권한 선택 -->
    <label class="block text-sm text-gray-600">권한</label>
    <select v-model="role" class="w-full p-3 border rounded-lg">
      <option value="ROLE_USER">ROLE_USER</option>
      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
    </select>

    <!-- 에러 메시지 -->
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <!-- 제출 버튼 -->
    <Button
      :loading="state.mutation.isPending"
      label="등록"
      @click="submit"
      class="w-full p-3 rounded-lg"
    />
  </div>
</template>

<style scoped></style>
