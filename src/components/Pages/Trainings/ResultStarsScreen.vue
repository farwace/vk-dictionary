<template>
  <div>
    <Vue3Lottie v-if="lottie" :animation-link="lottie" :width="200"/>
  </div>
</template>
<script lang="ts" setup>
  import {Vue3Lottie} from "vue3-lottie";
  import {computed, onMounted} from "vue";

  const props = defineProps<{
    value: number;
  }>();

  const lottie = computed(() => {
    const percent = props.value || 0;

    if(percent >= 95){
      return '/assets/lottie/99.json';
    }
    if(percent >= 90){
      return '/assets/lottie/90.json';
    }
    if(percent >= 80){
      return '/assets/lottie/80.json';
    }
    if(percent >= 70){
      return '/assets/lottie/70.json';
    }
    if(percent >= 60){
      return '/assets/lottie/60.json';
    }
    if(percent >= 50){
      return '/assets/lottie/50.json';
    }
    return '/assets/lottie/49.json';
  })


</script>
<style lang="scss" scoped>

</style>