import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'

export const state = () => ({
  status: {
    thinking: false,
    disableSubmitBtn: false,
    disableFields: false,
    submitBtnColor: 'is-primary',
    signUpRequested: false,
    justSignedUp: false,
    createProfileStartSlide: 0,
    showCreateProfile: false,
    error: {
      active: false,
      type: 0,
      text: '',
    },
  }
})


export const actions = {
  async nuxtServerInit ({ commit }) {
    //
  },

  async signUp({ commit, dispatch }, creds) {
    try {

      commit('GENERAL_REQUEST')
      commit('SIGN_UP_REQUEST')
      // CREATE FIREBASE USER WITH EMAIL AND PASSWORD
      const createUser = await firebase.auth().createUserWithEmailAndPassword(creds.email, creds.password)
      const newUserFlow = await this.$server.createUser(createUser.user.email, createUser.user.uid, (creds.provider ? creds.provider : 'password'))
      if (newUserFlow) {
        commit('SIGN_UP_SUCCESS')
        // SEND VERIFICATION EMAIL TO NEW USER
        const user = firebase.auth().currentUser;
        user.sendEmailVerification()
      }

    } catch (error) {

      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(
        'error during signUp action: ', 
        errorCode ? `error code: ${errorCode},` : null,
        errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
      );

      let errorStatus = {}
      if (errorCode) {
        switch (errorCode) {
          case 'auth/email-already-in-use':
            errorStatus = { active: true, type: 3, text: `Looks like this email is already associated with an active account.` }
            break
          case 'auth/invalid-email':
            errorStatus = { active: true, type: 1, text: 'This seems to be an invalid email. Please try again.' }
            break
        }
      }
      commit('GENERAL_ERROR', errorStatus)

    }
  },

  async signIn({ commit, dispatch}, payload) {

    commit('GENERAL_REQUEST')

    try {
      // SIGN INTO FIREBASE WITH EMAIL AND PASSWORD
      if (payload.reauthQuery) {
        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email, 
          payload.password
        )

        const fbReauth = await user.reauthenticateWithCredential(credential)
        if (fbReauth) {
          commit('SIGN_IN_SUCCESS')
          //TODO: Rethink logic for OnAuthStateChange('reauth) flow
          // vm.OnAuthStateChange('reauth');
        }
      } else {
        const fbSignIn = await firebase.auth().signInWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
        if (fbSignIn) {
          commit('SIGN_IN_SUCCESS')
        }
      }

    } catch (error) {

      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(
        'error during signUp action: ', 
        errorCode ? `error code: ${errorCode},` : null,
        errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
      );

      let errorStatus = {}
      if (errorCode) {
        switch (errorCode) {
          case 'auth/wrong-password' || 'auth/user-not-found':
            errorStatus = { active: true, type: 0, text: 'Incorrect email or password.' }
            break
          case 'auth/invalid-email':
            errorStatus = { active: true, type: 1, text: 'This seems to be an invalid email. Please try again.' }
            break
        }
      }
      commit('GENERAL_ERROR', errorStatus)

    }
  },

  async signInWithGoogle({ commit, dispatch}, payload) {
    commit('GENERAL_REQUEST')
    // CREATE NEW GOOGLE AUTH PROVIDER AND SIGNIN, REDIRECTING BACK TO THIS PAGE AFTERWARDS
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithRedirect(provider)
  },

  async resetPassword({ commit, dispatch}, email) {
    // SEND RESET PASSWORD EMAIL
    // FIRST PREPARE UI
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
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(
        'error during signUp action: ', 
        errorCode ? `error code: ${errorCode},` : null,
        errorMessage ? `error message: ${errorMessage}` : `error: ${error}`
      );

      let errorStatus = {}
      if (errorCode) {
        switch (errorCode) {
          case 'auth/user-not-found':
            errorStatus = { active: true, type: 2, text: `We couldn't find an accout associated with this email. Please try again.` }
            break
          case 'auth/invalid-email':
            errorStatus = { active: true, type: 1, text: 'This seems to be an invalid email. Please try again.' }
            break
        }
      }
      // PREPARE UI 
      commit('GENERAL_ERROR', errorStatus)
    }
  },

  async hasOnboarded({ commit, dispatch}, uid) {
    // TRIGGER AXIOS CALL WHEN ONBOARDING HAS COMPLETED (IN THIS CASE, ONBOARDING IS JUST UPDATING PROFILE NAME)
    try {
      const onboarded = await this.$server.hasOnboarded(uid)
      let confirmed = onboarded.data.success ? onboarded.data.success : false
      commit('UPDATE_ONBOARDED_CONFIRMED', confirmed)
    } catch (error) {
      console.error('error while making axios call to hasOnboarded serverMiddleware route', error);
    }
  },

  async checkIfOnboarded({ commit, dispatch}) {
    try {
      const user = firebase.auth().currentUser;
      let db = firebase.firestore();
      const doc = await db.collection('users').doc(user.uid).get()
      if (doc) {
        let confirmed = null
        if (doc.data().onboarded) {
          confirmed = true
        } else {
          confirmed = false
        }
        commit('UPDATE_ONBOARDED_CONFIRMED', confirmed)
        return confirmed
      }
    } catch (error) {
      console.log("Error getting firestore user document to check onboarded state:", error);
    }
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
    }, 4500);
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
  SHOW_CREATE_PROFILE(state, startSlide = 0) {
    state.status = {
      ...state.status,
      justSignedUp: true,
      thinking: false,
      createProfileStartSlide: startSlide,
      showCreateProfile: true
    }
  }
}


export const getters = {
  getStatus: state => state.status,
  getCreateProfileStartSlide: state => state.status.createProfileStartSlide,
  getShowCreateProfile: state => state.status.showCreateProfile,
}