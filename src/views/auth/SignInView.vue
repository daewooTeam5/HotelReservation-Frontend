<script lang="ts">
import { defineComponent, reactive } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import { useMutation } from '@tanstack/vue-query';
import { apiClient } from '@/utils/axiosClient.ts';
import type { ApiResult } from '@/types/ApiResult';
import { useToast } from 'primevue';
import type { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore.ts';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'SignInView',
  components: {
    Card,
    Button,
    InputText,
    Divider
  },
  data() {
    return {
      email: '',
      password: ''
    };
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const { setOtpEmail } = useAuthStore();
    const emailMutate = reactive(useMutation({
      mutationFn: async (data: { email: string })=> {
        const result = await apiClient.post<ApiResult<boolean>>('../auth', {
          email: data.email
        });
        if (result.data.success) {
          return data.email
        }
      },
      onSuccess: (data) => {
        console.log('Mutation 성공:', data);
        console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
        setOtpEmail(data as string);
        router.push("/auth/email-otp");
      },
      onError: (error: AxiosError<ApiResult<any>>) => {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.response?.data?.error?.detail ?? '알 수 없는 오류',
          life: 3000
        });
      }
    }));

    return { emailMutate };

  },
  methods: {
    handleEmailLogin() {
      this.emailMutate.mutate({ email: this.email });
    },
    handleGoogleLogin() {
      console.log('구글 로그인 실행!');
    },
    handleKakaoLogin() {
      console.log('카카오 로그인 실행!');
    },
    handleNaverLogin() {
      console.log('네이버 로그인 실행!');
    }
  }
});
</script>

<template>
  <Toast />
  <div class="flex justify-center items-center bg-gray-50 h-full flex-1 ">
    <Card class="w-full sm:w-96 shadow-lg">
      <template #title>
        <h2 class="text-center text-xl font-bold">로그인</h2>
      </template>

      <template #content>
        <!-- SNS 로그인 버튼들 -->
        <div class="flex flex-col gap-2 mb-4">
          <Button
            label="Google 로그인"
            icon="pi pi-google"
            severity="secondary"
            outlined
            @click="handleGoogleLogin"
          />
          <Button
            label="Kakao 로그인"
            icon="pi pi-comment"
            severity="warning"
            @click="handleKakaoLogin"
          />
          <Button
            label="Naver 로그인"
            icon="pi pi-globe"
            severity="success"
            @click="handleNaverLogin"
          />
        </div>

        <Divider align="center">또는</Divider>

        <!-- 이메일 로그인 -->
        <div class="flex flex-col gap-3">
          <span class="p-float-label">
            <label for="email">이메일</label>
            <InputText id="email" v-model="email" class="w-full" placeholder="이메일 주소를 입력해주세요" />
          </span>


          <Button
            :loading="emailMutate.isPending"
            label="이메일 로그인"
            icon="pi pi-sign-in"
            class="w-full"
            @click="handleEmailLogin"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
/* Card 안쪽 여백 조정 */
:deep(.p-card-body) {
  padding: 2rem;
}
</style>
