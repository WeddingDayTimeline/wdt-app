<template>
  <div id="dash-page-wrapper">
    <div v-if="this.$route.query.success === 'true' && !this.$route.query.alreadyApproved" class="success">
      Success!<br><br>
      {{ this.$route.query.email }} has been approved!<br><br>
      You can now close this window.
    </div>
    <div v-if="this.$route.query.success === 'true' && this.$route.query.alreadyApproved" class="success">
      It looks like {{ this.$route.query.email }} has already been approved for your app.<br><br>
      You may now close this window.
    </div>
    <div v-if="this.$route.query.success === 'false'" class="error">
      Oops...<br><br>
      It looks like there was an issue approving {{ (this.$route.query.email ? (this.$route.query.email + ' for your app.') : 'this user for your app.') }}<br><br>
      If you need further help, please don't hesitate to contact Dolan Internet Group for support.<br><br>
      <a :href="'mailto:' + DigConfig.dig.supportEmail">{{ DigConfig.dig.supportEmail }}</a><br>
      <a :href="FormatPhone('link', DigConfig.dig.supportPhone)">{{ FormatPhone('display', DigConfig.dig.supportPhone) }}</a>
    </div>
  </div>
</template>


<script>
// import onAuthStateChanged from '~/mixins/onAuthStateChanged.js'    //? MUST BE IMPORTED ON EVERY PAGE, THEN DECLARED AS MIXIN.
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import Logo from '~/components/Logo.vue'
import digConfig from '~/digConfig.js'
import formatPhone from '~/util/formatPhone.js'

export default {
  name: 'dash',
  components: {
    Logo
  },
  // mixins: [ onAuthStateChanged ],
  data() {
    return {
      Loaded: false,
      DigConfig: digConfig,
      FormatPhone: formatPhone
    };
  },
  computed: {
    ...mapGetters({
      // GetFirebaseInit: 'getFirebaseInit',
    })
  },
  methods: {
      LogOut() {
        setTimeout(() => {
            firebase.auth().signOut()
        }, 2000)
      }
  },
  mounted() {
  }
}
</script>


<style scoped lang="scss">


</style>


<style lang="scss">

</style>
