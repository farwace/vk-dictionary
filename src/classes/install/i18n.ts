import {createI18n} from "vue-i18n";
import ru from '@/lang/ru.json';
import en from '@/lang/en.json';

const urlParams = new URLSearchParams(window.location.search);
let lang = urlParams.get('vk_language')||'ru';

if(lang in ['en', 'be', 'pt', 'es']){lang = 'en';}
else{lang = 'ru'}

export default createI18n({
    locale: lang,
    fallbackLocale: lang,
    messages: {
        en: en,
        ru: ru
    },
    legacy: false,
})