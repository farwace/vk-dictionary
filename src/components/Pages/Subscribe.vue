<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%;">
      <div class="page-container">
        <div v-if="!user.subscriptionExpired || new Date() > user.subscriptionExpired">
          <div>Подписка скрывает всю рекламу в приложении.</div>
          <div>
            <div>
              <q-btn @click="doSubscribe(7)">
                Оформить на 7 дней
              </q-btn>
            </div>
            <div>
              <q-btn @click="doSubscribe(30)">
                Оформить на 30 дней
              </q-btn>
            </div>
            <div>
              <q-btn @click="doSubscribe(90)">
                Оформить на 90 дней
              </q-btn>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="user.subscriptionExpired">
            <div>{{t!('subscription.isActiveTo')}} {{getExpiredDate()}}</div>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>
<script lang="ts" setup>
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {storeToRefs} from "pinia";
  import {useQuasar} from "quasar";
  import i18n from "@/classes/install/i18n";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {inject} from "vue";
  import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";

  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();
  const UI = inject<IUIActions>('UI');

  const {
    contentHeight,
    user
  } = storeToRefs(UIStore());


  const doSubscribe = (days:number) => {
    $q.loading.show({
      delay: 800
    });
    UI?.trySubscribe(days).then(() => {
      $q.loading.hide();
    }).catch(() => {
      $q.loading.hide();
    })
  }

  const getExpiredDate = () => {
    let subscriptionExpiredDate = user.value.subscriptionExpired;
    let locale:string = i18n.global.locale.value || 'ru';
    if(locale != 'ru'){
      locale = 'en-US';
    }

    const options = {
      day: "numeric",
      year: "numeric",
      month: "long",
    }

    if(subscriptionExpiredDate){
      /** @ts-ignore */
      return subscriptionExpiredDate.toLocaleString(locale, options)
    }
    return '';
  }

</script>
<style lang="scss" scoped>

</style>