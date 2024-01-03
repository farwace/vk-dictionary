<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%">
      <div class="page-container">

        <div class="q-mb-md">
          <q-btn class="q-mr-sm" @click="router.push({name:'home'})">
            <q-icon name="mdi-arrow-left"/>
          </q-btn>
          <span>{{currentCollection?.name}}</span>
          <q-btn class="q-ml-sm" @click="editCollection" v-if="rows.length < 1">
              {{t!('Collection.Edit')}}
          </q-btn>
          <div class="text-right text-subtitle2">
            <q-toggle v-if="rows.length > 0" size="sm" v-model="isEditMode" :label="t('Collection.EditMode')"/>
          </div>
        </div>

        <q-table
            class="words-table"
            :loading="isLoading"
            flat bordered
            :rows="rows"
            :columns="columns"
            :filter="filter"
            :pagination="{
              rowsPerPage: 25
            }"
            :rows-per-page-options="[25, 50,75,100,150, 0]"
            :wrap-cells="true"
        >
          <template v-slot:top v-if="rows.length > 0">
            <q-input
                :disable="isLoading"
                borderless
                dense
                debounce="300"
                v-model="filter"
                :placeholder="t('Collection.Search')"
                class="table-top-search"
            >
            </q-input>
            <div class="q-ml-auto">
              <div v-if="isEditMode">
                <q-btn @click="editCollection">
                  {{t!('Collection.Edit')}}
                </q-btn>
              </div>
              <div v-else>
                <q-btn v-if="rows.length > 0" size="sm" @click="startTraining">
                  {{t!('Collection.Training')}}
                </q-btn>
              </div>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm no-words-found">
              <div v-if="filter">
                <div v-html="t('Collection.NotFoundWords')"></div>
              </div>
              <div v-else>
                <div v-html="t('Collection.NoOneWord')"></div>
                <img :src="`/assets/img/collection-detail/${sadAnimal}.webp`" alt="">
               <div v-html="t('Collection.AddWords')"></div>
              </div>
            </div>
          </template>

          <template v-slot:bottom-row v-if="rows.length < 1 || isEditMode">
            <tr class="add-word">
              <td>
                <q-input
                    ref="neoWordInput"
                    outlined
                    dense
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoWord"
                    :label="t('Collection.NeoWord')"
                    lazy-rules
                    :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>
              <td v-if="user.displayTranscription">
                <q-input
                    outlined
                    dense
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoTranscription"
                    :label="t('Collection.Transcription')"
                    lazy-rules
                    :rules="[val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>
              <td>
                <q-input
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoForeignWord"
                    outlined dense
                    :label="t('Collection.Translation')"
                    lazy-rules
                    :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>
              <td style="width: 10px;">
                <q-btn size="sm" @click.prevent="addNeoWord" :disabled="(neoWord.length < 1 && neoForeignWord.length < 1) || isLoading">
                  <q-icon name="mdi-content-save" />
                </q-btn>
              </td>
            </tr>
          </template>
          <template v-slot:top-row v-if="isEditMode && rows.length > 0">
            <tr class="add-word">
              <td>
                <q-input
                    ref="neoWordInput"
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoWord"
                    outlined dense
                    :label="t('Collection.NeoWord')"
                    lazy-rules
                    :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>
              <td v-if="user.displayTranscription">
                <q-input
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoTranscription"
                    outlined dense
                    :label="t('Collection.Transcription')"
                    lazy-rules
                    :rules="[val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>
              <td>
                <q-input
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoForeignWord"
                    outlined dense
                    :label="t('Collection.Translation')"
                    lazy-rules
                    :rules="[val => val && val.length > 0 || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>
              <td style="width: 10px;">
                <q-btn size="sm" @click.prevent="addNeoWord" :disabled="(neoWord.length < 1 && neoForeignWord.length < 1) || isLoading">
                  <q-icon name="mdi-content-save" />
                </q-btn>
              </td>
            </tr>
          </template>


          <template v-slot:body-cell-settings="{row}">
            <td>
              <div class="edit-row" v-if="isEditMode">

                <q-btn class="q-mr-md" :disable="isLoading" size="sm" @click="editWord(row)">
                  <q-icon name="mdi-pencil"/>
                </q-btn>

                <q-btn :disable="isLoading" size="sm" @click="removeWord(row.id)" class="remove-word-btn">
                  <q-icon name="mdi-delete-forever-outline"/>
                </q-btn>
              </div>
            </td>
          </template>

        </q-table>

      </div>
    </q-scroll-area>
  </div>
</template>
<script lang="ts" setup>
  import {computed, inject, onMounted, onUnmounted, ref} from "vue";
  import {useRoute, useRouter} from "vue-router"
  import {storeToRefs} from "pinia";
  import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
  import {useI18n} from "vue-i18n";
  import type {TranslateFunction} from "@/lang/TranslateFunction";
  import type {TWord} from "@/classes/Pinia/UIStore/TWord";
  import {useQuasar, QInput} from "quasar";
  import type {QTableProps} from "quasar";
  import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
  import {TCollection} from "@/classes/Pinia/UIStore/TCollection";
  import EditWordDialog from "@/components/common/EditWordDialog.vue";
  import EditCollectionDialog from "@/components/common/EditCollectionDialog.vue";

  const $q = useQuasar();

  const UI = inject<IUIActions>('UI');
  const filter = ref<string>('');

  const route = useRoute();
  const routeParams = ref(route.params);
  const router = useRouter();

  const isLoading = ref<boolean>(false);
  const isEditMode = ref<boolean>(false);

  const {t} = useI18n() as {t:TranslateFunction};
  const {
    contentHeight,
    currentCollectionWords,
    user,
    collections,
  } = storeToRefs(UIStore());

  const sadAnimal = ref<string>('');

  const neoWord = ref<string>('');
  const neoTranscription = ref<string>('');
  const neoForeignWord = ref<string>('');

  const neoWordInput = ref<QInput>();

  const rows = computed(() => {
    if(!currentCollectionWords?.value){
      return [];
    }
    return currentCollectionWords.value;
  });

  const currentCollectionId = computed(() => {
    if(!routeParams.value.id){
      return -1;
    }
    if(Array.isArray(routeParams.value.id)){
      return -2;
    }
    return parseInt(routeParams.value.id as string);
  })

  const currentCollection = computed(():TCollection | undefined => {
    const arCurrentCollection = collections.value.filter((collection) => {
      return collection.id === currentCollectionId.value;
    });
    if(arCurrentCollection.length < 1){
      return undefined;
    }
    else{
      return arCurrentCollection[0];
    }
  })

  const columns = computed(():QTableProps['columns'] => {

    const nameCol = {
      name: 'word',
      required: true,
      label: t('Collection.Word'),
      align: 'left' as 'left',
      field: (row:TWord) => {return row.word},
      sortable: true
    };
    const transcriptionCol = {
      name: 'transcription',
      label: t('Collection.Transcription'),
      align: 'left' as "left",
      field: (row:TWord) => {return row.transcription},
    };
    const translateCol = {
      name: 'translate',
      label: t('Collection.Translation'),
      align: 'left' as "left",
      field: (row:TWord) => {return row.foreignWord},
      sortable: true
    };

    const settingsCol = {
      name: 'settings',
      label: '',
      field: '',
    }
    const cols:QTableProps['columns'] = [nameCol];
    if(user.value.displayTranscription){
      cols.push(transcriptionCol);
    }
    cols.push(translateCol);
    if(isEditMode.value || rows.value.length < 1){
      cols.push(settingsCol);
    }
    return cols;
  });

  const removeWord = (id:number) => {
    isLoading.value = true;
    UI?.removeWord(id).then(() => {
      isLoading.value = false;
    }).catch((e) => {
      isLoading.value = false;
    });
  }

  const editWord = (word:TWord) => {
    $q.dialog({
      component: EditWordDialog,
      componentProps: {
        word: word
      },
    })
  }

  onMounted(() => {
    let isAllRight = true;
    if(!currentCollection.value){
      isAllRight = false;
    }
    if(!Array.isArray(rows.value)){
      isAllRight = false;
    }

    if(!Array.isArray(currentCollectionWords?.value)){
      if(currentCollectionId.value < 1){
        isAllRight = false;
      }

      if(!isAllRight){
        router.push({name: 'home'});
        return;
      }
      isLoading.value = true;
      UI?.getCollectionWords(currentCollectionId.value).then(() => {
        isLoading.value = false;
      }).catch((e) => {
        isLoading.value = false;
        router.push({name: 'home'});
      })
    }
    if(!isAllRight){
      router.push({name: 'home'});
      return;
    }

    sadAnimal.value = getRandomSadPicture();
  })


  const getRandomSadPicture = () => {
    const arPhotos = ['sad-raccoon', 'sad2', 'sad3', 'sad4'];
    return arPhotos[Math.floor(Math.random()*arPhotos.length)];
  }

  const addNeoWord = () => {
    if(neoWord.value.length < 1 || neoForeignWord.value.length < 1){
      return;
    }
    isLoading.value = true;
    UI?.addWordToCollection(neoWord.value, neoTranscription.value, neoForeignWord.value, currentCollectionId.value)
        .then(() => {
          neoWord.value = '';
          neoTranscription.value = '';
          neoForeignWord.value = '';
          isLoading.value = false;
          neoWordInput.value?.$el.querySelector('input').focus();
        }).catch(() => {
          isLoading.value = false;
    });
  }

  const startTraining = () => {
    alert('Coming soon...')
  }

  const editCollection = () => {
    $q.dialog({
      component: EditCollectionDialog,
      componentProps: {
        collection: currentCollection.value
      },
    })
  }

  onUnmounted(() => {

  });


</script>
<style lang="scss" scoped>
  .table-top-search{

  }
  .no-words-found{
    text-align: center;
    font-size: 1.2rem;
    padding: 20px;
    img{
      max-height: 200px;
    }
  }
  .remove-word-btn{
    color: var(--q-negative)
  }
  .edit-row{
    white-space: nowrap;
  }
  .add-word{
    td{
      padding: 0 4px;
    }
    .q-field--with-bottom{
      padding-bottom: 0;
    }
    :deep(.q-field__bottom){
      display: none;
    }

  }
  .words-table{
    :deep(th){
      white-space: nowrap
    }
  }
</style>