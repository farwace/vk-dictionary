<template>
  <div class="collections">
    <div class="collections__list">
        <div class="item" v-for="(collection, index) in systemCollections" @click="openCollection(collection.id!, collection)">
          <div class="item__header">
            <div class="item__title">
              {{ collection.name?.slice(0,30) }}
            </div>
          </div>
          <div class="item__body">
            <div class="item__pic">
              <img :src="getPhoto(collection.picture)" alt="">
            </div>
            <div class="item__desc">
              <div>
                <span class="text">{{collection.description?.slice(0,60)}}</span>
              </div>
            </div>
          </div>
        </div>
    </div>

  </div>
</template>
<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {inject} from "vue";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {useRouter} from "vue-router";
  import {useQuasar} from "quasar";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import { Pagination } from 'swiper/modules'
  import 'swiper/css';
  import 'swiper/css/pagination';
  import SystemCollectionWordsDialog from "@/components/common/SystemCollectionWordsDialog.vue";
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";

  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();
  const UI = inject<IUIActions>('UI');
  const router = useRouter();

  const {systemCollections} = storeToRefs(UIStore());

  const swiperModules = [Pagination];

  const openCollection = (id:number, collection:TCollection) => {
    UI?.setLoading(true);
    UI?.getSystemCollectionWords(id).then((res) => {
      UI?.setLoading(false);

      $q.dialog({
        component: SystemCollectionWordsDialog,
        componentProps: {
          words: res,
          collection: collection
        }
      });

    }).catch(() => {
      UI?.setLoading(false);
    })
  }

  const getPhoto = (src?:string) =>{
    if(src){
      return '/assets/img/photos/' + src;
    }
    return '/assets/img/unknown.webp';
  }

</script>
<style lang="scss" scoped>

  .collections{

    &__list{
      margin: 40px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (min-width: 569px){
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    .item {
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      font-size: 14px;
      line-height: 120%;
      word-break: break-word;
      position: relative;

      &__header{
        position: relative;
        z-index: 2;
      }

      &__title{
        padding: 8px 12px 7px;
        font-size: .9rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 50px;
        box-shadow: 0 0 10px rgba(0,0,0,.1);

        @media(min-width: 400px){
          font-size: 1rem;
        }
      }

      &__body{
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: 100px;

        @media(min-width: 640px){
          min-height: 160px;
        }
      }

      &__pic{
        text-align: center;
        img{
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }
      }
      &__desc {
        padding: 8px 5px;
        font-size: 12px;
        min-height: 50px;
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        .text{
          padding: 6px;
          border-radius: 37px;
          display: inline-block;
        }
      }
    }

  }

</style>