<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>

          <div class="dialog-container__title">
            {{ collection.name }}
          </div>

          <div class="dialog-container__subtitle">
            <q-btn outline @click="doSave">
              <q-icon name="mdi-plus" class="q-mr-sm"/>
              {{t!('Collection.AddToMyCollections')}}
            </q-btn>
          </div>

          <q-table
              class="words-table"
              flat bordered
              :rows="rows"
              :columns="columns"
              :pagination="{
                rowsPerPage: 25
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
  import {computed, inject} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {TWord, TWords} from "@/classes/Pinia/UIStore/TWord";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";
  import {useRouter} from "vue-router";

  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

  const $q = useQuasar();
  const router = useRouter();

  const UI = inject<IUIActions>('UI');
  const {
    user,
  } = storeToRefs(UIStore());
  defineEmits([
    ...useDialogPluginComponent.emits
  ]);

  const props = defineProps<{ words: TWords, collection: TCollection }>();

  const onOKClick = () => {
    //todo: validate form
    //onDialogOK({selectedLang: selectedLang.value, selectedLearnLang: selectedLearnLang.value})

  }

  const columns = computed(():QTableProps['columns'] => {
    const nameCol = {
      name: 'word',
      required: true,
      label: t('Collection.Word'),
      align: 'left' as 'left',
      field: (row:TWord) => {return row.word},
      sortable: true
    };
    const transcriptionCol = {
      name: 'transcription',
      label: t('Collection.Transcription'),
      align: 'center' as "center",
      field: (row:TWord) => {return row.transcription},
    };
    const translateCol = {
      name: 'translate',
      label: t('Collection.Translation'),
      align: 'right' as "right",
      field: (row:TWord) => {return row.foreignWord},
      sortable: true
    };

    const cols:QTableProps['columns'] = [nameCol];
    if(user.value.displayTranscription){
      cols.push(transcriptionCol);
    }
    cols.push(translateCol);

    return cols;
  });

  const rows = computed(() => {
    if(props.words && Array.isArray(props.words)){
      return props.words;
    }
    return [];
  });


  const doSave = () => {
    if(props.collection.id){
      $q.loading.show({
        delay: 800
      });

      UI?.cloneCollection(props.collection.id).then((neoCollection) => {
        $q.loading.hide();
        if(neoCollection.id){
          router.push({
            name: 'collection',
            params: {
              id: neoCollection.id
            }
          });
        }
      }).catch((e) => {
        $q.loading.hide();
      })

    }
    else{
      onDialogCancel();
    }
  }


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

  }
</style>