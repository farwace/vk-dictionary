<template>
  <div class="no-collections-text" v-if="collections.length < 1">
    <div class="text-center">
      <img src="/assets/img/collection-detail/sad4.webp" alt="">
    </div>
    <div>
        <span>
          {{ t!('HomePage.NoHaveCollections') }}
        </span>
      <br/>
      <span>
          <a href="#" @click.prevent="$emit('add-collection')">
            {{ t!('HomePage.UCanAddNewCollection') }}
          </a>
        </span><br/>
        <span v-if="systemCollections.length > 0">
          {{ t!('HomePage.UCanAddFromSystemCollections') }}
        </span>
    </div>
  </div>

</template>
<script lang="ts" setup>
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";

  const {t} = useI18n() as {t:TranslateFunction};

  const {
    collections,
    systemCollections,
    user,
  } = storeToRefs(UIStore());

  defineEmits(['add-collection'])

</script>

<style lang="scss" scoped>
  .no-collections-text{
    text-align: center;
    img{
      max-width: 200px;
      max-height: 300px;
    }
  }
</style>