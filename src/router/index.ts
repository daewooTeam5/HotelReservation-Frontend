import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/user/MainPage.vue'),
    },
    {
      path: "/places/:id",
      name: "PlaceDetail",
      component: () => import('../views/user/PlaceDetailPage.vue'),
      props: true,
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('../views/user/ListPage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/auth/signin',
      name: 'signin',
      component: () => import('@/views/auth/SignInView.vue')
    },
    {
      path:'/auth/email-otp',
      name:'verify-otp',
      component: () => import('@/views/auth/EmailOtpView.vue')
    }
  ]
});

export default router;
