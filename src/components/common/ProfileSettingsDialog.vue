<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="profile-settings" :class="{loading: isLoading}">
        <div class="profile-settings__title">
          {{ t!('ProfileSettingsDialog.Title') }}
        </div>
        <div class="profile-settings__body">
          <div class="user-info">
            <div class="user-name">
              {{ user.first_name }}
            </div>
            <div class="user-language" @click="callChangeLang" v-if="userLang.nameCode">
              <img :src="require(`@/assets/languages/${userLang.nameCode}.webp`)">
            </div>
          </div>

          <div class="user-settings">
            <q-toggle
                v-model="transcription"
                :label="t!('ProfileSettingsDialog.UseTranscription')"
                :disable="isLoading"
            />
          </div>

          <div class="write-to-developer">
            <a class="link" target="_blank" href="https://vk.com/write-79625925">
              {{ t!('ProfileSettingsDialog.WriteDeveloper') }}
            </a>
          </div>

        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import {useDialogPluginComponent} from "quasar";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {computed, inject, ref, watch} from "vue";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {TGetLang} from "@/classes/Pinia/UIStore/TLang";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";

  defineEmits([
    ...useDialogPluginComponent.emits,
  ]);

  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK } = useDialogPluginComponent();

  const {
    user,
    availableLanguages,
    isLoading
  } = storeToRefs(UIStore());

  const UI = inject<IUIActions>('UI');

  const transcription = ref<boolean>(user.value.displayTranscription || false);

  const props = defineProps<{
    showSelectLanguageDialog: (data: TGetLang) => void
  }>();

  const callChangeLang = () => {

    if(props.showSelectLanguageDialog){
      props.showSelectLanguageDialog(availableLanguages.value);
    }
  }

  const userLang = computed(() => {
    const userLang = availableLanguages.value.filter((lang) => {
      return lang.id === user.value.userLangId
    })
    return userLang[0] || {}
  });

  watch(transcription, (neoVal) => {
    UI?.setTranscription(neoVal).then();
  })

</script>

<style lang="scss" scoped>
.profile-settings{
  &.loading{
    pointer-events: none;
  }
  padding: 20px;

  &__title{
    margin-bottom: 20px;
    font-weight: 500;
    font-size: 1.3rem;
  }

  &__body{
    font-size: 1.2rem;

    .user-info{
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      margin-bottom: 20px;
      .user-name{
        margin-right: 5px;
      }
      .user-language{
        cursor: pointer;
        display: flex;
        padding: 10px;
        img{
          width: 30px;
        }
      }
    }

    .user-settings{
      font-size: .9rem;
    }

    .write-to-developer{
      font-size: .875rem;
      margin-top: 40px;
    }
  }

}
</style>