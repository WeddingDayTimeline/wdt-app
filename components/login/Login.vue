<template>
  <div id="login-page-cont" class="columns is-gapless">
    <div class="column login-image login-image-2" />
    <div class="column">
      <div id="login-card-wrapper">
        <b-progress
          v-if="Loading || status.thinking"
          class="progress-xs"
          type="is-info"
          size="is-small"
        />
        <div id="auth-card" class="card">
          <header v-if="ReauthQuery" id="auth-card-header" class="card-header">
            <b-message :active="ReauthQuery">
              Please confirm your password to continue.
            </b-message>
            <!-- <h2
              v-if="!ReauthQuery"
              class="card-header-title"
            >
              {{ ForgotMode ? 'Reset Password' : HeaderCopy }}
            </h2> -->
          </header>
          <div id="logo-cont">
            <div id="logo" />
          </div>
          <div id="input-cont" class="card-content" :class="Loading ? 'mostly-hidden' : ''">
            <validation-observer tag="div" slim ref="SignUpInObserver" v-slot="{invalid}">
              <div id="input-cont-inner" class="content" :class="ForgotMode ? 'forgot' : ''">
                <!-- Primary sign-in choice start -->
                <div
                  v-if="!PrimaryAuthChoice"
                  id="primary-signin-choice"
                >
                  <h5>{{ `Sign ${SignInMode ? 'in' : 'up'} with:` }}</h5>
                  <div class="primary-signin-choice-inner">
                    <b-button
                      class="signin-choice-left"
                      type="is-primary"
                      outlined
                      :disabled="status.submitBtnDisabled || status.disableFields"
                      @click="SetPrimarySignIn('email')"
                    >
                      Email
                    </b-button>
                    <b-button
                      class="signin-choice-right"
                      type="is-primary"
                      outlined
                      :disabled="status.submitBtnDisabled || status.disableFields"
                      @click="SetPrimarySignIn('phone')"
                    >
                      Phone
                    </b-button>
                  </div>
                </div>
                <!-- Primary sign-in choice end -->
                <!-- Primary sign-in email start -->
                <div
                  v-if="PrimaryAuthChoice === 'email'"
                  id="primary-signin-email"
                >
                  <div
                    id="input-cont-top"
                  >
                    <validation-provider
                      class="input-validation-provider"
                      rules="email"
                      mode="lazy"
                      v-slot="{errors}"
                      ref="EmailValidation"
                    >
                      <b-field :message="errors[0]">
                        <b-input
                          class="input-class"
                          icon="envelope"
                          :placeholder="SignInMode ? 'Email' : 'Choose an email'"
                          type="email"
                          autofocus="true"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.Email"
                        />
                      </b-field>
                    </validation-provider>
                    <p
                      v-if="ForgotMode && !ResetPasswordBtnClicked"
                      class="reset-instructions"
                    >
                      Please enter the email associated with your account.</p>
                    <p
                      v-if="ForgotMode && ResetPasswordBtnClicked"
                      class="reset-instructions"
                    >
                      Success! Please check your email for your password reset link.
                    </p>
                    <!-- First/Last name start -->
                    <div v-if="!SignInMode" class="first-last-name">
                      <b-field>
                        <b-input
                          class="input-class"
                          icon="user-tag"
                          :placeholder="SignInMode ? 'First name' : 'Your first name'"
                          type="text"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.Name.First"
                        />
                      </b-field>
                      <b-field>
                        <b-input
                          class="input-class"
                          icon="user-tag"
                          :placeholder="SignInMode ? 'Last name' : 'Your last name'"
                          type="text"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.Name.Last"
                        />
                      </b-field>
                    </div>
                    <!-- First/Last name end -->
                    <validation-provider
                      class="input-validation-provider"
                      rules="alpha_dash|min:8"
                      v-slot="{errors}"
                      ref="PasswordValidation"
                    >
                      <b-field :message="errors[0]">
                        <b-input
                          :class="ForgotMode ? 'no-click hide' : ''"
                          class="input-class"
                          icon="lock"
                          :placeholder="SignInMode ? 'Password' : 'Create a password'"
                          type="password"
                          password-reveal
                          :readonly="status.disableFields"
                          v-model="Input.Password"
                        />
                      </b-field>
                    </validation-provider>
                    <div class="fotgot-password-cont">
                      <a
                        class="forgot forgot-password"
                        :class="!SignInMode || status.error.active || ForgotMode ? 'no-click hide' : ''"
                        @click="ForgotPassword"
                      >Forgot password?</a>
                    </div>
                  </div>
                </div>
                <!-- Primary sign-in email end -->
                <!-- Primary sign-in phone start -->
                <div
                  v-if="PrimaryAuthChoice === 'phone'"
                  id="primary-signin-phone"
                >
                  <div
                    v-if="!status.enterVerificationCode"
                    id="input-cont-top"
                  >
                    <div class="phone-plus">
                      <span>+</span>
                    </div>
                    <!-- Country code start -->
                    <validation-provider
                      class="input-validation-provider country-code-provider"
                      rules="numeric"
                      mode="lazy"
                      v-slot="{errors}"
                      ref="ValidationCountryCode"
                    >
                      <b-field :message="errors[0]">
                        <b-input
                          class="input-class country-code"
                          :placeholder="SignInMode ? 'Email' : 'Choose an email'"
                          type="text"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.CountryCode"
                        />
                      </b-field>
                    </validation-provider>
                    <!-- Country code end -->
                    <!-- Area code & phone number start -->
                    <validation-provider
                      class="input-validation-provider phone-number-provider"
                      rules="numeric"
                      mode="lazy"
                      v-slot="{errors}"
                      ref="ValidationPhoneNumber"
                    >
                      <b-field :message="errors[0]">
                        <b-input
                          class="input-class"
                          :placeholder="SignInMode ? 'Phone number' : 'Choose a phone number'"
                          type="tel"
                          autofocus="true"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.Phone"
                        />
                      </b-field>
                    </validation-provider>
                    <br />
                    <!-- Area code & phone number end -->
                    <!-- First/Last name start -->
                    <div v-if="!SignInMode" class="first-last-name">
                      <b-field>
                        <b-input
                          class="input-class"
                          :placeholder="SignInMode ? 'First name' : 'Your first name'"
                          type="text"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.Name.First"
                        />
                      </b-field>
                      <b-field>
                        <b-input
                          class="input-class"
                          :placeholder="SignInMode ? 'Last name' : 'Your last name'"
                          type="text"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.Name.Last"
                        />
                      </b-field>
                    </div>
                    <!-- First/Last name end -->
                  </div>
                  <!-- Verification Code start -->
                  <div
                    v-if="status.enterVerificationCode"
                    id="input-cont-top"
                  >
                    <validation-provider
                      class="input-validation-provider verification-code-provider"
                      rules="numeric"
                      mode="lazy"
                      v-slot="{errors}"
                      ref="ValidationVerificationCode"
                    >
                      <b-field :message="errors[0]">
                        <b-input
                          class="input-class"
                          placeholder="eg. 836545"
                          type="text"
                          autofocus="true"
                          :readonly="status.disableFields || ReauthQuery"
                          v-model="Input.VerificationCode"
                        />
                      </b-field>
                    </validation-provider>
                  </div>
                  <!-- Verification Code end -->
                </div>
                <!-- Primary sign-in phone end -->
                <b-message v-if="status.error.active" type="is-danger" size="is-small" has-icon>
                  {{ status.error.text }}
                  <span
                    v-if="status.error.type === 0 || status.error.type === 3"
                  >
                    <br />
                    <a class="forgot" @click="ForgotPassword">Forgot your password?</a>
                  </span>
                </b-message>
                <b-button
                  v-if="SignInMode && PrimaryAuthChoice && !status.enterVerificationCode && !ForgotMode"
                  id="sign-in-btn"
                  class="submit-btn full-width-button"
                  :class="status.submitBtnColor === 'is-success' ? 'no-click' : ''"
                  :type="status.submitBtnColor"
                  :icon-left="status.submitBtnColor === 'is-success' ? 'check' : ''"
                  :disabled="status.submitBtnDisabled"
                  @click="PrimaryAuthChoice === 'email' ? SignInWithEmail() : SignInWithPhone()"
                >{{ status.submitBtnColor === 'is-success' ? '' : (PrimaryAuthChoice === 'phone' ? 'Send Verification Code *' : 'Sign in') }}</b-button>
                <b-button
                  v-if="PrimaryAuthChoice && status.enterVerificationCode && !ForgotMode"
                  class="submit-btn full-width-button"
                  :class="status.submitBtnColor === 'is-success' ? 'no-click' : ''"
                  :type="status.submitBtnColor"
                  :icon-left="status.submitBtnColor === 'is-success' ? 'check' : ''"
                  :disabled="status.submitBtnDisabled"
                  @click="VerifyCode(SignInMode ? 'signIn' : 'signUp')"
                >{{ status.submitBtnColor === 'is-success' ? '' : 'Verify' }}</b-button>
                <b-button
                  v-if="!SignInMode && PrimaryAuthChoice && !status.enterVerificationCode && !ForgotMode"
                  id="sign-in-btn"
                  class="submit-btn create-account full-width-button"
                  :class="status.submitBtnColor === 'is-success' ? 'no-click' : ''"
                  :type="status.submitBtnColor"
                  expanded
                  :icon-left="status.submitBtnColor === 'is-success' ? 'check' : ''"
                  :disabled="status.submitBtnDisabled"
                  @click="PrimaryAuthChoice === 'email' ? SignUpWithEmail() : SignUpWithPhone()"
                >{{ status.submitBtnColor === 'is-success' ? '' : 'Create Account' }}</b-button>
                <b-button
                  v-if="PrimaryAuthChoice && !status.enterVerificationCode && !ForgotMode"
                  id="try-another-method"
                  class="go-back-btn full-width-button"
                  type="is-teal"
                  icon-left="long-arrow-alt-left"
                  expanded
                  outlined
                  :disabled="status.submitBtnDisabled"
                  @click="SetPrimarySignIn(null)"
                >
                  Go Back
                </b-button>
                <b-button
                  v-if="ForgotMode"
                  class="submit-btn full-width-button"
                  :class="status.submitBtnColor === 'is-success' ? 'no-click' : ''"
                  :type="status.submitBtnColor"
                  :icon-left="status.submitBtnColor === 'is-success' ? 'check' : ''"
                  :disabled="status.submitBtnDisabled"
                  @click="ResetPassword"
                >{{ status.submitBtnColor !== 'is-success' ? 'Reset Password' : 'Email Sent' }}</b-button>
              </div>
              <div v-if="!ForgotMode && !PrimaryAuthChoice" id="alt-signin-cont">
                <div class="or-cont">
                  <hr />
                  <span class="or">or</span>
                  <hr />
                </div>
                <!-- Google sign-in button start -->
                <b-button
                  class="alt-signin-btn"
                  type="is-primary"
                  expanded
                  :disabled="status.submitBtnDisabled"
                  @click="signInWithGoogle"
                >
                  <div class="alt-logo google-logo" />Sign in with Google
                </b-button>
                <!-- Google sign-in button end -->
                <!-- Facebook sign-in button start -->
                <b-button
                  class="alt-signin-btn"
                  type="is-teal"
                  expanded
                  :disabled="status.submitBtnDisabled"
                  @click="signUpInWithFacebook(SignInMode ? 'signIn' : 'signUp')"
                >
                  <div class="alt-logo facebook-logo" />Sign in with Facebook
                </b-button>
                <!-- Facebook sign-in button end -->
              </div>
            </validation-observer>
          </div>
        </div>
        <!-- Bottom start -->
        <div
          v-if="!ReauthQuery || (ReauthQuery && ForgotMode)"
          id="bottom"
          :class="ForgotMode ? 'forgot' : ''"
        >
          <div v-if="!PasswordResetEmailSent && !status.justSignedUp" id="bottom-inner">
            <div class="bottom-question">
              {{ BottomCopy.Question }}
            </div>
            <!-- <a
              :class="SignInMode ? '' : 'primary'"
              @click="SignUpMode()"
            >{{ BottomCopy.Btn }}</a> -->
            <b-button
              type="is-teal"
              outlined
              :disabled="status.submitBtnDisabled"
              @click="SignUpMode()"
            >
              {{ BottomCopy.Btn }}
            </b-button>
          </div>
          <div v-else id="bottom-inner">
            <a class="primary" @click="SignUpMode('signIn')">Sign in</a>
          </div>
        </div>
        <!-- Bottom end -->
        <GlobalEvents @keyup.enter="OnKeyUpEnter" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import Logo from '~/components/Logo.vue'
import deep from '~/utils/deep'

export default {
  name: 'Auth',
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
      PrimaryAuthChoice: null,
      Input: {
        Email: '',
        Password: '',
        CountryCode: 1,
        Phone: '',
        Name: {
          First: '',
          Last: ''
        },
        VerificationCode: ''
      },
      ResetPasswordBtnClicked: false,
      PasswordResetEmailSent: false,
      ReauthQuery: false
    }
  },
  watch: {
    status(newVal, oldVal) {
      if (oldVal.recaptchaPassed === (newVal.recaptchaPassed - 1)) {
        console.log('watched status and running onauthstatechange')
        this.OnAuthStateChange()
      }
    }
  },
  computed: {
    ...mapGetters({
      status: 'auth/getStatus'
    }),
    HeaderCopy() {
      return this.SignInMode ? 'Sign In' : 'Sign Up'
    },
    BottomCopy() {
      if (this.ReauthQuery) {
        return { Question: '', Btn: 'Back' }
      } else if (this.SignInMode) {
        return { Question: 'Need an account? ', Btn: 'Sign up' }
      } else {
        return { Question: 'Have an account? ', Btn: 'Sign in' }
      }
    }
  },
  methods: {
    ...mapActions('auth', [
      'signUpWithEmail',
      'signInWithEmail',
      'signUpWithPhone',
      'signUpInWithPhone',
      'verifyCode',
      'signInWithGoogle',
      'signUpInWithFacebook',
      'resetPassword',
      'isEmailVerified'
    ]),
    SetPrimarySignIn(option) {
      this.PrimaryAuthChoice = option
    },
    async SignInWithEmail() {
      const vm = this
      // CHECK IF FIELDS ARE VALID, USING this.$refs.SignUpInObserver.validate() ASYNC METHOD
      const valid = await this.$refs.SignUpInObserver.validate()

      if (valid) {
        this.signInWithEmail({
          reauthQuery: vm.ReauthQuery,
          email: vm.Input.Email,
          password: vm.Input.Password
        })
      }
    },
    FormatPhoneNumber() {
      console.log(`+${this.Input.CountryCode}${this.Input.Phone}`)
      return `+${this.Input.CountryCode}${this.Input.Phone}`
    },
    FullName() {
      return `${this.Input.Name.First} ${this.Input.Name.Last}`
    },
    async SignInWithPhone() {
      // CHECK IF FIELDS ARE VALID, USING this.$refs.SignUpInObserver.validate() ASYNC METHOD
      const valid = await this.$refs.SignUpInObserver.validate()

      if (valid) {
        this.signUpInWithPhone({ phone: deep(this.FormatPhoneNumber()), method: 'signIn' })
      }
    },
    async VerifyCode(method) {
      const valid = await this.$refs.SignUpInObserver.validate()

      if (valid) {
        this.verifyCode({ code: this.Input.VerificationCode, name: !this.SignInMode ? this.FullName() : null, method })
      }
    },
    async SignUpWithEmail() {
      // CHECK IF FIELDS ARE VALID, USING this.$refs.SignUpInObserver.validate() ASYNC METHOD
      const valid = await this.$refs.SignUpInObserver.validate()

      if (valid) {
        this.signUpWithEmail({
          email: this.Input.Email,
          password: this.Input.Password,
          name: this.FullName()
        })
      }
    },
    async SignUpWithPhone() {
      // CHECK IF FIELDS ARE VALID, USING this.$refs.SignUpInObserver.validate() ASYNC METHOD
      const valid = await this.$refs.SignUpInObserver.validate()

      if (valid) {
        this.signUpInWithPhone({ phone: deep(this.FormatPhoneNumber()), method: 'signUp' })
      }
    },
    SignUpMode(toMode = null) {
      // CHANGE SIGNIN MODE (SIGN-IN OR SIGN-UP)
      this.Input.Email = ''
      this.Input.Password = ''

      if (toMode === null && !this.ReauthQuery) {
        if (this.SignInMode) {
          this.SignInMode = false
        } else {
          this.SignInMode = true
        }
      } else if (toMode === 'signIn' || this.ReauthQuery) {
        // PREPARE UI
        this.SignInMode = true
        this.$store.commit('auth/UPDATE_STATUS', {
          status: {
            submitBtnColor: 'is-primary'
          }
        })
        this.PasswordResetEmailSent = false
      }

      // CLEAN UP UI
      this.ForgotMode = false
      this.$store.commit('auth/UPDATE_STATUS', {
        status: {},
        error: {
          active: false
        }
      })
    },
    ForgotPassword() {
      // ON 'Forgot Password' LINK CLICK
      this.ForgotMode = true
      this.SignInMode = true
      this.ResetPasswordBtnClicked === true
        ? (this.ResetPasswordBtnClicked = false)
        : null
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
        this.ResetPasswordBtnClicked = true
        this.resetPassword(this.Input.Email)
      }
    },
    OnKeyUpEnter() {
      // DIFFERENT FUNCTIONS FOR ENTER-KEY-PRESS EVENT DEPENDING ON STATE
      let signInMode = this.SignInMode
      let forgotMode = this.ForgotMode
      let primaryAuthChoice = this.PrimaryAuthChoice

      if (signInMode && !forgotMode) {
        primaryAuthChoice === 'email' ? this.SignInWithEmail() : this.SignInWithPhone()
      } else if (!signInMode && !forgotMode) {
        primaryAuthChoice === 'email' ? this.SignUpWithEmail() : this.SignUpWithPhone()
      } else if (forgotMode) {
        this.ResetPassword()
      }
    },
    // async FirebaseRedirectResult() {
    //   try {
    //     console.log('FirebaseRedirectResult()');
    //     const result = await firebase.auth().getRedirectResult()
    //     console.log('result:', result)
    //     if (result.credential) {
    //       // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    //       const token = result.credential.accessToken
    //       // ...
    //     }
    //     // The signed-in user info.
    //     const user = result.user
    //     console.log('user:', user)
    //     console.log('facebook user from redirect:', user)
    //   } catch (error) {
    //     // Handle Errors here.
    //     const errorCode = error.code
    //     const errorMessage = error.message
    //     // The email of the user's account used.
    //     const email = error.email
    //     // The firebase.auth.AuthCredential type that was used.
    //     const credential = error.credential
    //     // ...
    //   }
    // },
    async CheckIfVerified(email) {
      let vm = this

      if (
        !vm.status.signUpRequested
      ) {
        // CHECK IF EMAIL HAS BEEN VERIFIED
        const verified = await vm.isEmailVerified(deep(email))

        if (verified.data.emailVerified) {
          vm.$root.context.redirect('/dash')
        } else {
          // PREPARE UI & STATE
          vm.SignInMode = true
          vm.Loading = false
        }
      } else {
        // PREPARE UI & STATE
        vm.SignInMode = true
        vm.Loading = false
      }
    },
    OnAuthStateChange(calledFrom = 'other') {
      const vm = this
      firebase.auth().onAuthStateChanged(function(user) {
        console.log('OnAuthStateChange')
        // IF USER IS SIGNED IN
        if (user) {
          try {
            if (vm.ReauthQuery && !vm.status.reAuthorized) {
              vm.Loading = false
              vm.Input.Email = user.email
            }

            if (!vm.ReauthQuery || (vm.ReauthQuery && vm.status.reAuthorized)) {
              const provider = user.providerData[0].providerId
              if (calledFrom !== 'reauth' && provider === 'password') {
                console.log('user:', user)
                console.log('user.email:', user.email)
                vm.CheckIfVerified(user.email)
              } else if (provider === 'phone' && vm.status.recaptchaPassed > 0) {
                vm.$root.context.redirect('/dash')
              } else if (provider === 'facebook.com' && !this.SignInMode) {
                // vm.$root.context.redirect('/dash')
              }
            }
          } catch (error) {
            console.log('caught error in try/catch in mounted(): ', error)
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
      this.ReauthQuery = true
    }
    // this.FirebaseRedirectResult()
    this.OnAuthStateChange('mounted')
  }
}
</script>

<style scoped lang="scss">

#login-page-cont {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.login-image {
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
}

.login-image-1 {
  background-image: $login-image-1-jpg;
  background-image: $login-image-1-webp;
  background-position: right bottom;
}

.login-image-2 {
  background: linear-gradient(to right, rgba($info, 0.33) 0%, rgba($info, 0.33) 99.65%, white 100%), $login-image-2-jpg;
  background: linear-gradient(to right, rgba($info, 0.33) 0%, rgba($info, 0.33) 99.65%, white 100%), $login-image-2-webp;
  // background-image: $login-image-2-jpg;
  // background-image: $login-image-2-webp;
  background-position: center bottom;
}

#login-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-xs {
  height: 0.5rem;
  margin-bottom: -0.25rem;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
  cursor: default;
}

#input-cont {
  padding-bottom: 4rem;
}

#input-cont,
#input-cont-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error {
  max-width: 220px;
  height: min-content !important;

  & * {
    line-height: 1.333rem;
  }
}

.loading {
  & #auth-card-header,
  & #input-cont,
  & #input-cont * {
    opacity: 0;
  }
}

.mostly-hidden {
  opacity: 0.1;
}

#auth-card {
  display: flex;
  flex-direction: column;
  width: 22rem;
  max-width: 100%;
  height: auto;
  min-height: 16rem;
}

#new-user-screen-cont {
  flex: 1;
  padding: 0.666rem;
}

#logo-cont {
  display: flex;
  justify-content: center;
  margin: 4rem 0 2.5rem;
}

#logo {
  width: 12rem;
  height: 3.19rem;
  background-image: $logo;
  background-repeat: no-repeat;
  cursor: default;
}

.card-header-title,
.content h5 {
  color: $primary;
}

#primary-signin-choice {
  width: 100%;

  & .primary-signin-choice-inner {
    display: flex;
  }

  & .button {
    flex: 1;
  }

  & .signin-choice-left {
    margin-right: -1px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  & .signin-choice-right {
    // margin-left: -1px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

.input-class,
.input-validation-provider {
  margin-bottom: 1rem;
}

.phone-plus {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  margin-right: 0.25rem;
  color: material-color('blue-grey', '400');
}

.phone-plus,
.country-code-provider {
  float: left;
}

.phone-number-provider {
  float: right;
}

.country-code-provider,
.phone-number-provider {
  margin-bottom: 0;
}

::v-deep .input-class.country-code {
  width: 3rem;
  margin-right: 0.5rem;

  & input {
    width: 100%;
    text-align: center;
  }
}

.check.remember-me {
  align-self: flex-start;
  color: material-color('blue-grey', '300');
}

.forgot,
.alt-primary-signinup {
  cursor: pointer;
}

.fotgot-password-cont {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.forgot-password,
.alt-primary-signinup {
  margin-top: -0.5rem;
  // color: $primary;
}

.check.remember-me,
.forgot-password {
  font-size: 0.75rem;
}

.submit-btn {
  margin: 3rem 0 0.5rem;
}

.go-back-btn {
  margin: 0 0 0.5rem;
}

#alt-signin-cont {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: auto;

  & .or-cont {
    display: flex;
    align-items: center;
    width: 200px;
    margin: 1.25rem 0 0.25rem;
  }

  & hr {
    flex: 1;
    background-color: transparent;
    border-bottom: 1px solid $teal;
    border-top: none;
    border-right: none;
    border-left: none;
  }

  & .or {
    margin: 0 0.666rem;
    color: $teal;
    cursor: default;
  }

  & button:not(:last-child) {
    margin-bottom: 0.5rem;
  }
}

#bottom {
  margin-top: 1.25rem;
  color: $teal;
  cursor: default;

  & #bottom-inner {
    display: flex;
    align-items: center;
    height: 100%;

    & .bottom-question {
      margin-right: 1rem;
    }
  }

  & .forgot {
    margin-top: 0.5rem;
  }

  & a {
    margin: 0 0 0 0.2rem;
    color: $teal;
    cursor: pointer;

    &:hover {
      color: $primary;
    }

    &.primary,
    .error span {
      color: $primary;
    }
  }
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
  padding-top: 0.333rem;
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
  margin-right: 0 !important;
}

.light-text {
  color: material-color('blue-grey', '200');
  font-style: italic;
}

.validation-errors {
  display: block;
  margin: -0.5rem 0 0;
  color: $danger;
  font-style: italic;
}
</style>

<style lang="scss">
</style>
