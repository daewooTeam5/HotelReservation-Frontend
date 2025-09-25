<script lang="ts" setup>
// 이 스크립트 영역에 폼 데이터 처리 로직을 추가할 수 있습니다.
</script>

<template>
  <div class="w-full bg-gray-100 flex items-center justify-center p-4">

    <div class="w-[540px] h-[620px] bg-white rounded-xl shadow-lg p-8 flex flex-col">

      <h1 class="font-bold text-gray-800 text-center mb-4">프로필 등록</h1>

      <form class="flex-grow flex flex-col">

        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <input
            type="text"
            id="name"
            placeholder="홍길동"
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input
            type="email"
            id="email"
            placeholder="hello@example.com"
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
          <textarea
            id="bio"
            rows="6"
            placeholder="자신에 대해 간단히 소개해주세요."
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
          ></textarea>
        </div>

        <div class="flex-grow flex items-end">
          <button
            type="submit"
            class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            정보 저장하기
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<style scoped>
/* Tailwind CSS를 사용하므로 추가적인 CSS는 필요 없습니다. */
</style>
