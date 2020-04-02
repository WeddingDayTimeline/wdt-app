<template>
  <div id="auth-page-wrapper">
    <Login v-if="!ShowCreateProfile" />
    <CreateProfile v-if="ShowCreateProfile" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Login from '~/components/login/Login.vue'
  import CreateProfile from '~/components/login/CreateProfile.vue'

  export default {
    name: 'auth',
    components: {
      Login,
      CreateProfile
    },
    data() {
      return {
        //
      }
    },
    computed: {
      ...mapGetters({
        ShowCreateProfile: 'auth/getShowCreateProfile'
      })
    }
  }
</script>

<style scoped lang="scss">
  #auth-page-wrapper {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>

<style lang="scss"></style>
