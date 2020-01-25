<template>
  <div class="auth-page-cont">
    <h1>Auth</h1>
    <div id="firebaseui-auth-container"></div>
    <div id="loader">Loading...</div>
  </div>  
</template>

<script>
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  data() {
    return {
      FirebaseUIInit: false
    };
  }, /*
  watch: {
    GetFirebaseInit: function () {
      if (!this.FirebaseUIInit && this.GetFirebaseInit) {
        this.FirebaseUI()
      }
    }
  }, */
  computed: {
    ...mapGetters({
      GetFirebaseInit: 'getFirebaseInit'
    }),
  },
  methods: {
    FirebaseUI() {
      this.FirebaseUIInit = true
      const firebaseui = require('firebaseui')

      // FIREBASE-UI INIT
      const ui = new firebaseui.auth.AuthUI(firebase.auth())

      // FIREBASE-UI CONFIG
      const uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            console.log(true);
            return true;
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: '/legal',
        // Privacy policy url.
        privacyPolicyUrl: '/legal'
      }

      // FIREBASE-UI START
      ui.start('#firebaseui-auth-container', uiConfig)
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.GetFirebaseInit) {
        this.FirebaseUI()
      } else {
        console.log('nope');
      }
    }, 5000);

  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
