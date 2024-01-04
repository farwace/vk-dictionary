const { defineConfig } = require('@vue/cli-service')
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
