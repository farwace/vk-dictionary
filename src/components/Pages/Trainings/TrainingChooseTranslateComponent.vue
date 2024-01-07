<template>
  <div class="training">
    <div class="training__title">
      <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          :duration="800"
      >
        <div>
          <span v-if="!isStart">
            {{ props.trainingName }}
          </span>
          <div v-if="isStart">
            <slot name="top"></slot>
          </div>
        </div>

      </transition>
    </div>
    <div class="training__body">
      <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          :duration="800"
      >
        <div>
          <div v-if="!isStart && !isAll">
            <q-btn
                rounded
                color="primary"
                @click="$emit('started')"
            >
              <span v-html="t('Training.Start')"></span>
            </q-btn>
          </div>

          <div v-if="isStart">
            <slot name="actions"></slot>
          </div>
        </div>

      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {ref} from "vue";

  const {t} = useI18n() as {t:TranslateFunction};

  const emits = defineEmits(['started']);

  const props = defineProps<{
    trainingName: string,
    isAll: boolean,
    isStart: boolean
  }>();


</script>

<style lang="scss" scoped>
  .training{
    position: absolute;
    top: 0;
    left: 0;
    padding: 20px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    &__title, &__body{
      display:flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    &__title{
      flex-basis: 40%;
      height: 40%;
    }
    &__body{
      flex-basis: 60%;
      height: 60%;
    }
  }
</style>