<template>
  <div class="page" :style="contentHeight">
    <q-scroll-area style="height: 100%">
      <div class="page-container">

        <div class="q-mb-md collection-title-block">
          <div class="collection-title">{{currentCollection?.name}}</div>
          <div class="collection-actions">
            <transition appear
                        enter-active-class="animated fadeInRight"
                        leave-active-class="animated fadeOutRight"
            >
              <q-btn v-if="isEditMode || rows.length < 1" size="sm" class="q-ml-sm" @click="editCollection">
                <q-icon name="mdi-text-box-edit-outline"/>
              </q-btn>
            </transition>
            <q-btn v-if="rows.length > 0" size="sm" class="q-ml-sm" @click="isEditMode = !isEditMode">
              <q-icon :name="editCollectionIcon"/>
            </q-btn>

          </div>
        </div>

        <q-table
            class="words-table"
            :class="{'edit-mode':isEditMode, 'read-mode':!isEditMode}"
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

          <template v-slot:body-cell="cellProps">
            <q-td
                @touchstart.stop="tryHandleRowHold($event, cellProps.row)"
                @touchend="stopTryingHandleRowHold"
                @touchmove="stopTryingHandleRowHold"
                @contextmenu.prevent.stop="handleRowHold($event, cellProps.row)"
                @click="toggleSelectedRow(cellProps.row.id)"
                :class="{selected: arSelectedProps.indexOf(cellProps.row.id) >= 0 || wordContextMenu?.word.id == cellProps.row.id}"
                :props="cellProps"
            >
              <div class="select-checkbox" v-if="isEditMode && cellProps.col.name == 'translate'">
                <q-checkbox v-model="arSelectedProps" :val="cellProps.row.id" />
              </div>
              <span>
                {{cellProps.value}}
              </span>
            </q-td>
          </template>

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
              <div class="action-buttons">
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

          <template v-slot:top-row>
            <tr class="examples" v-if="rows.length < 1 && currentCollectionExample">
              <td class="text-right">
                <div v-for="exWord in currentCollectionExample">
                  {{exWord.foreignWord}}
                </div>
              </td>
              <td class="text-center" v-if="user.displayTranscription">
                <div v-for="exWord in currentCollectionExample">
                  {{exWord.transcription}}
                </div>
              </td>
              <td class="text-left">
                <div v-for="exWord in currentCollectionExample">
                  {{exWord.word}}
                </div>
              </td>
            </tr>

            <tr class="add-word">
              <td :colspan="columns?.length">
                <div class="bottom-row-items">
                  <q-input
                      class="item"
                      @keydown.enter.stop="addNeoWord"
                      @change="tryTranslate"
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
                  <div class="position-relative item">
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
                    <div class="suggestion" v-if="(mayBeTranslate || isTranslateLoading) && neoWord.length < 1">
                      <div class="suggestion__item" @click="neoWord = mayBeTranslate" v-if="mayBeTranslate && !isTranslateLoading">
                        {{ mayBeTranslate }}
                      </div>
                      <div v-if="isTranslateLoading && !mayBeTranslate">
                        <q-icon name="mdi-loading mdi-spin"/>
                      </div>
                    </div>
                  </div>
                  <div class="bottom-row-save">
                    <q-btn size="sm" @click.prevent="addNeoWord" :class="{disabled:(neoWord.trim().length < 1 || neoWord.length > 254 || neoForeignWord.trim().length < 1 || neoForeignWord.length > 254 || neoTranscription.length > 254) || isLoading}">
                      <q-icon name="mdi-content-save" />
                    </q-btn>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </q-table>

        <transition appear
                    enter-active-class="animated fadeInRight"
                    leave-active-class="animated fadeOutRight"
        >
          <div v-if="isEditMode" class="context-many-items">
            <div class="text-right q-mb-sm">
              <span v-html="t('Collection.Selected')"></span> {{ arSelectedProps.length }} <span v-html="getNoun(arSelectedProps.length, t('Collection.WordsOne'), t('Collection.WordsTwo'), t('Collection.WordsFive'))"></span>
            </div>
            <div class="text-right">
              <q-btn :disable="arSelectedProps.length < 1" color="negative" size="sm" class="q-mb-sm" @click="tryRemoveSelectedWords()">
                <q-icon name="mdi-delete-forever-outline" class="q-mr-sm"/>
                <span v-html="t('Collection.Remove')"></span>
              </q-btn>
              <q-btn :disable="arSelectedProps.length < 1" size="sm" class="q-ml-sm q-mb-sm" @click="editWord()">
                <q-icon name="mdi-file-document-edit-outline" class="q-mr-sm"/>
                <span v-html="t('Collection.Edit')"></span>
              </q-btn>

              <q-btn size="sm" class="q-mb-sm q-ml-sm" @click="isEditMode = false;"><span v-html="t('Collection.Cancel')"></span></q-btn>
            </div>

          </div>
        </transition>

      </div>
    </q-scroll-area>

    <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut"
    >
      <div
          v-click-outside="clickWordContextOutside"
          class="word-context-menu"
          v-if="isWordContextShown && wordContextMenu"
          :style="'left: ' + (wordContextMenu?.left || 0) + 'px; top: ' + (wordContextMenu?.top || 0) + 'px'"
      >
        <div>
          <div class="word-context-menu__item" @click="startSelectionWord(wordContextMenu.word.id!)">
            <q-icon name="mdi-check-circle-outline" class="q-mr-md"/>
            <span v-html="t('Collection.Select')"></span>
          </div>
        </div>
        <div>
          <div class="word-context-menu__item" @click="editWord(wordContextMenu.word)">
            <q-icon name="mdi-pencil" class="q-mr-md"/>
            <span v-html="t('Collection.Edit')"></span>
          </div>
        </div>
        <div>
          <div class="word-context-menu__item text-negative" @click="tryRemoveSelectedWords(wordContextMenu.word.id!)">
            <q-icon name="mdi-delete-forever-outline" class="q-mr-md"/>
            <span v-html="t('Collection.Remove')"></span>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>
<script lang="ts" setup>
import {computed, inject, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
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
  import {IEventActions} from "@/classes/UI/Interfaces/IEventActions";
  import {ClickOutside} from "@/classes/UI/CompositionUtils/ClickOutside";

  const $q = useQuasar();

  const UI = inject<IUIActions>('UI');
  const TARGET_EVENTS = inject<IEventActions>('TARGET_EVENTS');


  const vClickOutside = ClickOutside;

  const filter = ref<string>('');

  const route = useRoute();
  const routeParams = ref(route.params);
  const router = useRouter();

  const isEditMode = ref<boolean>(false);

  const arSelectedProps = ref<number[]>([]);

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
  const mayBeTranslate = ref<string>();
  const isTranslateLoading = ref<boolean>(false);

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

  const wordContextMenu = ref<{left:number, top: number, word: TWord}>();
  const isWordContextShown = ref<boolean>(false);
  const canCloseWordContextShown = ref<boolean>(false);

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
      align: 'right' as "right",
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
      align: 'left' as 'left',
      field: (row:TWord) => {return row.word},
      sortable: true
    };

    const cols:QTableProps['columns'] = [];
    cols.push(translateCol);
    if(user.value.displayTranscription){
      cols.push(transcriptionCol);
    }
    cols.push(nameCol);
    return cols;
  });

  const editCollectionIcon = computed(() => {
    if(isEditMode.value == false){
      return 'mdi-pencil-remove';
    }
    return 'mdi-pencil';
  })

  const tryRemoveSelectedWords = (wordId?:number) => {
    isWordContextShown.value = false;
    $q.dialog({
      title: t('Collection.ConfirmRemoveWord'),
      message: t('Collection.ConfirmRemoveWordText'),
      cancel: true,
      ok: t('Collection.Remove')
    }).onOk(() => {
      removeWord(wordId);
    })
  }

  const removeWord = (id?:number) => {
    let ids:number|number[]|undefined = id;
    if(!ids){
      if(arSelectedProps.value.length < 1){
        return;
      }
      ids = arSelectedProps.value;
    }

    UI?.setLoading(true);
    UI?.removeWord(ids).then(() => {
      $q.notify({
        type: 'positive',
        message: t('Messages.WordHasBeenRemoved'),
        position: "bottom"
      });

      if(Array.isArray(ids)){
        arSelectedProps.value = [];
      }

      UI?.setLoading(false);
    }).catch((e) => {
      UI?.setLoading(false);
    });
  }

  const editWord = (word?:TWord) => {
    let arWords: TWord[] = [];
    isWordContextShown.value = false;
    if(word){
      arWords = [word];
    }
    else{
      if(arSelectedProps.value.length < 1){
        return;
      }
      arWords = rows.value.filter((w) => {
        return arSelectedProps.value.indexOf(w.id!) > -1;
      });
    }

    $q.dialog({
      component: EditWordDialog,
      componentProps: {
        words: arWords
      },
    }).onOk(() => {
      isEditMode.value = false;
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
        message: t('Errors.TranscriptionCanNotBeEmpty'),
        position: "bottom"
      });
      neoWordHasError.value = true;
      isAllRight = false;
    }
    if(neoForeignWord.value.trim().length < 1){
      $q.notify({
        type: 'negative',
        message: t('Errors.WordCanNotBeEmpty'),
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

    clearTranslateHelp();

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
          });
          TARGET_EVENTS?.sendEvent('AddedNeoWord');
          UI?.vibro();
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

  const toggleSelectedRow = (wordId:number) => {
    if(!isEditMode.value){
      return;
    }
    if(arSelectedProps.value.indexOf(wordId) == -1){
      arSelectedProps.value.push(wordId);
    }
    else{
      arSelectedProps.value = arSelectedProps.value.filter((val) => {
        return val != wordId;
      })
    }
  }

  watch(isEditMode, (neoVal) => {
    if(!neoVal){
      blockedHandleRowHold = false;
      arSelectedProps.value = [];
      wordContextMenu.value = undefined;
    }
    else{
      blockedHandleRowHold = true;
    }
  })

  const getNoun = (number:number, one:string, two:string, five:string) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return five;
  }

  let blockedHandleRowHold = false;
  const handleRowHold = (event:any, word: TWord) => {
    if(blockedHandleRowHold){
      return;
    }
    blockedHandleRowHold = true;
    setTimeout(() => {
      blockedHandleRowHold = false;
    }, 100)
    //console.log(event);
    canCloseWordContextShown.value = false; //todo: повторное открытие меню не закрывать!
    UI?.vibro();
    let pos:{x:number, y:number} = {x:0, y:0};
    if(event.clientX && event.clientY){
      pos.x = event.clientX;
      pos.y = event.clientY;
    }
    if(event.pageX && event.pageY){
      pos.x = event.pageX;
      pos.y = event.pageY;
    }

    if(event?.pointerType != 'mouse'){
      pos.x -= 50;
      pos.y -= 170;
    }


    if(pos.x && pos.y){
      wordContextMenu.value = {
        left: pos.x,
        top: pos.y,
        word: word
      }
      isWordContextShown.value = true;
    }

  }

  const clickWordContextOutside = (ev: any, el:any) => {
    if(canCloseWordContextShown.value || (ev && ev.pointerType && ev.pointerType == 'mouse')){
      isWordContextShown.value = false;
    }
  }


  let mobileTouchTimer:number = 0;
  const tryHandleRowHold = (event:any, word: TWord) => {
    if(isEditMode.value){
      return;
    }

    mobileTouchTimer = setTimeout(() => {
      handleRowHold(event, word);
      mobileTouchTimer = 0;
    }, 500)
  }

  const stopTryingHandleRowHold = () => {
    if(mobileTouchTimer > 0){
      clearTimeout(mobileTouchTimer);
      setTimeout(() => {
        canCloseWordContextShown.value = true;
        isWordContextShown.value = false;
      }, 100)
    }

  }

  const startSelectionWord = (wordId:number) => {
    isEditMode.value = true;
    toggleSelectedRow(wordId);
    isWordContextShown.value = false;
  }

  onUnmounted(() => {

  });

  const tryTranslate = () => {
    clearTranslateHelp();
    isTranslateLoading.value = true;
    UI?.tryTranslate(neoForeignWord.value).then((res) => {
      isTranslateLoading.value = false;
      if(res){
        mayBeTranslate.value = res;
      }
      else{
        clearTranslateHelp();
      }
    }).catch((e) => {
      isTranslateLoading.value = false;
      clearTranslateHelp();
    })
  }

  const clearTranslateHelp = () => {
    mayBeTranslate.value = undefined;
  }


</script>
<style lang="scss" scoped>
  .collection-title-block{
    padding-left: 20px;
    padding-right: 20px;
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

  :deep(.q-table) {

    tr.add-word{
      td{
        padding-left: 5px;
        padding-right: 5px;
      }
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

      .q-btn{
        height: 30px;
      }
    }
  }

  .examples{
    td{
      font-style: italic;
      color: $primary;
    }
  }

  .page-container{
    padding-left: 0;
    padding-right: 0;
  }

  .select-checkbox{
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .context-many-items{
    position: fixed;
    box-shadow: 0 0 10px rgba(0,0,0,.1);
    border-radius: 12px;
    padding: 6px 16px;
    font-size: .875rem;
    right: 10px;
    bottom: 40px;
    max-width: calc(100% - 20px);
  }
  .edit-mode{
    margin-bottom: 100px;

    :deep(.q-table){
      tbody{
        tr{
          td{
            cursor: pointer;
          }
        }
        tr.add-word{
          td{
            cursor: auto;
          }
        }
      }
    }
  }

  :deep(.read-mode){
    tbody{
      td{
        @media (pointer: coarse) {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      }
    }

  }

  .word-context-menu{
    position: fixed;
    z-index: 50;
    border-radius: 12px;
    padding: 6px;
    width: 150px;
    height: 136px;
    box-shadow: 0 0 10px rgba(0,0,0,.1);

    &__item{
      cursor:pointer;
      margin-bottom: 3px;
      font-size: 1.1rem;
      padding: 6px 4px;
      border-radius: 4px;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      i{
        flex-shrink: 0;
      }
      span{
        flex-shrink: 0;
        flex-grow: 1;
      }
    }
  }

  .suggestion{
    position: absolute;
    left: 0;
    z-index: 5;
    width: 100%;
    top: 100%;
    border-radius: 12px;
    padding: 8px 6px;
    font-size: .875rem;
    word-break: break-all;
    line-height: 120%;
    margin-top: 2px;
    box-shadow: 0 0 10px rgba(0,0,0,.1);

    &__item{
      padding: 4px 10px;
      cursor: pointer;
      border-radius: 4px;

    }
  }

</style>