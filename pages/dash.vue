<template>
  <div id="dash-page-wrapper">
    <div
      id="layout"
      :class="[
        GetNavRightState.open ? 'nav-right-on' : '',
        GetNavLeftState.open ? 'nav-left-on' : ''
      ]"
    >
      <header class="header">
        <div id="header-left">
          <!-- <button @click="LogOut()"></button> -->
        </div>
        <div id="header-right">
          <!-- <vs-button id="notif-icon-cont" color="primary" type="flat" size="large" icon="notifications"></vs-button> -->
          <div class="notif-icon-cont" @click="ClickHeaderRight('notif')">
            <md-icon class="notif-icon">notifications</md-icon>
          </div>
          <div id="user-area-cont" @click="ClickHeaderRight('user')">
            <div class="user-avatar-cont">
              <img v-if="User.photoURL" :src="User.photoURL" />
              <md-icon v-else class="user-avatar">account_circle</md-icon>
            </div>
            <div class="user-name-cont">
              <span class="user-name">{{ User.displayName }}</span>
            </div>
          </div>
        </div>
      </header>
      <aside id="nav-left">
        <div id="burger-cont" @click="ClickBurgerCont">
          <md-icon class="burger">sort</md-icon>
        </div>
      </aside>
      <nav-right-notif
        v-if="GetNavRightState.open && GetNavRightState.mode === 'notif'"
        :nav-right-open="GetNavRightState.open"
        v-click-outside="ClickOutsideNavRight"
      />
      <nav-right-user
        v-if="GetNavRightState.open && GetNavRightState.mode === 'user'"
        :nav-right-open="GetNavRightState.open"
        :user="User"
        v-click-outside="ClickOutsideNavRight"
      />
      <main class="main" />
    </div>
    <!-- <button @click="LogOut()">Log out</button> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import Logo from '~/components/Logo.vue'
import hubConfig from '~/hubConfig.js'
import NavRightNotif from '~/components/dash/NavRightNotif.vue'
import NavRightUser from '~/components/dash/NavRightUser.vue'
import deep from '~/utils/deep'

export default {
  name: 'Dash',
  components: {
    Logo,
    NavRightNotif,
    NavRightUser
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      User: 'auth/getUser',
      GetNavRightState: 'getNavRightState',
      GetNavLeftState: 'getNavLeftState'
    })
  },
  methods: {
    ClickBurgerCont() {
      this.$store.commit('updateNavLeftState', null)
    },
    ClickHeaderRight(area) {
      const payload = { area, open: true }
      this.$store.commit('updateNavRightState', payload)
    },
    ClickOutsideNavRight(event) {
      // IF USER CLICKS ANYWHERE OUTSIDE OF nav-right EXCEPT FOR header-right ELEMENTS, THEN CLOSE nav-right
      if (
        !event.target.classList.contains('notif-icon-cont') &&
        event.target.id !== 'user-area-cont'
      ) {
        const payload = { open: false }
        this.$store.commit('updateNavRightState', payload)
      } else {
      }
    }
  },
  mounted() {
    const vm = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        vm.$store.commit('auth/UPDATE_USER', deep(user))
      }
    })
  }
}
</script>

<style scoped lang="scss">
#dash-page-wrapper {
  display: flex;
  flex-direction: column;
  width: calc(100% - #{$layout-margin-sum}rem);
  height: calc(100% - #{$layout-margin-sum}rem);
  min-height: calc(100vh - #{$layout-margin-sum}rem);
  margin: #{$layout-margin}rem;
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1); // MIMICKING VUESAX CARD FOR MAIN LAYOUT
  border-radius: 8px; // MIMICKING VUESAX CARD FOR MAIN LAYOUT
  overflow: hidden; // JUST TO MAKE SURE BORDER-RADIUS IS MASKNIG ALL CHILDREN LAYERS
}

#layout {
  flex: 1;
  display: grid;
  grid-template-columns: 4rem 1fr 0;
  grid-template-rows: #{$header-height}rem 1fr;
  grid-template-areas:
    'nav-left header header'
    'nav-left main nav-right';
  height: 100%;
  width: 100%;
}

#layout.nav-left-on {
  grid-template-columns: 12rem 1fr 0;
}

#layout.nav-right-on {
  grid-template-columns: 4rem 1fr 15rem;
}

#layout.nav-right-on.nav-left-on {
  grid-template-columns: 12rem 1fr 15rem;
}

header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  background-color: #648ca6;
}

#nav-left {
  grid-area: nav-left;
  background-color: #394263;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: #{$header-height}rem;
}

main {
  grid-area: main;
  background-color: #8fd4d9;
}

#header-left {
  flex: 1;
  height: 100%;
}

#header-right {
  display: grid;
  grid-template-columns: 4em 1fr;
  grid-template-rows: 100%;
  width: 15rem;
  height: 100%;
  background-color: #fff;
  pointer-events: auto;
  cursor: pointer;
}

#user-area-cont {
  grid-column: span 1;
  justify-content: center;
  display: grid;
  grid-template-columns: 4em 1fr;
  grid-template-rows: 100%;
  cursor: pointer;
}

#header-right .notif-icon-cont {
  pointer-events: auto;
  cursor: pointer;
  display: flex;
}

#header-right .notif-icon {
  color: material-color('blue-grey', '200');
  pointer-events: none;
}

.user-avatar-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  pointer-events: none;
}

.user-avatar-cont img,
.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  pointer-events: none;
}

.user-avatar-cont img {
  background-color: material-color('blue-grey', '200');
}

.user-avatar {
  font-size: 2.375rem !important; // ACTUAL SIZE COMES OUT TO 2 REM
  color: material-color('blue-grey', '200') !important;
  background-color: material-color('blue-grey', '50');
}

.user-name-cont {
  display: flex;
  align-items: center;
  font-weight: 400;
  color: material-color('blue-grey', '400');
  pointer-events: none;
}

.user-name {
  pointer-events: none;
}

#burger-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

#layout.nav-left-on #burger-cont {
  width: 4rem;
}
</style>

<style lang="scss"></style>
