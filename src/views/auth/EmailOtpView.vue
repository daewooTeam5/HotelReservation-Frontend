<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
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

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default defineComponent({
  name: 'EmailOtpView',
  components: {
    InputOtp,
    Buttons,
    Toast
  },
  setup() {
    const { otpEmail, setAccessToken } = useAuthStore();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();

    const recaptchaToken = ref('');
    const isRecaptchaVerified = ref(false);
    const recaptchaWidgetId = ref<number | null>(null);
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'YOUR_SITE_KEY_HERE';

    // reCAPTCHA 스크립트 로드
    const loadRecaptchaScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById('recaptcha-script')) {
          if (window.grecaptcha && window.grecaptcha.render) {
            resolve();
          } else {
            const checkInterval = setInterval(() => {
              if (window.grecaptcha && window.grecaptcha.render) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkInterval);
              reject(new Error('reCAPTCHA 로드 타임아웃'));
            }, 10000);
          }
          return;
        }

        const script = document.createElement('script');
        script.id = 'recaptcha-script';
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          const checkReady = setInterval(() => {
            if (window.grecaptcha && window.grecaptcha.render) {
              clearInterval(checkReady);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkReady);
            reject(new Error('reCAPTCHA 초기화 타임아웃'));
          }, 5000);
        };

        script.onerror = () => reject(new Error('reCAPTCHA 스크립트 로드 실패'));

        document.head.appendChild(script);
      });
    };

    // reCAPTCHA 렌더링
    const renderRecaptcha = () => {
      try {
        if (window.grecaptcha && window.grecaptcha.render) {
          const container = document.getElementById('otp-recaptcha-container');
          if (container && !recaptchaWidgetId.value) {
            recaptchaWidgetId.value = window.grecaptcha.render('otp-recaptcha-container', {
              sitekey: recaptchaSiteKey,
              callback: (token: string) => {
                console.log('reCAPTCHA 검증 성공');
                recaptchaToken.value = token;
                isRecaptchaVerified.value = true;
              },
              'expired-callback': () => {
                console.log('reCAPTCHA 만료');
                recaptchaToken.value = '';
                isRecaptchaVerified.value = false;
                toast.add({
                  severity: 'warn',
                  summary: 'reCAPTCHA 만료',
                  detail: 'reCAPTCHA가 만료되었습니다. 다시 확인해주세요.',
                  life: 3000
                });
              },
              'error-callback': () => {
                console.error('reCAPTCHA 오류');
                recaptchaToken.value = '';
                isRecaptchaVerified.value = false;
                toast.add({
                  severity: 'error',
                  summary: 'reCAPTCHA 오류',
                  detail: 'reCAPTCHA에 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.',
                  life: 3000
                });
              }
            });
            console.log('reCAPTCHA 렌더링 완료:', recaptchaWidgetId.value);
          }
        }
      } catch (error) {
        console.error('reCAPTCHA 렌더링 오류:', error);
        toast.add({
          severity: 'error',
          summary: 'reCAPTCHA 오류',
          detail: 'reCAPTCHA 로딩에 실패했습니다.',
          life: 3000
        });
      }
    };

    // reCAPTCHA 리셋
    const resetRecaptcha = () => {
      if (window.grecaptcha && recaptchaWidgetId.value !== null) {
        window.grecaptcha.reset(recaptchaWidgetId.value);
        isRecaptchaVerified.value = false;
        recaptchaToken.value = '';
      }
    };

    const authCodeMutate = useMutation({
      mutationFn: async (data: { email: string, code: string, recaptchaToken: string }) => {
        const result = await apiClient.post<ApiResult<LoginSuccessDto>>('/v1/auth/code', {
          email: data.email,
          code: data.code,
          recaptchaToken: data.recaptchaToken
        }, {
          withCredentials: true
        });
        if (result.data.success) {
          return result.data.data as LoginSuccessDto;
        }
      },
      onSuccess(data) {
        const param = data as LoginSuccessDto;
        setAccessToken(param.accessToken);

        const redirectPath = route.query.redirect as string | undefined;

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

        // reCAPTCHA 리셋
        resetRecaptcha();
      }
    });

    onMounted(async () => {
      try {
        await loadRecaptchaScript();
        setTimeout(() => {
          renderRecaptcha();
        }, 100);
      } catch (error) {
        console.error('reCAPTCHA 로드 실패:', error);
        toast.add({
          severity: 'error',
          summary: 'reCAPTCHA 로드 실패',
          detail: 'reCAPTCHA를 로드할 수 없습니다. 페이지를 새로고침해주세요.',
          life: 5000
        });
      }
    });

    return {
      otpEmail,
      authCodeMutate,
      isRecaptchaVerified,
      recaptchaToken
    };
  },
  data() {
    return {
      otpCode: ''
    };
  },
  watch: {
    otpCode(newValue) {
      if (newValue && newValue.length === 6) {
        this.handleVerification();
      }
    }
  },
  methods: {
    handleVerification() {
      if (!this.isRecaptchaVerified) {
        this.$toast.add({
          severity: 'warn',
          summary: 'reCAPTCHA 필요',
          detail: 'reCAPTCHA를 먼저 확인해주세요!',
          life: 3000
        });
        return;
      }

      if (this.otpCode && this.otpCode.length === 6 && this.otpEmail) {
        this.authCodeMutate.mutate({
          code: this.otpCode,
          email: this.otpEmail,
          recaptchaToken: this.recaptchaToken
        });
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
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg text-center flex flex-col gap-4">
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

      <!-- reCAPTCHA -->
      <div class="flex justify-center my-4">
        <div id="otp-recaptcha-container"></div>
      </div>

      <Buttons
        label="인증하기"
        icon="pi pi-check"
        class="w-full !py-3 !text-lg !font-semibold"
        :disabled="!isRecaptchaVerified"
        @click="handleVerification"
      />
    </div>
  </div>
</template>
