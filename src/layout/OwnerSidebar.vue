<template>
  <aside
    class="bg-gray-800 text-white flex flex-col transition-all duration-300"
    :class="isOpen ? 'w-64' : 'w-0'"
  >
    <div v-if="isOpen" class="flex items-center justify-between p-4 border-b border-gray-700">
      <span class="text-xl font-bold">숙소 관리자</span>
      <!-- 닫기 버튼 -->
      <button
        @click="$emit('close')"
        class="p-1 rounded-md hover:bg-gray-700"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>

    <nav v-if="isOpen" class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-2">
        <li><router-link to="/owner" class="block p-2 hover:bg-gray-700 rounded">대시보드</router-link></li>
        <li><router-link to="/owner/place" class="block p-2 hover:bg-gray-700 rounded">숙소 관리</router-link></li>
        <li><router-link to="/owner/rooms" class="block p-2 hover:bg-gray-700 rounded">객실 관리</router-link></li>
        <li><router-link to="/owner/reservations" class="block p-2 hover:bg-gray-700 rounded">예약 관리</router-link></li>
        <li><router-link to="/owner/reviews" class="block p-2 hover:bg-gray-700 rounded">리뷰 관리</router-link></li>
        <li><router-link to="/owner/inquiries" class="block p-2 hover:bg-gray-700 rounded">문의 관리</router-link></li>
        <li><router-link to="/owner/statistics" class="block p-2 hover:bg-gray-700 rounded">통계</router-link></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: "close"): void }>();
</script>
