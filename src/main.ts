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
import {
  Checkbox,
  Splitter,
  SplitterPanel,
  Step,
  StepList,
  StepPanel,
  Stepper,
  Toast
} from 'primevue';

import Card from 'primevue/card';
import Popover from 'primevue/popover';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import OverlayBadge from 'primevue/overlaybadge';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import IftaLabel from 'primevue/iftalabel';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Galleria from 'primevue/galleria';
import Carousel from 'primevue/carousel';
import Skeleton from 'primevue/skeleton';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';

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

app.component('PrimeCarousel', Carousel);
app.component('PrimeMenu', Menu);
app.component('PrimeCard', Card);
app.component('Skeleton', Skeleton);
app.component('Splitter', Splitter);
app.component('Checkbox', Checkbox);
app.component('Stepper', Stepper);
app.component('StepList', StepList);
app.component('Step', Step);
app.component('StepPanel',StepPanel);
app.component('Button', Button);
app.component('Textarea', Textarea);
app.component('Dialog', Dialog);
app.component('SplitterPanel', SplitterPanel);
app.component('InputText', InputText);
app.component('PrimeInputText', InputText);
app.component('PrimeIconField', IconField);
app.component('PrimeInputIcon', InputIcon);
app.component('PrimeDatePicker', DatePicker);
app.component('PrimeSelect', Select);
app.component('PrimeButton', Button);
app.component('PrimePopover', Popover);
app.component('PrimeBadge', OverlayBadge);
app.component('PrimeLabel', IftaLabel);
app.component('PrimeTab', Tab);
app.component('PrimeTabs', Tabs);
app.component('PrimeTabList', TabList);
app.component('PrimeTabPanels', TabPanels);
app.component('PrimeTabPanel', TabPanel);
app.component('PrimeGalleria', Galleria);

app.mount('#app');
