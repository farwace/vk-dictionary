<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin">
      <div class="profile-settings" :class="{loading: isLoading}">
        <div class="position-relative">
          <q-icon class="close-icon" @click.prevent="onDialogCancel" name="mdi-window-close"/>
          <div class="profile-settings__title">
            {{ t!('ProfileSettingsDialog.Title') }}
          </div>
          <div class="profile-settings__body">
            <div class="user-info">
              <div class="user-language" @click="callChangeLang" v-if="userLang.nameCode">
                <img v-if="userLang.nameCode" :src="`/assets/img/languages/${userLang.nameCode}.webp`">
                <q-icon name="mdi-arrow-right-thin"/>
                <img v-if="userLearnLang.nameCode" :src="`/assets/img/languages/${userLearnLang.nameCode}.webp`">
              </div>
              <div class="settings-icons">
                <div class="interface-btn" v-if="launchParams?.vk_platform == 'mobile_android' || launchParams?.vk_platform == 'mobile_android_messenger' || launchParams?.vk_platform == 'mobile_iphone' || launchParams?.vk_platform == 'mobile_iphone_messenger'">
                  <q-icon :name="vibrateIcon" @click="toggleVibrateEnabled" />
                </div>
                <div class="interface-btn">
                  <q-icon :name="soundIcon" @click="toggleSoundEnabled" />
                </div>
              </div>
            </div>

            <div class="user-settings">
              <q-toggle
                  v-model="transcription"
                  @update:model-value="updateTranscription"
                  :label="t('ProfileSettingsDialog.UseTranscription')"
                  :disable="isLoading"
              />
              <div class="q-mt-md">
                <a href="#" class="link" @click.prevent="router.push({name: 'faq'})" >
                  {{ t!('ProfileSettingsDialog.ShowTutorial') }}
                </a>
              </div>
              <div class="q-mt-sm" v-if="!cantSubscribeDevice">
                <a href="#" class="link" @click.prevent="router.push({name: 'subscribe'})" >
                  <span v-if="!user.subscriptionExpired || new Date() > user.subscriptionExpired " v-html="t('ProfileSettingsDialog.HideAD')"></span>
                  <span v-else v-html="t('subscription.isActive')"></span>
                </a>
              </div>
            </div>
            <div class="write-to-developer">
              <div>
                <a class="link" target="_blank" href="https://vk.com/write-79625925">
                  {{ t!('ProfileSettingsDialog.WriteDeveloper') }}
                </a>
              </div>
            </div>

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
  import {computed, inject, onMounted, ref, watch} from "vue";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {TGetLang} from "@/classes/Pinia/UIStore/TLang";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {useRouter} from "vue-router";

  defineEmits([
    ...useDialogPluginComponent.emits,
  ]);

  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
  const router = useRouter();
  const {
    user,
    availableLanguages,
    isLoading,
    isSoundEnabled,
    isVibrateEnabled,
    launchParams
  } = storeToRefs(UIStore());

  const UI = inject<IUIActions>('UI');

  const transcription = ref<boolean>(user.value.displayTranscription || false);
  const cantSubscribeDevice = ref<boolean>(false);

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

  const userLearnLang = computed(() => {
    const userLang = availableLanguages.value.filter((lang) => {
      return lang.id === user.value.userLearnLangId
    })
    return userLang[0] || {}
  });

  const vibrateIcon = computed(() => {
    if(isVibrateEnabled.value){
      return 'mdi-vibrate'
    }
    return 'mdi-vibrate-off';
  });

  const soundIcon = computed(() => {
    if(isSoundEnabled.value){
      return 'mdi-volume-high'
    }
    return 'mdi-volume-off';
  });

  const toggleSoundEnabled = () => {
    UI?.vibro();
    UI?.toggleSoundEnabled(!isSoundEnabled.value);
  }
  const toggleVibrateEnabled = () => {
    if(!isVibrateEnabled.value){
      UI?.vibro(true);
    }
    UI?.toggleVibrateEnabled(!isVibrateEnabled.value);
  }


  const updateTranscription = (neoVal: boolean) => {
    UI?.setLoading(true);
    UI?.setTranscription(neoVal).then((res) => {
      if(!res){
        transcription.value = !neoVal;
      }
      UI?.vibro();
      UI?.setLoading(false);
    }).catch(() => {
      transcription.value = !neoVal;
      UI?.setLoading(false);
    });
  }

  onMounted(() => {
    /** @ts-ignore */
    if(launchParams?.value?.vk_client == 'browser_atom' || launchParams?.value?.vk_client == 'ok' || launchParams?.value?.vk_client == 'mail'){
      cantSubscribeDevice.value = true;
    }
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
  .settings-icons{
    margin-left: auto;
    margin-top: -5px;
  }

}
</style>