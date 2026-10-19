const { defineConfig } = require('@vue/cli-service')

// Vue CLI успевает загрузить .env* до чтения этого файла, поэтому проверка работает.
// Ломаем сборку вместо тихого дефолта в SystemActions.ts: иначе можно собрать и выложить
// бандл, который с нового домена бьёт в боевой бэкенд (или наоборот).
if (process.env.NODE_ENV === 'production') {
  const apiUrl = process.env.VUE_APP_API_URL
  if (!apiUrl) {
    throw new Error(
      'VUE_APP_API_URL не задан. Положите его в .env.production или соберите явно: ' +
      'VUE_APP_API_URL=https://api.example.com/api/ npm run build'
    )
  }
  if (!/\/$/.test(apiUrl)) {
    throw new Error('VUE_APP_API_URL должен заканчиваться на /api/ (запрос = API_URL + "getUserInfo"): ' + apiUrl)
  }
}

module.exports = defineConfig({
  transpileDependencies: [
    'quasar'
  ],

  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT,
    https: true, //todo dev false для мобильных
    webSocketServer: false,
  },

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  }
})
