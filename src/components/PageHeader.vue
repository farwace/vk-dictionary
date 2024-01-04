<template>
  <div class="header__wrapper">

    <div class="left-side">
      <div v-if="route.name != 'home'" class="q-mr-sm interface-btn" @click="router.push({name:'home'})">
        <q-icon name="mdi-arrow-left"/>
      </div>
    </div>

    <div class="middle-side">
      <div class="user-info" @click="$emit('openUserSettings')">
        <div class="user-photo">
          <img class="photo" :src="user.photo_100">
          <img v-if="userLearnLang.nameCode" class="lang" :src="`/assets/img/languages/${userLearnLang.nameCode}.webp`">
        </div>
      </div>
    </div>

    <div class="right-side">
      <div v-if="route.name == 'home'">
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
      <div v-if="route.name=='collection'">
        <div class="share">
          <div @click="doShareAction" class="interface-btn">
            <q-icon name="mdi-share-variant-outline"></q-icon>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script lang="ts" setup>

  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {computed, ref} from "vue";
  import {useRoute, useRouter} from "vue-router";

  const emits = defineEmits(['openUserSettings'])
  const route = useRoute();
  const router = useRouter();

  const {user, availableLanguages} = storeToRefs(UIStore());

  const livesTimer = ref<string>('24:07')//todo: таймер на сокетах???

  const userLearnLang = computed(() => {
    const userLang = availableLanguages.value.filter((lang) => {
      return lang.id === user.value.userLearnLangId
    })
    return userLang[0] || {}
  });

  const doShareAction = () => {
    alert('coming soonn');
    //todo: сделать поделиться ссылкой
  }


</script>
<style lang="scss" scoped>
  .header{
    &__wrapper{
      font-size: 1.2rem;

      display: grid;
      grid-template-columns: 1fr 40px 1fr;
      gap: 20px;

      .left-side{
        display: flex;
        align-items: center;
      }

      .middle-side{
        text-align: center;
      }

      .right-side{
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .user-info{
        cursor: pointer;

        .user-photo{
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
        justify-content: flex-end;
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