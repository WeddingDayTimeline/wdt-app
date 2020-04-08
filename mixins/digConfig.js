import appConfig from '~/appConfig.js'

export default {
  data() {
    return {
      appConfig: {}
    }
  },
  created() {
    this.appConfig = appConfig
  }
}
