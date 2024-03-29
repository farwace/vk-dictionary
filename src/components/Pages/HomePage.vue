<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%;">
    <div class="page-container home-page">
      <NoHaveCollections @add-collection="addCollectionLink" v-if="collections.length < 1" @easy-start="easyStart"/>
      <CollectionsList v-else/>

      <SystemCollectionsList v-if="systemCollections && systemCollections.length > 0"/>

      <div class="add-collections-btn text-center">
        <div>
          <q-btn v-if="collections.length > 0" outline rounded color="primary" @click.prevent="trainingsDialog" class="q-mb-md" :class="{'bg-dark': $q.dark.isActive, 'bg-white': !$q.dark.isActive}">
            <q-icon name="mdi-play-circle-outline" class="q-mr-sm"></q-icon> {{t!('Training.doTraining')}}
          </q-btn>
        </div>
        <div>
          <q-btn class="add-collection-link" outline rounded color="primary" @click.prevent="addCollectionLink" :class="{'bg-dark': $q.dark.isActive, 'bg-white': !$q.dark.isActive}">
             <q-icon name="mdi-plus" class="q-mr-sm"/> {{t!('HomePage.AddCollection')}}
          </q-btn>
        </div>
      </div>
    </div>
    </q-scroll-area>
  </div>
</template>
<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import NoHaveCollections from "@/components/Pages/HomePage/NoHaveCollections.vue";
  import {useQuasar} from "quasar";
  import CreateCollectionDialog from "@/components/common/CreateCollectionDialog.vue";
  import CollectionsList from "@/components/Pages/HomePage/CollectionsList.vue";
  import ChooseTrainingDialog from "@/components/common/ChooseTrainingDialog.vue";
  import SystemCollectionsList from "@/components/Pages/HomePage/SystemCollectionsList.vue";
  import {inject} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {useRouter} from "vue-router";
  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();

  const {
    collections,
    systemCollections,
    user,
    availableLanguages,
    contentHeight
  } = storeToRefs(UIStore());

  const UI = inject<IUIActions>('UI');
  const router = useRouter();

  const addCollectionLink = () => {
    $q.dialog({
      component: CreateCollectionDialog
    });
  }

  const trainingsDialog = () => {
    $q.dialog({
      component: ChooseTrainingDialog,
    });
  }

  const easyStart = () => {
    UI?.setLoading(true);
    UI?.easyStart().then((res) => {
      UI?.setLoading(false);
      if(res){
        router.push({
          name: "training",
          query: {
            collectionIds: res,
            name: 'wordToTranslate'
          }
        });
      }
    }).catch((e) => {
      UI?.setLoading(false);
    })
  }

</script>
<style lang="scss" scoped>
  .page-container.home-page{
    padding-bottom: 150px;
    position: relative;
  }
  .add-collections-btn{
    position: fixed;
    z-index: 10;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
  }
  :deep(.add-collection-link){
    .q-btn__content{
      flex-wrap:nowrap;
      white-space: nowrap;
    }
  }
</style>