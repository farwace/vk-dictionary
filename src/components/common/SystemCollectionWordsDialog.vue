<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>

          <div class="dialog-container__title" :class="{'q-pa-md':!collection}">
            <div v-if="collection">
              {{ collection.name }}
            </div>
          </div>

          <div v-if="collection" class="dialog-container__subtitle">
            <q-btn :disable="isLoading" outline @click="doSave">
              <q-icon name="mdi-plus" class="q-mr-sm"/>
              {{t!('Collection.AddToMyCollections')}}
            </q-btn>
          </div>

          <q-table
              class="words-table"
              :class="{'without-pager':props.hidePagination}"
              flat bordered
              :rows="rows"
              :columns="columns"
              :pagination="{
                rowsPerPage: rowsPerPage
              }"
              :rows-per-page-options="[25, 50,75,100,150, 0]"
              :wrap-cells="true"
          >

          </q-table>
        </div>
      </div>
    </q-card>
  </q-dialog>

</template>
<script lang="ts" setup>
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {useDialogPluginComponent, useQuasar} from "quasar";
  import type {QTableProps} from "quasar";
  import {computed, inject, onMounted, ref} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {TWord, TWords} from "@/classes/Pinia/UIStore/TWord";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";
  import {useRouter} from "vue-router";
  import {IEventActions} from "@/classes/UI/Interfaces/IEventActions";

  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

  const $q = useQuasar();
  const router = useRouter();

  const UI = inject<IUIActions>('UI');
  const TARGET_EVENTS = inject<IEventActions>('TARGET_EVENTS');
  const {
    user,
    isLoading
  } = storeToRefs(UIStore());
  defineEmits([
    ...useDialogPluginComponent.emits
  ]);

  const props = defineProps<{
    words: TWords,
    collection?: TCollection,
    hidePagination?:boolean
  }>();

  const rowsPerPage = ref<number>(25);

  const onOKClick = () => {

  }

  const columns = computed(():QTableProps['columns'] => {
    const translateCol = {
      name: 'translate',
      label: t('Collection.Word'),
      align: 'left' as "left",
      field: (row:TWord) => {return row.foreignWord},
      sortable: true
    };
    const transcriptionCol = {
      name: 'transcription',
      label: t('Collection.Transcription'),
      align: 'center' as "center",
      field: (row:TWord) => {return row.transcription},
    };
    const nameCol = {
      name: 'word',
      required: true,
      label: t('Collection.Translation'),
      align: 'right' as 'right',
      field: (row:TWord) => {return row.word},
      sortable: true
    };

    const cols:QTableProps['columns'] = [];
    cols.push(translateCol);
    if(user.value.displayTranscription){
      cols.push(transcriptionCol);
    }
    cols.push(nameCol);

    return cols;
  });

  const rows = computed(() => {
    if(props.words && Array.isArray(props.words)){
      return props.words;
    }
    return [];
  });


  const doSave = () => {
    if(!props.collection){
      return;
    }
    if(props.collection.id){
      UI?.setLoading(true);

      let collectionOrShareId: number | string = props.collection.id;
      if(props.collection.shareId){
        collectionOrShareId = props.collection.shareId;
      }

      UI?.cloneCollection(collectionOrShareId).then((neoCollection) => {
        UI?.setLoading(false);
        if(neoCollection.id){
          router.push({
            name: 'collection',
            params: {
              id: neoCollection.id
            }
          });
          TARGET_EVENTS?.sendEvent('AddedCollectionFromPreview')
        }
        else{
          $q.notify({
            type: 'negative',
            message: t('Errors.CloneCollectionError'),
            position: "bottom"
          });
          onDialogCancel();
        }
      }).catch((e) => {
        UI?.setLoading(false);
      })

    }
    else{
      onDialogCancel();
    }
  }

  onMounted(() => {
    if(props.hidePagination){
      rowsPerPage.value = 0;
    }
  })


</script>
<style lang="scss" scoped>
  .dialog-container{
    padding: 20px;

    &__title{
      margin-bottom: 5px;
      font-weight: 500;
      font-size: 1.3rem;
    }

    &__subtitle{
      margin-bottom: 20px;
    }
    :deep(.q-table){
      th{
        white-space: nowrap;
      }
    }
    :deep(.without-pager){
      .q-table__bottom{
        display: none;
      }
    }
  }
</style>