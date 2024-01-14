<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%;">
      <div class="page-container subscription">
        <div v-if="!user.subscriptionExpired || new Date() > user.subscriptionExpired">
          <div class="q-mb-sm" v-html="t('subscription.buyTitle')"></div>
          <div v-if="launchParams?.vk_platform == 'mobile_iphone' || launchParams?.vk_platform == 'mobile_ipad' || launchParams?.vk_platform == 'mobile_iphone_messenger'" v-html="t('subscription.iosError')"></div>
          <div v-if="launchParams?.vk_platform !== 'mobile_iphone' && launchParams?.vk_platform !== 'mobile_ipad' && launchParams?.vk_platform !== 'mobile_iphone_messenger'">
            <div class="text-subtitle1" v-html="t('subscription.buySubtitle')"></div>
            <div class="subscription__items">
              <q-btn @click="doSubscribe(7)">
                <q-icon color="pink-3" name="mdi-hand-heart-outline" class="q-mr-sm"/> {{t!('subscription.buy7')}}
              </q-btn>

              <q-btn @click="doSubscribe(30)">
                <q-icon color="pink-3" name="mdi-hand-heart-outline" class="q-mr-sm"/> {{t!('subscription.buy30')}}
              </q-btn>

              <q-btn @click="doSubscribe(90)">
                <q-icon color="pink-3" name="mdi-hand-heart-outline" class="q-mr-sm"/>  {{t!('subscription.buy90')}}
              </q-btn>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="user.subscriptionExpired">
            <div>{{t!('subscription.isActiveTo')}} {{getExpiredDate()}}</div>
          </div>
        </div>
        <div>
          <Vue3Lottie animation-link="/assets/lottie/subscribe-page.json" style="width: 100%; max-width: 400px;"/>
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
  import {Vue3Lottie} from "vue3-lottie";

  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();
  const UI = inject<IUIActions>('UI');

  const {
    contentHeight,
    user,
    launchParams
  } = storeToRefs(UIStore());


  const doSubscribe = (days:number) => {
    UI?.setLoading(true);
    UI?.trySubscribe(days).then(() => {
      UI?.setLoading(false);
      //UI?.updateUserInfo();
    }).catch(() => {
      UI?.setLoading(false);
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
  .subscription{
    text-align: center;
  }
  .subscription__items{
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    margin-top: 40px;
  }
</style>