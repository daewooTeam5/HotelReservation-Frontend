<template>
  <div class="login-container">
    <h2>관리자 로그인</h2>
    <form @submit.prevent="login">
      <div>
        <label>아이디</label>
        <input v-model="form.adminId" required />
      </div>
      <div>
        <label>비밀번호</label>
        <input type="password" v-model="form.adminPassword" required />
      </div>
      <button type="submit">로그인</button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { apiClient } from '@/utils/axiosClient'
import { useAuthStore } from '@/stores/authStore.js'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: "AdminLogin",
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    // 마운트 시 로그인 상태면 바로 리다이렉트
    onMounted(async () => {
      try {
        const res = await apiClient.post("../auth/token", {}, { withCredentials: true })
        if (res.data?.success) {   // 토큰이 유효할 때만
          router.push("/admin")
        }
      } catch (e) {
        console.log("토큰 없음 또는 만료됨:", e)
      }
    })


    const form = reactive({
      adminId: "",
      adminPassword: ""
    })
    const message = ref("")

    const login = async () => {
      try {
        const res = await apiClient.post("../admin/login", form, { withCredentials: true })
        const { accessToken } = res.data.data
        authStore.setAccessToken(accessToken)
        message.value = "로그인 성공"
        router.push("/admin")
      } catch (err) {
        message.value = err.response?.data?.message || "로그인 실패"
      }
    }

    return { form, message, login }
  }
}
</script>
