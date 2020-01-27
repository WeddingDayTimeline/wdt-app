<template>
  <div id="auth-page-wrapper">
    <vs-progress class="progress" v-if="!Loaded || Thinking" indeterminate :height="3" color="primary"></vs-progress>
    <vs-card v-if="GetFirebaseInit" id="auth-card" :class="Loaded ? '' : 'loading'">
      <div v-if="!ForgotMode" id="auth-card-header" slot="header">
        {{ SignInMode ? 'Sign In' : 'Sign Up' }}
      </div>
      <div v-if="ForgotMode" id="auth-card-header" slot="header">
        Reset Password
      </div>
      <div id="logo-cont">
        <div id="logo">
          DIG hub
        </div>
      </div>
      <div id="input-cont">
        <div id="input-cont-inner">
          <vs-input class="input" icon-no-border icon="email" :placeholder="SignInMode ? 'Email' : 'Choose an email'" type="email" v-model="Input.Email"/>
          <p v-if="ForgotMode && !ResetPasswordBtnClicked" class="reset-instructions">Please enter the email associated with your account.</p>
          <vs-input :class="ForgotMode ? 'no-click hide' : ''" class="input" icon-no-border icon="lock" :placeholder="SignInMode ? 'Password' : 'Create a password'" type="password" v-model="Input.Password"/>
          <a class="forgot forgot-password" :class="!SignInMode || Error.Active || ForgotMode ? 'no-click hide' : ''" @click="ForgotPassword()">Forgot password?</a>
          <vs-alert v-if="Error.Active" class="error" active="true" color="danger" icon="erroroutline" >
            {{ Error.Text }}
            <span v-if="Error.Type === 0 || Error.Type === 3">
              <br>
              <a class="forgot" @click="ForgotPassword()">Forgot your password?</a>
            </span>
          </vs-alert>
          <vs-button v-if="SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="SignIn()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">Sign in</vs-button>
          <vs-button v-if="!SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="SignUp()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">Create Account</vs-button>
          <vs-button v-if="ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="ResetPassword()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">Reset Password</vs-button>
          <div id="bottom">
            {{ SignInMode ? 'Need an account? ' : 'Have an account? ' }}<a :class="SignInMode ? '' : 'primary'" @click="SignUpMode()">{{ SignInMode ? 'Sign up' : 'Sign in' }}</a>
          </div>
        </div>
      </div>
    </vs-card>
    <GlobalEvents @keyup.enter="OnKeyUpEnter()"></GlobalEvents>
  </div>
</template>


<script>
import onAuthStateChanged from '~/mixins/onAuthStateChanged.js'    //? MUST BE IMPORTED ON EVERY PAGE, THEN DECLARED AS MIXIN.
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  mixins: [ onAuthStateChanged ],
  data() {
    return {
      Loaded: false,
      Thinking: false,
      FirebaseUIInit: false,
      SignInMode: true,
      ForgotMode: false,
      Input: {
        Email: '',
        Password: ''
      },
      Options: {
        RememberMe: false
      },
      Error: {
        Active: false,
        Type: 0,
        Text: '',
      },
      SubmitBtnColor: 'primary',
      SubmitBtnDisabled: false,
      ResetPasswordBtnClicked: false
    };
  },
  watch: {
    GetFirebaseInit: function () {
      if (this.GetFirebaseInit) {
        this.Loaded = true;
      }
    },
    GetAuthState: function () {
      this.Thinking = false;
    }
  },
  computed: {
    ...mapGetters({
      GetFirebaseInit: 'getFirebaseInit',
      GetAuthState: 'getAuthState'
    })
  },
  methods: {
    SignIn() {
      console.log('SignIn()');
      let vm = this;
      
      this.Thinking = true;
      this.SubmitBtnDisabled = true;
      this.Error.Active ? this.Error.Active = false : null;
      firebase.auth().signInWithEmailAndPassword(this.Input.Email, this.Input.Password)
      .then(function(response) {
        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
      })
      .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        vm.SubmitBtnTempColor('warning');
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;

        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/user-disabled') {
          vm.Error = { Active: true, Type: 0, Text: 'Incorrect email or password.' }
        } else if (errorCode === 'auth/invalid-email') {
          vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
        }
        // ...
      });
    },
    SignUp() {
      console.log('SignUp()');
      this.Thinking = true;
      this.SubmitBtnDisabled = true;
      this.Error.Active ? this.Error.Active = false : null;
      let vm = this;
      
      firebase.auth().createUserWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
      .then(function(response) {
        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        vm.SubmitBtnColor = 'success';
        // ...
      })
      .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/email-already-in-use') {
          vm.Error = { Active: true, Type: 3, Text: `Looks like this email is already associated with an active account.` }
        } else if (errorCode === 'auth/invalid-email') {
          vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
        } else {
          console.log('errorCode:', errorCode, ' errorMessage:', errorMessage);
        }

        vm.SubmitBtnTempColor('warning');
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        // ...
      });
    },
    SignUpMode() {
      this.Input.Email = '';
      this.Input.Password = '';

      if (this.SignInMode) {
        this.SignInMode = false;
      } else {
        this.SignInMode = true
      }

      this.ForgotMode = false;
      this.Error.Active ? this.Error.Active = false : null
    },
    ForgotPassword() {
      this.ForgotMode = true;
      this.SignInMode = true;
      this.ResetPasswordBtnClicked === true ? this.ResetPasswordBtnClicked = false : null;
      this.Error.Active ? this.Error.Active = false : null;
    },
    ResetPassword() {
      this.Thinking = true;
      this.ResetPasswordBtnClicked = true;
      this.SubmitBtnDisabled = true;
      this.Error.Active ? this.Error.Active = false : null;
      let vm = this;

      firebase.auth().sendPasswordResetEmail(vm.Input.Email)
      .then(function() {
        // Email sent.
        vm.SubmitBtnColor = 'success';

        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
      }).catch(function(error) {
        // An error happened.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/user-not-found') {
          vm.Error = { Active: true, Type: 2, Text: `We couldn't find an accout associated with this email. Please try again.` }
        } else if (errorCode === 'auth/invalid-email') {
          vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
        } else {
          console.log('errorCode:', errorCode, ' errorMessage:', errorMessage);
        }

        vm.SubmitBtnTempColor('warning');
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
      });
    },
    SubmitBtnTempColor(color) {
      this.SubmitBtnColor = color;
      setTimeout(() => {
        this.SubmitBtnColor = 'primary';
      }, 4500);
    },
    OnKeyUpEnter() {
      if (this.SignInMode && !this.ForgotMode) {
        this.SignIn()
      } else if (!this.SignInMode && !this.ForgotMode) {
        this.SignUp()
      } else if (this.ForgotMode) {
        this.ResetPassword()
      }
    }
  },
  mounted() {

    if (this.GetFirebaseInit) {
      this.Loaded = true;
    }

    // firebase.auth().signOut()

  }
}
</script>


<style scoped lang="scss">

#auth-page-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress {
  width: calc(22rem - .5rem);
  margin-bottom: -3px;
}

.loading #auth-card-header, .loading #input-cont, .loading #input-cont * {
  opacity: 0;
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

.forgot {
  cursor: pointer;
}

.forgot-password {
  align-self: flex-end;
  margin-top: -.5rem;
  color: $primary;
}

.check.remember-me, .forgot-password {
  font-size: .75rem;
}

.submit-btn {
  margin: 2.5rem 0 .5rem;
}

#bottom {
  margin-top: 4rem;
  color: material-color('blue-grey', '300');
}

#bottom a {
  color: material-color('blue-grey', '500');
  cursor: pointer;
}

#bottom a.primary, .error span {
  color: $primary;
}

.error {
  max-width: 220px;
  height: min-content !important;
}

.error * {
  line-height: 1.333rem;
}

.reset-instructions {
  max-width: 200px;
  color: material-color('blue-grey', '500');
}


</style>


<style lang="scss">

</style>
