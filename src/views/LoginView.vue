<script lang="ts">
import { defineComponent, reactive } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  components: {
    InputText,
    Password,
    Button,
  },

  data() {
    return {
      username: '',
      password: '',
      error: '',
    };
  },

  setup() {
    const router = useRouter();
    const loginApi = async ({ username, password }: { username: string; password: string }) => {
      const data = await apiClient.post('v1/users/login', {
        username,
        password,
      });
      return data.data;
    };

    // 뮤테이션 훅
    const mutation = useMutation({
      mutationFn: loginApi,
      onSuccess: (data) => {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        console.log('로그인 성공!', data);
        router.push('/');
      },
    });

    // mutation 객체를 Options API에서 쓰려면 return 해줘야 함
    const state = reactive({ mutation }); // reactive wrapper 씌움
    return { mutation, state };
  },

  methods: {
    submit() {
      this.error = '';
      if (!this.username || !this.password) {
        this.error = '이메일과 비밀번호를 모두 입력해줘~';
        return;
      }
      this.mutation.mutate(
        { username: this.username, password: this.password },
        {
          onError: (err: unknown) => {
            this.error = (err as Error).message || '로그인 실패';
          },
        },
      );
    },
  },
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-md p-8">
        <h1 class="text-2xl font-semibold mb-6 text-center">어서와, 다시 만나서 반가워요 👋</h1>

        <div class="space-y-4">
          <!-- 이메일 -->
          <label class="block text-sm text-gray-600">아이디</label>
          <InputText v-model="username" placeholder="아이디" class="w-full p-3 border rounded-lg" />

          <!-- 비밀번호 -->
          <label class="block text-sm text-gray-600">비밀번호</label>
          <Password
            v-model="password"
            placeholder="비밀번호를 입력해줘"
            toggleMask
            :feedback="false"
            class="w-full"
          />

          <!-- 에러 -->
          <p v-if="error" class="text-sm text-red-500 my-1">{{ error }}</p>

          <!-- 로그인 버튼 -->
          <Button
            :loading="state.mutation.isPending"
            label="로그인"
            @click="submit"
            class="w-full mt-2 p-3 rounded-lg"
          />

          <!-- 링크 -->
          <div class="flex items-center justify-between text-sm mt-2">
            <a class="text-indigo-600 hover:underline" href="#">비밀번호를 잊었어?</a>
            <router-link to="/register">계정 만들기</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
