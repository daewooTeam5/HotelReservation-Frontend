import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/placeOwner/Dashboard.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 사용자 영역
    {
      path: "/",
      name: "home",
      component: () => import("@/views/user/MainPage.vue"),
      meta: { layout: "user" },
    },
    {
      path: "/places/:id",
      name: "place-detail",
      component: () => import("@/views/user/PlaceDetailPage.vue"),
      props: true,
      meta: { layout: "user" },
    },
    {
      path: "/list",
      name: "list",
      component: () => import("@/views/user/ListPage.vue"),
      meta: { layout: "user" },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
      meta: { layout: "user" },
    },

    // 인증/회원가입
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { layout: "user" },
    },
    {
      path: "/auth/register",
      name: "register",
      component: () => import("@/views/RegisterView.vue"),
      meta: { layout: "user" },
    },
    {
      path: "/auth/signin",
      name: "signin",
      component: () => import("@/views/auth/SignInView.vue"),
      meta: { layout: "user" },
    },
    {
      path: "/auth/email-otp",
      name: "verify-otp",
      component: () => import("@/views/auth/EmailOtpView.vue"),
      meta: { layout: "user" },
    },

    // 숙소 관리자 영역
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
          path: "rooms",
          name: "owner-rooms",
          component: () => import("@/views/placeOwner/RoomManagement.vue"),
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
      ],
    },
  ],
});

export default router;
