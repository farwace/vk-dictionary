<template>
  <training-choose-translate-component
      :training-name="t('Training.WordToTranslate')"
      :is-all="isAll"
  >
    <template v-slot:top>
      <div>
        <div v-if="stepWord && !isAll" class="original-word animated" :class="{fadeOut: isStepAnswer, fadeIn: !isStepAnswer}">
          {{ stepWord.word }}
        </div>
        <div v-if="isAll">
          <ResultStarsScreen :value="getResultPercent()!"/>
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <div>
        <div v-if="!isAll" class="word-variants animated" :class="{fadeOut: isStepAnswer, fadeIn: !isStepAnswer}">
          <div v-for="variant in stepVariants" class="variant-item">
            <q-btn class="variant-button" @click="doChooseValue(variant)" rounded outline color="primary" :class="{'bg-dark': $q.dark.isActive, 'bg-white': !$q.dark.isActive, 'right-answer': rightAnswerId == variant.id, 'fail-answer': failAnswerId == variant.id}">
              {{variant.foreignWord}}
            </q-btn>
          </div>
        </div>
        <div v-else class="result-table">
          <div v-if="showResultTable" class="animated fadeInLeft q-mb-md">
            {{getResultMessage()}}
          </div>
          <div v-if="showCountRightAnswers" class="animated fadeInLeft">
            Правильных ответов: {{countRightAnswers}}<br/>
          </div>
          <div v-if="showCountRightInRowAnswers && countRightInRowAnswers > 1" class="animated fadeInLeft">
            Из них подряд: {{countRightInRowAnswers}}<br/>
          </div>
          <!-- TODO: АНИМИРОВАТЬ, ДОБАВИТЬ ИКОНКУ В ЗАВИСИМОСТИ ОТ РЕЗУЛЬТАТА, БРАТЬ ТЕКСТ ИЗ ЛАНГОВ, ДОБАВИТЬ КНОПКУ "ЕЩЕ РАЗ" -->
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
  import {inject, onMounted, ref, watch} from "vue";
  import TrainingChooseTranslateComponent from "@/components/Pages/Trainings/TrainingChooseTranslateComponent.vue";
  import {TWord} from "@/classes/Pinia/UIStore/TWord";
  import {useQuasar} from "quasar";
  import {ISoundActions} from "@/classes/UI/Interfaces/ISoundActions";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import ResultStarsScreen from "@/components/Pages/Trainings/ResultStarsScreen.vue";

  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();
  const SOUND = inject<ISoundActions>('SOUND');
  const UI = inject<IUIActions>('UI');

  const {
    trainingWords,
  } = storeToRefs(UIStore());

  onMounted(() => {
    fillWordsForRepeat();
    doChooseValue();
  });

  const delayTime = 550;
  const trainingCnt = 20;

  const stepWord = ref<TWord>();
  const stepVariants = ref<TWord[]>();
  const rightAnswerId = ref<number>();
  const failAnswerId = ref<number>();
  const isStepAnswer = ref<boolean>(false);
  const canAnswer = ref<boolean>(true);

  const isAll = ref<boolean>(false);
  const countRightAnswers = ref<number>(0);
  const countFaultAnswers = ref<number>(0);
  const countRightInRowAnswers = ref<number>(0);
  const tmpCountRightInRowAnswers = ref<number>(0);


  const showResultTable = ref<boolean>(false);
  const showCountRightAnswers = ref<boolean>(false);
  const showCountRightInRowAnswers = ref<boolean>(false);
  const showCountFaultAnswers = ref<boolean>(false);

  const doChooseValue = (answer?:TWord) => {
    if(!canAnswer.value){
      return;
    }
    canAnswer.value = false;
    if(answer){
      setTimeout(() => {
        isStepAnswer.value = true;
      }, delayTime - 150);

      if(((answer.id == stepWord.value?.id) || ( answer.word.toLowerCase() == stepWord.value?.word.toLowerCase() ))){
        UI?.addWordExperience(stepWord!.value!.id!, 3);
        SOUND?.playSuccess();
        countRightAnswers.value += 1;
        rightAnswerId.value = answer.id;

        tmpCountRightInRowAnswers.value += 1;
      }
      else {
        SOUND?.plyFault();
        countFaultAnswers.value += 1;
        failAnswerId.value = answer.id;
        tmpCountRightInRowAnswers.value = 0;
      }
    }

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
      }, delayTime);
    }
    else{
      //todo: РЕКЛАМА!

      setTimeout(() => {
        failAnswerId.value = undefined;
        rightAnswerId.value = undefined;
        isStepAnswer.value = false;
        canAnswer.value = true;
        isAll.value = true;
      }, delayTime)

      setTimeout(() => {
        showResultTable.value = true;
      }, 300)
      setTimeout(() => {
        showCountRightAnswers.value = true;
      }, delayTime + 800);
      setTimeout(() => {
        showCountRightInRowAnswers.value = true;
      }, delayTime + 1100);
      setTimeout(() => {
        showCountFaultAnswers.value = true;
      }, delayTime + 1500);

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
    wordsForRepeat.value = fillRepeatArray(trainingWords!.value!, trainingCnt);
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
    let result = arr.slice(0, count);
    while (result.length < count) {
      result = result.concat(arr.slice(0, count - result.length));
    }
    return result;
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
    min-height: 200px;
    text-align: center;
  }
</style>