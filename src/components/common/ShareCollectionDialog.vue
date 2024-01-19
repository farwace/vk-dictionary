<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="dialog-container">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>

          <div class="dialog-container__title" v-html="t('share.title')"></div>
          <div class="dialog-container__body">
            <div v-if="!collection.shareId" class="text-center">
              <q-btn @click.prevent="regenerateLink">
                <span v-html="t('share.openPermission')"></span>
              </q-btn>
              <div class="q-mt-lg" v-html="t('share.youCanShare')"></div>
            </div>
            <div v-else class="text-center">
              <div class="copy-link">
                <q-icon :class="{disabled: isLoading}" class="interface-btn" name="mdi-reload" @click="regenerateLink"></q-icon>
                <q-input outlined dense rounded v-model="shareUrl" readonly type="text"></q-input>
                <q-icon :class="{disabled: isLoading}" class="interface-btn" name="mdi-content-copy" @click="copyLink"></q-icon>
                <q-icon :class="{disabled: isLoading}" class="interface-btn" name="mdi-share-variant-outline" @click="shareLink"></q-icon>
              </div>
              <div class="q-mt-lg">
                <q-btn :disabled="isLoading" @click="removeLink">
                  <span v-html="t('share.closePermissions')"></span>
                  <q-icon class="interface-btn" color="negative" name="mdi-delete-forever-outline" ></q-icon>
                </q-btn>
              </div>
            </div>
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
  import {useRouter} from "vue-router";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";

  const props = defineProps<{
    collection: TCollection
  }>();

  const $q = useQuasar();

  defineEmits([
    ...useDialogPluginComponent.emits
  ]);
  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

  const {
    isLoading,
    launchParams
  } = storeToRefs(UIStore());

  const UI = inject<IUIActions>('UI');
  const router = useRouter();

  const updateShareLink = (doClear:boolean = false):Promise<boolean> => {
    return new Promise((resolve) => {
      if(props.collection.id){
        UI?.setLoading(true);
        UI?.updateShareLink(props.collection.id, doClear).then(() => {
          UI?.setLoading(false);
          resolve(true);
        }).catch((e) => {
          UI?.setLoading(false);
          resolve(false);
        });
      }
      else{
        resolve(false);
      }
    })

  }

  const shareUrl = ref<string>('');

  const compShareUrl = computed(() => {
    if(!props.collection.shareId){
      return '';
    }
    /* @ts-ignore */
    if(launchParams?.value?.vk_client == 'ok'){
      return 'https://ok.ru/app/vk_app51805937#collection-' + props.collection.shareId;
    }
    return 'https://vk.com/app51805937#collection-' + props.collection.shareId;
  });

  watch(compShareUrl, (neoVal) => {
    shareUrl.value = neoVal;
  });

  onMounted(() => {
    shareUrl.value = compShareUrl.value;
  });

  const regenerateLink = () => {
    if(isLoading.value){
      return;
    }
    updateShareLink(false).then((res) => {
      if(res){
        $q.notify({
          type: 'positive',
          message: t('share.linkGeneratedSuccess'),
          position: "bottom"
        });
        copyLink();
      }
      else{
        $q.notify({
          type: 'negative',
          message: t('share.linkGeneratedError'),
          position: "bottom"
        });
      }
    }).catch(() => {
      $q.notify({
        type: 'negative',
        message: t('share.linkGeneratedError'),
        position: "bottom"
      });
    })
  }

  const copyLink = () => {
    UI?.copyToClipboard(compShareUrl.value).then((res) => {
      if(res){
        $q.notify({
          type: 'positive',
          message: t('share.linkCopiedSuccess'),
          position: "bottom"
        });
      }
      else{
        $q.notify({
          type: 'negative',
          message: t('share.linkCopiedError'),
          position: "bottom"
        });
      }
    })
  }

  const shareLink = () => {
    UI?.share('collection-' + props.collection.shareId, props.collection.name);
  }

  const removeLink = () => {

    updateShareLink(true).then((res) => {
      if(res){
        $q.notify({
          type: 'positive',
          message: t('share.linkDeletedSuccess'),
          position: "bottom"
        });
      }
      else{
        $q.notify({
          type: 'negative',
          message: t('share.linkDeletedError'),
          position: "bottom"
        });
      }
    }).catch(() => {
      $q.notify({
        type: 'negative',
        message: 'Не удалось удалить ссылку',
        position: "bottom"
      });
    })
  }

</script>

<style scoped lang="scss">
  .dialog-container{

    &__title{
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 1.3rem;
    }

    .copy-link{
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
      gap: 1px;
      .q-field{
        flex-grow: 1;
      }
      .q-icon{
        flex-shrink: 0;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 10px;
      }
    }
  }
</style>