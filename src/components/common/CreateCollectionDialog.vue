<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>

          <div class="dialog-container__title">
            {{ t!('AddCollection.Title') }}
          </div>
          <div class="dialog-container__form">
            <q-form
                class="q-gutter-md"
                @submit="submitForm"
            >
              <q-input
                  dense
                  autofocus
                  filled
                  v-model="neoName"
                  :label="t('AddCollection.LabelName')+'*'"

                  lazy-rules
                  :rules="[val => val && val.length > 0 || t('AddCollection.EmptyName'), val => val.length < 255 || t('AddCollection.LongName')]"
              />

              <div class="error q-my-sm" v-if="errorText" v-html="errorText"></div>

              <q-card-actions align="right">
                <q-btn :disabled="neoName.trim().length < 1"  type="submit" color="primary" :label="t('AddCollection.Save')" @click="onOKClick" />
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
  import {inject, ref, watch} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {useRouter} from "vue-router";
  import {IEventActions} from "@/classes/UI/Interfaces/IEventActions";

  const $q = useQuasar();

  defineEmits([
    ...useDialogPluginComponent.emits
  ]);
  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

  const UI = inject<IUIActions>('UI');
  const TARGET_EVENTS = inject<IEventActions>('TARGET_EVENTS');
  const router = useRouter();

  const errorText = ref<string>();

  const onOKClick = () => {
    //onDialogOK({selectedLang: selectedLang.value, selectedLearnLang: selectedLearnLang.value})

  }

  const neoName = ref<string>('');
  const neoDesc = ref<string>('');

  const submitForm = () => {
    if(neoName.value.length < 1){
      errorText.value = t('AddCollection.EmptyNameError');
      return;
    }
    errorText.value = '';
    UI?.setLoading(true);
    UI?.createCollection(neoName.value, neoDesc.value).then((res) => {
      UI?.setLoading(false);
      if(res.id){
        router.push({
          name: 'collection',
          params: {
            id: res.id
          }
        })
      }
      TARGET_EVENTS?.sendEvent('CreateCollection');
      UI?.vibro();
    }).catch((e) => {
      errorText.value = t('Common.Errors.UnknownError');
      UI?.setLoading(false);
    })
  }

  watch(neoName, (neoVal) => {
    if(neoVal.length > 0){
      errorText.value = '';
    }
  });

</script>

<style lang="scss" scoped>
  .dialog-container{

    &__title{
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 1.3rem;
    }


  }
</style>