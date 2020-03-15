<template>
  <div id="login-card-wrapper">
    <vs-progress class="progress" v-if="Loading || Thinking" indeterminate :height="3" color="primary"></vs-progress>
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
                <b-input class="input" icon="envelope" :placeholder="SignInMode ? 'Email' : 'Choose an email'" type="email" v-model="Input.Email" autofocus="true" :readonly="DisableFields || ReauthQuery"/>
              </b-field>
            </ValidationProvider>
            <p v-if="ForgotMode && !ResetPasswordBtnClicked" class="reset-instructions">Please enter the email associated with your account.</p>
            <p v-if="ForgotMode && ResetPasswordBtnClicked" class="reset-instructions">Success! Please check your email for your password reset link.</p>
            <ValidationProvider class="input-validation-provider" rules="alpha_dash|min:8" v-slot="{ errors }" ref="PasswordValidation">
              <b-field
                :message="errors[0]"
              >
                <b-input :class="ForgotMode ? 'no-click hide' : ''" class="input" icon="unlock-alt" :placeholder="SignInMode ? 'Password' : 'Create a password'" type="password" password-reveal v-model="Input.Password" :readonly="DisableFields" />
              </b-field>
            </ValidationProvider>
            <a class="forgot forgot-password" :class="!SignInMode || Error.Active || ForgotMode ? 'no-click hide' : ''" @click="ForgotPassword()">Forgot password?</a>
            <b-message v-if="Error.Active" type="is-danger" size="is-small" has-icon>
              {{ Error.Text }}
              <span v-if="Error.Type === 0 || Error.Type === 3">
                <br>
                <a class="forgot" @click="ForgotPassword()">Forgot your password?</a>
              </span>
            </b-message>
            <b-button v-if="SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'is-success' ? 'no-click' : ''" :type="SubmitBtnColor" @click="SignIn()" :icon-left="SubmitBtnColor === 'is-success' ? 'check' : ''" :disabled="SubmitBtnDisabled">{{ SubmitBtnColor === 'is-success' ? '' : 'Sign in' }}</b-button>
            <b-button v-if="!SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'is-success' ? 'no-click' : ''" :type="SubmitBtnColor" @click="SignUp()" :icon-left="SubmitBtnColor === 'is-success' ? 'check' : ''" :disabled="SubmitBtnDisabled">{{ SubmitBtnColor === 'is-success' ? '' : 'Create Account' }}</b-button>
            <b-button v-if="ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'is-success' ? 'no-click' : ''" :type="SubmitBtnColor" @click="ResetPassword()" :icon-left="SubmitBtnColor === 'is-success' ? 'check' : ''" :disabled="SubmitBtnDisabled">{{ SubmitBtnColor !== 'is-success' ? 'Reset Password' : 'Email Sent' }}</b-button>
            <div v-if="!ForgotMode" id="google-option-cont">
              <div class="or-cont"><hr><span class="or">or</span><hr></div>
              <b-button class="google-signin-btn full-width-button" type="is-google" inverted @click="GoogleSignIn()" :disabled="SubmitBtnDisabled">
                <div class="google-logo"></div>
                Sign in with Google
              </b-button>
            </div>
            <div v-if="!ReauthQuery || (ReauthQuery && ForgotMode)" id="bottom" :class="ForgotMode ? 'forgot' : ''">
              <div v-if="!PasswordResetEmailSent && !JustSignedUp" id="bottom-inner">
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
import {mapGetters} from 'vuex'
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
      Thinking: false,
      FirebaseUIInit: false,
      SignInMode: true,
      ForgotMode: false,
      Input: {
        Email: '',
        Password: ''
      },
      // Options: {
      //   RememberMe: false
      // },
      Error: {
        Active: false,
        Type: 0,
        Text: '',
      },
      SubmitBtnColor: 'is-primary',
      SubmitBtnDisabled: false,
      ResetPasswordBtnClicked: false,
      PasswordResetEmailSent: false,
      DisableFields: false,
      JustSignedUp: false,
      OnboardedConfirmed: false,
      ReauthQuery: false,
      ReAuthorized: false
    };
  },
  computed: {
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
    SignIn() {
      let vm = this;

      function updateUI(success) {
        // IF SUCCESS, GET UI READY
        if (success) {
          vm.SubmitBtnColor = 'is-success';
        } else {
          vm.SubmitBtnTempColor('is-warning');
          vm.DisableFields = false;
        }
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
      }

      function signInCatchError(error) {
        console.log('error in signInCatchError(): ', error);
        // ERRORS FOR VUESAX ALERT COMPONENTS HERE
        const errorCode = error.code;
        const errorMessage = error.message;
        // FIRST, UPDATE UI
        updateUI(false);

        // DISPLAY ERROR-SPECIFIC MESSAGES TO this.Error
        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/user-disabled') {
          vm.Error = { Active: true, Type: 0, Text: 'Incorrect email or password.' }
        } else if (errorCode === 'auth/invalid-email') {
          vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
        }
      }

      // CHECK IF FIELDS ARE VALID, USING ValidateSignInUpFields() ASYNC METHOD
      this.ValidateSignInUpFields()
      .then(function(valid) {
        if (valid) {


          vm.Thinking = true;
          vm.SubmitBtnDisabled = true;
          vm.DisableFields = true;
          vm.Error.Active ? vm.Error.Active = false : null;
          // SIGN INTO FIREBASE WITH EMAIL AND PASSWORD
          if (vm.ReauthQuery) {
            const user = firebase.auth().currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(
              user.email, 
              vm.Input.Password
            )

            user.reauthenticateWithCredential(credential)
            .then(function(response) {
              vm.ReAuthorized = true;
              updateUI(true);
              vm.OnAuthStateChange('reauth');
            })
            .catch(function(error) {
              signInCatchError(error)
            });
          } else {
            firebase.auth().signInWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
            .then(function(response) {
              updateUI(true)
            })
            .catch(function(error) {
              signInCatchError(error)
            });
          }
          

        }
      })
      .catch(function(error) {
        console.log('caught error while validating fields in this.SignIn():', error);
      })

      
    },
    SignUp() {
      let vm = this;
      // CHECK IF FIELDS ARE VALID, USING ValidateSignInUpFields() ASYNC METHOD
      this.ValidateSignInUpFields()
      .then(function(valid) {
        if (valid) {
          // FIRST, PREPARE UI
          vm.Thinking = true;
          vm.SubmitBtnDisabled = true;
          vm.DisableFields = true;
          vm.Error.Active ? vm.Error.Active = false : null;
          
          // CREATE FIREBASE USER WITH EMAIL AND PASSWORD
          firebase.auth().createUserWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
          .then(async function(response) {
            // THEN CALL NEWUSERFLOW, WHICH CALLS newUser API ROUTE TO SEND ADMIN APPROVAL EMAIL AND SET ONBOARDED STATE IN FIRESTORE USER DOC
            await vm.NewUserFlow(response.user.email, response.user.uid)
            .then(function(res) {
              if (res) {
                // PREPARE UI
                vm.SubmitBtnColor = 'is-success';
                vm.SubmitBtnDisabled = false;
                vm.Thinking = false;
                vm.DisableFields = false;
                vm.SubmitBtnColor = 'is-success';
              }
              // SEND VERIFICATION EMAIL TO USER
              vm.SendVerificationEmail();
            })
            .catch(function(error) {
              console.log('caught error while awaiting this.newUserFlow function:', error);
            })
          })
          .catch(function(error) {
            vm.DisableFields = false;
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
              vm.Error = { Active: true, Type: 3, Text: `Looks like this email is already associated with an active account.` }
            } else if (errorCode === 'auth/invalid-email') {
              vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
            } else {
              console.log('caught error while attempting to create firebase user with email/password, ', 'errorCode:', errorCode, ' errorMessage:', errorMessage);
            }

            // PREPARE UI
            vm.SubmitBtnTempColor('is-warning');
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
          });
        }
      })
      .catch(function(error) {
        console.log('caught error while validating fields in this.SignUp():', error);
      })
    },
    GoogleSignIn() {
      // CREATE NEW GOOGLE AUTH PROVIDER AND SIGNIN, REDIRECTING BACK TO THIS PAGE AFTERWARDS
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
    async NewUserFlow(email, uid, provider = 'password') {
      // AXIOS CALL FOR newUser API ROUTE TO SEND ADMIN APPROVAL EMAIL AND SET ONBOARDED:FALSE DEFAULT STATE IN FIRESTORE USER DOC
      try {
        const post = await this.$axios({
          method: 'post',
          url: '/api/firebase/newUser',
          params: {
            app: 'dig-hub'
          },
          data: {
            email: email,
            uid: uid,
            provider: provider
          }
        });
        if (post.data.success) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.log('caught error while making axios call to newUser api route:', error);
        return false
      }
    },
    async SendVerificationEmail() {
      // SEND VERIFICATION EMAIL TO NEW USER
      const user = firebase.auth().currentUser;

      await user.sendEmailVerification()
      .catch(function(error) {
        console.log('error sending verification email to new user');
      });
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
        this.SubmitBtnColor = 'is-primary';
        this.PasswordResetEmailSent = false;
      } 

      // CLEAN UP UI
      this.ForgotMode = false;
      this.Error.Active ? this.Error.Active = false : null
    },
    ForgotPassword() {
      // ON 'Forgot Password' LINK CLICK
      this.ForgotMode = true;
      this.SignInMode = true;
      this.ResetPasswordBtnClicked === true ? this.ResetPasswordBtnClicked = false : null;
      this.Error.Active ? this.Error.Active = false : null;
    },
    ResetPassword() {
      let vm = this;
      // CHECK IF FIELDS ARE VALID, USING ValidateSignInUpFields() ASYNC METHOD
      this.ValidateSignInUpFields()
      .then(function(valid) {
        if (valid) {
          // SEND RESET PASSWORD EMAIL
          // FIRST PREPARE UI
          vm.Thinking = true;
          vm.ResetPasswordBtnClicked = true;
          vm.SubmitBtnDisabled = true;
          vm.DisableFields = true;
          vm.Error.Active ? vm.Error.Active = false : null;

          // SEND THE EMAIL
          firebase.auth().sendPasswordResetEmail(vm.Input.Email)
          .then(function() {
            // PREPARE UI
            vm.SubmitBtnColor = 'is-success';
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
            vm.PasswordResetEmailSent = true;
          })
          .catch(function(error) {
            // CREATE ERROR SPECIFIC MESSAGES FOR VUESAX ALERT COMPONENT
            vm.DisableFields = false;
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === 'auth/user-not-found') {
              vm.Error = { Active: true, Type: 2, Text: `We couldn't find an accout associated with this email. Please try again.` }
            } else if (errorCode === 'auth/invalid-email') {
              vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
            } else {
              console.log('error caught while sending password reset email, ', 'errorCode:', errorCode, ' errorMessage:', errorMessage);
            }

            // PREPARE UI 
            vm.SubmitBtnTempColor('is-warning');
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
          });
        }
      })
      .catch(function(error) {
        console.log('caught error while validating fields in this.ResetPassword(): ', error);
      })
    },
    SubmitBtnTempColor(color) {
      // UPON ERROR, TEMPORARILY CHANGE COLOR, THEN CHANGE IT BACK TO PRIMARY
      this.SubmitBtnColor = color;
      setTimeout(() => {
        this.SubmitBtnColor = 'is-primary';
      }, 4500);
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
    async HasOnboarded(uid) {
      // TRIGGER AXIOS CALL WHEN ONBOARDING HAS COMPLETED (IN THIS CASE, ONBOARDING IS JUST UPDATING PROFILE NAME)
      try {
        const post = await this.$axios({
          method: 'post',
          url: '/api/firebase/firestore/hasOnboarded',
          params: {
            app: 'dig-hub'
          },
          data: {
            uid: uid
          }
        });
        if (post.data.success) {
          this.OnboardedConfirmed = true
          return true
        } else {
          this.OnboardedConfirmed = false
          return false
        }
      } catch (error) {
        console.error('error while making axios call to hasOnboarded api route', error);
        return false
      }
    },
    async CheckIfOnboarded() {
      let vm = this;
      const user = firebase.auth().currentUser;
      let db = firebase.firestore();
      await db.collection('users').doc(user.uid).get()
      .then(function(doc) {
          if (doc.exists) {
              if (doc.data().onboarded) {
                vm.OnboardedConfirmed = true
                return true
              } else {
                vm.OnboardedConfirmed = false
                return false
              }
          } else {
              // doc.data() will be undefined in this case
          }
      }).catch(function(error) {
          console.log("Error getting firestore user document to check onboarded state:", error);
      });
    },
    async ValidateSignInUpFields() {
      // CHECK IF EMAIL FIELD IS VALID IF SO, RETURN TRUE
      const isValid = await this.$refs.SignUpInObserver.validate();
      if (!isValid) {
        return false
      } else if (isValid) {
        return true
      }
    },
    ResetErrorState() {
      // MAKE SURE ANY ERRORS ARE NOT CROSSING OVER INTO NEXT SLIDE
      this.Error = {
        Active: false,
        Type: 0,
        Text: '',
      }
    },
    OnAuthStateChange(calledFrom) {
      let vm = this;
      firebase.auth().onAuthStateChanged(function(user) {
          // IF USER IS SIGNED IN
          if (user) {

            async function checkIfGoogleSignIn() {
                // CHECK IF USER WAS SIGNED IN WITH GOOGLE METHOD
                let provider = user.providerData[0].providerId;

                if (provider === 'google.com') {
                  // IF SO, TRIGGER NewUserFlow FOR SENDING ADMIN APPROVAL EMAIL
                  await vm.NewUserFlow(user.email, user.uid, provider);
                  // AND TRIGGER HasOnBoarded TO SET ONBOARDED STATE IN FIRESTORE USER DOC
                  await vm.HasOnboarded(user.uid)
                  .then(function() {
                    return true
                  })
                  .catch(function(error) {
                    console.log('caught error in vm.HasOnboarded():', error)
                  });
                };
                return true
            }

            async function checkIfApproved(email, uid) {

                // CHECK IF EMAIL IS ORIGINAL EMAIL FROM SIGNUP (IF NOT, CAN BYPASS isUserApproved CHECK)
                const getIsOriginal = await vm.$axios({
                  method: 'get',
                  url: '/api/firebase/firestore/isOriginalSignUpEmail',
                  params: {
                    app: 'dig-hub',
                    uid: uid,
                    email: email
                  }
                })

                if (getIsOriginal.data.original) {
                  // CHECK IF USER HAS BEEN APPROVED BY ADMIN YET
                  const getApproved = await vm.$axios({
                    method: 'get',
                    url: '/api/firebase/isUserApproved',
                    params: {
                      app: 'dig-hub',
                      email: email
                    }
                  })
                }

                // CHECK IF USER HAS FINISHED ONBOARDING
                await vm.CheckIfOnboarded();
                
                if (vm.OnboardedConfirmed) {
                  if (!getIsOriginal.data.original || (getApproved.data.approved && getApproved.data.emailVerified)) {
                  // IF ONBOARDED IS COMPLETE AND ADMIN HAS APPROVED BY EMAIL LINK, OR IF EMAIL ISN'T THE ORIGINAL EMAIL AT SIGNUP, YOU PASS!
                    vm.$root.context.redirect('/dash')
                  } else {
                    // PREPARE UI & STATE
                    vm.JustSignedUp = true;
                    vm.$store.commit('updateCreateProfileStartSlide', 3)
                    vm.$store.commit('updateShowCreateProfile', true)
                    vm.SignInMode = true;
                    vm.Loading = false;
                    vm.Thinking = false;
                  }
                } else {
                  // PREPARE UI & STATE
                  vm.JustSignedUp = true;
                  // vm.CreateProfileStartSlide = 0;
                  vm.$store.commit('updateShowCreateProfile', true)
                  vm.SignInMode = true;
                  vm.Loading = false;
                  vm.Thinking = false;
                }
            }

            try {
              // CALL THE FUNCTIONS DECLARED ABOVE, IN ORDER

              if (vm.ReauthQuery && !vm.ReAuthorized) {
                vm.Loading = false
                vm.Input.Email = user.email;
              }
              
              if (!vm.ReauthQuery || (vm.ReauthQuery && vm.ReAuthorized) ) {

                checkIfGoogleSignIn()
                .then(function() {
                  if (calledFrom !== 'reauth') {
                    checkIfApproved(user.email, user.uid)
                    .catch(function(error) {
                      console.log('caught error in mounted() -- checkIfApproved(): ', error);
                    })
                  } else {
                    vm.$root.context.redirect('/dash')
                  }
                })
                .catch(function(error) {
                  console.log('caught error in mounted() -- checkIfSoogleSignIn(): ', error);
                })

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
    this.ResetErrorState();
  },
  mounted() {
    this.OnAuthStateChange('mounted');
    if (this.$route.query.reauth) {
      this.ReauthQuery = true;
    } 
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
