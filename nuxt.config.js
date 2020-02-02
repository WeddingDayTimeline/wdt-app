
export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
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
    'material-icons/iconfont/material-icons.css',
    // '~assets/scss/webfonts.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    // { src: '~plugins/axiosInterceptors.js', ssr: false },    // KEEP FOR AXIOS CALL DEBUGGING
    { src: '~plugins/veeValidate.js', ssr: false },
    { src: '~plugins/vuesax.js', ssr: false },
    { src: '~plugins/vueGlobalEvents.js', ssr: false },
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
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
  serverMiddleware: [
    '~/api/index.js',
  ],

  /*
  ** Files to watch for automatic server-reloading
  */
  watch: ['~/api/**/*.js'],

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
    scss: [
      '~/assets/scss/non-compiling/_non-compiling.scss',
    ]
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
** Nuxt Build
*/
  build: {
    /*
    ** You can extend webpack config here
    */
    // Add exception
    transpile: [
      "vee-validate/dist/rules"
    ],
    extend (config, ctx) {
      config.node = {
        fs: "empty"
      }
    }
  }
}
