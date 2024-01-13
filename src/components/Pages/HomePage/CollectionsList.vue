<template>
  <div class="collections">

    <div class="collections__top q-mb-md">
      <div class="collections__title" v-html="t('HomePage.MyCollections')"></div>
      <div class="collections__sort position-relative" v-click-outside="clickOutside">
        <div class="change-sort" :class="{active: isActiveChangeSort}">
          <q-icon :name="getSortIcon(sortBy)" @click="isActiveChangeSort = !isActiveChangeSort"/>
          <div @click.prevent="sortBy='id-desc'" v-if="sortBy!='id-desc' && isActiveChangeSort">
            <q-icon :name="getSortIcon('id-desc')"/>
          </div>
          <div @click.prevent="sortBy='id-asc'" v-if="sortBy!='id-asc' && isActiveChangeSort">
            <q-icon :name="getSortIcon('id-asc')"/>
          </div>
          <div @click.prevent="sortBy='name-asc'" v-if="sortBy!='name-asc' && isActiveChangeSort">
            <q-icon :name="getSortIcon('name-asc')"/>
          </div>
          <div @click.prevent="sortBy='name-desc'" v-if="sortBy!='name-desc' && isActiveChangeSort">
            <q-icon :name="getSortIcon('name-desc')"/>
          </div>
        </div>
      </div>
    </div>

    <div class="collections__items">
      <q-btn @click="openCollection(collection.id!)" class="collection-item-btn" v-for="(collection, index) in sortedCollections">
        <template v-slot:default>
          <div class="item">
            <div class="item__title">
              {{ collection.name?.slice(0,30) }}
            </div>
            <q-separator class="q-my-sm" v-if="collection.description && collection.description.length > 0"/>
            <div class="item__desc" v-if="collection.description && collection.description.length > 0">
              {{collection.description?.slice(0,60)}}
            </div>
          </div>
        </template>
      </q-btn>

    </div>

  </div>
</template>
<script lang="ts" setup>
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {computed, inject, ref} from "vue";
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {ClickOutside} from "@/classes/UI/CompositionUtils/ClickOutside";
  import {useRouter} from "vue-router";
  import {useQuasar} from "quasar";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  const vClickOutside = ClickOutside;

  const {t} = useI18n() as {t:TranslateFunction};
  const $q = useQuasar();
  const UI = inject<IUIActions>('UI');
  const router = useRouter();

  const {collections} = storeToRefs(UIStore());
  const sortBy = ref<"id-asc"|"id-desc"|"name-asc"|"name-desc">("id-desc")

  const isActiveChangeSort = ref<boolean>(false);

  const getSortIcon = (val:typeof sortBy.value) => {
    switch (val){
      case "id-asc":
        return "mdi-sort-clock-ascending-outline";
      case "name-asc":
        return "mdi-sort-alphabetical-ascending";
      case "name-desc":
        return "mdi-sort-alphabetical-descending";
      default:
        return "mdi-sort-clock-descending-outline";
    }
  }

  const openCollection = (id:number) => {
    UI?.setLoading(true);
    UI?.getCollectionWords(id).then(() => {
      router.push({name: 'collection', params: {id: id}})
      UI?.setLoading(false);
    }).catch(() => {
      UI?.setLoading(false);
    })
  }

  const clickOutside = () => {
    isActiveChangeSort.value = false;
  }

  const sortedCollections = computed(() => {
    const sortFunction = (a:TCollection, b:TCollection) => {
      if(sortBy.value == 'id-asc'){
        if(a.id! < b.id!){
          return -1;
        }
        if(a.id! > b.id!){
          return 1;
        }
        return 0;
      }
      if(sortBy.value == 'id-desc'){
        if(a.id! < b.id!){
          return 1;
        }
        if(a.id! > b.id!){
          return -1;
        }
        return 0;
      }
      if(sortBy.value == 'name-asc'){
        if(a.name?.toUpperCase()! < b.name?.toUpperCase()!){
          return -1;
        }
        if(a.name?.toUpperCase()! > b.name?.toUpperCase()!){
          return 1;
        }
        return 0;
      }
      if(sortBy.value == 'name-desc'){
        if(a.name?.toUpperCase()! < b.name?.toUpperCase()!){
          return 1;
        }
        if(a.name?.toUpperCase()! > b.name?.toUpperCase()!){
          return -1;
        }
        return 0;
      }
      return 0;
    }
    return collections.value.sort(sortFunction);
  });


</script>
<style lang="scss" scoped>
  .collections{
    &__top{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 20px;
    }
    &__sort{
      .q-icon{
        padding: 10px;
        font-size: 1.6rem;
      }
      .change-sort{
        position:absolute;
        right: -5px;
        top: -5px;
        padding: 0;
        z-index: 2;
        border-radius: 4px;
        transition: box-shadow .3s ease-out;

        .q-icon{
          cursor:pointer;
        }
      }
    }

    &__items{
      display: grid;
      grid-template-columns: 1fr 1fr;
      .q-btn{
        max-width: 100%;
        min-width: 0;
      }
      @media(min-width: 569px){
        grid-template-columns: 1fr 1fr 1fr;
      }
      gap: 20px;

      .item{
        width: 100%;
        align-self: normal;
        line-height: 120%;
        padding: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        &__desc{
          text-transform: none;
          font-size: .875rem;
        }
      }

    }
  }

</style>