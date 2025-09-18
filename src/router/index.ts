import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({//여기에 PATH는 경로, NAME은 아무거나, 컴포넌트 import('')는 vue 경로
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test',
      name: 'tset',
      component: () => import('../views/HomeView.vue'),
    },
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
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('../views/WishList.vue')
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

    },
    {
      path:'/hotelregister',
      name:'hotelregister',
      component: () => import('../views/PubliShing/HotelRegister.vue')
    },
    {
      path:'/publishing/address',
      name:'Address',
      component: () => import('../views/PubliShing/Address.vue')
    },
    {
      path:'/publishing/images',
      name:'Images',
      component: () => import('../views/PubliShing/Images.vue')
    },
    {
      path:'/publishing/rooms',
      name:'Rooms',
      component: () => import('../views/PubliShing/Rooms.vue')
    },
    {
      path:'/publishing/amenities',
      name:'Amenties',
      component: () => import('../views/PubliShing/Amenities.vue')
    },
    {
      path: "/places/:id",
      name: "PlaceDetail",
      component: () => import('../views/user/PlaceDetailPage.vue'),
      props: true,
    }

  ]
});

export default router;
