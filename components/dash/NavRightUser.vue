<template>
  <aside id="nav-right" :class="ProfileSettingsExpanded ? 'profile-settings-expanded' : ''">
    <div id="log-out-cont" @click="ClickLogOut()">
        <md-icon class="log-out-icon">exit_to_app</md-icon>    
        <span>Log out</span>
    </div>
    <div id="profile-settings-cont" :class="ProfileSettingsExpanded ? 'expanded' : ''">
        <div id="profile-settings-select" @click="ClickExpandProfileSettings()">
            <md-icon class="profile-settings-icon">edit</md-icon> 
            <span>Profile settings</span>
            <md-icon v-if="!ProfileSettingsExpanded" class="profile-settings-icon">expand_more</md-icon>
            <md-icon v-else class="profile-settings-icon">expand_less</md-icon>
        </div>
        <div v-if="ProfileSettingsExpanded" id="profile-settings">
          <div id="profile-name-section" class="section">
            <span class="label">Display name</span><span :class="Editing === 'displayName' ? 'hide' : ''" @click="ClickEdit('displayName')"><md-icon class="display-name-edit-icon">edit</md-icon></span><br>
            <span v-if="Editing !== 'displayName'" class="display-name-preview no-click">{{ UserInfo.name }}</span>
            <div v-if="Editing === 'displayName'" class="edit-area">
              <ValidationObserver ref="NameObserver" tag="div" v-slot="{ invalid }" slim>
                <ValidationProvider rules="required" v-slot="{ errors }" ref="NameRequired">
                  <vs-input class="input" :placeholder="UserInfo.name" type="text" v-model="Input.Name" autofocus="true" :readonly="DisableFields"/>
                  <span class="validation-errors no-click">{{ errors[0] }}</span>
                </ValidationProvider>
                <vs-button class="reg-width-button" :class="ButtonColor === 'success' ? 'no-click' : ''" :color="ButtonColor" @click="UpdateDisplayName()" :icon="ButtonColor === 'success' ? 'done' : (ButtonColor === 'danger' ? 'error' : '')" :disabled="DisableButtons">{{ ButtonColor === 'success' ? '' : 'Update name' }}</vs-button>
              </ValidationObserver>
            </div>
          </div>
          <div id="profile-email-section" class="section">
            <span class="label">Email address</span><span :class="Editing === 'email' ? 'hide' : ''" @click="ClickEdit('email')"><md-icon class="email-edit-icon">edit</md-icon></span><br>
            <span v-if="Editing !== 'email'" class="email-preview no-click">{{ UserInfo.email }}</span>
            <div v-if="Editing === 'email'" class="edit-area">
              <ValidationObserver ref="EmailObserver" tag="div" v-slot="{ invalid }" slim>
                <ValidationProvider rules="required|email" mode="lazy" v-slot="{ errors }" ref="EmailRequired">
                  <vs-input class="input" :placeholder="UserInfo.email" type="email" v-model="Input.Email" autofocus="true" :readonly="DisableFields"/>
                  <span class="validation-errors no-click">{{ errors[0] }}</span>
                </ValidationProvider>
                <vs-button class="reg-width-button" :class="ButtonColor === 'success' ? 'no-click' : ''" :color="ButtonColor" @click="UpdateEmail()" :icon="ButtonColor === 'success' ? 'done' : (ButtonColor === 'danger' ? 'error' : '')" :disabled="DisableButtons">{{ ButtonColor === 'success' ? '' : 'Update email' }}</vs-button>
              </ValidationObserver>
            </div>
          </div>
          <div id="profile-photo-section" class="section">
            <span class="label">Profile photo</span><span :class="Editing === 'photo' ? 'hide' : ''" @click="ClickEdit('photo')"><md-icon class="email-edit-icon">edit</md-icon></span><br>
            <img v-if="GetUserInfo.photo" :src="GetUserInfo.photo">
            <div v-if="Editing === 'photo'" class="edit-area">
              <UpdateUserPhoto @NewUserSlideAddIncr="() => { this.Editing = '' }" />
            </div>
          </div>
          <div id="profile-password-section" class="section">
            <span class="label">Password</span>
          </div>
        </div>
    </div>
  </aside>
</template>


<script>
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import hubConfig from '~/hubConfig.js';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import UpdateUserPhoto from '~/components/shared/UpdateUserPhoto.vue'

export default {
  name: 'nav-right-user',
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
    UserInfo: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      ProfileSettingsExpanded: false,
      EditDisplayName: false,
      EditEmail: false,
      EditPhoto: false,
      Editing: '',
      Input: {
        Name: '',
        Email: ''
      },
      ButtonColor: 'primary',
      DisableFields: false,
      DisableButtons: false,
    };
  },
  watch: {
      NavRightOpen: function () {
          if (this.NavRightOpen === false) { this.ProfileSettingsExpanded = false }
      }
  },
  computed: {
    ...mapGetters({
      GetUserInfo: 'getUserInfo',
    })
  },
  methods: {
      ClickExpandProfileSettings() {
          if (!this.ProfileSettingsExpanded) { this.ProfileSettingsExpanded = true }
          else if (this.ProfileSettingsExpanded) { this.ProfileSettingsExpanded = false }
      },
      ClickLogOut() {
        firebase.auth().signOut()
      },
      ClickEdit(setting) {
        if (this.Editing !== setting) { this.Editing = setting }
        else { this.Editing = '' }
      },
      UpdateUI(state) {    // TAKES 'enable', 'success', 'disable', 'error'
        let vm =this;
        // UPDATE UI
        if (state === 'disable') {
          vm.DisableFields = true;
          vm.DisableButtons = true;
          vm.ButtonColor = 'disabled';
        } else {
          vm.DisableFields = false;
          vm.DisableButtons = false;

          if (state === 'enable') {
            vm.ButtonColor = 'primary';
          } else if (state === 'success') {
            vm.ButtonColor = 'success';
          } else if (state === 'error') {
            vm.ButtonColor = 'danger';
          }
        }        
      },
      async UpdateDisplayName() {
        let vm = this;
        // CHECK IF NAME FIELD IS VALID IF SO, COMPLETE FUNCTION
        const isValid = await vm.$refs.NameObserver.validate();
        if (!isValid) {
          // 
        } else if (isValid) {

          // UPDATE UI
          vm.UpdateUI('disable')

          // UPDATE PROFILE NAME UPON COMPLETING FORM, THEN GO TO NEXT NEW-USER SLIDE, THEN CALL HasOnboarded FUNCTION TO SET FIREBASE USER DOC TO ONBOARDED:TRUE
          const user = firebase.auth().currentUser;

          user.updateProfile({
            displayName: vm.Input.Name
          }).then(function() {
            // UPDATE UI
            vm.UpdateUI('success')

            setTimeout(() => {
              vm.Editing = ''
            }, hubConfig.ux.completionDelay.long);

            let userInfo = { name: vm.Input.Name}
            vm.$store.commit("updateUserInfo", userInfo);
          }).catch(function(error) {
            // UPDATE UI
            vm.UpdateUI('error')
            console.log('caught error while updating user profile display name from profile settings: ', error);
          });
        }
      },
      async UpdateEmail() {
        let vm = this;
        // CHECK IF NAME FIELD IS VALID IF SO, COMPLETE FUNCTION
        const isValid = await vm.$refs.EmailObserver.validate();
        if (!isValid) {
          // 
        } else if (isValid) {

          // UPDATE UI
          vm.UpdateUI('disable')

          // UPDATE PROFILE NAME UPON COMPLETING FORM, THEN GO TO NEXT NEW-USER SLIDE, THEN CALL HasOnboarded FUNCTION TO SET FIREBASE USER DOC TO ONBOARDED:TRUE
          const user = firebase.auth().currentUser;

          user.updateEmail(vm.Input.Email)
          .then(function() {
            // UPDATE UI
            vm.UpdateUI('success')

            setTimeout(() => {
              vm.Editing = ''
            }, hubConfig.ux.completionDelay.long);

            let userInfo = { email: vm.Input.Email}
            vm.$store.commit("updateUserInfo", userInfo);
          }).catch(function(error) {
            if (error.code === 'auth/requires-recent-login') {
              vm.$root.context.redirect('/?reauth=true&type=email')
              // MUST USE FIREBASE REAUTHORIZE FUNCTION INSTEAD OF UST REDIRECTING TO THE SIGN-IN PAGE TO RE-SIGN IN MANUALLY,
              // SO REDIRECT WITH CORRECT PARAMS AND MODIFY FLOW BASED ON THOSE PARAMS WITH CONDITIONS IN MULTIPLE PLACES
              // THEN REDIRECT BACK TO /dash with correct query string to pickup where left off, or do it automatically by saving the temp email in state
            }
            // UPDATE UI
            vm.UpdateUI('error')
            console.log('caught error while updating user profile email from profile settings: ', error);
          });
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

#log-out-cont, #profile-settings-select {
    display: grid;
    grid-template-rows: 100%;
    align-items: center;
    // padding-left: 1.5rem;
    border-bottom: 1px solid material-color('blue-grey', '50');
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

#log-out-inner, #profile-settings-inner {
  color: material-color('blue-grey', '600');
}

.log-out-icon, .profile-settings-icon {
    color: material-color('blue-grey', '200') !important;
}

</style>


<style lang="scss">

</style>
