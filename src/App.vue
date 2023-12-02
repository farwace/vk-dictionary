<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <MainPage />

      <q-btn @click="tryAdd">
        Добавить на экран?
      </q-btn>
      <div>
        {{ addStatus }}
      </div>

    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import MainPage from './components/MainPage.vue'
import {useQuasar} from "quasar";
import {ref} from "vue";

const $q = useQuasar();
$q.dark.set('auto');

const addStatus = ref<string>('');
const tryAdd = () => {

}

</script>
