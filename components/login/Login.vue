<template>
  <div id="login-card-wrapper">
    <vs-progress class="progress" v-if="Loading || status.thinking" indeterminate :height="3" color="primary"></vs-progress>
    <div id="auth-card" class="card">
      <header id="auth-card-header" class="card-header">
        <b-message :active="ReauthQuery">
          Please confirm your password to continue.
        </b-message>
        <p v-if="!ReauthQuery" class="card-header-title">{{ ForgotMode ? 'Reset Password' : HeaderCopy }}</p>
      </header>
      <div id="logo-cont">
        <div id="logo">
          DIG hub
        </div>
      </div>
      <div id="input-cont" class="card-content" :class="Loading ? 'mostly-hidden' : ''">
        <ValidationObserver ref="SignUpInObserver" tag="div" v-slot="{ invalid }" slim>
          <div id="input-cont-inner" class="content" :class="ForgotMode ? 'forgot' : ''">
            <ValidationProvider class="input-validation-provider" rules="email" mode="lazy" v-slot="{ errors }" ref="EmailValidation">
              <b-field
                :message="errors[0]"
              >
                <b-input class="input" icon="envelope" :placeholder="SignInMode ? 'Email' : 'Choose an email'" type="email" v-model="Input.Email" autofocus="true" :readonly="status.disableFields || ReauthQuery"/>
              </b-field>
            </ValidationProvider>
            <p v-if="ForgotMode && !ResetPasswordBtnClicked" class="reset-instructions">Please enter the email associated with your account.</p>
            <p v-if="ForgotMode && ResetPasswordBtnClicked" class="reset-instructions">Success! Please check your email for your password reset link.</p>
            <ValidationProvider class="input-validation-provider" rules="alpha_dash|min:8" v-slot="{ errors }" ref="PasswordValidation">
              <b-field
                :message="errors[0]"
              >
                <b-input :class="ForgotMode ? 'no-click hide' : ''" class="input" icon="unlock-alt" :placeholder="SignInMode ? 'Password' : 'Create a password'" type="password" password-reveal v-model="Input.Password" :readonly="status.disableFields" />
              </b-field>
            </ValidationProvider>
            <a class="forgot forgot-password" :class="!SignInMode || status.error.active || ForgotMode ? 'no-click hide' : ''" @click="ForgotPassword()">Forgot password?</a>
            <b-message v-if="status.error.active" type="is-danger" size="is-small" has-icon>
              {{ status.error.text }}
              <span v-if="status.error.type === 0 || status.error.type === 3">
                <br>
                <a class="forgot" @click="ForgotPassword()">Forgot your password?</a>
              </span>
            </b-message>
            <b-button v-if="SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="status.submitBtnColor === 'is-success' ? 'no-click' : ''" :type="status.submitBtnColor" @click="SignIn()" :icon-left="status.submitBtnColor === 'is-success' ? 'check' : ''" :disabled="status.submitBtnDisabled">{{ status.submitBtnColor === 'is-success' ? '' : 'Sign in' }}</b-button>
            <b-button v-if="!SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="status.submitBtnColor === 'is-success' ? 'no-click' : ''" :type="status.submitBtnColor" @click="SignUp()" :icon-left="status.submitBtnColor === 'is-success' ? 'check' : ''" :disabled="status.submitBtnDisabled">{{ status.submitBtnColor === 'is-success' ? '' : 'Create Account' }}</b-button>
            <b-button v-if="ForgotMode" class="submit-btn full-width-button" :class="status.submitBtnColor === 'is-success' ? 'no-click' : ''" :type="status.submitBtnColor" @click="ResetPassword()" :icon-left="status.submitBtnColor === 'is-success' ? 'check' : ''" :disabled="status.submitBtnDisabled">{{ status.submitBtnColor !== 'is-success' ? 'Reset Password' : 'Email Sent' }}</b-button>
            <div v-if="!ForgotMode" id="google-option-cont">
              <div class="or-cont"><hr><span class="or">or</span><hr></div>
              <b-button class="google-signin-btn full-width-button" type="is-google" inverted @click="signInWithGoogle()" :disabled="status.submitBtnDisabled">
                <div class="google-logo"></div>
                Sign in with Google
              </b-button>
            </div>
            <div v-if="!ReauthQuery || (ReauthQuery && ForgotMode)" id="bottom" :class="ForgotMode ? 'forgot' : ''">
              <div v-if="!PasswordResetEmailSent && !status.justSignedUp" id="bottom-inner">
                {{ BottomCopy.One }}<a :class="SignInMode ? '' : 'primary'" @click="SignUpMode()">{{ BottomCopy.Two }}</a>
              </div>
              <div v-else id="bottom-inner">
                <a class="primary" @click="SignUpMode('signIn')">Sign in</a>
              </div>
            </div>
          </div>
        </ValidationObserver>
      </div>
    </div>
    <GlobalEvents @keyup.enter="OnKeyUpEnter()"></GlobalEvents>
  </div>
</template>


<script>
import {mapGetters, mapActions} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'
import Logo from '~/components/Logo.vue'
import { ValidationProvider, ValidationObserver } from 'vee-validate';

export default {
  name: 'auth',
  components: {
    Logo,
    ValidationProvider,
    ValidationObserver
  },
  data() {
    return {
      Loading: true,
      FirebaseUIInit: false,
      SignInMode: true,
      ForgotMode: false,
      Input: {
        Email: '',
        Password: ''
      },
      ResetPasswordBtnClicked: false,
      PasswordResetEmailSent: false,
      ReauthQuery: false,
    };
  },
  computed: {...mapGetters({
      status: 'auth/getStatus',
    }),
    HeaderCopy() {
        return this.SignInMode ? 'Sign In' : 'Sign Up'
    },
    BottomCopy() {
      if (this.ReauthQuery) {
        return { One: '', Two: 'Back' }
      } else if (this.SignInMode) {
        return { One: 'Need an account? ', Two: 'Sign up' }
      } else {
        return { One: 'Have an account? ', Two: 'Sign in' }
      }
    }
  },
  methods: {
    ...mapActions('auth', ['signUp', 'signIn', 'signInWithGoogle', 'resetPassword', 'hasOnboarded', 'checkIfOnboarded']),
    async SignIn() {
      // CHECK IF FIELDS ARE VALID, USING this.$refs.SignUpInObserver.validate() ASYNC METHOD
      const valid = await this.$refs.SignUpInObserver.validate()

      if (valid) {
        this.signIn({
          reauthQuery: vm.ReauthQuery,
          email: vm.Input.Email,
          password: vm.Input.Password
        })
      }
    },
    async SignUp() {
      // CHECK IF FIELDS ARE VALID, USING this.$refs.SignUpInObserver.validate() ASYNC METHOD
      const valid = await this.$refs.SignUpInObserver.validate()

      if (valid) {
        this.signUp({
          email: this.Input.Email, 
          password: this.Input.Password
        })
      }
    },
    SignUpMode(toMode = null) {
      // CHANGE SIGNIN MODE (SIGN-IN OR SIGN-UP)
      this.Input.Email = '';
      this.Input.Password = '';

      if (toMode === null && !this.ReauthQuery) {
        if (this.SignInMode) {
          this.SignInMode = false;
        } else {
          this.SignInMode = true
        }
      } else if (toMode === 'signIn' || this.ReauthQuery) {
        // PREPARE UI
        this.SignInMode = true;
        this.$store.commit('auth/UPDATE_STATUS', {
          status: {
            submitBtnColor: 'is-primary'
          }
        })
        this.PasswordResetEmailSent = false;
      }

      // CLEAN UP UI
      this.ForgotMode = false;
      this.$store.commit('auth/UPDATE_STATUS', {
        status: {},
        error: {
          active: false
        }
      })
    },
    ForgotPassword() {
      // ON 'Forgot Password' LINK CLICK
      this.ForgotMode = true;
      this.SignInMode = true;
      this.ResetPasswordBtnClicked === true ? this.ResetPasswordBtnClicked = false : null;
      this.$store.commit('auth/UPDATE_STATUS', {
        status: {},
        error: {
          active: false
        }
      })
    },
    async ResetPassword() {
      // CHECK IF FIELDS ARE VALID, USING this.$refs.SignUpInObserver.validate() ASYNC METHOD
      const valid = await this.$refs.SignUpInObserver.validate()
      if (valid) {
        this.ResetPasswordBtnClicked = true;
        this.resetPassword(this.Input.Email)
      }
    },
    OnKeyUpEnter() {
      // DIFFERENT FUNCTIONS FOR ENTER-KEY-PRESS EVENT DEPENDING ON STATE
        if (this.SignInMode && !this.ForgotMode) {
            this.SignIn()
        } else if (!this.SignInMode && !this.ForgotMode) {
            this.SignUp()
        } else if (this.ForgotMode) {
            this.ResetPassword()
        }
    },
    OnAuthStateChange(calledFrom) {
      let vm = this;
      firebase.auth().onAuthStateChanged( async function(user) {
          // IF USER IS SIGNED IN
          if (user) {

            async function ifGoogleSignIn() {
                // CHECK IF USER WAS SIGNED IN WITH GOOGLE METHOD
                let provider = user.providerData[0].providerId;

                if (provider === 'google.com') {
                  // IF SO, TRIGGER this.signUp FOR SENDING ADMIN APPROVAL EMAIL
                  const signUp = await this.signUp({
                    email: user.email, 
                    password: user.uid,
                    provider: provider
                  })
                  if (signUp) {
                    // AND TRIGGER HasOnBoarded TO SET ONBOARDED STATE IN FIRESTORE USER DOC
                    console.log('running hasOnboarded()');
                    const hasOnboarded = await vm.hasOnboarded(user.uid)
                    if (hasOnboarded) { return true }
                  }
                };
                return true
            }

            async function checkIfApproved(email, uid) {

              console.log('email:', email);
              console.log('uid:', uid);

                let isOriginalEmail = null;
                
                if (!vm.status.signUpRequested && !vm.status.justSignedUp) {
                  // CHECK IF EMAIL IS ORIGINAL EMAIL FROM SIGNUP (IF NOT, CAN BYPASS isUserApproved CHECK)
                  const getIsOriginal = await vm.$axios({
                    method: 'get',
                    url: '/serverMiddleware/firebase/firestore/isOriginalSignUpEmail',
                    params: {
                      app: 'dig-hub',
                      uid: uid,
                      email: email
                    }
                  })
                  isOriginalEmail = getIsOriginal.data.original
                  console.log('isOriginalEmail:', isOriginalEmail)
                } else {
                  isOriginalEmail = true
                }

                if (isOriginalEmail) {
                  console.log('is original email!');

                  // CHECK IF USER HAS FINISHED ONBOARDING
                  if (!vm.status.signUpRequested && await vm.checkIfOnboarded()) {
                    // CHECK IF USER HAS BEEN APPROVED BY ADMIN & EMAIL HAS BEEN VERIFIED
                    const getApproved = await vm.$axios({
                      method: 'get',
                      url: '/serverMiddleware/firebase/isUserApproved',
                      params: {
                        app: 'dig-hub',
                        email: email
                      }
                    })

                    console.log('getApproved:', getApproved)

                    // IF EMAIL ISN'T THE ORIGINAL EMAIL AT SIGNUP, OR IF ONBOARDED IS COMPLETE AND ADMIN HAS APPROVED BY EMAIL LINK, YOU PASS!
                    if (getApproved.data.approved && getApproved.data.emailVerified) {
                      console.log('ok to redirect to dash');
                      console.log('vm.$route:', vm.$route)
                      vm.$root.context.redirect('/dash')
                    } else {
                      // PREPARE UI & STATE
                      vm.SignInMode = true;
                      vm.Loading = false;
                      vm.$store.commit('auth/SHOW_CREATE_PROFILE', 3)
                    }
                  } else {
                    // PREPARE UI & STATE
                    vm.SignInMode = true;
                    vm.Loading = false;
                    vm.$store.commit('auth/SHOW_CREATE_PROFILE')
                  }
                    
                } else {
                  console.log('is not original email');
                  // IF USER EMAIL IS NOT THE ORIGINAL EMAIL AT SIGNUP, THIS MEANS THEY HAVE CHANGED IT WITHIN THE APP... WHICH MEANS THEY HAVE COMPLETED ONBOARDING AND HAVE BEEN APPROVED
                  console.log('vm.$route:', vm.$route)
                  vm.$root.context.redirect('/dash')
                }
            }

            try {
              // CALL THE FUNCTIONS DECLARED ABOVE, IN ORDER

              if (vm.ReauthQuery && !vm.status.reAuthorized) {
                vm.Loading = false
                vm.Input.Email = user.email;
              }
              
              if (!vm.ReauthQuery || (vm.ReauthQuery && vm.status.reAuthorized) ) {

                let google = await ifGoogleSignIn()
                if (google) {
                  if (calledFrom !== 'reauth') {
                    checkIfApproved(user.email, user.uid)
                  } else {
                    console.log('vm.$route:', vm.$route)
                    vm.$root.context.redirect('/dash')
                  }
                }
                
              }
            } catch (error) {
              console.log('caught error in try/catch in mounted(): ', error);
            }


          } else {
            // User is signed out.
            vm.Loading = false
          }
      })
    }
  },
  created() {
    // MAKE SURE ANY ERRORS DO NOT CROSS OVER INTO NEXT SLIDE
    this.$store.commit('auth/RESET_ERROR_STATE')
  },
  mounted() {
    if (this.$route.query.reauth) {
      this.ReauthQuery = true;
    }
    this.OnAuthStateChange('mounted');
  }
}
</script>


<style scoped lang="scss">

// #login-card-wrapper {
//   width: 100%;
//   height: 100vh;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
// }

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
  display: flex;
  flex-direction: column;
  width: 22rem;
  max-width: 100%;
  height: auto;
  min-height: 16rem;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
  cursor: default;
}

::v-deep .vs-card--content {
  height: calc(100% - 38.4px);    // 38.4px is header height and is consistent.
}

#new-user-screen-cont {
  flex: 1;
  padding: .666rem;
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

.input, .input-validation-provider {
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

#bottom.forgot {
  margin-top: .5rem;
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



.new-user-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.new-user-slide-main-icon {
  margin: 2rem 0;
}

.new-user-slide-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
  color: material-color('blue-grey', '600');
}

#new-user-slide-1 .new-user-slide-text {
  flex: 1;
  justify-content: center;
  padding-top: 3rem;
}

.new-user-slide-input {
    flex: 1;
    display: flex;
    justify-content: center;
}

.new-user-slide-btn-cont {
    display: flex;
    justify-content: flex-end;
    margin-top: 3rem;
}

// #new-user-slide-2 .new-user-slide-btn-cont {
//     justify-content: space-around;
// }

.skip {
  padding-top: .333rem;
  color: material-color('blue-grey', '300');
}

// .uploaded-img {
//   width: 5rem;
//   height: 5rem;
//   margin: 3rem 0;
//   border-radius: 6px;
// }

.next-steps {
  margin-left: 2.25rem;
  color: material-color('blue-grey', '400');
}

::v-deep .mini-number-icon i {
  margin-right: 0px !important;
}

.light-text {
  color: material-color('blue-grey', '200');
  font-style: italic;
}


.validation-errors {
  display: block;
  margin: -.5rem 0 0;
  color: $danger;
  font-style: italic;
}

</style>


<style lang="scss">

</style>
