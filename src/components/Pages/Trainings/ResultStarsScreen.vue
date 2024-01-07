<template>
  <div>{{ props.value }}</div>
</template>
<script lang="ts" setup>

  const props = defineProps<{
    value: number;
  }>();

</script>
<style lang="scss" scoped>

</style>