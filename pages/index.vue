<template>
  <div id="auth-page-wrapper">
    <vs-progress class="progress" v-if="Loading || Thinking" indeterminate :height="3" color="primary"></vs-progress>
    <vs-card id="auth-card">
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
      <div id="input-cont" :class="Loading ? 'mostly-hidden' : ''">
        <div id="input-cont-inner">
          <vs-input class="input" icon-no-border icon="email" :placeholder="SignInMode ? 'Email' : 'Choose an email'" type="email" v-model="Input.Email" autofocus="true" :readonly="DisableFields"/>
          <p v-if="ForgotMode && !ResetPasswordBtnClicked" class="reset-instructions">Please enter the email associated with your account.</p>
          <p v-if="ForgotMode && ResetPasswordBtnClicked" class="reset-instructions">Success! Please check your email for your password reset link.</p>
          <vs-input :class="ForgotMode ? 'no-click hide' : ''" class="input" icon-no-border icon="lock" :placeholder="SignInMode ? 'Password' : 'Create a password'" type="password" v-model="Input.Password" :readonly="DisableFields"/>
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
          <vs-button v-if="ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="ResetPassword()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">{{ SubmitBtnColor !== 'success' ? 'Reset Password' : 'Email Sent' }}</vs-button>
          <div id="google-option-cont">
            <div class="or-cont"><hr><span class="or">or</span><hr></div>
            <vs-button v-if="!ForgotMode" class="google-signin-btn full-width-button" color="#4285F4" type="flat" :disabled="SubmitBtnDisabled">
              <div class="google-logo"></div>
              Sign in with Google
            </vs-button>
          </div>
          <div v-if="!PasswordResetEmailSent" id="bottom">
            {{ SignInMode ? 'Need an account? ' : 'Have an account? ' }}<a :class="SignInMode ? '' : 'primary'" @click="SignUpMode()">{{ SignInMode ? 'Sign up' : 'Sign in' }}</a>
          </div>
          <div v-else id="bottom">
            <a class="primary" @click="SignUpMode('signIn')">Sign in</a>
          </div>
        </div>
      </div>
    </vs-card>
    <GlobalEvents @keyup.enter="OnKeyUpEnter()"></GlobalEvents>
  </div>
</template>


<script>
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import Logo from '~/components/Logo.vue'

export default {
  name: 'auth',
  components: {
    Logo
  },
  data() {
    return {
      Loading: true,
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
      ResetPasswordBtnClicked: false,
      PasswordResetEmailSent: false,
      DisableFields: false
    };
  },
  computed: {
    ...mapGetters({
      // GetFirebaseInit: 'getFirebaseInit',
    })
  },
  methods: {
    SignIn() {
      console.log('SignIn()');
      let vm = this;
      
      this.Thinking = true;
      this.SubmitBtnDisabled = true;
      this.DisableFields = true;
      this.Error.Active ? this.Error.Active = false : null;
      firebase.auth().signInWithEmailAndPassword(this.Input.Email, this.Input.Password)
      .then(function(response) {
        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        vm.GoodToGo()
      })
      .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        vm.SubmitBtnTempColor('warning');
        vm.SubmitBtnDisabled = false;
        vm.DisableFields = false;
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
      this.DisableFields = true;
      this.Error.Active ? this.Error.Active = false : null;
      let vm = this;
      
      firebase.auth().createUserWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
      .then(function(response) {
        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        vm.SubmitBtnColor = 'success';
        vm.GoodToGo()
        // ...
      })
      .catch(function(error) {
        // Handle Errors here.
        vm.DisableFields = false;
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
    SignUpMode(toMode = null) {
      this.Input.Email = '';
      this.Input.Password = '';

      if (toMode === null) {
        if (this.SignInMode) {
          this.SignInMode = false;
        } else {
          this.SignInMode = true
        }
      } else if (toMode === 'signIn') {
        this.SignInMode = true;
        this.SubmitBtnColor = 'primary';
        this.PasswordResetEmailSent = false;
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
      this.DisableFields = true;
      this.Error.Active ? this.Error.Active = false : null;
      let vm = this;

      firebase.auth().sendPasswordResetEmail(vm.Input.Email)
      .then(function() {
        // Email sent.
        vm.SubmitBtnColor = 'success';

        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        vm.PasswordResetEmailSent = true;
      }).catch(function(error) {
        // An error happened.
        vm.DisableFields = false;
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
    },
    GoodToGo() {
      console.log('----- Good to go!');
    }
  },
  mounted() {
    let vm = this;
    firebase.auth().onAuthStateChanged(function(user) {
        console.log('onAuthStateChanged()');
        if (user) {
          // User is signed in.
          console.log('signed in!');
          vm.$root.context.redirect('/dash')
        } else {
          // User is signed out.
          vm.Loading = false
        }
    })
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

.mostly-hidden {
  opacity: .1;
}

#auth-card {
  width: 22rem;
  max-width: 100%;
  height: auto;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
  cursor: default;
}

#logo-cont {
  display: flex;
  justify-content: center;
  margin: 4rem 0;
}

#logo {
  font-size: 2rem;
  color: material-color('blue-grey', '200');
  cursor: default;
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

#google-option-cont {
  display: flex;
  flex-direction: column;
  width: auto;
  margin: 1.2rem 0 0;
}

#google-option-cont .or-cont{
  display: flex;
  width: 200px;
  margin: 0 0 .333rem;
}

#google-option-cont hr {
  flex: 1;
  background-color: transparent;
  border-bottom: 1px solid material-color('blue-grey', '100');
  border-top: none;
  border-right: none;
  border-left: none;
}

#google-option-cont .or{
  margin: -.5rem .666rem 0;
  color: material-color('blue-grey', '200');
  cursor: default;
}

#bottom {
  margin-top: 4rem;
  color: material-color('blue-grey', '300');
  cursor: default;
}

#bottom a {
  margin: 0 0 0 .2rem;
  color: material-color('blue-grey', '300');
  cursor: pointer;
}

#bottom a:hover {
  color: $primary;
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
