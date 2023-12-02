<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <MainPage />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import MainPage from './components/MainPage.vue'
import {useQuasar} from "quasar";
import {inject, onMounted, ref} from "vue";

const $q = useQuasar();
$q.dark.set('auto');

const UI = inject<IUIActions>('UI');
const launchParams = ref<GetLaunchParamsResponse | undefined>();
onMounted(() => {
  UI?.queryLaunchParams().then(() => {
    console.log(UI?.getLaunchParams());
  })
})
</script>
