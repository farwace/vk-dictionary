<template>
  <div class="collections">
    <div class="collections__slider">


      <swiper
          :pagination="{
            clickable: true
          }"
          :modules="swiperModules"
          space-between="20"
          slides-per-view="auto"
      >
        <swiper-slide v-for="(collection, index) in systemCollections">
          <div>
            <div @click="openCollection(collection.id!, collection)" class="collection-item-btn" >
              <div class="item">
                <div class="item__title">
                  {{ collection.name?.slice(0,30) }}
                </div>
                <q-separator class="q-my-sm"/>
                <div class="item__desc">
                  {{collection.description?.slice(0,60)}}
                </div>
              </div>
            </div>
          </div>
        </swiper-slide>

      </swiper>



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
  import { Swiper, SwiperSlide } from 'swiper/vue';
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
    $q.loading.show({delay: 800});
    UI?.getSystemCollectionWords(id).then((res) => {
      $q.loading.hide();

      $q.dialog({
        component: SystemCollectionWordsDialog,
        componentProps: {
          words: res,
          collection: collection
        }
      });

    }).catch(() => {
      $q.loading.hide();
    })
  }


</script>
<style lang="scss" scoped>

  .collections{

    &__slider{
      width: 100%;
      position: relative;
      margin: 20px 0;
      :deep(.swiper){
        width: calc(100vw - 40px);
        max-width: 871px;
        min-width: 0;
        .swiper-slide{
          width: 200px;
        }
      }
      .collection-item-btn{
        padding: 40px 0;
      }
      .item{
        cursor: pointer;
        border: 1px solid rgba(211, 211, 211, 0.4);
        border-radius: 4px;
        font-size: 14px;

        &__title, &__desc{
          padding: 6px;
        }
        &__desc{
          min-height: 67px;
        }

      }

    }


  }

</style>