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
                  v-if="!isApple"
                  appear
                  enter-active-class="animated fadeInLeft"
                  leave-active-class="animated fadeOutLeft"
              >
                <component :is="Component"></component>
              </transition>
              <component v-else :is="Component"></component>
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
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";
  import {TWord} from "@/classes/Pinia/UIStore/TWord";
  import SystemCollectionWordsDialog from "@/components/common/SystemCollectionWordsDialog.vue";

  const UI = inject<IUIActions>('UI');
  const API = UI!.getApi()!;

  const $q = useQuasar();
  const {t} = useI18n() as {t:TranslateFunction};

  const { user, availableLanguages, appliedCollection, launchParams } = storeToRefs(UIStore())

  const content = ref<HTMLDivElement>();

  const resizeTimeout = ref<number>();

  const router = useRouter();

  const isApple = ref<boolean>(false);

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
    if(launchParams?.value?.vk_platform == 'mobile_iphone' || launchParams?.value?.vk_platform == 'mobile_ipad' || launchParams?.value?.vk_platform == 'mobile_iphone_messenger'){
      isApple.value = true;
    }
  });


  watch(appliedCollection.value, (neoVal) => {
     tryOpenAppliedCollection(appliedCollection.value);
  })

  const tryOpenAppliedCollection = (neoAppliedCollection: { collection?: TCollection, words?: TWord[] }) => {
    if(!neoAppliedCollection.collection || !neoAppliedCollection.words){
      return;
    }
    $q.dialog({
      component: SystemCollectionWordsDialog,
      componentProps: {
        words: neoAppliedCollection.words,
        collection: neoAppliedCollection.collection
      }
    });
    setTimeout(() => {
      $q.dialog({
        title: t('Collection.SomeOneShareCollection'),
        message: t('Collection.YouCanAddThisCollection'),
      });
    }, 300)

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
        if(user.value.userLangId != res.selectedLang || user.value.userLearnLangId != res.selectedLearnLang){
          router.push({
            name: 'home'
          });
        }
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