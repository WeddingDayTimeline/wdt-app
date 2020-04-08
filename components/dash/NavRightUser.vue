<template>
  <aside id="nav-right" :class="ProfileSettingsExpanded ? 'profile-settings-expanded' : ''">
    <div id="log-out-cont" @click="ClickLogOut">
      <md-icon class="log-out-icon">exit_to_app</md-icon>
      <span>Log out</span>
    </div>
    <div id="profile-settings-cont" :class="ProfileSettingsExpanded ? 'expanded' : ''">
      <div id="profile-settings-select" @click="ClickExpandProfileSettings">
        <md-icon class="profile-settings-icon">edit</md-icon>
        <span>Profile settings</span>
        <md-icon v-if="!ProfileSettingsExpanded" class="profile-settings-icon">expand_more</md-icon>
        <md-icon v-else class="profile-settings-icon">expand_less</md-icon>
      </div>
      <div v-if="ProfileSettingsExpanded" id="profile-settings">
        <div id="profile-name-section" class="section">
          <span class="label">Display name</span>
          <span @click="ClickEdit('displayName')">
            <md-icon>{{ Editing !== 'displayName' ? 'edit' : 'close' }}</md-icon>
          </span>
          <br />
          <span
            v-if="Editing !== 'displayName'"
            class="display-name-preview no-click"
          >{{ User.displayName }}</span>
          <div v-if="Editing === 'displayName'" class="edit-area">
            <validation-observer tag="div" slim ref="NameObserver" v-slot="{invalid}">
              <validation-provider rules="required" v-slot="{errors}" ref="NameRequired">
                <vs-input
                  class="input"
                  :placeholder="User.displayName"
                  type="text"
                  autofocus="true"
                  :readonly="DisableFields"
                  v-model="Input.Name"
                />
                <span class="validation-errors no-click">{{ errors[0] }}</span>
              </validation-provider>
              <vs-button
                class="reg-width-button"
                :class="ButtonColor === 'success' ? 'no-click' : ''"
                :color="ButtonColor"
                :icon="ButtonColor === 'success' ? 'done' : (ButtonColor === 'danger' ? 'error' : '')"
                :disabled="DisableButtons"
                @click="UpdateDisplayName"
              >{{ ButtonColor === 'success' ? '' : 'Update name' }}</vs-button>
            </validation-observer>
          </div>
        </div>
        <div id="profile-email-section" class="section">
          <span class="label">Email address</span>
          <span @click="ClickEdit('email')">
            <md-icon>{{ Editing !== 'email' ? 'edit' : 'close' }}</md-icon>
          </span>
          <br />
          <span v-if="Editing === 'email'">
            Current email:
            <br />
          </span>
          <span class="email-preview no-click">{{ User.email }}</span>
          <div v-if="Editing === 'email'" class="edit-area">
            <validation-observer tag="div" slim ref="EmailObserver" v-slot="{invalid}">
              <validation-provider
                rules="required|email"
                mode="lazy"
                v-slot="{errors}"
                ref="EmailRequired1"
              >
                <vs-input
                  class="input"
                  placeholder="new email"
                  type="email"
                  autofocus="true"
                  :readonly="DisableFields"
                  v-model="Input.Email1"
                />
                <span class="validation-errors no-click">{{ errors[0] }}</span>
              </validation-provider>
              <validation-provider
                :rules="{required: true, email: true, is: Input.Email1}"
                mode="lazy"
                v-slot="{errors}"
                ref="EmailRequired2"
              >
                <vs-input
                  class="input"
                  placeholder="re-enter email"
                  type="email"
                  :readonly="DisableFields"
                  v-model="Input.Email2"
                />
                <span class="validation-errors no-click">{{ errors[0] }}</span>
              </validation-provider>
              <vs-button
                class="reg-width-button"
                :class="ButtonColor === 'success' ? 'no-click' : ''"
                :color="ButtonColor"
                :icon="ButtonColor === 'success' ? 'done' : (ButtonColor === 'danger' ? 'error' : '')"
                :disabled="DisableButtons"
                @click="UpdateEmail"
              >{{ ButtonColor === 'success' ? '' : 'Update email' }}</vs-button>
            </validation-observer>
          </div>
        </div>
        <div id="profile-photo-section" class="section">
          <span class="label">Profile photo</span>
          <span @click="ClickEdit('photo')">
            <md-icon>{{ Editing !== 'photo' ? 'edit' : 'close' }}</md-icon>
          </span>
          <br />
          <img v-if="User.photoURL" :src="User.photoURL" />
          <div v-if="Editing === 'photo'" class="edit-area">
            <update-user-photo @NewUserSlideAddIncr="() => { this.Editing = '' }" />
          </div>
        </div>
        <div id="profile-password-section" class="section">
          <span class="label">Password</span>
          <span @click="ClickEdit('password')">
            <md-icon>{{ Editing !== 'password' ? 'edit' : 'close' }}</md-icon>
          </span>
          <br />
          <div v-if="Editing === 'password'" class="edit-area">
            <validation-observer tag="div" slim ref="PasswordObserver" v-slot="{invalid}">
              <validation-provider
                :rules="{required: true}"
                mode="lazy"
                v-slot="{errors}"
                ref="OldPasswordRequired"
              >
                <vs-input
                  class="input"
                  placeholder="old password"
                  type="password"
                  autofocus="true"
                  :readonly="DisableFields"
                  v-model="Input.PasswordOld"
                />
                <span class="validation-errors no-click">{{ errors[0] }}</span>
              </validation-provider>
              <br />
              <br />
              <validation-provider
                :rules="{required: true, regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/}"
                mode="lazy"
                v-slot="{errors}"
                ref="PasswordRequired1"
              >
                <vs-input
                  class="input"
                  placeholder="new password"
                  type="password"
                  :readonly="DisableFields"
                  v-model="Input.PasswordNew1"
                />
                <span class="validation-errors no-click">{{ errors[0] }}</span>
              </validation-provider>
              <validation-provider
                :rules="{required: true, is: Input.PasswordNew1}"
                mode="lazy"
                v-slot="{errors}"
                ref="PasswordRequired2"
              >
                <vs-input
                  class="input"
                  placeholder="re-enter password"
                  type="password"
                  :readonly="DisableFields"
                  v-model="Input.PasswordNew2"
                />
                <span class="validation-errors no-click">{{ errors[0] }}</span>
              </validation-provider>
              <vs-button
                class="reg-width-button"
                :class="ButtonColor === 'success' ? 'no-click' : ''"
                :color="ButtonColor"
                :icon="ButtonColor === 'success' ? 'done' : (ButtonColor === 'danger' ? 'error' : '')"
                :disabled="DisableButtons"
                @click="UpdatePassword"
              >{{ ButtonColor === 'success' ? '' : 'Update password' }}</vs-button>
            </validation-observer>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import appConfig from '~/appConfig.js'
import UpdateUserPhoto from '~/components/shared/UpdateUserPhoto.vue'

export default {
  name: 'NavRightUser',
  components: {
    ValidationProvider,
    ValidationObserver,
    UpdateUserPhoto
  },
  props: {
    NavRightOpen: {
      type: Boolean,
      required: false
    },
    User: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      ProfileSettingsExpanded: false,
      Editing: '',
      Input: {
        Name: '',
        Email1: '',
        Email2: '',
        PasswordOld: '',
        PasswordNew1: '',
        PasswordNew2: ''
      },
      ButtonColor: 'primary',
      DisableFields: false,
      DisableButtons: false
    }
  },
  watch: {
    NavRightOpen() {
      if (this.NavRightOpen === false) {
        this.ProfileSettingsExpanded = false
      }
    }
  },
  methods: {
    ...mapActions('auth', ['updateProfile']),
    ClickExpandProfileSettings() {
      if (!this.ProfileSettingsExpanded) {
        this.ProfileSettingsExpanded = true
      } else if (this.ProfileSettingsExpanded) {
        this.ProfileSettingsExpanded = false
      }
    },
    ClickLogOut() {
      this.$client.signOut()
    },
    ClickEdit(setting) {
      if (this.Editing !== setting) {
        this.Editing = setting
      } else {
        this.Editing = ''
      }
    },
    UpdateUI(state) {
      // TAKES 'enable', 'success', 'disable', 'error'
      const vm = this
      // UPDATE UI
      if (state === 'disable') {
        vm.DisableFields = true
        vm.DisableButtons = true
        vm.ButtonColor = 'disabled'
      } else {
        vm.DisableFields = false
        vm.DisableButtons = false

        if (state === 'enable') {
          vm.ButtonColor = 'primary'
        } else if (state === 'success') {
          vm.ButtonColor = 'success'
        } else if (state === 'error') {
          vm.ButtonColor = 'danger'
        }
      }
    },
    async UpdateDisplayName() {
      const vm = this
      // CHECK IF NAME FIELD IS VALID IF SO, COMPLETE FUNCTION
      const isValid = await vm.$refs.NameObserver.validate()
      if (isValid) {
        // UPDATE UI
        vm.UpdateUI('disable')

        try {
          // UPDATE PROFILE NAME UPON COMPLETING FORM, THEN GO TO NEXT NEW-USER SLIDE, THEN CALL HasOnboarded FUNCTION TO SET FIREBASE USER DOC TO ONBOARDED:TRUE
          const user = firebase.auth().currentUser
          const update = await vm.updateProfile({
            uid: user.uid,
            userData: { displayName: vm.Input.Name }
          })
          if (update) {
            // UPDATE UI
            vm.UpdateUI('success')

            setTimeout(() => {
              vm.Editing = ''
            }, appConfig.ux.completionDelay.long)
          }
        } catch (error) {
          // UPDATE UI
          vm.UpdateUI('error')
          console.log(
            'caught error while updating user profile display name from profile settings: ',
            error
          )
        }
      }
    },
    async UpdateEmail() {
      const vm = this
      // CHECK IF NAME FIELD IS VALID IF SO, COMPLETE FUNCTION
      const isValid = await vm.$refs.EmailObserver.validate()
      if (isValid) {
        // UPDATE UI
        vm.UpdateUI('disable')

        // UPDATE PROFILE NAME UPON COMPLETING FORM, THEN GO TO NEXT NEW-USER SLIDE, THEN CALL HasOnboarded FUNCTION TO SET FIREBASE USER DOC TO ONBOARDED:TRUE

        try {
          // UPDATE PROFILE NAME UPON COMPLETING FORM, THEN GO TO NEXT NEW-USER SLIDE, THEN CALL HasOnboarded FUNCTION TO SET FIREBASE USER DOC TO ONBOARDED:TRUE
          const user = await firebase.auth().currentUser
          const update = await vm.updateProfile({
            uid: user.uid,
            userData: { email: vm.Input.Email2 }
          })
          if (update) {
            // UPDATE UI
            vm.UpdateUI('success')

            setTimeout(() => {
              vm.Editing = ''
            }, appConfig.ux.completionDelay.long)
          }
        } catch (error) {
          if (error.code === 'auth/requires-recent-login') {
            vm.$root.context.redirect('/?reauth=true&type=email')
            /*
             * MUST USE FIREBASE REAUTHORIZE FUNCTION INSTEAD OF UST REDIRECTING TO THE SIGN-IN PAGE TO RE-SIGN IN MANUALLY,
             * SO REDIRECT WITH CORRECT PARAMS AND MODIFY FLOW BASED ON THOSE PARAMS WITH CONDITIONS IN MULTIPLE PLACES
             * THEN REDIRECT BACK TO /dash with correct query string to pickup where left off, or do it automatically by saving the temp email in state
             */
          }
          // UPDATE UI
          vm.UpdateUI('error')
          console.log(
            'caught error while updating user profile email from profile settings: ',
            error
          )
        }
      }
    },
    async UpdatePassword() {
      const vm = this
      // CHECK IF NAME FIELD IS VALID IF SO, COMPLETE FUNCTION
      const isValid = await vm.$refs.PasswordObserver.validate()
      if (isValid) {
        // UPDATE UI
        vm.UpdateUI('disable')

        try {
          // First, reauthenticate to avoid needing to check if reauth is needed and redirect to login page.
          const user = firebase.auth().currentUser
          const reauth = await vm.$client.reAuthenticate(
            user.email,
            vm.Input.PasswordOld
          )
          if (reauth) {
            console.log('reauth client:', reauth)
            // Then update new password
            const newPassword = vm.Input.PasswordNew2
            console.log('newPassword:', newPassword)

            const update = await vm.$client.updatePassword(newPassword)
            if (update) {
              // UPDATE UI
              vm.UpdateUI('success')

              setTimeout(() => {
                vm.Editing = ''
              }, appConfig.ux.completionDelay.long)
            }
          }
        } catch (error) {
          if (error.code === 'auth/requires-recent-login') {
            vm.$root.context.redirect('/?reauth=true&type=password')
          }
          // UPDATE UI
          vm.UpdateUI('error')
          console.log(
            'caught error while reauthenticating/updating password from profile settings > change password: ',
            error
          )
        }
      }
    }
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

#nav-right.profile-settings-expanded {
  grid-template-rows: #{$header-height}rem 1fr;
}

#log-out-cont,
#profile-settings-select {
  display: grid;
  grid-template-rows: 100%;
  align-items: center;
  // padding-left: 1.5rem;
  border-bottom: 1px solid $grey-lighter;
}

#log-out-cont {
  grid-template-columns: 4rem 1fr;
  cursor: pointer;
}

#profile-settings-cont {
  z-index: 1;
  background-color: $white;
}

#profile-settings-cont.expanded {
  margin-left: -10rem;
}

#profile-settings-select {
  height: #{$header-height}rem;
  grid-template-columns: 4rem 1fr 2rem;
  cursor: pointer;
}

#log-out-inner,
#profile-settings-inner {
  color: $grey;
}

.log-out-icon,
.profile-settings-icon {
  color: $grey-lighter !important;
}
</style>

<style lang="scss">
</style>
