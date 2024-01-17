<template>
<div>
  <div class="loading-screen">
    <img src="/assets/img/waiting.webp">
    <div class="loading-text"><span v-html="t('Launch.Loading')"></span><span v-html="points"></span></div>
    <div class="crutches">
      <q-icon name="mdi-head-lightbulb"></q-icon>
    </div>
  </div>
</div>
</template>
<script lang="ts" setup>
  import {useQuasar} from "quasar";
  import {computed, onBeforeUnmount, onMounted, onUnmounted, ref} from "vue";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";

  const {t} = useI18n() as {t:TranslateFunction};


  const $q = useQuasar();

  const points = ref<string>('...');
  const interval = ref<number>();

  onMounted(() => {
    interval.value = setInterval(() => {
      changePoints();
    }, 500)
  });

  onUnmounted(() => {
    clearInterval(interval.value);
  });

  const changePoints = () => {
    switch (points.value){
      case '.':
        points.value = '..';
        break;
      case '..':
        points.value = '...';
        break;
      case '...':
        points.value = '.';
        break;
      default:
        points.value = '.';
        break;
    }
  }
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

  img{
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  .loading-text{
    font-size: 1.5rem;
    position: absolute;
    z-index: 2;
    text-shadow: 0 0 10px rgba(0,0,0,.3);
  }
  .crutches{
    position: fixed;
    left: 0;
    top: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
}
</style>