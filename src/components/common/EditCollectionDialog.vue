<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>

          <div class="dialog-container__title">
            {{ t!('Collection.EditCollectionTitle') }}
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
                  v-model="neoName"
                  :label="t('AddCollection.LabelName')+'*'"
                  lazy-rules
                  :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
              />
              <q-input
                  type="textarea"
                  filled
                  dense
                  rows="2"
                  v-model="neoDescription"
                  :label="t('AddCollection.LabelDesc')"
                  lazy-rules
                  :rules="[val => val.length < 255 || t('Collection.LongWord')]"
              >
              </q-input>

              <div class="error q-my-sm" v-if="errorText" v-html="errorText"></div>

              <q-card-actions align="right">
                <q-btn @click.prevent="tryRemoveCollection" class="remove-btn">
                  {{ t!('Collection.Remove') }} <q-icon name="mdi-delete-forever-outline"/>
                </q-btn>

                <q-btn :disabled="neoName.trim().length < 1 || isLoading"  type="submit" color="primary" :label="t('AddCollection.Save')" @click="onOKClick" />
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
  import type {TCollection} from "@/classes/Pinia/UIStore/TCollection";

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

  const props = defineProps<{ collection: TCollection }>();


  const errorText = ref<string>();

  const onOKClick = () => {

  }

  const neoName = ref<string>('');
  const neoDescription = ref<string>('');
  const isLoading = ref<boolean>(false);
  const submitForm = () => {
    if(neoName.value.length < 1){
      errorText.value = t('AddCollection.EmptyNameError');
      return;
    }
    errorText.value = '';
    UI?.setLoading(true);
    isLoading.value = true;
    UI?.updateCollection({
      name: neoName.value.trim(),
      description: neoDescription.value.trim(),
      id: props.collection.id
    }).then(() => {
      UI?.setLoading(false);
      $q.notify({
        type: 'positive',
        message: t('Messages.CollectionHasBeenUpdated'),
        position: "bottom"
      });
      isLoading.value = false;
      onDialogOK();
    }).catch((e) => {
      UI?.setLoading(false);
      isLoading.value = false;
    })
  }

  const tryRemoveCollection = () => {
    $q.dialog({
      title: t('Collection.ConfirmRemove'),
      message: t('Collection.ConfirmRemoveText'),
      cancel: true,
      persistent: true
    }).onOk(() => {
      if(props.collection.id){
        isLoading.value = true;
        UI?.setLoading(true);
        UI?.removeCollection(props.collection.id).then((res) => {
          isLoading.value = false;
          UI?.setLoading(false);
          if(res){
            $q.notify({
              type: 'positive',
              message: t('Messages.CollectionHasBennRemoved'),
              position: "bottom"
            });
            router.push({name: 'home'});
          }
          else{
            onDialogCancel();
          }
        }).catch((e) => {
          UI?.setLoading(false);
          isLoading.value = false;
        });
      }
      else{
        onDialogCancel();
      }

    })
  }

  onMounted(() => {
    neoName.value = props.collection.name || '';
    neoDescription.value = props.collection.description || '';
  });

  watch(neoName, (neoVal) => {
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
  .remove-btn{
    color: var(--q-negative);
  }
</style>