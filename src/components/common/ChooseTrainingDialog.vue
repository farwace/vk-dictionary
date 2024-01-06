<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>
          <div class="training">
            <div class="dialog-container__title">
              <span v-html="t('Training.ChooseTitle')"></span>
              <div class="text-subtitle2 collections-subtitle" v-if="currentCollections" @click="chooseCollectionsDialog">
                <div v-if="currentCollections.length < 2" v-html="t('Training.Collection') + ':'"></div>
                <div v-if="currentCollections.length > 1" v-html="t('Training.Collections') + ':'"></div>
                <div v-for="(collect, index) in currentCollections" class="item">
                  <div v-if="index < 5">
                    <span>{{collect.name?.slice(0,30)}}</span><span v-if="currentCollections.length>1">;</span>
                  </div>
                  <div v-if="index == 5">...</div>
                </div>
              </div>
            </div>
            <div class="dialog-container__body choose-training" v-if="trainingWords && trainingWords.length > 4">
              <q-btn :disable="isLoading" v-for="training in trainingList" outline rounded @click="doTraining(training.name)">
                <div v-html="training.title"></div>
              </q-btn>
            </div>
            <div v-else v-html="t('Training.LowWordsCount')"></div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import {useDialogPluginComponent, useQuasar} from "quasar";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {computed, inject, onMounted, ref, watch} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {useRoute, useRouter} from "vue-router";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {TWord} from "@/classes/Pinia/UIStore/TWord";
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";
  import ChooseCollectionsDialog from "@/components/common/ChooseCollectionsDialog.vue";

  const $q = useQuasar();

  defineEmits([
    ...useDialogPluginComponent.emits
  ]);
  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();


  const props = defineProps<{
    collectionId?:number
  }>();

  const {
    user,
    collections,
    trainingWords,
  } = storeToRefs(UIStore());

  const UI = inject<IUIActions>('UI');
  const router = useRouter();

  const isLoading = ref<boolean>(true);

  const trainingList = [
    {
      title: t('Training.WordToTranslate'),
      name: "wordToTranslate"
    },
    {
      title: t('Training.TranslateToWord'),
      name: "translateToWord"
    },
    {
      title: t('Training.MatchTheWords'),
      name: "matchTheWords"
    },
    {
      title: t('Training.MakeFromLetters'),
      name: "makeFromLetters"
    },
    {
      title: t('Training.WriteWord'),
      name: "writeWord"
    },
  ];

  const collectionIds = ref<number[]>([]);

  const currentCollections = ref<TCollection[]|undefined>();

  const currentCollectionsIds = computed(():number[] => {
    return currentCollections.value?.map((currCol) => {
      return currCol.id!
    }) || [];
  });


  const fillCurrentCollections = () => {
    currentCollections.value = getCurrentCollections();
  }
  const getCurrentCollections = () => {
    let arCurrentCollections = collections.value;
    if(collectionIds.value.length > 0){
      arCurrentCollections = collections.value.filter((col) => {
        return collectionIds.value.indexOf(col.id || 0) >= 0;
      });
    }

    if(arCurrentCollections && arCurrentCollections[0] && arCurrentCollections[0]['id']){
      return arCurrentCollections
    }
    return undefined;
  }

  onMounted(() => {
    if(props.collectionId){
      collectionIds.value = [props.collectionId];
    }

    fillCurrentCollections();
    getTrainingWords();
  });

  const doTraining = (trainingName: string) => {
    router.push({
      name: "training",
      query: {
        collectionIds: currentCollectionsIds.value,
        name: trainingName
      }
    });
  }

  const chooseCollectionsDialog = () => {
    $q.dialog({
      component: ChooseCollectionsDialog,
      componentProps: {
        selectedCollections: currentCollectionsIds.value,
        onCollectionsToggle: onCollectionToggle,
        isLoading: isLoading.value
      }
    })
  }

  const onCollectionToggle = (id:number, value: boolean) => {
    if(!value){
      currentCollections.value = currentCollections.value?.filter((currCol) => {
        return currCol.id != id;
      });
      if(!currentCollections.value || currentCollections.value?.length < 1){
        fillCurrentCollections();
      }
    }
    if(value){
      addCollectionToCurrentCollections(id);
    }
  }

  const addCollectionToCurrentCollections = (id: number) => {
    const arFindCollection = collections.value.filter((currCol) => {
      return currCol.id == id;
    })
    if(arFindCollection && arFindCollection[0] && arFindCollection[0]['id']){
      if(currentCollections.value){
        currentCollections.value.push(arFindCollection[0]);
      }
      else{
        currentCollections.value = [arFindCollection[0]];
      }
    }
  }

  watch(currentCollectionsIds, () => {
    getTrainingWords();
  });

  watch(isLoading, (neoVal) => {
    if(neoVal){
      $q.loading.show({
        delay: 200
      });
    }
    else{
      $q.loading.hide();
    }
  })

  const getTrainingWords = () => {
    isLoading.value = true;
    UI?.updateTrainingWords(currentCollectionsIds.value).then(() => {
      isLoading.value = false;
    }).catch((e) => {
      isLoading.value = false;
    });
  }

</script>

<style scoped lang="scss">
  .dialog-container{
    padding: 20px;

    &__title{
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 1.3rem;
    }

    .training{
      text-align: center;
    }
    .choose-training{
      display: flex;
      flex-direction: column;
      gap:20px;
      justify-content: center;
      align-items: center;
    }
    .collections-subtitle{
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1px 10px;
      cursor: pointer;

      .item{
        font-style: italic;
      }
    }

  }
</style>