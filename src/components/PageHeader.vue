<template>
  <div class="header__wrapper">
    <div class="user-info" @click="$emit('openUserSettings')">
      <div class="user-photo">
        <img class="photo" :src="user.photo_100">
        <img v-if="userLearnLang.nameCode" class="lang" :src="`/assets/img/languages/${userLearnLang.nameCode}.webp`">
      </div>
      <div class="user-name">
        {{ user.first_name }}
      </div>
    </div>
    <div class="user-lives" v-if="(user.lives || 0) > 0">
      <img src="/assets/img/icons/icon-heart.webp">
      <div class="user-lives__num">
        {{ user.lives }}
      </div>
    </div>
    <div class="user-lives no-lives" v-if="(user.lives || 0) < 1">
      <img src="/assets/img/icons/icon-heart-broke.webp">
      <div class="user-lives__num">
        {{ livesTimer }}
      </div>
    </div>

  </div>
</template>
<script lang="ts" setup>

  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {computed, ref} from "vue";

  const emits = defineEmits(['openUserSettings'])

  const {user, availableLanguages} = storeToRefs(UIStore());

  const livesTimer = ref<string>('24:07')//todo: таймер на сокетах???

  const userLearnLang = computed(() => {
    const userLang = availableLanguages.value.filter((lang) => {
      return lang.id === user.value.userLearnLangId
    })
    return userLang[0] || {}
  });

</script>
<style lang="scss" scoped>
  .header{
    &__wrapper{
      font-size: 1.2rem;

      display: flex;
      flex-wrap: nowrap;
      gap: 20px;
      justify-content: space-between;


      .user-info{
        cursor: pointer;
        display: flex;
        align-items: center;
        flex-basis: calc(100% - 118px);
        max-width: calc(100% - 118px);
        .user-photo{
          margin-right: 20px;
          position: relative;
          img.photo{
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            object-fit: contain;
            box-shadow: 0 0 5px rgba(0,0,0,.3);
          }
          img.lang{
            position: absolute;
            right: -10px;
            bottom: 5px;
            width: 20px;
            height: 15px;
            object-fit: contain;
          }
        }

      }

      .user-lives{
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        img{
          width: 40px;
          height: 40px;
          object-fit: contain;
          margin-right: 10px;
        }

        &__num{

        }
        &.no-lives{
          .user-lives__num{
            min-width: 48px;
          }
        }
      }

      .user-name{
        display: none;
        white-space: nowrap;
        max-width: calc(100% - 60px);
        @media (min-width: 350px) {
          display: block;
        }

        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>