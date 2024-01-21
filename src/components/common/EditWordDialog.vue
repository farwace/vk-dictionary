<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>

          <div class="dialog-container__title">
            <div v-if="origWords.length > 1">
              {{ t!('Collection.EditWordTitleMany') }}
            </div>
            <div v-else>
              {{ t!('Collection.EditWordTitle') }}
            </div>

          </div>
          <div class="dialog-container__form">
            <q-form
                class="q-gutter-md"
                @submit="submitForm"
            >
              <div v-for="(word, index) in origWords" class="q-mb-sm edit-item">
                <q-input
                    autofocus
                    filled
                    dense
                    v-model="origWords[index]['foreignWord']"
                    :label="t('Collection.Word')+'*'"
                    lazy-rules
                    :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
                <q-input
                    v-if="user.displayTranscription"
                    filled
                    dense
                    v-model="origWords[index]['transcription']"
                    :label="t('Collection.Transcription')"
                    lazy-rules
                    :rules="[val => val.length < 255 || t('Collection.LongWord')]"
                />
                <q-input
                    filled
                    dense
                    v-model="origWords[index]['word']"
                    :label="t('Collection.Translation')+'*'"
                    lazy-rules
                    :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </div>



              <q-card-actions align="right">
                <q-btn @click="onDialogCancel()" :label="t('Collection.Cancel')" class="q-mr-sm"/>
                <q-btn :disabled="!isAllRight" type="submit" color="primary" :label="t('AddCollection.Save')" @click="onOKClick" />
              </q-card-actions>
            </q-form>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>

  import {useDialogPluginComponent, useQuasar} from "quasar";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {computed, inject, onMounted, ref, watch} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {useRouter} from "vue-router";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {TWord} from "@/classes/Pinia/UIStore/TWord";

  const $q = useQuasar();

  defineEmits([
    ...useDialogPluginComponent.emits
  ]);
  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

  const {
    user
  } = storeToRefs(UIStore());

  const UI = inject<IUIActions>('UI');
  const router = useRouter();

  const props = defineProps<{ words: TWord[] }>();


  const onOKClick = () => {

  }

  const origWords = ref<TWord[]>([]);

  const isAllRight = computed(() => {
    if(!origWords.value){
      return false;
    }

    let isOk = true;
    origWords.value.forEach((w) => {
      if(
          w.word.trim().length < 1 ||
          w.foreignWord.trim().length < 1 ||
          w.word.length > 254 ||
          (w?.transcription?.length || 0) > 254 ||
          w.foreignWord.length > 254
      ){
        isOk = false;
      }
    })
    return isOk;

  })

  const submitForm = () => {
    const wordsChanged = origWords.value.filter((ow) => {
      const arPWord = props.words.filter((pw) => {
        return pw.id && pw.id == ow.id;
      });
      if(arPWord[0]){
        const pWord = arPWord[0];

        if(pWord.word == ow.word && pWord.foreignWord == ow.foreignWord && pWord.transcription == (ow.transcription || '')){
          return false;
        }
        return true;
      }
      return false;
    });
    UI?.vibro();
    if(wordsChanged.length < 1){
      onDialogOK();
      return;
    }

    let isOk = true;
    wordsChanged.forEach((w) => {
      if(
          w.word.trim().length < 1 ||
          w.foreignWord.trim().length < 1 ||
          w.word.length > 254 ||
          (w?.transcription?.length || 0) > 254 ||
          w.foreignWord.length > 254
      ){
        isOk = false;
      }
    });
    if(!isOk){
      return;
    }
    UI?.setLoading(true);
    UI?.updateWords(wordsChanged).then(() => {
      UI?.setLoading(false);
      let successMessage = t('Messages.WordHasBeenUpdated');
      if(origWords.value.length > 1){
        successMessage = t('Messages.WordSHasBeenUpdated');
      }
      $q.notify({
        type: 'positive',
        message: successMessage,
        position: "bottom"
      });
      onDialogOK();
    }).catch(() => {
      UI?.setLoading(false);
    })
  }

  onMounted(() => {
    if(props.words){
      props.words.forEach((pw) => {
        origWords.value.push({
          collectionId: pw.collectionId,
          word: pw.word,
          foreignWord: pw.foreignWord,
          id: pw.id,
          transcription: pw.transcription,
          fileId: pw.fileId
        })
      })
    }
  })
</script>

<style lang="scss" scoped>
  .dialog-container{

    &__title{
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 1.3rem;
    }

    .edit-item{
      box-shadow: 0 0 10px rgba(0,0,0,.1);
      padding: 6px;
      border-radius: 12px;
    }

  }
</style>