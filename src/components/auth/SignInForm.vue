<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';
import type { ApiResult } from '@/types/ApiResult';
import { useToast } from 'primevue';
import type { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore.ts';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'SignInForm',
  emits: ['success', 'close'],
  components: { Button, InputText, Divider },
  setup(_, { emit }) {
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const state = reactive({
      email: '',
      password: '',
    });
    const emailMutate = useMutation({
      mutationFn: async (data: { email: string }) => {
        const result = await apiClient.post<ApiResult<boolean>>('../auth', {
          email: data.email
        });
        if (result.data.success) {
          return data.email;
        }
      },
      onSuccess: (data) => {
        authStore.setOtpEmail(data as string);
        emit('success');
      },
      onError: (error: AxiosError<ApiResult<any>>) => {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.response?.data?.error?.detail ?? '알 수 없는 오류',
          life: 3000
        });
      }
    });
    const handleEmailLogin = () => {
      emailMutate.mutate({ email: state.email });
    };
    const handleGoogleLogin = () => { emit('close'); };
    const handleKakaoLogin = () => { emit('close'); };

    return {
      ...toRefs(state),
      emailMutate,
      handleEmailLogin,
      handleGoogleLogin,
      handleKakaoLogin,

    };
  }
});
</script>

<template>
  <div>
    <!-- SNS 로그인 버튼들 -->
    <div class="flex flex-col gap-2 mb-4">
      <Button label="Google 로그인" icon="pi pi-google" severity="secondary" outlined @click="handleGoogleLogin" />
      <Button label="Kakao 로그인" icon="pi pi-comment" severity="warning" @click="handleKakaoLogin" />
    </div>
    <Divider align="center">또는</Divider>
    <!-- 이메일 로그인 -->
    <form @submit.prevent="handleEmailLogin">
      <span class="p-float-label">
        <label for="email">이메일</label>
        <InputText id="email" v-model="email" class="w-full" placeholder="이메일 주소를 입력해주세요" />
      </span>
      <Button :loading="!emailMutate.isPending" label="이메일 로그인" icon="pi pi-sign-in" class="w-full" type="submit" style="margin-top: 6px;" />
    </form>
  </div>
</template>

<style scoped>
</style>

