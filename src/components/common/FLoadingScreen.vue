<template>
<div>
  <!-- TODO: сделать красивый LOADING SCREEN!!! -->
  <div class="loading-screen">
    Загрузка...
  </div>
</div>
</template>
<script lang="ts" setup>
import {useQuasar} from "quasar";
import {onBeforeUnmount, onMounted} from "vue";

const $q = useQuasar();
// onMounted(() => {
//   $q.loading.show();
// });
// onBeforeUnmount(() => {
//   $q.loading.hide();
// })
</script>

<style lang="scss" scoped>
.loading-screen{
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  align-items: center;
}
</style>