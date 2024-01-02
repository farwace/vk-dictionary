<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%">
      <div class="page-container">
        collection detail {{routeParams.id}}
        <router-link to="/">Go to home</router-link>
      </div>
    </q-scroll-area>
  </div>
</template>
<script lang="ts" setup>
  import {onUnmounted, ref} from "vue";
  import {useRoute} from "vue-router"
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";


  const route = useRoute();
  const routeParams = ref(route.params);

  const {
    contentHeight
  } = storeToRefs(UIStore());

  onUnmounted(() => {

  });


</script>
<style lang="scss" scoped>

</style>