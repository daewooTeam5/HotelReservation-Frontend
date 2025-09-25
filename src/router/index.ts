import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/placeOwner/Dashboard.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/profile",
      meta: { layout: "profile" },   // 공통 ProfileLayout 사용
      children: [
        {
          path: "account",
          name: "account",
          component: () => import("@/views/profile/AccountPage.vue"),
        },
        {
          path: "payments",
          name: "payments",
          component: () => import("@/views/profile/PaymentsPage.vue"),
        },
        {
          path: "wishlist",
          name: "wishlist",
          component: () => import("@/views/profile/WishList.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/views/profile/SettingsPage.vue"),
        },

      ],
    },
    // 예약 스텝 라우트 (레이아웃 + 자식 페이지)
    {
      path: '/places',
      component: () => import('@/views/hotel/reservation/ReservationLayout.vue'),
      meta: { layout: 'user' },
      children: [
        {
          path: "order",
          name: "PlaceOrder",
          component: () => import("@/views/hotel/reservation/OrderStepPage.vue"),
          meta: { step: "1" },
          props: true,
        },
        {
          path: "payment",
          name: "PlacePayment",
          component: () => import("@/views/hotel/reservation/PaymentStepPage.vue"),
          meta: { step: "2" },
          props: true,
        },
        {
          path: "success",
          name: "PlaceSuccess",
          component: () => import("@/views/hotel/reservation/SuccessStepPage.vue"),
          meta: { step: "3" },
          props: true,
        },
        {
          path: "error",
          name: "PlaceError",
          component: () => import("@/views/hotel/reservation/ErrorStepPage.vue"),
          meta: { step: "2" },
          props: true,
        },
      ],
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
          path: 'rooms',
          name: 'RegisterRooms',
          component: () => import('@/views/PubliShing/register/RoomsStepPage.vue'),
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
          path: 'address',
          name: 'RegisterAddress',
          component: () => import('@/views/PubliShing/register/AddressStepPage.vue'),
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
      props: true,
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/user/MainPage.vue'),
      meta: { layout: 'user' }
    },
    {
      path: '/places/:id',
      name: 'place-detail',
      component: () => import('@/views/user/PlaceDetailPage.vue'),
      props: true,
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
    // 인증/회원가입
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
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
    // 숙소 관리자 영역
    {

      path:'/HotelRegister-old',
      name:'HotelRegister-old',
      component: () => import('@/views/PubliShing/HotelRegister.vue')
    },
    {
      path: "/publishing/images",
      name: "Images",
      component: () => import("../views/PubliShing/Images.vue"),
    },
    {
      path: "/publishing/rooms",
      name: "Rooms",
      component: () => import("../views/PubliShing/Rooms.vue"),
    },
    {
      path: "/publishing/amenities",
      name: "Amenties",
      component: () => import("../views/PubliShing/Amenities.vue"),
    },

    // 오너 영역
    {
      path: "/owner",
      meta: { layout: "owner" },
      children: [
        {
          path: "",
          name: "owner-dashboard",
          component: Dashboard,
          meta: { layout: "owner" },
        },
        {
          path: "place",
          name: "owner-place",
          component: () => import("@/views/placeOwner/PlaceManagement.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "reservations",
          name: "owner-reservations",
          component: () => import("@/views/placeOwner/ReservationManagement.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "reservations/:id",
          name: "owner-reservation-detail",
          component: () => import("@/views/placeOwner/ReservationDetail.vue"),
          props: true,
          meta: { layout: "owner" },
        },
        {
          path: "reviews",
          name: "owner-reviews",
          component: () => import("@/views/placeOwner/ReviewManagement.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "inquiries",
          name: "owner-inquiries",
          component: () => import("@/views/placeOwner/InquiryManagement.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "statistics",
          name: "owner-statistics",
          component: () => import("@/views/placeOwner/Statistics.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "profile",
          name: "owner-profile",
          component: () => import("@/views/placeOwner/ProfilePage.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "settings",
          name: "owner-settings",
          component: () => import("@/views/placeOwner/SettingsPage.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "rooms",
          name: "owner-rooms",
          component: () => import("@/views/placeOwner/RoomManagement.vue"),
          meta: { layout: "owner" },
        },
        {
          path: "rooms/:id",
          name: "owner-room-detail",
          component: () => import("@/views/placeOwner/RoomDetail.vue"),
          props: true,
          meta: { layout: "owner" },
        },
        {
          path: "/owner/statistics",
          name: "statistics",
          component: () => import("@/views/placeOwner/Statistics.vue"),
          meta: { layout: "owner" },
        }
      ],
    },
    // 관리자 영역
    {
      path: '/admin',
      meta: { layout: 'admin' },
      children: [
        {
          path: "",
          name: "admin-dashboard",
          component: () => import('@/views/admin/AdminDashboard.vue'),
          meta: { layout: "admin" },
        },
        {
          path: "place",
          name: "admin-place",
          component: () => import('@/views/admin/AdminPlace.vue'),
          meta: { layout: "admin" },
        },
      ]
    },
    {
      path: '/login1',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLogin.vue'),
    },
    {
      path: '/signup1',
      name: 'admin-signup',
      component: () => import('@/views/admin/AdminSignUp.vue'),
    },
  ],
});

export default router;
