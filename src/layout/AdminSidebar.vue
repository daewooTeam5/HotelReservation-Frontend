// filepath: /Users/kotlinandnode/seungho/daewoo/hotelReservation/frontend/src/layout/AdminSidebar.vue
<template>
  <aside class="w-64 bg-white border-r h-full p-4 space-y-2">
    <h2 class="text-lg font-bold mb-4">Admin</h2>
    <nav class="flex flex-col gap-2">
      <RouterLink to="/admin" class="hover:bg-gray-100 rounded p-2">Dashboard</RouterLink>
      <RouterLink to="/admin/hotels" class="hover:bg-gray-100 rounded p-2">Hotels</RouterLink>
      <RouterLink to="/admin/requests" class="hover:bg-gray-100 rounded p-2">Requests</RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
</script>

