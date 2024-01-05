<template>
  <q-page class="flex">
    <div class="all">
      <div class="wrapper">
        <div class="header">
          <page-header @open-user-settings="openUserSettings"></page-header>
        </div>

          <div class="content" ref="content">
            <router-view v-slot="{Component}">
              <transition
                  appear
                  enter-active-class="animated fadeInLeft"
                  leave-active-class="animated fadeOutLeft"
              >
                <component :is="Component"></component>
              </transition>
            </router-view>

          </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
  import {inject, onMounted, ref, watch} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {useQuasar} from "quasar";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import SelectLanguageDialog from "@/components/common/SelectLanguageDialog.vue";
  import {TGetLang} from "@/classes/Pinia/UIStore/TLang";
  import PageHeader from "@/components/PageHeader.vue";
  import ProfileSettingsDialog from "@/components/common/ProfileSettingsDialog.vue";
  import {useRouter} from "vue-router";

  const UI = inject<IUIActions>('UI');
  const API = UI!.getApi()!;

  const $q = useQuasar();
  const {t} = useI18n() as {t:TranslateFunction};

  const { user, availableLanguages, appliedCollection } = storeToRefs(UIStore())

  const content = ref<HTMLDivElement>();

  const resizeTimeout = ref<number>();

  const router = useRouter();

  onMounted(() => {

    writeContentHeight();
    window.addEventListener("resize", () => {
      if(resizeTimeout.value){
        clearTimeout(resizeTimeout.value);
      }
      resizeTimeout.value = setTimeout(() => {
        writeContentHeight();
      }, 200)
    });
    tryOpenAppliedCollection(appliedCollection.value)

    // API.getLanguages().then((res) => {
    //   console.log('>>> LANGUAGES', res);
    // });
    //

  });


  watch(appliedCollection, (neoVal) => {
    if(neoVal > 0){
      tryOpenAppliedCollection(neoVal);
    }
  })

  const tryOpenAppliedCollection = (collectionId: number) => {
    if(collectionId < 1){
      return;
    }
    router.push({
      name: 'collection',
      params: {
        id: collectionId
      }
    })
  }

  const writeContentHeight = () => {
    const rect = content.value?.getBoundingClientRect();
    if(rect){
      UI?.setContentHeight('max-height: ' + rect.height + 'px; max-width: '+rect.width+'px;');
    }
  }

  watch(availableLanguages, (neoVal) => {
    onAppIsReady(neoVal);
  })

  const onAppIsReady = (data: TGetLang) => {
    if(user.value.isNew && Array.isArray(data) && data.length > 0){
      toggleSelectLanguageDialog(data);
    }
    else{
      loadCollections();
    }
  }

  const toggleSelectLanguageDialog = (data: TGetLang) => {
    $q.dialog({
      component: SelectLanguageDialog,
      componentProps: {
        availableLanguages: data,
        currentLanguageId: user.value.userLangId || undefined,
        currentLearnLanguageId: user.value.userLearnLangId || undefined,
      }
    }).onOk((res) => {
      if(res.selectedLang && res.selectedLearnLang){
        UI?.setLanguage(res.selectedLang, res.selectedLearnLang).then(() => {
          loadCollections();
        });
      }
    });
  }

  const loadCollections = () => {
    //UI.loadCollections(); //todo: loadCollections:
  }

  const openUserSettings = () => {
    $q.dialog({
      component: ProfileSettingsDialog,
      componentProps: {
        showSelectLanguageDialog: toggleSelectLanguageDialog
      }
    })
  }

</script>

<style lang="scss" scoped>
  .all{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-content: space-between;
    min-height: 100%;
    height: auto!important;
    width: 100%;
    min-width: 320px;
    position: relative;
    max-width: 911px;
    margin-left: auto;
    margin-right: auto;
    .header{
      position: fixed;
      top: 0;
      width: 100%;
      max-width: 911px;
      //height: 65px;
      padding: env(safe-area-inset-top, 0) 20px 10px;
      flex-shrink: 0;
      z-index: 20;
    }
    .wrapper{
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      padding-top: 65px;
      margin-top: env(safe-area-inset-top, 0);
      .content{
        flex-grow: 1;
        display: flex;
        flex-direction: column;

      }
    }
    .footer{
      position: relative;
      padding: 20px;
    }
  }
</style>