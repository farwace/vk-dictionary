<template>
  <div class="page" :style="contentHeight" :class="{'edit-mode':isEditMode}">
    <q-scroll-area style="height: 100%">
      <div class="page-container">

        <div class="q-mb-md collection-title-block">
          <div class="collection-title">{{currentCollection?.name}}</div>
          <div class="collection-actions">
            <div class="text-right text-subtitle2">
              <q-toggle v-if="rows.length > 0" size="sm" v-model="isEditMode" :label="t('Collection.EditMode')"/>
            </div>
            <q-btn class="q-ml-sm" @click="editCollection" v-if="rows.length < 1">
              {{t!('Collection.Edit')}}
            </q-btn>
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
              <div v-else class="action-buttons">
                <div class="interface-btn" v-if="rows.length > 0" @click="startTraining">
                  <q-icon name="mdi-play-circle-outline"></q-icon>
                </div>
                <div class="share">
                  <div @click="doShareAction" class="interface-btn">
                    <q-icon name="mdi-share-variant-outline"></q-icon>
                  </div>
                </div>
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

          <template v-slot:top-row v-if="isEditMode && rows.length > 0">
            <tr class="add-word">
              <td>
                <q-input
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoForeignWord"
                    :class="{'q-field--highlighted':neoForeignWordHasError}"
                    ref="neoForeignWordInput"
                    outlined dense
                    :label="t('Collection.NeoWord')"
                    lazy-rules
                    :rules="[val => (val && val.length > 0 || !val) || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>

              <td v-if="user.displayTranscription">
                <q-input
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoTranscription"
                    :class="{'q-field--highlighted':neoTranscriptionHasError}"
                    outlined dense
                    :label="t('Collection.Transcription')"
                    lazy-rules
                    :rules="[val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>

              <td>
                <q-input
                    ref="neoWordInput"
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoWord"
                    outlined dense
                    :label="t('Collection.Translation')"
                    lazy-rules
                    :class="{'q-field--highlighted':neoWordHasError}"
                    :rules="[val => (val && val.length > 0 || !val) || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>

              <td style="width: 10px;">
                <q-btn size="sm" @click.prevent="addNeoWord" :disabled="(neoWord.trim().length < 1 || neoWord.length > 254 || neoForeignWord.trim().length < 1 || neoForeignWord.length > 254 || neoTranscription.length > 254) || isLoading">
                  <q-icon name="mdi-content-save" />
                </q-btn>
              </td>
            </tr>
          </template>

          <template v-slot:bottom-row>

            <tr class="examples" v-if="rows.length < 1 && currentCollectionExample">
              <td class="text-left">
                <div v-for="exWord in currentCollectionExample">
                  {{exWord.foreignWord}}
                </div>
              </td>
              <td class="text-center" v-if="user.displayTranscription">
                <div v-for="exWord in currentCollectionExample">
                  {{exWord.transcription}}
                </div>
              </td>
              <td class="text-right">
                <div v-for="exWord in currentCollectionExample">
                  {{exWord.word}}
                </div>
              </td>
              <td>

              </td>
            </tr>

            <tr class="add-word" v-if="isEditMode">

              <td>
                <q-input
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoForeignWord"
                    :class="{'q-field--highlighted':neoForeignWordHasError}"
                    ref="neoForeignWordInput"
                    outlined dense
                    :label="t('Collection.NeoWord')"
                    lazy-rules
                    :rules="[val => (val && val.length > 0 || !val) || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>

              <td v-if="user.displayTranscription">
                <q-input
                    outlined
                    dense
                    @keydown.enter.stop="addNeoWord"
                    v-model="neoTranscription"
                    :class="{'q-field--highlighted':neoTranscriptionHasError}"
                    :label="t('Collection.Transcription')"
                    lazy-rules
                    :rules="[val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>
              <td>
                <q-input
                    ref="neoWordInput"
                    outlined
                    dense
                    @keydown.enter.stop="addNeoWord"
                    :class="{'q-field--highlighted':neoWordHasError}"
                    v-model="neoWord"
                    :label="t('Collection.Translation')"
                    lazy-rules
                    :rules="[val => (val && val.length > 0 || !val) || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                />
              </td>

              <td style="width: 10px;" v-if="rows.length < 1 || isEditMode">
                <q-btn size="sm" @click.prevent="addNeoWord" :disabled="(neoWord.trim().length < 1 || neoWord.length > 254 || neoForeignWord.trim().length < 1 || neoForeignWord.length > 254 || neoTranscription.length > 254) || isLoading">
                  <q-icon name="mdi-content-save" />
                </q-btn>
              </td>
            </tr>
            <tr v-else class="add-word">
              <td :colspan="columns?.length">
                <div class="bottom-row-items">
                  <q-input
                      class="item"
                      @keydown.enter.stop="addNeoWord"
                      v-model="neoForeignWord"
                      :class="{'q-field--highlighted':neoForeignWordHasError}"
                      ref="neoForeignWordInput"
                      outlined dense
                      :label="t('Collection.NeoWord')"
                      lazy-rules
                      :rules="[val => (val && val.length > 0 || !val) || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                  />

                  <q-input
                      class="item"
                      v-if="user.displayTranscription"
                      outlined
                      dense
                      @keydown.enter.stop="addNeoWord"
                      :class="{'q-field--highlighted':neoTranscriptionHasError}"
                      v-model="neoTranscription"
                      :label="t('Collection.Transcription')"
                      lazy-rules
                      :rules="[val => val.length < 255 || t('Collection.LongWord')]"
                  />

                  <q-input
                      class="item"
                      ref="neoWordInput"
                      outlined
                      dense
                      @keydown.enter.stop="addNeoWord"
                      v-model="neoWord"
                      :class="{'q-field--highlighted':neoWordHasError}"
                      :label="t('Collection.Translation')"
                      lazy-rules
                      :rules="[val => (val && val.length > 0 || !val) || t('Collection.EmptyWord'), val => val.length < 255 || t('Collection.LongWord')]"
                  />

                  <div class="bottom-row-save">
                    <q-btn size="sm" @click.prevent="addNeoWord" :class="{disabled:(neoWord.trim().length < 1 || neoWord.length > 254 || neoForeignWord.trim().length < 1 || neoForeignWord.length > 254 || neoTranscription.length > 254) || isLoading}">
                      <q-icon name="mdi-content-save" />
                    </q-btn>
                  </div>
                </div>
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
  import ChooseTrainingDialog from "@/components/common/ChooseTrainingDialog.vue";
  import ShareCollectionDialog from "@/components/common/ShareCollectionDialog.vue";

  const $q = useQuasar();

  const UI = inject<IUIActions>('UI');
  const filter = ref<string>('');

  const route = useRoute();
  const routeParams = ref(route.params);
  const router = useRouter();

  const isEditMode = ref<boolean>(false);

  const {t} = useI18n() as {t:TranslateFunction};
  const {
    contentHeight,
    currentCollectionWords,
    user,
    collections,
    appliedCollectionId,
    isLoading,
    availableLanguages,
    collectionExamples
  } = storeToRefs(UIStore());

  const sadAnimal = ref<string>('');

  const neoWord = ref<string>('');
  const neoTranscription = ref<string>('');
  const neoForeignWord = ref<string>('');

  const neoWordHasError = ref<boolean>(false);
  const neoTranscriptionHasError = ref<boolean>(false);
  const neoForeignWordHasError = ref<boolean>(false);

  const currentCollectionExample = computed(():TWord[] | undefined =>{
    let userLangCode = availableLanguages.value?.filter((obLang) => {
      return obLang.id == user.value.userLangId;
    });
    let userLearnLangCode = availableLanguages.value?.filter((obLang) => {
      return obLang.id == user.value.userLearnLangId;
    });

    if(userLangCode && userLangCode[0] && userLangCode[0]['nameCode'] && userLearnLangCode && userLearnLangCode[0] && userLearnLangCode[0]['nameCode']){
      const langCode = userLangCode[0]['nameCode'] + '-' + userLearnLangCode[0]['nameCode'];
      if(collectionExamples.value[langCode]){
        return collectionExamples.value[langCode];
      }
    }
    else{
      return undefined;
    }

  })

  const neoWordInput = ref<QInput>();
  const neoForeignWordInput = ref<QInput>();

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

    const translateCol = {
      name: 'translate',
      label: t('Collection.Word'),
      align: 'left' as "left",
      field: (row:TWord) => {return row.foreignWord},
      sortable: true
    };
    const transcriptionCol = {
      name: 'transcription',
      label: t('Collection.Transcription'),
      align: 'center' as "center",
      field: (row:TWord) => {return row.transcription},
    };
    const nameCol = {
      name: 'word',
      required: true,
      label: t('Collection.Translation'),
      align: 'right' as 'right',
      field: (row:TWord) => {return row.word},
      sortable: true
    };

    const settingsCol = {
      name: 'settings',
      label: '',
      field: '',
    }
    const cols:QTableProps['columns'] = [];
    cols.push(translateCol);
    if(user.value.displayTranscription){
      cols.push(transcriptionCol);
    }
    cols.push(nameCol);
    if(isEditMode.value || rows.value.length < 1){
      cols.push(settingsCol);
    }
    return cols;
  });

  const removeWord = (id:number) => {
    UI?.setLoading(true);
    UI?.removeWord(id).then(() => {
      $q.notify({
        type: 'positive',
        message: t('Messages.WordHasBeenRemoved'),
        position: "bottom"
      });
      UI?.setLoading(false);
    }).catch((e) => {
      UI?.setLoading(false);
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
        $q.notify({
          type: 'negative',
          message: t('Errors.CollectionDetailNotIsAllRight'),
          position: "bottom"
        });
        router.push({name: 'home'});
        return;
      }
      UI?.setLoading(false);
      UI?.getCollectionWords(currentCollectionId.value).then(() => {
        UI?.setLoading(false);
      }).catch((e) => {
        UI?.setLoading(false);
        $q.notify({
          type: 'negative',
          message: t('Errors.CollectionDetailErrorGetWords'),
          position: "bottom"
        });
        router.push({name: 'home'});
      })
    }
    if(!isAllRight){
      $q.notify({
        type: 'negative',
        message: t('Errors.CollectionDetailNotIsAllRight'),
        position: "bottom"
      });
      router.push({name: 'home'});
      return;
    }

    sadAnimal.value = getRandomSadPicture();

    if(appliedCollectionId.value > 0 && currentCollection.value?.id == appliedCollectionId.value){
      $q.dialog({
        title: t('AddCollection.Title'),
        message: t('Collection.CollectionHasBeenAdded'),
        cancel: false
      });
      UI?.clearSharedId();
    }
  })


  const getRandomSadPicture = () => {
    const arPhotos = ['sad-raccoon', 'sad2', 'sad3', 'sad4'];
    return arPhotos[Math.floor(Math.random()*arPhotos.length)];
  }

  const addNeoWord = () => {
    if(isLoading.value){
      return;
    }
    let isAllRight = true;
    if(neoWord.value.trim().length < 1){
      $q.notify({
        type: 'negative',
        message: t('Errors.WordCanNotBeEmpty'),
        position: "bottom"
      });
      neoWordHasError.value = true;
      isAllRight = false;
    }
    if(neoForeignWord.value.trim().length < 1){
      $q.notify({
        type: 'negative',
        message: t('Errors.TranscriptionCanNotBeEmpty'),
        position: "bottom"
      });
      neoForeignWordHasError.value = true;
      isAllRight = false;
    }
    if(neoWord.value.length > 254){
      $q.notify({
        type: 'negative',
        message: t('Collection.LongWord'),
        position: "bottom"
      });
      isAllRight = false;
      neoWordHasError.value = true;
    }
    if(neoTranscription.value.length > 254){
      $q.notify({
        type: 'negative',
        message: t('Collection.LongWord'),
        position: "bottom"
      });
      neoTranscriptionHasError.value = true;
      isAllRight = false;
    }
    if(neoForeignWord.value.length > 254){
      $q.notify({
        type: 'negative',
        message: t('Collection.LongWord'),
        position: "bottom"
      });
      neoForeignWordHasError.value = true;
      isAllRight = false;
    }

    setTimeout(() => {
      neoForeignWordHasError.value = false;
      neoWordHasError.value = false;
      neoTranscriptionHasError.value = false;
    },1000)

    if(!isAllRight){
      return;
    }

    UI?.setLoading(true);
    UI?.addWordToCollection(neoWord.value, neoTranscription.value, neoForeignWord.value, currentCollectionId.value)
        .then(() => {
          neoWord.value = '';
          neoTranscription.value = '';
          neoForeignWord.value = '';
          UI?.setLoading(false);
          neoForeignWordInput.value?.$el.querySelector('input').focus();
          $q.notify({
            type: 'positive',
            message: t('Messages.WordHasBeenAdded'),
            position: "bottom"
          })

        }).catch(() => {
          UI?.setLoading(false);
        });
  }

  const startTraining = () => {
    $q.dialog({
      component: ChooseTrainingDialog,
      componentProps: {
        collectionId: currentCollection.value?.id
      }
    });
  }

  const editCollection = () => {
    $q.dialog({
      component: EditCollectionDialog,
      componentProps: {
        collection: currentCollection.value
      },
    })
  }

  const doShareAction = () => {
    $q.dialog({
      component: ShareCollectionDialog,
      componentProps: {
        collection: currentCollection.value
      }
    });
  }

  onUnmounted(() => {

  });


</script>
<style lang="scss" scoped>
  .collection-title-block{
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 20px;
    justify-content: space-between;

    .collection-title{
      word-break: break-all;
    }
    .collection-actions{
      flex-shrink: 0;
    }
  }
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
      padding: 0 2px;
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

  .action-buttons{
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .bottom-row-items{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 2px;

    .item{
      flex-grow: 1;
    }

    .bottom-row-save{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex-basis: 50px;
    }
  }

  .examples{
    td{
      font-style: italic;
      color: $primary;
    }
  }
</style>