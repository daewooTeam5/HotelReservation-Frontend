<template>
  <div class="signup-container">
    <h2>회원가입</h2>
    <form @submit.prevent="signUp">
      <div>
        <label>아이디</label>
        <input v-model="form.adminId" required />
      </div>
      <div>
        <label>이름</label>
        <input v-model="form.adminName" required />
      </div>
      <div>
        <label>비밀번호</label>
        <input type="password" v-model="form.adminPassword" required />
      </div>
      <button type="submit">회원가입</button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import axios from "axios"

export default {
  name: "SignUp",
  data() {
    return {
      form: {
        adminId: "",
        adminName: "",
        adminPassword: ""
      },
      message: ""
    }
  },
  methods: {
    async signUp() {
      try {
        const res = await axios.post("http://localhost:8080/signup", this.form)
        this.message = res.data.message
      } catch (err) {
        this.message = err.response?.data?.message || "회원가입 실패"
      }
    }
  }
}
</script>
