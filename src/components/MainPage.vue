<template>
  <q-page class="flex flex-center">
    <img alt="Quasar logo" src="../assets/logo.svg" style="width: 200px; height: 200px">
    <q-btn @click="tryAdd">
      Добавить на экран?
    </q-btn>
    <div>
      {{ addStatus }}
    </div>
  </q-page>
</template>

<style>
</style>

<script lang="ts" setup>
import {ref, inject} from "vue";
import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";

const addStatus = ref<string>('');
const UI = inject<IUIActions>('UI')
const tryAdd = () => {
  const addToHomeScreen = UI?.addToFavorites;
  if(addToHomeScreen){

    addToHomeScreen().then((res) => {
      if(res){
        addStatus.value = 'Успешно добавлено';
      }
      else{
        addStatus.value = 'Не удалось добавить';
      }
    });
  }
}

</script>
