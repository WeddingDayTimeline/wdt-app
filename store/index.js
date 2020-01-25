
export const state = () => ({
  firebaseInit: false
})


export const mutations = {
  updateFirebaseInitState(state, payload) {
      state.firebaseInit = payload
      console.log('state.firebaseInit:', state.firebaseInit)
  }
}


export const actions = {
  async nuxtServerInit ({ commit }) {
  }
}


export const getters = {
  getFirebaseInit: state => state.firebaseInit,
}