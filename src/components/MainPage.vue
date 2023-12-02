<template>
  <q-page class="flex flex-center">
    <img alt="Quasar logo" src="../assets/logo.svg" style="width: 200px; height: 200px">
    <q-btn @click="tryAdd">
      Добавить на экран?
    </q-btn>
    <div>
      {{ addStatus }}
    </div>
  </q-page>
</template>

<style>
</style>

<script lang="ts" setup>
import {ref} from "vue";

const addStatus = ref<string>('');
const tryAdd = () => {

}

</script>
