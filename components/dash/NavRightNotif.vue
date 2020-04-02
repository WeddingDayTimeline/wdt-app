<template>
  <aside id="nav-right" :class="ProfileSettingsExpanded ? 'profile-settings-expanded' : ''">
    <!--  -->
  </aside>
</template>

<script>
import { mapGetters } from 'vuex'
import hubConfig from '~/hubConfig.js'

export default {
  name: 'NavRightUser',
  components: {},
  props: {
    navRightOpen: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      //
    }
  },
  computed: {
    ...mapGetters({
      //   GetUserInfo: 'getUserInfo',
    })
  },
  methods: {
    //
  }
}
</script>

<style scoped lang="scss">
#nav-right {
  grid-area: nav-right;
  // background-color: #394263;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: #{$header-height}rem #{$header-height}rem;
}
</style>

<style lang="scss"></style>
