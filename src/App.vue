<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <MainPage />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import MainPage from './components/MainPage.vue'
import {useQuasar} from "quasar";

const $q = useQuasar();
$q.dark.set('auto');

</script>
