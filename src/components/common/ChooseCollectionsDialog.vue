<template>
  <q-dialog ref="dialogRef" no-backdrop-dismiss no-esc-dismiss>
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="closeDialog" name="mdi-window-close"/>

          <div class="dialog-container__title">
            <div v-html="t('Training.Collections')"></div>
          </div>
          <div class="dialog-container__body toggle-collections-list">
            <q-scroll-area style="height: 40vh; min-height: 200px;">
              <q-toggle :disable="isLoading" v-if="allCollections" v-model="allCollections[collection.id!]" :label="collection.name?.slice(0,30)" v-for="collection in collections" />
            </q-scroll-area>
          </div>
          <q-card-actions class="justify-end">
            <q-btn @click="closeDialog">
              <span v-html="t('AddCollection.Save')"></span>
            </q-btn>
          </q-card-actions>
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
  import {useRouter} from "vue-router";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";

  const $q = useQuasar();

  defineEmits([
    ...useDialogPluginComponent.emits
  ]);
  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } = useDialogPluginComponent();

  const {
    collections,
    isLoading,
  } = storeToRefs(UIStore());

  const props = defineProps<{
    selectedCollections: number[],
  }>();

  const allCollections = ref<{[key: number]: boolean}>();

  const UI = inject<IUIActions>('UI');
  const router = useRouter();

  onMounted(() => {
    const allCollectionsOb:{[key: number]:boolean} = {};
    collections.value.forEach((currColl) => {
      allCollectionsOb[currColl.id!] = props.selectedCollections.indexOf(currColl.id!) >= 0;
    });
    allCollections.value = allCollectionsOb;
  });

  const closeDialog = () => {
    onDialogOK({
      selectedCollections: allCollections.value
    });
  }

</script>

<style scoped lang="scss">
  .dialog-container{

    &__title{
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 1.3rem;
    }
  }
</style>