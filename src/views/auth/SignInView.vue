```vue
<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';
import type { ApiResult } from '@/types/ApiResult';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore.ts';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'SignInView',
  components: {
    Card,
    Button,
    InputText,
    Divider
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const email = ref('');

    onMounted(() => {
      if (authStore.userAuth) router.push('/');
    });

    // ✅ Google 로그인 버튼 클릭 시 백엔드 OAuth2 엔드포인트로 리다이렉트
    const handleGoogleLogin = () => {
      window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };
    const handleKakaoLogin = () => {
      window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
    };

    // 이메일 로그인 뮤테이션 (기존 그대로)
    const emailMutate = reactive(
      useMutation({
        mutationFn: async (data: { email: string }) => {
          const result = await apiClient.post<ApiResult<boolean>>('/v1/auth', { email: data.email });
          if (result.data.success) return data.email;
        },
        onSuccess: (data) => {
          authStore.setOtpEmail(data as string);
          router.push({
            path: '/auth/email-otp',
            query: route.query
          });
        },
        onError: (error: AxiosError<ApiResult<any>>) => {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.response?.data?.error?.detail ?? '알 수 없는 오류',
            life: 3000
          });
        }
      })
    );

    const handleEmailLogin = () => emailMutate.mutate({ email: email.value });

    return { email, emailMutate, handleEmailLogin, handleGoogleLogin, handleKakaoLogin };
  }
});
</script>

<template>
  <div class="flex justify-center items-center bg-gray-50 h-full flex-1">
    <Card class="w-full sm:w-96 shadow-lg">
      <template #title>
        <h2 class="text-center text-xl font-bold">로그인</h2>
      </template>

      <template #content>
        <!-- ✅ Google 로그인 버튼 -->
        <div class="flex flex-col gap-2 mb-4">
          <Button label="Google 로그인" icon="pi pi-google" severity="secondary" outlined @click="handleGoogleLogin" />
          <img
            src="/images/kakao_login_medium_wide.png"
            alt="카카오 로그인"
            @click="handleKakaoLogin"
            class="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>

        <Divider align="center">또는</Divider>

        <!-- 이메일 로그인 -->
        <form @submit.prevent="handleEmailLogin">
          <span class="p-float-label">
            <label for="email">이메일</label>
            <InputText id="email" v-model="email" class="w-full" placeholder="이메일 주소를 입력해주세요" />
          </span>
          <Button
            :loading="emailMutate.isPending"
            label="이메일 로그인"
            icon="pi pi-sign-in"
            class="w-full"
            type="submit"
            style="margin-top: 6px"
          />
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-card-body) {
  padding: 2rem;
}
</style>
```
