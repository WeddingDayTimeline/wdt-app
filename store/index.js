
export const state = () => ({
  firebaseInit: false,
  authState: null,
  userInfo: {
    uid: '',
    name: '',
    email: '',
    photo: ''
  },
  navRightState: {
    open: false,
    mode: 'notif'
  },
  navLeftState: {
    open: false
  }
})


export const mutations = {
  updateFirebaseInitState(state, payload) {
      state.firebaseInit = payload
  },
  updateAuthState(state, payload) {
    state.authState = payload;
  },
  updateUserInfo(state, userInfo) {
    Object.assign(state.userInfo, userInfo)
  },
  updateNavLeftState(state, payload) {
    state.navLeftState.open ? state.navLeftState.open = false : state.navLeftState.open = true
  },
  updateNavRightState(state, payload) {
    state.navRightState.open = payload.open;
    payload.area ? state.navRightState.mode = payload.area : null;
  },
}


export const actions = {
  async nuxtServerInit ({ commit }) {
    //
  }
}


export const getters = {
  getFirebaseInit: state => state.firebaseInit,
  getAuthState: state => state.authState,
  getUserInfo: state => state.userInfo,
  getNavRightState: state => state.navRightState,
  getNavLeftState: state => state.navLeftState,
}