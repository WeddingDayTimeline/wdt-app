
export const state = () => ({
  firebaseInit: false,
  authState: null
})


export const mutations = {
  updateFirebaseInitState(state, payload) {
      state.firebaseInit = payload
      console.log('state.firebaseInit:', state.firebaseInit)
  },
  updateAuthState(state, payload) {
    state.authState = payload;
  }
}


export const actions = {
  async nuxtServerInit ({ commit }) {
  }
}


export const getters = {
  getFirebaseInit: state => state.firebaseInit,
  getAuthState: state => state.authState,
}