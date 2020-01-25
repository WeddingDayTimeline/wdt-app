<template>
  <div id="auth-page-wrapper">
    <vs-card id="auth-card">
      <div id="auth-card-header" slot="header">
        Sign In
      </div>
      <div id="logo-cont">
        <div id="logo">
          DIG hub
        </div>
      </div>
      <div id="input-cont">
        <div id="input-cont-inner">
          <vs-input class="input" icon-no-border icon="email" placeholder="Email" type="email" v-model="Input.email"/>
          <vs-input class="input" icon-no-border icon="lock" placeholder="Password" type="password" v-model="Input.password"/>
          <vs-checkbox class="check check-mini remember-me" v-model="Options.rememberMe">Keep me signed in</vs-checkbox>
          <vs-button id="sign-in-btn" class="full-width-button" type="relief">Sign in</vs-button>
          <a class="forgot-password" href="">Forgot password?</a>
          <div id="bottom">
            Need an account? <a href="">Sign up</a>
          </div>
        </div>
      </div>
    </vs-card>
  </div>
</template>


<script>
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  data() {
    return {
      FirebaseUIInit: false,
      Input: {
        email: '',
        password: ''
      },
      Options: {
        rememberMe: false
      }
    };
  }, /*
  watch: {
    GetFirebaseInit: function () {
      if (!this.FirebaseUIInit && this.GetFirebaseInit) {
        this.FirebaseUI()
      }
    }
  }, */
  computed: {
    ...mapGetters({
      GetFirebaseInit: 'getFirebaseInit'
    }),
  },
  methods: {
  },
  mounted() {
    setTimeout(() => {
      if (this.GetFirebaseInit) {
        // this.FirebaseUI()
      } else {
        console.log('nope');
      }
    }, 5000);

  }
}
</script>


<style scoped lang="scss">

#auth-page-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#auth-card {
  width: 24rem;
  height: auto;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
}

#logo-cont {
  display: flex;
  justify-content: center;
  margin: 4rem 0;
}

#logo {
  font-size: 2rem;
  color: material-color('blue-grey', '200');
}

#input-cont, #input-cont-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input:not(last-child) {
  margin-bottom: 1rem;
}

.check.remember-me {
  align-self: flex-start;
  color: material-color('blue-grey', '300');
}

.forgot-password {
  align-self: flex-end;
  color: $primary;
}

.check.remember-me, .forgot-password {
  font-size: .75rem;
}

#sign-in-btn {
  margin: 2rem 0 .5rem;
}

#bottom {
  margin-top: 4rem;
  color: material-color('blue-grey', '300');
}

#bottom a {
  color: material-color('blue-grey', '500');
}

</style>


<style lang="scss">

</style>
