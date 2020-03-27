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

      commit('signUpInRequest')
      // CREATE FIREBASE USER WITH EMAIL AND PASSWORD
      const createUser = await firebase.auth().createUserWithEmailAndPassword(creds.email, creds.password)
      const newUserFlow = await this.$server.createUser(createUser.user.email, createUser.user.uid)
      if (newUserFlow) {
        commit('signUpSuccess')
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
      commit('signUpError', errorStatus)
      
    }
  },

  async signIn({ commit, dispatch}, payload) {

    commit('signUpInRequest')

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
          commit('signInSuccess')
          //TODO: Rethink logic for OnAuthStateChange('reauth) flow
          // vm.OnAuthStateChange('reauth');
        }
      } else {
        const fbSignIn = await firebase.auth().signInWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
        if (fbSignIn) {
          commit('signInSuccess')
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
      commit('signInError', errorStatus)

    }
  }
}


export const mutations = {
  signUpInRequest(state, payload) {
    state.status = {
      ...state.status,
      thinking: true,
      submitBtnDisabled: true,
      disableFields: true,
      error: { ...state.error, active: false }
    }
  },
  signUpSuccess(state, payload) {
    state.status = {
      ...state.status,
      thinking: false,
      submitBtnDisabled: false,
      disableFields: false,
      submitBtnColor: 'is-success',
      error: { ...state.error, active: false }
    }
  },
  signUpError(state, errorStatus) {
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
  signInSuccess(state, payload) {
    state.status = {
      ...state.status,
      reAuthorized: true,
      thinking: false,
      submitBtnDisabled: false,
      submitBtnColor: 'is-success',
      error: { ...state.error, active: false }
    }
  },
  signInError(state, errorStatus) {
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
  }
}


export const getters = {
  getStatus: state => state.status
}