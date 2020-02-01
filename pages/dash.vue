<template>
  <div id="dash-page-wrapper">
      stuff<br>
      <button @click="LogOut()">Log out</button>
  </div>
</template>


<script>
// import onAuthStateChanged from '~/mixins/onAuthStateChanged.js'    //? MUST BE IMPORTED ON EVERY PAGE, THEN DECLARED AS MIXIN.
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
