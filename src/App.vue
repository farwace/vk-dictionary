<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <FLoadingScreen v-if="AppIsLoading"/>
      <MainPage v-else />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import MainPage from './components/MainPage.vue'
import {useQuasar} from "quasar";
import {computed, inject, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {LaunchParams} from "@/classes/Pinia/LaunchParams/LaunchParams";
import FLoadingScreen from "@/components/common/FLoadingScreen.vue";

const $q = useQuasar();
$q.dark.set('auto');

const UI = inject<IUIActions>('UI');

const {
    vk_app_id,
    vk_user_id,
    isReady
} = storeToRefs(LaunchParams())

const AppIsLoading = computed(() => {
  return !isReady.value;
})


onMounted(() => {

})
</script>
