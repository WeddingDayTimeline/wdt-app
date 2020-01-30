<template>
  <div id="dash-page-wrapper">
      Approved!
  </div>
</template>


<script>
// import onAuthStateChanged from '~/mixins/onAuthStateChanged.js'    //? MUST BE IMPORTED ON EVERY PAGE, THEN DECLARED AS MIXIN.
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import Logo from '~/components/Logo.vue'

export default {
  name: 'dash',
  components: {
    Logo
  },
  // mixins: [ onAuthStateChanged ],
  data() {
    return {
      Loaded: false,
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
