<template>
  <div>Слово - перевод</div>
</template>
<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";

  const {
    trainingWords,
    trainingCollections,
  } = storeToRefs(UIStore());



</script>
<style lang="scss" scoped>

</style>