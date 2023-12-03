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
import {computed, inject, onMounted, watch} from "vue";
import {storeToRefs} from "pinia";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import FLoadingScreen from "@/components/common/FLoadingScreen.vue";

const $q = useQuasar();
$q.dark.set('auto');

const UI = inject<IUIActions>('UI');

const {
    isReady,
    launchError,
    userQueryError
} = storeToRefs(UIStore())

const AppIsLoading = computed(() => {
  return !isReady.value;
});

watch((launchError), (neoVal) => {
  if(neoVal){
    $q.dialog({
      title: 'Ошибка запуска',
      message: 'Не удалось инициализироваь приложение. Перезапустите приложение или попробуйте позже',
      html: true,
      persistent: true,
      ok: false
    });
  }
});
watch((userQueryError), (neoVal) => {
  if(neoVal){
    $q.dialog({
      title: 'Ошибка запуска',
      message: 'Не удалось получить информацию о пользователе. Перезапустите приложение или попробуйте позже',
      html: true,
      persistent: true,
      ok: false
    });
  }
});


onMounted(() => {

});

</script>
