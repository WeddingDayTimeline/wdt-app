import hubConfig from '~/hubConfig.js'

export default {
  data() {
    return {
      HubConfig: {}
    }
  },
  created() {
    this.HubConfig = hubConfig
  }
}
