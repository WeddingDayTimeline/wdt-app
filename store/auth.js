import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'
import deep from '~/utils/deep'

export const state = () => ({
  user: {},
  status: {
    thinking: false,
    disableSubmitBtn: false,
    disableFields: false,
    submitBtnColor: 'is-primary',
    signUpRequested: false,
    enterVerificationCode: false,
    justSignedUp: false,
    emailVerified: null,
    error: {
      active: false,
      type: 0,
      text: ''
    }
  }
})

export const actions = {
  async signUpWithEmail({ commit, dispatch }, creds) {
    try {
      commit('GENERAL_REQUEST')
      commit('SIGN_UP_REQUEST')
      // CREATE FIREBASE USER WITH EMAIL AND PASSWORD
      const createUser = await firebase
        .auth()
        .createUserWithEmailAndPassword(creds.email, creds.password)
      console.log('createUser:', createUser)
      commit('SIGN_UP_SUCCESS')
      // SEND VERIFICATION EMAIL TO NEW USER
      const user = firebase.auth().currentUser
      user.sendEmailVerification()
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(
        'error during signUpWithEmail action: ',
        errorCode ? `error code: ${errorCode},` : null,
        errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
      )

      let errorStatus = {}
      if (errorCode) {
        switch (errorCode) {
          case 'auth/email-already-in-use':
            errorStatus = {
              active: true,
              type: 3,
              text: `Looks like this email is already associated with an active account.`
            }
            break
          case 'auth/invalid-email':
            errorStatus = {
              active: true,
              type: 1,
              text: 'This seems to be an invalid email. Please try again.'
            }
            break
        }
      }
      commit('GENERAL_ERROR', errorStatus)
    }
  },

  async signInWithEmail({ commit, dispatch }, payload) {
    commit('GENERAL_REQUEST')

    try {
      // SIGN INTO FIREBASE WITH EMAIL AND PASSWORD
      if (payload.reauthQuery) {
        const user = firebase.auth().currentUser
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          payload.password
        )

        const fbReauth = await user.reauthenticateWithCredential(
          deep(credential)
        )
        if (fbReauth) {
          commit('SIGN_IN_SUCCESS')
          /*
           * TODO: Rethink logic for OnAuthStateChange('reauth) flow
           *  vm.OnAuthStateChange('reauth');
           */
        }
      } else {
        const fbSignIn = await firebase
          .auth()
          .signInWithEmailAndPassword(payload.email, payload.password)
        if (fbSignIn) {
          commit('SIGN_IN_SUCCESS')
        }
      }
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(
        'error during signIn action: ',
        errorCode ? `error code: ${errorCode},` : null,
        errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
      )

      let errorStatus = {}
      if (errorCode) {
        switch (errorCode) {
        case 'auth/wrong-password' || 'auth/user-not-found':
          errorStatus = {
            active: true,
            type: 0,
            text: 'Incorrect email or password.'
          }
          break
        case 'auth/invalid-email':
          errorStatus = {
            active: true,
            type: 1,
            text: 'This seems to be an invalid email. Please try again.'
          }
          break
        }
      }
      commit('GENERAL_ERROR', errorStatus)
    }
  },

  async signUpInWithPhone({ commit, dispatch }, params) {
    commit('GENERAL_REQUEST')
    console.log('signUpInWithPhone action!')
    this.$client.useDeviceLanguage()
    window.recaptchaVerifier = this.$client.reCaptchaVerifier()
    console.log('window.recaptchaVerifier:', window.recaptchaVerifier)

    try {
      const confirm = await this.$client.signUpInWithPhoneNumber(params.phone)
      if (confirm) {
        console.log('confirm:', confirm)
        commit('SEND_VCODE_SUCCESS')
        window.confirmationResult = confirm

        // console.log('params.method:', params.method)
        // if (params.method === 'signUp') {
        //   console.log('params.method:', params.method)
        //   commit('SIGN_UP_SUCCESS')
        // }
      }
    } catch (error) {
      const widget = await window.recaptchaVerifier.render()
      if (widget) {
        // TODO: HANDLE WITH NEW GLOBAL ERROR COMPONENT
        const errorCode = error.code
        const errorMessage = error.message
        console.log(
          'error during signUpInWithPhone action: ',
          errorCode ? `error code: ${errorCode},` : null,
          errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
        )

        const errorStatus = {
          active: true,
          type: 0,
          text: errorMessage
        }
        commit('GENERAL_ERROR', errorStatus)
      }
    }
  },

  async verifyCode({ commit, dispatch }, params) {
    commit('GENERAL_REQUEST')

    try {
      const confirm = await this.$client.verifyCode(params.code)
      if (confirm) {
        // commit('UPDATE_USER', deep(confirm.user))
        console.log('confirm from verifyCode action:', confirm)

        if (params.method === 'signUp') {
          const newUserFlow = await this.$server.createUserWithPhone(
            params.phone,
            confirm.user.uid
          )
          console.log('newUserFlow:', newUserFlow)
          if (newUserFlow) {
            commit('SIGN_UP_SUCCESS')
          }
        } else {
          commit('SIGN_IN_SUCCESS')
        }
      }
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(
        'error during verifyCode action: ',
        errorCode ? `error code: ${errorCode},` : null,
        errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
      )

      const errorStatus = {
        active: true,
        type: 0,
        text: errorMessage
      }
      commit('GENERAL_ERROR', errorStatus)
    }
  },

  signInWithGoogle({ commit, dispatch }, payload) {
    commit('GENERAL_REQUEST')
    // CREATE NEW GOOGLE AUTH PROVIDER AND SIGNIN, REDIRECTING BACK TO THIS PAGE AFTERWARDS
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithRedirect(provider)
  },

  async resetPassword({ commit, dispatch }, email) {
    /*
     * SEND RESET PASSWORD EMAIL
     * FIRST PREPARE UI
     */
    commit('GENERAL_REQUEST')

    try {
      // SEND THE EMAIL
      const reset = await firebase.auth().sendPasswordResetEmail(email)
      if (reset) {
        // PREPARE UI
        commit('PASSWORD_RESET_SUCCESS')
      }
    } catch (error) {
      // CREATE ERROR SPECIFIC MESSAGES FOR VUESAX ALERT COMPONENT
      const errorCode = error.code
      const errorMessage = error.message
      console.log(
        'error during signInWithGoogle action: ',
        errorCode ? `error code: ${errorCode},` : null,
        errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
      )

      let errorStatus = {}
      if (errorCode) {
        switch (errorCode) {
        case 'auth/user-not-found':
          errorStatus = {
            active: true,
            type: 2,
            text: `We couldn't find an accout associated with this email. Please try again.`
          }
          break
        case 'auth/invalid-email':
          errorStatus = {
            active: true,
            type: 1,
            text: 'This seems to be an invalid email. Please try again.'
          }
          break
        }
      }
      // PREPARE UI
      commit('GENERAL_ERROR', errorStatus)
    }
  },

  async isEmailVerified({ commit, dispatch }, email) {
    try {
      const verified = await this.$server.isEmailVerified(deep(email))
      console.log('verified action :', verified)
      commit('UPDATE_EMAIL_VERIFIED', verified)
      return verified
    } catch (error) {
      console.log(
        'error while making axios call to isEmailVerified serverMiddleware route'
      )
    }
  },

  async updateProfile({ commit, dispatch }, params) {
    try {
      const update = await this.$server.updateProfile(
        params.uid,
        params.userData
      )
      if (update) {
        commit('UPDATE_USER', update.data.user)
        return update.data.user
      }
    } catch (error) {
      console.log(
        'error while making axios call to updateProfile serverMiddleware route'
      )
    }
  },

  updateUser({ commit, dispatch }) {
    const user = firebase.auth().currentUser
    commit('UPDATE_USER', user)
  }
}

export const mutations = {
  UPDATE_STATUS(state, update) {
    state.status = {
      ...state.status,
      ...update.status,
      error: { ...state.error, ...update.error }
    }
  },
  GENERAL_REQUEST(state) {
    state.status = {
      ...state.status,
      thinking: true,
      submitBtnDisabled: true,
      disableFields: true,
      error: { ...state.error, active: false }
    }
  },
  SIGN_UP_REQUEST(state) {
    state.status = {
      ...state.status,
      signUpRequested: true
    }
  },
  SIGN_UP_SUCCESS(state) {
    state.status = {
      ...state.status,
      thinking: false,
      submitBtnDisabled: false,
      disableFields: false,
      submitBtnColor: 'is-success',
      error: { ...state.error, active: false }
    }
  },
  GENERAL_ERROR(state, errorStatus) {
    state.status = {
      ...state.status,
      thinking: false,
      submitBtnDisabled: false,
      disableFields: false,
      submitBtnTempColor: 'is-warning',
      error: { ...state.error, errorStatus }
    }

    setTimeout(() => {
      state.status = {
        ...state.status,
        submitBtnTempColor: 'is-primary'
      }
    }, 4500)
  },
  RESET_ERROR_STATE(state) {
    state.status = {
      ...state.status,
      error: { active: false, type: 0, text: '' }
    }
  },
  SIGN_IN_SUCCESS(state) {
    state.status = {
      ...state.status,
      reAuthorized: true,
      thinking: false,
      submitBtnDisabled: false,
      submitBtnColor: 'is-success',
      error: { ...state.error, active: false }
    }
  },
  SEND_VCODE_SUCCESS(state) {
    state.status = {
      ...state.status,
      thinking: false,
      submitBtnDisabled: false,
      disableFields: false,
      submitBtnColor: 'is-primary',
      enterVerificationCode: true,
      error: { ...state.error, active: false }
    }
  },
  PASSWORD_RESET_SUCCESS(state) {
    state.status = {
      ...state.status,
      thinking: false,
      submitBtnDisabled: false,
      disableFields: false,
      submitBtnColor: 'is-success',
      passwordResetEmailSent: true,
      error: { ...state.error, active: false }
    }
  },
  UPDATE_ONBOARDED_CONFIRMED(state, onboarded) {
    state.status = {
      ...state.status,
      onboardedConfirmed: onboarded
    }
  },
  UPDATE_IS_ORIGINAL_EMAIL(state, isOriginal) {
    state.status = {
      ...state.status,
      isOriginalEmail: isOriginal
    }
  },
  UPDATE_EMAIL_VERIFIED(state, verified) {
    state.status = {
      ...state.status,
      emailVerified: verified
    }
  },
  UPDATE_USER(state, user) {
    state.user = user
  }
}

export const getters = {
  getUser: (state) => state.user,
  getStatus: (state) => state.status
}
