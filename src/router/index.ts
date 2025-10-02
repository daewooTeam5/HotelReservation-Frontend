import { createRouter, createWebHistory } from 'vue-router';
import type { RouterScrollBehavior } from 'vue-router';
import Dashboard from '@/views/placeOwner/Dashboard.vue';

// 스크롤 동작 정의
const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  // 기본은 항상 최상단으로 이동
  return { left: 0, top: 0 };
};
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/profile',
      meta: { layout: 'profile' },   // 공통 ProfileLayout 사용
      children: [
        {
          path: 'account',
          name: 'account',
          component: () => import('@/views/profile/AccountPage.vue')
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/views/profile/PaymentsPage.vue')
        },
        {
          path: 'payments/:paymentId',
          name: 'profile-payment-detail',
          component: () => import('@/views/profile/PaymentDetailPage.vue'),
          props: true,
          meta: { layout: 'profile' }
        },
        {
          path: 'comment',
          name: 'comment',
          component: () => import('@/views/profile/QuestionPage.vue')
        },
        {
          path: 'wishlist',
          name: 'wishlist',
          component: () => import('@/views/profile/WishList.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/profile/SettingsPage.vue')
        },
        {
          path: '/auth/point',
          name: 'point',
          component: () => import('@/views/auth/MyPointView.vue')
        },
        {
          path: '/auth/coupon',
          name: 'coupon',
          component: () => import('@/views/auth/MyCouponView.vue')
        },
        {
          path: 'owner-request',
          name: 'OwnerRequest',
          component: () => import('../views/user/RequestOwnerPage.vue')
        },
        {
          path: 'review-list',
          name: 'reviewList',
          component: () => import('../views/user/reviews/ReviewList.vue')
        }

      ]
    },
    // 예약 스텝 라우트 (레이아웃 + 자식 페이지)
    {
      path: '/places',
      component: () => import('@/views/hotel/reservation/ReservationLayout.vue'),
      meta: { layout: 'user' },
      children: [
        {
          path: 'order',
          name: 'PlaceOrder',
          component: () => import('@/views/hotel/reservation/OrderStepPage.vue'),
          meta: { step: '1' },
          props: true
        },
        {
          path: 'payment',
          name: 'PlacePayment',
          component: () => import('@/views/hotel/reservation/PaymentStepPage.vue'),
          meta: { step: '2' },
          props: true
        },
        {
          path: 'success',
          name: 'PlaceSuccess',
          component: () => import('@/views/hotel/reservation/SuccessStepPage.vue'),
          meta: { step: '3' },
          props: true
        },
        {
          path: 'error',
          name: 'PlaceError',
          component: () => import('@/views/hotel/reservation/ErrorStepPage.vue'),
          meta: { step: '2' },
          props: true
        }
      ]
    },
    // 발행(숙소 등록) 스텝 라우트
    {
      path: '/publishing/register',
      component: () => import('@/views/PubliShing/register/RegisterLayout.vue'),
      children: [
        {
          path: 'basic',
          name: 'RegisterBasic',
          component: () => import('@/views/PubliShing/register/BasicStepPage.vue'),
          meta: { step: '1' }
        },
        {
          path: 'address',
          name: 'RegisterAddress',
          component: () => import('@/views/PubliShing/register/AddressStepPage.vue'),
          meta: { step: '2' }
        },
        {
          path: 'amenities',
          name: 'RegisterAmenities',
          component: () => import('@/views/PubliShing/register/AmenitiesStepPage.vue'),
          meta: { step: '3' }
        },
        {
          path: 'policy',
          name: 'RegisterPolicy',
          component: () => import('@/views/PubliShing/register/PolicyStepPage.vue'),
          meta: { step: '4' }
        },
        {
          path: 'rooms',
          name: 'RegisterRooms',
          component: () => import('@/views/PubliShing/register/RoomsStepPage.vue'),
          meta: { step: '5' }
        },
        {
          path: 'confirm',
          name: 'RegisterConfirm',
          component: () => import('../views/PubliShing/register/ConfirmStepPage.vue'),
          meta: { step: '6' }
        },
        {
          path: 'error',
          name: 'RegisterError',
          component: () => import('../views/PubliShing/register/RegisterErrorPage.vue'),
          meta: { step: '8' }
        }
      ]
    },
    {
      path: '/HotelRegister',
      name: 'HotelRegister',
      redirect: { name: 'RegisterBasic' }
    },
    {
      path: '/places/:id',
      name: 'PlaceDetail',
      component: () => import('../views/user/PlaceDetailPage.vue'),
      meta: { layout: 'user' },
      props: true
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/user/MainPage.vue'),
      meta: { layout: 'user' }
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('@/views/user/ListPage.vue'),
      meta: { layout: 'user' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { layout: 'user' }
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { layout: 'user' }
    },
    // 인증/회원가입
    {
      path: '/cart',
      name: 'cart',
      meta: { layout: 'user' },
      component: () => import('../views/ShoppingCartPage.vue')
    },
    {
      path: '/auth/register',
      name: 'register',
      meta: { layout: 'user' },
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/auth/signin',
      name: 'signin',
      component: () => import('@/views/auth/SignInView.vue'),
      meta: { layout: 'user' }
    },
    {
      path: '/auth/email-otp',
      name: 'verify-otp',
      component: () => import('@/views/auth/EmailOtpView.vue'),
      meta: { layout: 'user' }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/profile/NotificationView.vue'),
      meta: { layout: 'user' }
    },
    {

      path: '/HotelRegister-old',
      name: 'HotelRegister-old',
      component: () => import('@/views/PubliShing/HotelRegister.vue')
    },
    {
      path: '/publishing/images',
      name: 'Images',
      component: () => import('../views/PubliShing/Images.vue')
    },
    {
      path: '/publishing/rooms',
      name: 'Rooms',
      component: () => import('../views/PubliShing/Rooms.vue')
    },
    {
      path: '/publishing/amenities',
      name: 'Amenties',
      component: () => import('../views/PubliShing/Amenities.vue')
    },
    // 오너 영역
    {
      path: '/owner',
      meta: { layout: 'owner' },
      children: [
        {
          path: '',
          name: 'owner-dashboard',
          component: Dashboard,
          meta: { layout: 'owner' }
        },
        {
          path: 'place',
          name: 'owner-place',
          component: () => import('@/views/placeOwner/PlaceManagement.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'reservations',
          name: 'owner-reservations',
          component: () => import('@/views/placeOwner/ReservationManagement.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'reservations/:id',
          name: 'owner-reservation-detail',
          component: () => import('@/views/placeOwner/ReservationDetail.vue'),
          props: true,
          meta: { layout: 'owner' }
        },
        {
          path: 'reviews',
          name: 'owner-reviews',
          component: () => import('@/views/placeOwner/ReviewManagement.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'inquiries',
          name: 'owner-inquiries',
          component: () => import('@/views/placeOwner/InquiryManagement.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'statistics',
          name: 'owner-statistics',
          component: () => import('@/views/placeOwner/Statistics.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'profile',
          name: 'owner-profile',
          component: () => import('@/views/placeOwner/ProfilePage.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'rooms',
          name: 'owner-rooms',
          component: () => import('@/views/placeOwner/RoomManagement.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'rooms/:id',
          name: 'owner-room-detail',
          component: () => import('@/views/placeOwner/RoomDetail.vue'),
          props: true,
          meta: { layout: 'owner' }
        },
        {
          path: '/owner/statistics',
          name: 'statistics',
          component: () => import('@/views/placeOwner/Statistics.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'coupons',
          name: 'owner-coupons',
          component: () => import('@/views/placeOwner/CouponManagement.vue'),
          meta: { layout: 'owner' }
        },
        {
          path: 'coupons/:id',
          name: 'owner-coupon-detail',
          component: () => import('@/views/placeOwner/CouponDetail.vue'),
          props: true,
          meta: { layout: 'owner' }
        },
        {
          path: 'discounts',
          name: 'owner-discounts',
          component: () => import('@/views/placeOwner/DiscountManagement.vue'),
          meta: { layout: 'owner' }
        }
      ]
    },
    // 관리자 영역
    {
      path: '/admin',
      meta: { layout: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboard.vue'),
          meta: { layout: 'admin' }
        },
        {
          path: 'place',
          name: 'admin-place',
          component: () => import('@/views/admin/AdminPlace.vue'),
          meta: { layout: 'admin' }
        },
        {
          path: 'user',
          name: 'admin-user',
          component: () => import('@/views/admin/AdminUser.vue'),
          meta: { layout: 'admin' }
        },
        {
          path: 'user/:id',
          name: 'admin-user-detail',
          component: () => import('@/views/admin/AdminUserDetail.vue'),
          meta: { layout: 'admin' }
        },
        {
          path: 'place/:id',
          name: 'admin-place-detail',
          component: () => import('@/views/admin/AdminPlaceDetail.vue'),
          meta: { layout: 'admin' }
        },
        {
          path: 'review',
          name: 'admin-review',
          component: () => import('@/views/admin/AdminReview.vue'),
          meta: { layout: 'admin' }
        },
        {
          path: 'payment',
          name: 'admin-payment',
          component: () => import('@/views/admin/AdminPayment.vue'),
          meta: { layout: 'admin' }
        },
        {
          path: 'statistics',
          name: 'admin-statistics',
          component: () => import('@/views/admin/AdminStatistics.vue'),
          meta: { layout: 'admin' }
        }
      ]
    },
    {
      path: '/guest/reservation-search',
      name: 'guest-reservation-search',
      component: () => import('@/views/guest/ReservationInfoSearch.vue'),
      meta: { layout: 'user' }
    },

    {
      path: '/login',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLogin.vue')
    },
    {
      path: '/signup',
      name: 'admin-signup',
      component: () => import('@/views/admin/AdminSignUp.vue')
    }
  ],
  scrollBehavior
});

import { useAuthStore } from '@/stores/authStore';

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.accessToken;
  let role: string | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = JSON.parse(payload.sub).role;
    } catch (e) {
      console.error('JWT 파싱 실패:', e);
    }
  }

  if (to.path.startsWith('/admin')) {
    setTimeout(() => {


      console.log('token:', token);
      console.log('parsed role:', role);

      if (!token) {
        console.log('➡️ 토큰 없음 → admin-login으로 이동');
        return next({ name: 'home' });
      }

      if (!role || !['admin', 'place_admin', 'user_admin'].includes(role)) {
        console.log('➡️ 권한 없음 → home으로 이동');
        return next({ name: 'home' });
      }
    }, 0);
  }

  if (to.name === 'admin-login' && token) {
    return next({ name: 'admin-dashboard' });
  }

  next();
});

export default router;
