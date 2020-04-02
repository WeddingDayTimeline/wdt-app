<template>
  <div id="new-user-screen-wrapper">
    <div v-if="Slide !== 3" id="auth-card" class="card">
      <header id="auth-card-header" class="card-header">
        <p class="card-header-title">{{ Slide !== 3 ? 'Create Profile' : 'Next Steps' }}</p>
      </header>
      <div id="new-user-screen-cont">
        <div v-if="Slide === 0" id="new-user-slide-0" class="new-user-slide">
          <div class="new-user-slide-text">
            <b-icon
              class="new-user-slide-main-icon"
              type="is-success"
              custom-size="is-large"
              icon="check"
            />
            <span class="new-user-slide-text">Next, lets create your profile...</span>
          </div>
          <div class="new-user-slide-btn-cont">
            <b-button class="med-width-button" type="is-primary" @click="() => { Slide++ }">Next</b-button>
          </div>
        </div>
        <validation-observer tag="div" slim ref="NameObserver" v-slot="{invalid}">
          <div v-if="Slide === 1" id="new-user-slide-1" class="new-user-slide">
            <div class="new-user-slide-text">
              First, let's start with your name:
              <br />
              <br />
            </div>
            <div class="new-user-slide-input">
              <validation-provider rules="required" v-slot="{errors}" ref="NameRequired">
                <b-field :message="errors[0]">
                  <b-input
                    class="input"
                    placeholder="Full name"
                    type="text"
                    autofocus="true"
                    :readonly="DisableFields"
                    v-model="Input.Name"
                  />
                </b-field>
              </validation-provider>
            </div>
            <div class="new-user-slide-btn-cont">
              <b-button class="med-width-button" type="is-primary" @click="UpdateProfileName">Next</b-button>
            </div>
          </div>
        </validation-observer>
        <div v-if="Slide === 2" id="new-user-slide-2" class="new-user-slide">
          <update-user-photo instance="CreateProfile" @photoUpdated="() => { Slide++ }" />
        </div>
        <!-- <div v-if="Slide === 3" id="new-user-slide-3" class="new-user-slide">
          <div class="new-user-slide-text">
            <b-icon class="new-user-slide-main-icon" color="is-info" size="is-large" icon="envelope"></b-icon><br><br>
            <div class="text-inner">
              <span class="next-steps fw-400">Next steps:</span><br><br><br>
              <b-button class="mini-number-icon float-left" :type="NextStepsState.step1 ? 'is-success' : 'is-info'" :icon="NextStepsState.step1 ? 'check' : ''" size="is-small">{{NextStepsState.step1 ? '' : '1'}}</b-button><span :class="NextStepsState.step1 ? 'light-text' : ''"> Check your email to verify your account.</span><br><br>
              <b-button class="mini-number-icon float-left" :type="NextStepsState.step2 ? 'is-success' : 'is-info'" :icon="NextStepsState.step2 ? 'check' : ''" size="is-small">{{NextStepsState.step2 ? '' : '2'}}</b-button><span :class="NextStepsState.step2 ? 'light-text' : ''"> Ask your manager to check their email so they can approve your account.</span><br><br>
              <b-button class="mini-number-icon float-left" type="is-info" size="is-small">3</b-button> Refresh this page, and get started!
            </div>
          </div>
        </div>-->
      </div>
    </div>
    <b-notification v-if="Slide === 3" class="no-click" type="is-info" :closable="false" indefinite>
      <b-button
        class="refresh"
        type="is-primary"
        size="is-small"
        icon-right="redo-alt"
        :loading="Loading"
        @click="Refresh"
      >Refresh</b-button>
      <b-tag class="hide" size="is-small">0</b-tag>
      <span class="fs-2 fw-300">&nbsp; Next steps:</span>
      <br />
      <br />
      <b-tag :type="NextStepsState.step1 ? 'is-info' : 'is-primary'" size="is-small">
        {{ NextStepsState.step1 ? '' : '1' }}
        <b-icon v-if="NextStepsState.step1" icon="check" size="is-small" />
      </b-tag>
      <span
        :class="NextStepsState.step1 ? 'fw-300i light-text' : ''"
      >&nbsp; Check your email and verify your account.</span>
      <br />
      <br />
      <b-tag :type="NextStepsState.step2 ? 'is-info' : 'is-primary'" size="is-small">
        {{ NextStepsState.step2 ? '' : '2' }}
        <b-icon v-if="NextStepsState.step2" icon="check" size="is-small" />
      </b-tag>
      <span
        :class="NextStepsState.step2 ? 'fw-300i light-text' : ''"
      >&nbsp; Ask your manager to check their email and approve your account.</span>
      <br />
      <br />
      <b-tag type="is-primary" size="is-small">3</b-tag>&nbsp; Refresh this page, and get started!
    </b-notification>
    <GlobalEvents @keyup.enter="OnKeyUpEnter" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import UpdateUserPhoto from '~/components/shared/UpdateUserPhoto.vue'
import hubConfig from '~/hubConfig'

export default {
  name: 'Auth',
  components: {
    ValidationProvider,
    ValidationObserver,
    UpdateUserPhoto
  },
  data() {
    return {
      Input: {
        Name: ''
      },
      Error: {
        Active: false,
        Type: 0,
        Text: ''
      },
      Loading: false,
      DisableFields: false,
      Slide: null,
      PhotoUploadProgress: 0,
      UploadedPhotoURL: '',
      PhotoUploadBtnState: { icon: 'cloud_upload', color: 'primary' },
      OnboardedConfirmed: false,
      FileSizeLimit: 3000000, // FALLBACK SET TO 3MB HERE, BUT DON'T CHANGE THIS NUMBER, CHANGE IT IN hubConfig.js
      NextStepsState: { step1: false, step2: false }
    }
  },
  watch: {
    Slide() {
      /*
       * IF USER REACHES THE LAST newUser SLIDE,
       * CHECK IF USER HAS BEEN APPROVED
       */
      if (this.Slide === 3) {
        this.CheckIfApproved()
      }

      // MAKE SURE ANY ERRORS ARE NOT CROSSING OVER INTO NEXT SLIDE
      this.ResetErrorState()
    }
  },
  computed: {
    ...mapGetters({
      CreateProfileStartSlide: 'auth/getCreateProfileStartSlide'
    })
  },
  methods: {
    ...mapActions('auth', ['isUserApproved', 'updateProfile', 'hasOnboarded']),
    async CheckIfApproved() {
      // Update UI
      this.Loading = true

      try {
        // CHECK IF USER HAS BEEN APPROVED
        const vm = this
        const user = firebase.auth().currentUser
        const get = await vm.isUserApproved(user.email)

        // IF APPROVED AND EMAIL IS VERIFIED, REDIRECT TO DASHBOARD
        if (get.data.approved && get.data.emailVerified) {
          this.$root.context.redirect('/dash')
        } else {
          // IF EMAIL IS VERIFIED, SET ICON STATE
          if (get.data.emailVerified) {
            this.NextStepsState.step1 = true
          }
          // IF APPROVED, SET ICON STATE
          if (get.data.approved) {
            this.NextStepsState.step2 = true
          }
        }

        // Update UI
        this.Loading = false
      } catch (error) {
        vm.Loading = false
        console.log(
          'caught error in newUserSlide watcher axios call to isUserApproved:',
          error
        )
      }
    },
    async UpdateProfileName() {
      const vm = this
      // CHECK IF NAME FIELD IS VALID IF SO, COMPLETE FUNCTION
      const isValid = await vm.$refs.NameObserver.validate()
      if (isValid) {
        try {
          // UPDATE PROFILE NAME UPON COMPLETING FORM, THEN GO TO NEXT NEW-USER SLIDE, THEN CALL HasOnboarded FUNCTION TO SET FIREBASE USER DOC TO ONBOARDED:TRUE
          const user = await firebase.auth().currentUser
          const update = await vm.updateProfile({
            uid: user.uid,
            userData: { displayName: vm.Input.Name }
          })
          if (update) {
            vm.Slide++
            vm.HasOnboarded(user.uid)
          }
        } catch (error) {
          console.log(
            'caught error while updating user profile display name: ',
            error
          )
        }
      }
    },
    ChooseProfilePhoto() {
      // TRIGGER CLICK ON HIDDEN FILE INPUT ELEMENT TO OPEN OS'S NATIVE UPLOAD WINDOW
      const fileRef = this.$refs.File
      fileRef.click()
    },
    async HasOnboarded(uid) {
      // TRIGGER AXIOS CALL WHEN ONBOARDING HAS COMPLETED (IN THIS CASE, ONBOARDING IS JUST UPDATING PROFILE NAME)
      try {
        const onboarded = await this.hasOnboarded(uid)
        if (onboarded.data.success) {
          this.OnboardedConfirmed = true
          return true
        } else {
          this.OnboardedConfirmed = false
          return false
        }
      } catch (error) {
        console.error(
          'error while making axios call to hasOnboarded serverMiddleware route',
          error
        )
        return false
      }
    },
    Refresh() {
      window.location.reload(false)
    },
    ResetErrorState() {
      // MAKE SURE ANY ERRORS ARE NOT CROSSING OVER INTO NEXT SLIDE
      this.Error = {
        Active: false,
        Type: 0,
        Text: ''
      }
    },
    OnKeyUpEnter() {
      // DIFFERENT FUNCTIONS FOR ENTER-KEY-PRESS EVENT DEPENDING ON STATE OR NEW-USER SLIDE
      if (this.Slide === 0) {
        this.Slide++
      } else if (this.Slide === 1) {
        this.UpdateProfileName()
      } else if (this.Slide > 1) {
        return null
      }
    }
  },
  created() {
    // Set startSlide prop as local data slide number
    this.Slide = this.CreateProfileStartSlide
    // IMPORT FILE SIZE LIMIT FROM hubConfig.js
    const digUser = hubConfig.user
    this.FileSizeLimit = digUser.profilePhotoSizeLimit

    this.ResetErrorState()
  }
}
</script>

<style scoped lang="scss">
.progress {
  width: calc(22rem - 0.5rem);
  margin-bottom: -3px;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
  cursor: default;
}

#input-cont,
#input-cont-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error {
  max-width: 220px;
  height: min-content !important;
}

.error * {
  line-height: 1.333rem;
}

.loading #auth-card-header,
.loading #input-cont,
.loading #input-cont * {
  opacity: 0;
}

.mostly-hidden {
  opacity: 0.1;
}

#auth-card {
  display: flex;
  flex-direction: column;
  width: 22rem;
  max-width: 100%;
  height: auto;
  min-height: 16rem;
}

::v-deep .vs-card--content {
  height: calc(100% - 38.4px); // 38.4px is header height and is consistent.
}

#new-user-screen-cont {
  flex: 1;
  padding: 0.666rem;
}

#logo-cont {
  display: flex;
  justify-content: center;
  margin: 4rem 0;
}

#logo {
  font-size: 2rem;
  color: material-color('blue-grey', '200');
  cursor: default;
}

.input,
.input-validation-provider {
  margin-bottom: 1rem;
}

.check.remember-me {
  align-self: flex-start;
  color: material-color('blue-grey', '300');
}

.forgot {
  cursor: pointer;
}

.forgot-password {
  align-self: flex-end;
  margin-top: -0.5rem;
  color: $primary;
}

.check.remember-me,
.forgot-password {
  font-size: 0.75rem;
}

.submit-btn {
  margin: 2.5rem 0 0.5rem;
}

#google-option-cont {
  display: flex;
  flex-direction: column;
  width: auto;
  margin: 1.2rem 0 0;
}

#google-option-cont .or-cont {
  display: flex;
  width: 200px;
  margin: 0 0 0.333rem;
}

#google-option-cont hr {
  flex: 1;
  background-color: transparent;
  border-bottom: 1px solid material-color('blue-grey', '100');
  border-top: none;
  border-right: none;
  border-left: none;
}

#google-option-cont .or {
  margin: -0.5rem 0.666rem 0;
  color: material-color('blue-grey', '200');
  cursor: default;
}

#bottom {
  margin-top: 4rem;
  color: material-color('blue-grey', '300');
  cursor: default;
}

#bottom.forgot {
  margin-top: 0.5rem;
}

#bottom a {
  margin: 0 0 0 0.2rem;
  color: material-color('blue-grey', '300');
  cursor: pointer;
}

#bottom a:hover {
  color: $primary;
}

#bottom a.primary,
.error span {
  color: $primary;
}

.reset-instructions {
  max-width: 200px;
  color: material-color('blue-grey', '500');
}

.new-user-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.new-user-slide-main-icon {
  margin: 2rem 0;
}

.new-user-slide-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
  color: material-color('blue-grey', '600');
}

#new-user-slide-1 .new-user-slide-text {
  flex: 1;
  justify-content: center;
  padding-top: 3rem;
}

.new-user-slide-input {
  flex: 1;
  display: flex;
  justify-content: center;
}

.new-user-slide-btn-cont {
  display: flex;
  justify-content: flex-end;
  margin-top: 3rem;
}

// #new-user-slide-2 .new-user-slide-btn-cont {
//     justify-content: space-around;
// }

.skip {
  padding-top: 0.333rem;
  color: material-color('blue-grey', '300');
}

// .uploaded-img {
//   width: 5rem;
//   height: 5rem;
//   margin: 3rem 0;
//   border-radius: 6px;
// }

.next-steps {
  margin-left: 2.25rem;
  color: material-color('blue-grey', '400');
}

::v-deep .mini-number-icon i {
  margin-right: 0 !important;
}

.light-text {
  opacity: 0.85;
}

.validation-errors {
  display: block;
  margin: -0.5rem 0 0;
  color: $danger;
  font-style: italic;
}

button.refresh {
  position: absolute;
  top: 0;
  right: 0;
  margin: 1rem 1.25rem;
  pointer-events: auto;
}

.tag .icon {
  vertical-align: text-bottom;
}
</style>

<style lang="scss">
</style>
