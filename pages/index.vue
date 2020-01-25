<template>
  <div id="auth-page-wrapper">
    <vs-card id="auth-card">
      <div id="auth-card-header" slot="header">
        Sign In
      </div>
      <div id="logo-cont">
        <div id="logo">
          DIG hub
        </div>
      </div>
      <div id="input-cont">
        <div id="input-cont-inner">
          <vs-input class="input" icon-no-border icon="email" placeholder="Email" type="email" v-model="Input.Email"/>
          <vs-input class="input" icon-no-border icon="lock" placeholder="Password" type="password" v-model="Input.Password"/>
          <!-- <vs-checkbox class="check check-mini remember-me" v-model="Options.RememberMe">Keep me signed in</vs-checkbox> -->
          <a class="forgot-password" href="">Forgot password?</a>
          <vs-button id="sign-in-btn" class="full-width-button" type="relief" @click="SignIn()">Sign in</vs-button>
          <div id="bottom">
            Need an account? <a @click="SignUpMode()">Sign up</a>
          </div>
        </div>
      </div>
    </vs-card>
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
      FirebaseUIInit: false,
      Mode: 'signin',
      Input: {
        Email: '',
        Password: ''
      },
      Options: {
        RememberMe: false
      }
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
    SignIn() {
      console.log('SignIn()');
      
      firebase.auth().signInWithEmailAndPassword(this.Input.Email, this.Input.Password)
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
    },
    SignUpMode() {
      this.Mode = 'signup'
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.GetFirebaseInit) {
        // this.FirebaseUI()
      } else {
        console.log('nope');
      }
    }, 5000);

    firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log('signed in!');
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // ...
    } else {
      console.log('not signed in.');
      // User is signed out.
      // ...
    }
  });

  }
}
</script>


<style scoped lang="scss">

#auth-page-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#auth-card {
  width: 22rem;
  max-width: 100%;
  height: auto;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
}

#logo-cont {
  display: flex;
  justify-content: center;
  margin: 4rem 0;
}

#logo {
  font-size: 2rem;
  color: material-color('blue-grey', '200');
}

#input-cont, #input-cont-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input {
  margin-bottom: 1rem;
}

.check.remember-me {
  align-self: flex-start;
  color: material-color('blue-grey', '300');
}

.forgot-password {
  align-self: flex-end;
  margin-top: -.5rem;
  color: $primary;
}

.check.remember-me, .forgot-password {
  font-size: .75rem;
}

#sign-in-btn {
  margin: 2.5rem 0 .5rem;
}

#bottom {
  margin-top: 4rem;
  color: material-color('blue-grey', '300');
}

#bottom a {
  color: material-color('blue-grey', '500');
}

</style>


<style lang="scss">

</style>
