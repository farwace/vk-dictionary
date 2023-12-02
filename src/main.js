import { createApp } from 'vue'
import App from './App.vue'
import bridge from "@vkontakte/vk-bridge";

createApp(App).mount('#app');
bridge.send('VKWebAppInit');