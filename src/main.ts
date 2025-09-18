import './assets/main.css';

import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';

import 'primeicons/primeicons.css';

import ToastService from 'primevue/toastservice';

import Aura from '@primeuix/themes/aura';
import { Toast } from 'primevue';

import Card from 'primevue/card';
import Popover from 'primevue/popover';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Menu from 'primevue/menu';

const app = createApp(App);

const koreanLocale = {
  firstDayOfWeek: 0,
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  today: '오늘',
  clear: '초기화',
  dateFormat: 'yy-mm-dd',
  weekHeader: '주'
};



app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: 0
      }
    }
  }
});
app.use(ToastService);
app.component('Toast', Toast);
app.use(PrimeVue, {
  locale: koreanLocale,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.my-dark-mode'
    }
  }
});

app.component('PrimeMenu', Menu);
app.component('PrimeCard', Card);
app.component('PrimeInputText', InputText);
app.component('PrimeDatePicker', DatePicker);
app.component('PrimeSelect', Select);
app.component('PrimeButton', Button);
app.component('PrimePopover', Popover);

app.mount('#app');
