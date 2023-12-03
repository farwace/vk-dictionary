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
//import type {TranslateFunction} from "@/lang/TranslateFunction";
import {useI18n} from "vue-i18n";

const $q = useQuasar();
$q.dark.set('auto');

const UI = inject<IUIActions>('UI');

//const t =	inject<TranslateFunction>('t');
const {t} = useI18n();

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
      title: t('Launch.error'),
      message: t('Launch.errorLaunch'),
      html: true,
      persistent: true,
      ok: false
    });
  }
});
watch((userQueryError), (neoVal) => {
  if(neoVal){
    $q.dialog({
      title: t!('Launch.error'),
      message: t!('Launch.errorGetUser'),
      html: true,
      persistent: true,
      ok: false
    });
  }
});


onMounted(() => {

});

</script>
