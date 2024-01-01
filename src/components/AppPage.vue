<template>
  <q-page class="flex">
    <div class="all">
      <div class="wrapper">
        <div class="header">
          <page-header @open-user-settings="openUserSettings"></page-header>
        </div>
        <div class="content">
          <MainPage></MainPage>
        </div>
      </div>
      <div class="footer">
        <page-footer></page-footer>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
  import MainPage from "@/components/MainPage.vue";
  import {inject, onMounted, ref, watch} from "vue";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {useQuasar} from "quasar";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import SelectLanguageDialog from "@/components/common/SelectLanguageDialog.vue";
  import {TGetLang} from "@/classes/Pinia/UIStore/TLang";
  import PageFooter from "@/components/PageFooter.vue";
  import PageHeader from "@/components/PageHeader.vue";
  import ProfileSettingsDialog from "@/components/common/ProfileSettingsDialog.vue";

  const UI = inject<IUIActions>('UI');
  const API = UI!.getApi()!;

  const $q = useQuasar();
  const {t} = useI18n() as {t:TranslateFunction};

  const { user, availableLanguages } = storeToRefs(UIStore())

  onMounted(() => {
    // API.getLanguages().then((res) => {
    //   console.log('>>> LANGUAGES', res);
    // });
    //

  });

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
      position: sticky;
      top: 0;
      height: 60px;
      padding: 10px 20px;
    }
    .wrapper{
      flex-grow: 1;

      .content{
        padding-top: 20px;
      }
    }
    .footer{
      position: relative;
      padding: 20px;
    }
  }
</style>