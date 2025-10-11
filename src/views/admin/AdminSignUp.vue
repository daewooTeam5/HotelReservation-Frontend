<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50">
    <PrimeCard class="w-full max-w-md shadow-md">
      <template #title>회원가입</template>
      <template #content>
        <form @submit.prevent="signUp" class="space-y-4">
          <div>
            <PrimeLabel for="adminId">아이디</PrimeLabel>
            <PrimeInputText id="adminId" v-model="form.adminId" class="w-full" required />
          </div>

          <div>
            <PrimeLabel for="adminName">이름</PrimeLabel>
            <PrimeInputText id="adminName" v-model="form.adminName" class="w-full" required />
          </div>

          <div>
            <PrimeLabel for="adminPassword">비밀번호</PrimeLabel>
            <PrimeInputText id="adminPassword" type="password" v-model="form.adminPassword" class="w-full" required />
          </div>

          <div>
            <PrimeLabel for="adminRole">권한</PrimeLabel>
            <PrimeSelect id="adminRole" v-model="form.adminRole" :options="roles" optionLabel="label" optionValue="value" class="w-full" placeholder="권한 선택" required />
          </div>

          <PrimeButton type="submit" label="회원가입" class="w-full" />

          <Divider />
          <div class="text-center">
            <span>이미 계정이 있으신가요? </span>
            <RouterLink to="/auth/login" class="text-blue-600 hover:underline">로그인</RouterLink>
          </div>
        </form>
      </template>
      <template #footer>
        <Message v-if="message" severity="info" :closable="false">{{ message }}</Message>
      </template>
    </PrimeCard>
  </div>
</template>

<script lang="ts">
import axios from "axios"
import { apiClient } from '@/utils/axiosClient.ts';

export default {
  name: "SignUp",
  data() {
    return {
      form: {
        adminId: "",
        adminName: "",
        adminPassword: "",
        adminRole: ""
      },
      roles: [
        { label: "관리자", value: "admin" },
        { label: "전체 숙소 관리자", value: "place_admin" },
        { label: "전체 유저 관리자", value: "user_admin" }
      ],
      message: ""
    }
  },
  methods: {
    async signUp() {
      try {
        const res = await apiClient.post("v1/auth/signup", this.form)
        this.message = res.data.message
        this.$router.push("/login")
      } catch (err: any) {
        this.message = err.response?.data?.message || "회원가입 실패"
      }
    }
  }
}
</script>
