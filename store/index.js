
export const state = () => ({
  firebaseInit: false,
  auth: {
    state: null,
    createProfileStartSlide: 0,
    showCreateProfile: false
  },
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


export const actions = {
  async nuxtServerInit ({ commit }) {
    //
  }
}


export const mutations = {
  updateFirebaseInitState(state, payload) {
      state.firebaseInit = payload
  },
  updateAuthState(state, payload) {
    state.auth.state = payload;
  },
  updateCreateProfileStartSlide(state, slideNumber) {
    state.auth.createProfileStartSlide = slideNumber;
  },
  updateShowCreateProfile(state, payload) {
    state.auth.showCreateProfile = payload;
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


export const getters = {
  getFirebaseInit: state => state.firebaseInit,
  getAuthState: state => state.auth.state,
  getCreateProfileStartSlide: state => state.auth.createProfileStartSlide,
  getShowCreateProfile: state => state.auth.showCreateProfile,
  getUserInfo: state => state.userInfo,
  getNavRightState: state => state.navRightState,
  getNavLeftState: state => state.navLeftState,
}