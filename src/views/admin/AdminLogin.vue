<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50">
    <PrimeCard class="w-full max-w-md shadow-md">
      <template #title>관리자 로그인</template>
      <template #content>
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <PrimeLabel for="adminId">아이디</PrimeLabel>
            <PrimeInputText id="adminId" v-model="form.adminId" class="w-full" required />
          </div>

          <div>
            <PrimeLabel for="adminPassword">비밀번호</PrimeLabel>
            <PrimeInputText id="adminPassword" type="password" v-model="form.adminPassword" class="w-full" required />
          </div>

          <PrimeButton style="margin-top: 8px;" type="submit" label="로그인" class="w-full" />

          <Divider />
          <div class="text-center">
            <span>계정이 없으신가요? </span>
            <RouterLink to="/signup" class="text-blue-600 hover:underline">회원가입</RouterLink>
          </div>
        </form>
      </template>
      <template #footer>
        <Message v-if="message" severity="error" :closable="false">{{ message }}</Message>
      </template>
    </PrimeCard>
  </div>
</template>

<script lang="ts">
import { apiClient } from "@/utils/axiosClient"
import { useAuthStore } from "@/stores/authStore"
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"

export default {
  name: "AdminLogin",
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const form = reactive({
      adminId: "",
      adminPassword: ""
    })
    const message = ref("")

    const login = async () => {
      try {
        const res = await apiClient.post("/v1/auth/admin/login", form, { withCredentials: true })
        const { accessToken } = res.data.data
        authStore.setAccessToken(accessToken)
        router.push("/admin")
      } catch (err: any) {
        message.value = err.response?.data?.message || "로그인 실패"
      }
    }

    return { form, message, login }
  }
}
</script>
