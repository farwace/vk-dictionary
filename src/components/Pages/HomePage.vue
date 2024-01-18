<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%;">
    <div class="page-container home-page">
      <NoHaveCollections @add-collection="addCollectionLink" v-if="collections.length < 1" />
      <CollectionsList v-else/>

      <SystemCollectionsSlider v-if="systemCollections && systemCollections.length > 0"/>

      <div class="add-collections-btn text-center">
        <div>
          <q-btn v-if="collections.length > 0" outline rounded color="primary" @click.prevent="trainingsDialog" class="q-mb-md" :class="{'bg-dark': $q.dark.isActive, 'bg-white': !$q.dark.isActive}">
            <q-icon name="mdi-play-circle-outline" class="q-mr-sm"></q-icon> {{t!('Training.doTraining')}}
          </q-btn>
        </div>
        <div>
          <q-btn outline rounded color="primary" @click.prevent="addCollectionLink" :class="{'bg-dark': $q.dark.isActive, 'bg-white': !$q.dark.isActive}">
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
  import SystemCollectionsSlider from "@/components/Pages/HomePage/SystemCollectionsSlider.vue";
  import ChooseTrainingDialog from "@/components/common/ChooseTrainingDialog.vue";
  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();

  const {
    collections,
    systemCollections,
    user,
    availableLanguages,
    contentHeight
  } = storeToRefs(UIStore());

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
    left: 0;
    width: 100%;
  }
</style>