<template>
  <div class="header__wrapper">
    <div class="user-info" @click="$emit('openUserSettings')">
      <img :src="user.photo_100">
      <div class="user-name">
        {{ user.first_name }}
      </div>
    </div>
    <div class="user-lives" v-if="user.lives > 0">
      <img src="/assets/img/icons/icon-heart.webp">
      <div class="user-lives__num">
        {{ user.lives }}
      </div>
    </div>
    <div class="user-lives no-lives" v-if="user.lives < 1">
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
  import {ref} from "vue";

  const emits = defineEmits(['openUserSettings'])

  const {user} = storeToRefs(UIStore());

  const livesTimer = ref<string>('24:07')

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

        img{
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          object-fit: contain;
          margin-right: 20px;
          box-shadow: 0 0 5px rgba(0,0,0,.3);
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