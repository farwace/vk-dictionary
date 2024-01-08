<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%;">
      <div class="page-container faq-page">
        <div class="questions-title" v-html="t('faq.title')"></div>
        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.addWords.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <div v-html="t('faq.addWords.step1')"></div>
                <div>
                  <img src="/assets/img/faq/add-collection.webp" alt="">
                </div>
              </li>
              <li>
                <div v-html="t('faq.addWords.step2')">
                </div>
                <div>
                  <img src="/assets/img/faq/add-word.webp" alt="">
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.removeWord.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <div v-html="t('faq.removeWord.step1')"></div>
                <div>
                  <img src="/assets/img/faq/edit-mode-collection-remove-word.webp" alt="">
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.selectWordsForTraining.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <div v-html="t('faq.selectWordsForTraining.step1')"></div>
                <div>
                  <img src="/assets/img/faq/training-click.webp" alt="">
                </div>
              </li>
              <li>
                <div v-html="t('faq.selectWordsForTraining.step2')"></div>
                <div>
                  <img src="/assets/img/faq/training-click-collections.webp" alt="">
                </div>
              </li>
              <li>
                <div v-html="t('faq.selectWordsForTraining.step3')"></div>
                <div>
                  <img src="/assets/img/faq/training-click-collections-toggle.webp" alt="">
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.howToDeleteCollection.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <div v-html="t('faq.howToDeleteCollection.step1')"></div>
                <div>
                  <img src="/assets/img/faq/edit-collection.webp" alt="">
                </div>
              </li>
              <li>
                <div v-html="t('faq.howToDeleteCollection.step2')"></div>
                <div>
                  <img src="/assets/img/faq/remove-collection.webp" alt="">
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.howToEnableTranscription.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <div v-html="t('faq.howToEnableTranscription.step1')"></div>
                <div>
                  <img src="/assets/img/faq/avatar-click.webp" alt="">
                </div>
              </li>
              <li>
                <div  v-html="t('faq.howToEnableTranscription.step2')"></div>
                <div>
                  <img src="/assets/img/faq/change-transcription.webp" alt="">
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.howToChangeLanguage.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <div v-html="t('faq.howToChangeLanguage.step1')"></div>
                <div>
                  <img src="/assets/img/faq/avatar-click.webp" alt="">
                </div>
              </li>
              <li>
                <div  v-html="t('faq.howToChangeLanguage.step2')"></div>
                <div>
                  <img src="/assets/img/faq/change-language.webp" alt="">
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.howToShare.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <div v-html="t('faq.howToShare.step1')"></div>
                <div>
                  <img src="/assets/img/faq/share-click.webp" alt="">
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="question">
          <div class="question__title" @click="toggleQuestion" v-html="t('faq.howToRemoveAd.title')"></div>
          <div class="question__body">
            <ul>
              <li>
                <router-link to="subscribe">
                  <div v-html="t('faq.howToRemoveAd.step1')"></div>
                </router-link>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </q-scroll-area>
  </div>
</template>
<script lang="ts" setup>
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {storeToRefs} from "pinia";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";

  const {t} = useI18n() as {t:TranslateFunction};

  const {
    contentHeight
  } = storeToRefs(UIStore());

  const toggleQuestion = (event:any) => {
    const target = event.target as unknown as HTMLElement | null;
    if(target){
      target?.closest('.question')?.classList.toggle('active');
    }
  }


</script>
<style lang="scss" scoped>
  .questions-title{
    margin-bottom: 20px;
  }
  .question{
    margin-bottom: 20px;
    font-size: 1rem;
    padding: 8px;

    border-radius: 4px;

    &__title{
      cursor: pointer;
      font-style: italic;
    }

    &.active{
      .question__body{
        display: block;
      }
    }
    &__body{
      display: none;
    }

    img{
      margin: 5px 0;
    }
  }
</style>