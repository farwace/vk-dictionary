<template>
  <training-choose-translate-component
      :training-name="t('Training.TranslateToWord')"
      :is-all="isAll"
      :is-start="isStart"
      @started="isStart = true"
  >
    <template v-slot:top>
      <div>
        <div v-if="stepWord && !isAll" class="original-word animated" :class="{fadeOut: isStepAnswer, fadeIn: !isStepAnswer, 'long-word':isLongTopWord(stepWord.foreignWord)}">
          {{ stepWord.foreignWord }}
        </div>
        <div v-if="isAll">
          <ResultStarsScreen :value="getResultPercent() || 0"/>
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <div>
        <div v-if="!isAll" class="word-variants animated" :class="{fadeOut: isStepAnswer, fadeIn: !isStepAnswer}">
          <div v-for="variant in stepVariants" class="variant-item">
            <q-btn class="variant-button" @click="doChooseValue(variant)" rounded outline color="primary" :class="{'bg-dark': $q.dark.isActive, 'bg-white': !$q.dark.isActive, 'right-answer': rightAnswerId == variant.id, 'fail-answer': failAnswerId == variant.id, 'long-word':isLongBottomWord(variant.word)}">
              {{variant.word}}
            </q-btn>
          </div>
        </div>
        <div v-else class="result-table">
          <div v-if="showResultTable" class="animated fadeInLeft q-mb-md">
            {{getResultMessage()}}
          </div>
          <div v-if="showCountRightAnswers" class="animated fadeInLeft">
            {{ parseInt((getResultPercent() || 0).toString()) }} % <span v-html="t('Training.Results.RightAnswers')"></span>
          </div>
          <div v-if="showCountRightInRowAnswers && countRightInRowAnswers > 1" class="animated fadeInLeft">
            {{countRightInRowAnswers}} <span v-html="t('Training.Results.RightRowAnswers')"></span>
          </div>
          <div v-if="showRestartButton" class="animated fadeIn q-mt-sm">
            <q-icon name="mdi-replay" class="replay" @click="doReplay"></q-icon>
          </div>
          <div v-if="errorWords.length > 0 && showErrorsButton" class="animated fadeIn q-mt-lg">
            <q-btn @click="showErrors" rounded><q-icon name="mdi-eye-refresh-outline" class="q-mr-sm"/><span v-html="t('Training.MyErrors')"></span></q-btn>
          </div>
        </div>
      </div>
    </template>
  </training-choose-translate-component>
</template>
<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {inject, onBeforeUnmount, onMounted, ref, watch} from "vue";
  import TrainingChooseTranslateComponent from "@/components/Pages/Trainings/TrainingChooseTranslateComponent.vue";
  import {TWord} from "@/classes/Pinia/UIStore/TWord";
  import {useQuasar} from "quasar";
  import {ISoundActions} from "@/classes/UI/Interfaces/ISoundActions";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import ResultStarsScreen from "@/components/Pages/Trainings/ResultStarsScreen.vue";
  import {useRouter} from "vue-router";
  import {IEventActions} from "@/classes/UI/Interfaces/IEventActions";
  import SystemCollectionWordsDialog from "@/components/common/SystemCollectionWordsDialog.vue";

  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();
  const SOUND = inject<ISoundActions>('SOUND');
  const UI = inject<IUIActions>('UI');
  const TARGET_EVENTS = inject<IEventActions>('TARGET_EVENTS');

  const router = useRouter();

  const {
    trainingWords,
    trainingCollections,
  } = storeToRefs(UIStore());

  onMounted(() => {
    fillWordsForRepeat();
    doChooseValue();
  });
  const delayTimeOrig = 550;
  const delayTime = ref<number>(delayTimeOrig);
  const trainingCnt = 20;
  const addedExperience = 2;

  const stepWord = ref<TWord>();
  const stepVariants = ref<TWord[]>();
  const rightAnswerId = ref<number>();
  const failAnswerId = ref<number>();
  const isStepAnswer = ref<boolean>(false);
  const canAnswer = ref<boolean>(true);

  const isAll = ref<boolean>(false);
  const isStart = ref<boolean>(false);

  const countRightAnswers = ref<number>(0);
  const countFaultAnswers = ref<number>(0);
  const countRightInRowAnswers = ref<number>(0);
  const tmpCountRightInRowAnswers = ref<number>(0);


  const showResultTable = ref<boolean>(false);
  const showCountRightAnswers = ref<boolean>(false);
  const showCountRightInRowAnswers = ref<boolean>(false);
  const showCountFaultAnswers = ref<boolean>(false);
  const showRestartButton = ref<boolean>(false);
  const showErrorsButton = ref<boolean>(false);

  const errorWords = ref<TWord[]>([]);

  const doChooseValue = (answer?:TWord) => {
    if(!canAnswer.value){
      return;
    }
    canAnswer.value = false;
    if(answer){

      if(((answer.id == stepWord.value?.id) || ( answer.foreignWord.toLowerCase() == stepWord.value?.foreignWord.toLowerCase() ))){
        UI?.addWordExperience(stepWord!.value!.id!, addedExperience);
        SOUND?.playSuccess();
        countRightAnswers.value += 1;
        rightAnswerId.value = answer.id;
        delayTime.value = delayTimeOrig;
        tmpCountRightInRowAnswers.value += 1;
      }
      else {
        SOUND?.plyFault();
        delayTime.value = delayTimeOrig + 600;
        countFaultAnswers.value += 1;

        const issetStepErrorWords = errorWords.value.filter((word) => {
          return stepWord.value?.id == word.id;
        });
        if(issetStepErrorWords.length < 1){
          errorWords.value.push(stepWord.value!);
        }
        const issetAnswerErrorWords = errorWords.value.filter((word) => {
          return answer?.id == word.id;
        });
        if(issetAnswerErrorWords.length < 1) {
          errorWords.value.push(answer!);
        }
        rightAnswerId.value = stepWord.value!.id!;
        failAnswerId.value = answer.id;
        tmpCountRightInRowAnswers.value = 0;
      }
    }

    setTimeout(() => {
      isStepAnswer.value = true;
    }, delayTime.value - 150);

    const randomWord = getRandomWordForTraining();
    if(randomWord) {
      const otherWords = trainingWords!.value!.filter((word) => {
        return word.id != randomWord.id;
      });

      var chooseArray: TWord[] = [];
      for (let i = 0; i < 3; i++) {
        chooseArray.push(getRandomElement(otherWords));
      }
      chooseArray.push(randomWord);


      setTimeout(() => {
        failAnswerId.value = undefined;
        rightAnswerId.value = undefined;
        isStepAnswer.value = false;

        stepWord.value = randomWord;
        stepVariants.value = shuffleArray(chooseArray);

        canAnswer.value = true;
      }, delayTime.value);
    }
    else{

      setTimeout(() => {
        failAnswerId.value = undefined;
        rightAnswerId.value = undefined;
        isStepAnswer.value = false;
        canAnswer.value = true;
        isAll.value = true;
      }, delayTime.value)

      setTimeout(() => {
        showResultTable.value = true;
      }, 300)
      setTimeout(() => {
        showCountRightAnswers.value = true;
      }, delayTime.value + 800);
      setTimeout(() => {
        showCountRightInRowAnswers.value = true;
      }, delayTime.value + 1100);
      setTimeout(() => {
        showCountFaultAnswers.value = true;
      }, delayTime.value + 1500);
      setTimeout(() => {
        showRestartButton.value = true;
      }, delayTime.value + 1500);
      setTimeout(() => {
        showErrorsButton.value = true;
      }, delayTime.value + 1600);


    }

  }



  const getResultPercent = () => {
    if(!(countRightAnswers.value && trainingCnt)){
      return undefined;
    }
    return countRightAnswers.value * 100 / trainingCnt;
  }

  const getResultMessage = () => {
    const rightPercent = getResultPercent();
    if(!rightPercent){
      return '';
    }

    if(rightPercent >= 99){
      return t('Training.Results.99')
    }
    if(rightPercent >= 90){
      return t('Training.Results.90')
    }
    if(rightPercent >= 80){
      return t('Training.Results.80')
    }
    if(rightPercent >= 70){
      return t('Training.Results.70')
    }
    if(rightPercent >= 60){
      return t('Training.Results.60')
    }
    if(rightPercent >= 50){
      return t('Training.Results.50')
    }
    return t('Training.Results.49');
  }

  const wordsForRepeat = ref<TWord[]>();

  const fillWordsForRepeat = () => {
    const arWordsForRepeat = fillRepeatArray(trainingWords!.value!, trainingCnt);
    if(arWordsForRepeat){
      wordsForRepeat.value = arWordsForRepeat;
    }
  }

  const getRandomWordForTraining = () => {
    if(!wordsForRepeat.value){
      return null;
    }
    if (wordsForRepeat.value.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * wordsForRepeat.value.length);
    const randomWord = wordsForRepeat.value[randomIndex];
    wordsForRepeat.value.splice(randomIndex, 1);

    return randomWord;
  }

  const getRandomElement = (array: any[]) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }



  const fillRepeatArray = (arr:any[], count:number) => {
    if(!Array.isArray(arr) || arr.length < 1){
      $q.notify({
        type: 'negative',
        message: t('Errors.GetTrainingWordsError'),
        position: "bottom"
      });
      router.push({
        name: 'home'
      });
      return false;
    }
    let result = arr.slice(0, count);
    while (result.length < count) {
      result = result.concat(arr.slice(0, count - result.length));
    }

    const changeLastNumberElements = 5;
    if(result.length > count - changeLastNumberElements  && arr.length > count){
      result = result.slice(0, count-changeLastNumberElements);
      const additionalItems = arr.slice(count - changeLastNumberElements).filter((_, index) => index >= count - changeLastNumberElements);
      const randomItems = additionalItems.sort(() => Math.random() - 0.5).slice(0, changeLastNumberElements);

      result = result.concat(randomItems);
    }

    return shuffleArray(result);
  }

  const shuffleArray = (array:any[]) => {
    const shuffledArray = array.slice();

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
  }

  watch(tmpCountRightInRowAnswers, (neoVal) => {
    if(neoVal > countRightInRowAnswers.value){
      countRightInRowAnswers.value = neoVal;
    }
  });

  const doReplay = () => {
    UI?.showBetweenScreenAd();
    UI?.setLoading(true);
    UI?.updateTrainingWords(trainingCollections.value).then(() => {
      countRightAnswers.value = 0;
      countFaultAnswers.value = 0;
      countRightInRowAnswers.value = 0;
      tmpCountRightInRowAnswers.value = 0;

      showCountRightAnswers.value = false;
      showCountRightInRowAnswers.value = false;
      showCountFaultAnswers.value = false;
      showRestartButton.value = false;
      showErrorsButton.value = false;
      showResultTable.value = false;

      delayTime.value = delayTimeOrig;
      errorWords.value = [];

      isStart.value = false;
      isAll.value = false;
      fillWordsForRepeat();
      doChooseValue();
      UI?.setLoading(false);
    }).catch(() => {
      UI?.setLoading(false);
    })

  }

  onBeforeUnmount(() => {
    UI?.showBetweenScreenAd();
  });

  const getMaxWithoutSpaceLength = (str:string) => {
    const words = str.split(' ');
    return Math.max(...words.map(word => word.length));
  }

  const isLongTopWord = (str:string = '') => {
    const oneLetterWirth = 22;
    const maxLength = getMaxWithoutSpaceLength(str);
    return oneLetterWirth * maxLength > window.innerWidth;
  }

  const isLongBottomWord = (str:string = '') => {
    const oneLetterWirth = 22;
    const maxLength = getMaxWithoutSpaceLength(str);
    return oneLetterWirth * maxLength > window.innerWidth;
  }

  watch(isStart, (neoVal) => {
    if(neoVal){
      TARGET_EVENTS?.sendEvent('StartTranslateToWordTraining');
    }
  });

  const showErrors = () => {
    $q.dialog({
      component: SystemCollectionWordsDialog,
      componentProps: {
        words: errorWords.value,
        hidePagination: true
      }
    })
  }


</script>
<style lang="scss" scoped>
  .word-variants{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    text-align: center;
  }
  .variant-button{
    text-transform: none;
    width: 100%;
  }
  .original-word{
    text-align: center;
  }
  .variant-item{
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .right-answer{
    color: green!important;
  }
  .fail-answer{
    color: red!important;
  }
  .result-table{
    font-size: 1rem;
    min-height: 220px;
    text-align: center;
  }
  .replay{
    font-size: 2rem;
    cursor: pointer;
    transition: transform .3s ease-out;
    will-change: transform;
    &:hover{
      transform: scale3d(1.5, 1.5, 1.5);
    }
  }
  .long-word{
    word-break: break-all;
  }
</style>