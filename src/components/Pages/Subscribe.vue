<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%;">
      <div class="page-container">
        Подписка
      </div>
    </q-scroll-area>
  </div>
</template>
<script lang="ts" setup>
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {storeToRefs} from "pinia";

const {
  contentHeight
} = storeToRefs(UIStore());


</script>
<style lang="scss" scoped>

</style>