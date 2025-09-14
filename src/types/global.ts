import type { ToastServiceMethods } from 'primevue/toastservice';

declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: ToastServiceMethods;
  }
}
