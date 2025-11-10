<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50">
    <PrimeCard class="w-full max-w-md shadow-md">
      <template #title>관리자 로그인</template>
      <template #content>
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <PrimeLabel for="adminId">아이디</PrimeLabel>
            <PrimeInputText id="adminId" v-model="form.adminId" class="w-full" required />
          </div>
          <div>
            <PrimeLabel for="adminPassword">비밀번호</PrimeLabel>
            <PrimeInputText
              id="adminPassword"
              type="password"
              v-model="form.adminPassword"
              class="w-full"
              required
            />
          </div>

          <!-- reCAPTCHA -->
          <div class="flex justify-center my-4">
            <div id="admin-recaptcha-container"></div>
          </div>

          <PrimeButton
            style="margin-top: 8px;"
            type="submit"
            label="로그인"
            class="w-full"
            :disabled="!isRecaptchaVerified"
          />
          <Divider />
          <div class="text-center">
            <span>계정이 없으신가요? </span>
            <RouterLink to="/signup" class="text-blue-600 hover:underline">회원가입</RouterLink>
          </div>
        </form>
      </template>
      <template #footer>
        <Message v-if="message" severity="error" :closable="false">{{ message }}</Message>
      </template>
    </PrimeCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/axiosClient';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue';

declare global {
  interface Window {
    grecaptcha: any;
    onCaptchaSuccess: (token: string) => void;
    onCaptchaExpired: () => void;
  }
}

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

// reCAPTCHA Site Key (환경변수에서 가져오기)
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'YOUR_SITE_KEY_HERE';

const form = reactive({
  adminId: '',
  adminPassword: '',
  recaptchaToken: ''
});

const message = ref('');
const isRecaptchaVerified = ref(false);
const recaptchaWidgetId = ref<number | null>(null);

// reCAPTCHA 스크립트 로드
const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('recaptcha-script')) {
      // 이미 로드되어 있으면 바로 resolve
      if (window.grecaptcha && window.grecaptcha.render) {
        resolve();
      } else {
        // 스크립트는 있지만 로드 중이면 대기
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
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // 스크립트 로드 완료 후 grecaptcha 객체가 준비될 때까지 대기
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
      const container = document.getElementById('admin-recaptcha-container');
      if (container && !recaptchaWidgetId.value) {
        recaptchaWidgetId.value = window.grecaptcha.render('admin-recaptcha-container', {
          sitekey: recaptchaSiteKey,
          callback: (token: string) => {
            console.log('reCAPTCHA 검증 성공');
            form.recaptchaToken = token;
            isRecaptchaVerified.value = true;
            message.value = '';
          },
          'expired-callback': () => {
            console.log('reCAPTCHA 만료');
            form.recaptchaToken = '';
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
            form.recaptchaToken = '';
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
    form.recaptchaToken = '';
  }
};

const login = async () => {
  if (!isRecaptchaVerified.value) {
    message.value = 'reCAPTCHA를 먼저 확인해주세요.';
    toast.add({
      severity: 'warn',
      summary: 'reCAPTCHA 필요',
      detail: 'reCAPTCHA를 먼저 확인해주세요.',
      life: 3000
    });
    return;
  }

  try {
    const res = await apiClient.post('/v1/auth/admin/login', {
      adminId: form.adminId,
      adminPassword: form.adminPassword,
      recaptchaToken: form.recaptchaToken
    }, {
      withCredentials: true
    });

    const { accessToken } = res.data.data;
    authStore.setAccessToken(accessToken);

    toast.add({
      severity: 'success',
      summary: '로그인 성공',
      detail: '관리자 로그인에 성공했습니다.',
      life: 2000
    });

    await router.push('/admin');
  } catch (err: any) {
    const errorDetail = err.response?.data?.error?.detail || err.response?.data?.message || '로그인 실패';
    message.value = errorDetail;

    toast.add({
      severity: 'error',
      summary: '로그인 실패',
      detail: errorDetail,
      life: 3000
    });

    // reCAPTCHA 리셋
    resetRecaptcha();
  }
};

onMounted(async () => {
  // 이미 로그인이 되어있을시 처리
  if (authStore.userAuth) {
    if (authStore.userAuth.role === 'admin') {
      router.replace('/admin');
      return;
    } else {
      toast.add({
        severity: 'warn',
        summary: '로그아웃 필요',
        detail: '관리자 로그인을 하려면 먼저 로그아웃해주세요.',
        life: 3000
      });
      router.push('/');
      return;
    }
  }

  // reCAPTCHA 설정
  try {
    await loadRecaptchaScript();
    // 약간의 지연 후 렌더링 (DOM이 완전히 준비되도록)
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
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
