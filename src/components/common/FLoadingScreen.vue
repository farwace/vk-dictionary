<template>
<div>
  <!-- TODO: сделать красивый LOADING SCREEN!!! -->
</div>
</template>
<script lang="ts" setup>
import {useQuasar} from "quasar";
import {onBeforeUnmount, onMounted} from "vue";

const $q = useQuasar();
onMounted(() => {
  $q.loading.show();
});
onBeforeUnmount(() => {
  $q.loading.hide();
})
</script>