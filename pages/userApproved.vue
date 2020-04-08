<template>
  <div id="user-approved-page-wrapper">
    <vs-card id="card">
      <div
        v-if="
          this.$route.query.success === 'true' &&
            !this.$route.query.alreadyApproved
        "
        class="inner-cont success"
      >
        <vs-button class="main-icon" radius color="success" size="large" type="filled" icon="done" />
        <br />
        <br />
        <p>
          <span class="bold">{{ this.$route.query.email }}</span> has been
          approved!
          <br />
          <br />You can now close this window.
        </p>
      </div>
      <div
        v-if="
          this.$route.query.success === 'true' &&
            this.$route.query.alreadyApproved
        "
        class="inner-cont success"
      >
        <vs-button class="main-icon" radius color="success" size="large" type="filled" icon="done" />
        <br />
        <br />
        <p>
          It looks like
          <span class="bold">{{ this.$route.query.email }}</span> has already
          been approved for your app.
          <br />
          <br />You may now close this window.
        </p>
      </div>
      <div v-if="this.$route.query.success === 'false'" class="inner-cont error">
        <vs-button class="main-icon" radius color="danger" size="large" type="filled" icon="error" />
        <br />
        <br />
        <p>
          It looks like there was an issue approving
          {{
          this.$route.query.email
          ? this.$route.query.email + ' for your app.'
          : 'this user for your app.'
          }}
          <br />
          <br />If you need further help, please don't hesitate to contact Dolan
          Internet Group for support.
          <br />
          <br />
          <a :href="'mailto:' + appConfig.wdt.supportEmail">
            {{
            appConfig.wdt.supportEmail
            }}
          </a>
          <br />
          <a :href="FormatPhone('link', appConfig.wdt.supportPhone)">
            {{
            FormatPhone('display', appConfig.wdt.supportPhone)
            }}
          </a>
        </p>
      </div>
    </vs-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import appConfig from '~/appConfig.js'
import formatPhone from '~/utils/formatPhone.js'

export default {
  name: 'UserApproved',
  components: {},
  // Mixins: [ onAuthStateChanged ],
  data() {
    return {
      Loaded: false,
      appConfig: appConfig,
      FormatPhone: formatPhone
    }
  },
  computed: {
    ...mapGetters({
      // GetFirebaseInit: 'getFirebaseInit',
    })
  },
  methods: {
    LogOut() {
      setTimeout(() => {
        firebase.auth().signOut()
      }, 2000)
    }
  },
  mounted() {}
}
</script>

<style scoped lang="scss">
#user-approved-page-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#card {
  width: 22rem;
  max-width: 100%;
  height: auto;
  // min-height: 22rem;
  padding: 2rem 1rem 1.5rem;
}

::v-deep .vs-card--content {
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.inner-cont {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.inner-cont * {
  font-size: 1rem;
  text-align: center;
}

.main-icon {
  margin: 0 0 2rem;
}

.bold {
  font-weight: 500;
  color: material-color('blue-grey', '400');
}
</style>

<style lang="scss"></style>
