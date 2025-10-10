<script lang="ts">
import { defineComponent } from 'vue';
import InputOtp from 'primevue/inputotp';
import Buttons from 'primevue/button';
import Toast from 'primevue/toast';
import { useAuthStore } from '@/stores/authStore.ts';
import { apiClient } from '@/utils/axiosClient.ts';
import { useMutation } from '@tanstack/vue-query';
import type { ApiResult } from '@/types/ApiResult.ts';
import type { LoginSuccessDto } from '@/types/users.ts';
import { useToast } from 'primevue';
import type { AxiosError } from 'axios';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'EmailOtpView',
  components: {
    InputOtp,
    Buttons,
    Toast
  },
  setup() {
    const { otpEmail,setAccessToken } = useAuthStore();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute(); // 현재 라우트 객체를 가져옵니다.
    const authCodeMutate = useMutation({
      mutationFn: async (data: { email: string, code: string }) => {
        const result = await apiClient.post<ApiResult<LoginSuccessDto>>('../auth/code', {
          email: data.email,
          code: data.code
        },{
          withCredentials:true
        });
        if (result.data.success) {
          return result.data.data as LoginSuccessDto;
        }
      },
      onSuccess(data) {
        const param = data as LoginSuccessDto
        setAccessToken(param.accessToken);

        // 주석: 쿼리에서 redirect 경로를 확인합니다.
        const redirectPath = route.query.redirect as string | undefined;

        // 주석: redirect 경로가 있으면 그곳으로, 없으면 메인 페이지('/')로 이동합니다.
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push("/");
        }
      },
      onError(error: AxiosError<ApiResult<any>>) {
        console.log(error.response);
        toast.add({
          severity: 'error',
          detail: error?.response?.data.error?.detail ?? '알 수 없는 오류',
          summary: '인증 코드 에러'
        });
      }
    });

    return { otpEmail, authCodeMutate };
  },
  data() {
    return {
      otpCode: ''
    };
  },
  watch: {
    // 2. watch 속성으로 otpCode 변화 감지
    otpCode(newValue) {
      if (newValue && newValue.length === 6) {
        this.handleVerification();
      }
    }
  },
  methods: {
    // 3. methods에 함수 정의
    handleVerification() {
      if (this.otpCode && this.otpCode.length === 6 && this.otpEmail) {
        this.authCodeMutate.mutate({ code: this.otpCode, email: this.otpEmail });
      } else {
        this.$toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: '인증 코드를 6자리 모두 입력해주세요!',
          life: 3000
        });
      }
    }
  }
});
</script>

<template>

  <div class="flex items-center justify-center min-h-screen bg-slate-100 font-sans p-4">
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg text-center">
      <div class="flex flex-col items-center space-y-4">
        <i class="pi pi-shield text-5xl text-blue-500"></i>
        <h1 class="text-3xl font-bold text-gray-800">이메일 인증</h1>
      </div>

      <div class="text-gray-600 leading-relaxed">
        <div>
          <b>{{ otpEmail }}</b> 로 이메일을 전송하였습니다.
        </div>
        <div>
          6자리 인증 코드를 입력해주세요
        </div>
      </div>

      <InputOtp
        v-model="otpCode"
        :length="6"
        integerOnly
        :pt="{
          root: { class: 'flex items-center justify-center gap-2' },
          input: { class: 'w-12 h-14 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition' }
        }"
        style="margin-top: 8px; margin-bottom: 8px;"
      />

      <Buttons
        label="인증하기"
        icon="pi pi-check"
        class="w-full !py-3 !text-lg !font-semibold"
        @click="handleVerification"
      />
    </div>
  </div>
</template>
