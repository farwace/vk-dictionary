<template>
  <q-dialog ref="dialogRef" :no-backdrop-dismiss="true" :no-esc-dismiss="true">
    <q-card class="q-dialog-plugin">
      <div class="select-language">
        <div class="select-language__title">
          {{ t!('ChooseLanguageDialog.Title') }}
        </div>
        <div class="select-language__items">
          <swiper style="--swiper-scrollbar-bottom: 0"
            :scrollbar="{hide: true, draggable: true}"
            space-between="20"
            :modules="swiperModules"
            slides-per-view="auto"
          >
            <swiper-slide v-for="lang in availableLanguagesSorted">
              <div class="item-inner" @click="selectedLang=lang.id" :class="{selected:selectedLang==lang.id}">
                <img :src="require(`@/assets/languages/${lang.nameCode}.webp`)" :alt="lang.nameCode">
              </div>
            </swiper-slide>
          </swiper>
        </div>
        <div class="select-language__title">
          {{ t!('ChooseLanguageDialog.WantLearn') }}
        </div>
        <div class="select-language__items no-margin">
          <swiper style="--swiper-scrollbar-bottom: 0"
                  :scrollbar="{hide: true, draggable: true}"
                  space-between="20"
                  :modules="swiperModules"
                  slides-per-view="auto"
          >
            <swiper-slide v-for="lang in availableLanguagesSorted">
              <div class="item-inner" @click="selectedLearnLang=lang.id" :class="{selected:selectedLearnLang==lang.id}">
                <img :src="require(`@/assets/languages/${lang.nameCode}.webp`)" :alt="lang.nameCode">
              </div>
            </swiper-slide>
          </swiper>
        </div>
      </div>
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import type {TGetLang} from "@/classes/Pinia/UIStore/TLang";
  import {useDialogPluginComponent} from "quasar";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {computed, onMounted, ref} from "vue";
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import 'swiper/css';
  import 'swiper/css/scrollbar';
  import {Scrollbar} from "swiper/modules";

  const swiperModules = [Scrollbar];

  defineEmits([
    ...useDialogPluginComponent.emits
  ]);
  const {t} = useI18n() as {t:TranslateFunction};
  const { dialogRef, onDialogOK } = useDialogPluginComponent();

  const onOKClick = () => {
    // on OK, it is REQUIRED to
    // call onDialogOK (with optional payload)
    onDialogOK({selectedLang: selectedLang.value, selectedLearnLang: selectedLearnLang.value})
    // or with payload: onDialogOK({ ... })
    // ...and it will also hide the dialog automatically
  }

  const props = defineProps<{
    availableLanguages: TGetLang,
    currentLanguageId?:number
    currentLearnLanguageId?:number
  }>();

  const selectedLang = ref<number>(1);
  const selectedLearnLang = ref<number>(2);

  const availableLanguagesSorted = computed(() => {
    const primaryLanguages = [
        'ru',
        'en',
        'es',
        'pt'
    ]
    return props.availableLanguages.sort((a,b) => {
      const aIndex = primaryLanguages.indexOf(a.nameCode) > -1 ? primaryLanguages.indexOf(a.nameCode) : 1000;
      const bIndex = primaryLanguages.indexOf(b.nameCode) > -1 ? primaryLanguages.indexOf(b.nameCode) : 1000;
      if(aIndex > bIndex){
        return 1;
      }
      if(aIndex < bIndex){
        return -1;
      }
      return 0;
    })
  });

  onMounted(() => {
    if(props.currentLanguageId){
      selectedLang.value = props.currentLanguageId;
    }
    if(props.currentLearnLanguageId){
      selectedLearnLang.value = props.currentLearnLanguageId
    }
  })

</script>

<style lang="scss" scoped>
  .select-language{
    padding: 20px;

    &__title{
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 1.3rem;
    }

    &__items{
      margin-bottom: 40px;

      .swiper-slide{
        width: 60px;
        margin-bottom: 6px;
        .item-inner{
          display: flex;
          border: 3px solid rgba(0,0,0,0);
          border-radius: 4px;
          cursor: pointer;
          &.selected{
            border-color: #efefef;
          }

          img{
            object-fit: contain;
            max-width: 100%;
          }
        }
      }
    }
  }
</style>