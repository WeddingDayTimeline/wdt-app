export default {
  mode: 'spa',
  vue: {
    config: {
      productionTip: false,
      devtools: process.env.NODE_ENV !== 'production'
    }
  },
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [
    '~assets/scss/main.scss',
    'material-icons/iconfont/material-icons.css'
    // '~assets/scss/webfonts.scss'
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    // { src: '~plugins/axiosInterceptors.js', ssr: false },    // KEEP FOR AXIOS CALL DEBUGGING
    { src: '~plugins/server.js', ssr: false },
    { src: '~plugins/client.js', ssr: false },
    { src: '~plugins/buefy.js', ssr: false },
    { src: '~plugins/veeValidate.js', ssr: false },
    { src: '~plugins/vueGlobalEvents.js', ssr: false },
    { src: '~plugins/vueMaterial.js', ssr: false },
    { src: '~plugins/vClickOutside.js', ssr: false }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxtjs/stylelint-module'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    '@nuxtjs/style-resources',
    'nuxt-webfontloader',
    // 'nuxt-buefy',
    'nuxt-fontawesome'
  ],
  /*
   ** Router & Middleware
   */
  router: {
    middleware: 'auth'
  },
  /*
   ** Server Middleware
   */
  serverMiddleware: ['~/serverMiddleware/index.js'],
  /*
   ** Files to watch for automatic server-reloading
   */
  watch: ['~/serverMiddleware/**/*.js'],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    browserBaseURL: '/'
  },
  /*
   ** Build configuration
   */
  /*
   ** Style Resources (Sass loader)
   */
  styleResources: {
    scss: ['~/assets/scss/non-compiling/_non-compiling.scss']
  },
  /*
   ** Stylelint Module
   */
  stylelint: {
    fix: true,
    lintDirtyModulesOnly: true
  },
  /*
   ** Web Font Loader
   */
  webfontloader: {
    google: {
      families: ['Roboto:300, 300i,400,500,600,700&display=swap']
    }
  },
  /*
   ** Fontawesome
   */
  fontawesome: {
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: ['fas']
      }
    ]
  },
  /*
   ** Nuxt Build
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    // Add exception
    transpile: ['vee-validate/dist/rules'],
    /*
     ** Babel
     */
    babel: {
      plugins: [
        '@babel/plugin-proposal-optional-chaining'
      ]
    },
    extend(config, ctx) {
      config.node = {
        fs: 'empty'
      }
    }
  }
}
