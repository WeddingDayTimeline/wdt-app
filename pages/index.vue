<template>
  <div id="auth-page-wrapper">
    <login />
  </div>
</template>

<script>
import Login from '~/components/login/Login.vue'

export default {
  name: 'Auth',
  components: {
    Login
  },
  data() {
    return {
      //
    }
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
