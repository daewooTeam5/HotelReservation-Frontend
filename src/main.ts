import './assets/main.css';

import 'primevue/resources/themes/saga-blue/theme.css';   // v3 테마
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Stepper from 'primevue/stepper';
import Steps from 'primevue/steps';

const app = createApp(App);

const koreanLocale = {
  firstDayOfWeek: 0,
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  dayNamesMin: ['일','월','화','수','목','금','토'],
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  today: '오늘',
  clear: '초기화',
  dateFormat: 'yy-mm-dd',
  weekHeader: '주'
};

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClientConfig: { defaultOptions: { queries: { retry: 0 }}}});
app.use(ToastService);
app.component('Toast', Toast);
app.use(PrimeVue, { locale: koreanLocale, ripple: true });

app.component('PrimeInputText', InputText);
app.component('PrimeButton', Button);
app.component('Stepper', Stepper);
app.component('Steps', Steps);

app.mount('#app');
