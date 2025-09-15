<script lang="ts">
import { defineComponent } from 'vue';
import Button from 'primevue/button';
import Menubar from 'primevue/menubar';

export default defineComponent({
  name: 'Header',
  components: {
    Button,
    Menubar
  }
});
</script>

<template>
  <Menubar class="border-none border-t! border-l! border-r! rounded-0">
    <template #start>
      <div class="text-4xl font-bold">
        Hotel Reservation
      </div>
    </template>
    <template #end>
      <div class="flex gap-2 items-center">
        <Button variant="outlined" rounded icon="pi pi-shopping-cart" />

        <RouterLink to="/auth/signin">
          <Button
            rounded
            variant="outlined"
            label="로그인/회원가입"
            icon="pi pi-sign-in"
            icon-pos="left" />
        </RouterLink>
      </div>
    </template>

  </Menubar>


</template>

<style scoped>

</style>
