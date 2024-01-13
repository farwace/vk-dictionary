<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>

          <div class="dialog-container__title">
            {{ t!('Collection.EditWordTitle') }}
          </div>
          <div class="dialog-container__form">
            <q-form
                class="q-gutter-md"
                @submit="submitForm"
            >
              <q-input
                  autofocus
                  filled
                  dense
                  v-model="neoWord"
                  :label="t('Collection.Word')+'*'"
                  lazy-rules
                  :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
              />
              <q-input
                  v-if="user.displayTranscription"
                  filled
                  dense
                  v-model="neoTranscription"
                  :label="t('Collection.Transcription')"
                  lazy-rules
                  :rules="[val => val.length < 255 || t('Collection.LongWord')]"
              />
              <q-input
                  filled
                  dense
                  v-model="neoForeignWord"
                  :label="t('Collection.Translation')+'*'"
                  lazy-rules
                  :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
              />


              <div class="error q-my-sm" v-if="errorText" v-html="errorText"></div>

              <q-card-actions align="right">
                <q-btn :disabled="neoWord.trim().length < 1 || neoForeignWord.trim().length < 1 || neoWord.length > 254 || neoForeignWord.length > 254 || neoTranscription.length > 254"  type="submit" color="primary" :label="t('AddCollection.Save')" @click="onOKClick" />
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
  import {inject, onMounted, ref, watch} from "vue";
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

  const props = defineProps<{ word: TWord }>();


  const errorText = ref<string>();

  const onOKClick = () => {

  }

  const neoWord = ref<string>('');
  const neoTranscription = ref<string>('');
  const neoForeignWord = ref<string>('');

  const submitForm = () => {
    if(neoWord.value == props.word.word && neoForeignWord.value == props.word.foreignWord && neoTranscription.value == props.word.transcription){
      onDialogOK();
      return;
    }

    if(neoWord.value.length < 1 || neoForeignWord.value.length < 1){
      errorText.value = t('AddCollection.EmptyNameError');
      return;
    }
    errorText.value = '';
    UI?.setLoading(true);
    UI?.updateWord({
      word: neoWord.value,
      foreignWord: neoForeignWord.value,
      transcription: neoTranscription.value,
      collectionId: props.word.collectionId,
      id: props.word.id,
    }).then(() => {
      UI?.setLoading(false);
      $q.notify({
        type: 'positive',
        message: t('Messages.WordHasBeenUpdated'),
        position: "bottom"
      });
      onDialogOK();
    }).catch((e) => {
      UI?.setLoading(false);
    })
  }

  onMounted(() => {
    neoWord.value = props.word.word;
    neoTranscription.value = props.word.transcription || '';
    neoForeignWord.value = props.word.foreignWord;
  })

  watch(neoWord, (neoVal) => {
    if(neoVal.length > 0){
      errorText.value = '';
    }
  });
  watch(neoForeignWord, (neoVal) => {
    if(neoVal.length > 0){
      errorText.value = '';
    }
  });


</script>

<style lang="scss" scoped>
  .dialog-container{
    padding: 20px;

    &__title{
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 1.3rem;
    }


  }
</style>