import './assets/main.css';

import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';
import { Toast } from 'primevue';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: 0,
      },
    },
  },
});
app.use(ToastService);
app.component('Toast', Toast);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

app.mount('#app');
