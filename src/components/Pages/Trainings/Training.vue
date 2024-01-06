<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%;">
      <div class="page-container training-page">
        <div v-if="isLoading || !isReady" class="text-center">
          <FLoadingScreen/>
        </div>
        <div v-else>
          <AsyncComponent :component="trainingComponentPath" v-if="trainingComponentPath" @ready="isReady = true" />
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>
<script lang="ts" setup>
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {storeToRefs} from "pinia";
  import {useRoute, useRouter} from "vue-router";
  import {defineAsyncComponent, inject, onMounted, ref} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import FLoadingScreen from "@/components/common/FLoadingScreen.vue";
  import AsyncComponent from "@/components/common/AsyncComponent.vue";
  import {useQuasar} from "quasar";

  const $q = useQuasar();

  const route = useRoute();
  const router = useRouter();
  const UI = inject<IUIActions>('UI');
  const {t} = useI18n() as {t:TranslateFunction};

  const isLoading = ref<boolean>(true);
  const isReady = ref<boolean>(false);


  const {
    contentHeight,
    trainingWords,
    trainingCollections
  } = storeToRefs(UIStore());

  const trainingComponentPath = ref<string>();

  onMounted(() => {
    const query = route.query;
    let tmpQueryCollections = query.collectionIds as unknown as string[] | string | null;
    if(!tmpQueryCollections){
      $q.notify({
        type: 'negative',
        message: t('Errors.TrainingNoCollectionInQuery'),
        position: "bottom"
      });
      router.push({
        name: 'home'
      });
      return;
    }


    let arCollectionIds:number[] = [];
    if(tmpQueryCollections){
      if(Array.isArray(tmpQueryCollections)) {
        /** @ts-ignore */
        arCollectionIds = tmpQueryCollections.map((colId) => {
          return parseInt(colId);
        });
      }
      else{
        arCollectionIds = [parseInt(tmpQueryCollections as string)];
      }
    }
    const areEqual = JSON.stringify(arCollectionIds.sort()) === JSON.stringify(trainingCollections.value.sort());

    if(!areEqual){
      UI?.updateTrainingWords(arCollectionIds).then(() => {
        isLoading.value = false;
        if(5 > (trainingWords?.value?.length || 0)){
          $q.notify({
            type: 'negative',
            message: t('Errors.TrainingLowWords'),
            position: "bottom"
          });
          router.push({
            name: 'home'
          });
        }
      }).catch(() => {
        $q.notify({
          type: 'negative',
          message: t('Errors.GetTrainingWordsError'),
          position: "bottom"
        });
        router.push({
          name: 'home'
        });
        isLoading.value = false;
      });
    }
    else{
      if(5 > (trainingWords?.value?.length || 0)){
        $q.notify({
          type: 'negative',
          message: t('Errors.TrainingLowWords'),
          position: "bottom"
        });
        router.push({
          name: 'home'
        });
      }
      else{
        isLoading.value = false;
      }
    }

    const trainingName = query.name;

    if(!trainingName || ['wordToTranslate', 'translateToWord', 'makeFromLetters', 'writeWord', 'matchTheWords'].indexOf(trainingName.toString()) < 0){
      $q.notify({
        type: 'negative',
        message: t('Errors.TrainingTypeError'),
        position: "bottom"
      });
      router.push({
        name: 'home'
      });
    }
    else{
      isReady.value = true;
      trainingComponentPath.value = 'Pages/Trainings/' + trainingName + '.vue';
    }
  });


</script>
<style lang="scss" scoped>

</style>