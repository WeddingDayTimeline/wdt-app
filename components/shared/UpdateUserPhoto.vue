<template>
  <div class="update-user-photo-cont">
    <div class="text-cont">
      <b-icon
        v-if="!UploadedPhotoURL"
        :type="PhotoUploadState === null ? 'is-success' : PhotoUploadBtnState.color"
        icon="check"
        size="is-large"
      />
      <!-- <b-button v-if="!UploadedPhotoURL" class="main-icon" rounded :type="PhotoUploadState === null ? 'success' : PhotoUploadBtnState.color" size="is-large" icon="check"></b-button> -->
      <!-- <vs-button v-if="!UploadedPhotoURL" class="main-icon" radius :color="PhotoUploadState === null ? 'success' : PhotoUploadBtnState.color" size="large" type="filled" icon="done"></vs-button> -->
      <img v-if="UploadedPhotoURL" :src="UploadedPhotoURL" class="uploaded-img" />
      <br />
      <br />
      <span :style="{opacity: (PhotoUploadState === null ? 1 : 0)}">
        Now, you can upload a profile image.
        <br />
        <br />
        <span class="skip fw-300i">...to skip this for now, click Next.</span>
      </span>
    </div>
    <div class="input-cont">
      <input id="file" type="file" hidden @change="UpdateProfilePhoto($event)" ref="File" />
      <b-progress
        v-if="PhotoUploadState === 'uploading'"
        :value="PhotoUploadProgress"
        type="is-light"
      />
    </div>
    <b-message v-if="Error.Active" type="is-danger" size="is-small" has-icon>{{ Error.Text }}</b-message>
    <!-- <vs-alert v-if="Error.Active" class="error" active="true" color="danger" icon="erroroutline" >
            {{ Error.Text }}
    </vs-alert>-->
    <div class="btn-cont">
      <b-button
        :class="PhotoUploadState === 'complete' || PhotoUploadState === 'error' ? 'no-click' : ''"
        :type="PhotoUploadBtnState.color"
        :icon-left="PhotoUploadBtnState.icon"
        @click="ChooseProfilePhoto"
      >{{ !PhotoUploadState ? 'Choose Photo' : '' }}</b-button>
      <!-- <vs-button class="full-width-button flex-1" :class="PhotoUploadState === 'complete' || PhotoUploadState === 'error' ? 'no-click' : ''" :color="PhotoUploadBtnState.color" :icon="PhotoUploadBtnState.icon" type="filled" @click="ChooseProfilePhoto()">{{ !PhotoUploadState ? 'Choose Photo' : '' }}</vs-button> -->
      <b-button
        v-if="PhotoUploadState != 'uploading' && PhotoUploadState != 'complete'"
        type="is-primary"
        :disabled="PhotoUploadState === 'uploading' ? true : false"
        @click="$emit('NewUserSlideAddIncr')"
      >Next</b-button>
      <!-- <vs-button v-if="PhotoUploadState != 'uploading' && PhotoUploadState != 'complete'" class="med-width-button" color="primary" type="filled" @click="$emit('NewUserSlideAddIncr')" :disabled="PhotoUploadState === 'uploading' ? true : false">Next</vs-button> -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as firebase from 'firebase/app'
import appConfig from '~/appConfig.js'
import 'firebase/auth'
import 'firebase/storage'

export default {
  name: 'UpdateUserPhoto',
  components: {},
  props: {
    instance: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      UploadedPhotoURL: '',
      PhotoUploadState: null,
      PhotoUploadBtnState: { icon: 'cloud-upload-alt', color: 'is-primary' },
      UploadedPhotoURL: '',
      PhotoUploadProgress: 0,
      FileSizeLimit: 3000000, // FALLBACK SET TO 3MB HERE, BUT DON'T CHANGE THIS NUMBER, CHANGE IT IN appConfig.js
      Error: {
        Active: false,
        Type: 0,
        Text: ''
      }
    }
  },
  watch: {
    PhotoUploadState() {
      // CHANGE PHOTO UPLOAD BUTTON ICON AND COLOR BASED ON UPLOAD STATE
      const state = this.PhotoUploadState
      if (state === 'uploading') {
        this.PhotoUploadBtnState = {
          icon: 'cloud-upload-alt',
          color: 'is-info'
        }
      } else if (state === 'complete') {
        this.PhotoUploadBtnState = { icon: 'check', color: 'is-success' }
      } else if (state === 'error') {
        this.PhotoUploadBtnState = {
          icon: 'exclamation-circle',
          color: 'is-danger'
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      //   GetUserInfo: 'getUserInfo',
    })
  },
  methods: {
    async UpdateProfilePhoto(event) {
      if (process.client) {
        const vm = this
        this.ResetErrorState()

        const files = event.target.files
        // IF A NEW FILE WAS UPLOADED

        if (files.length) {
          // GET THE FILE
          const file = files[0]
          console.log('file:', file)
          // VALIDATION
          const validation = { size: false, type: false }

          if (file.size <= vm.FileSizeLimit) {
            validation.size = true
            if (file.type.includes('image')) {
              validation.type = true
            } else {
              vm.Error = {
                Active: true,
                Type: 4,
                Text: 'Must be an image file'
              }
            }
          } else {
            vm.Error = {
              Active: true,
              Type: 4,
              Text: 'File size must be less than 3 mb'
            }
          }

          if (validation.size && validation.type) {
            // UPLOAD IT TO profilePhoto FOLDER IN FIREBASE STORAGE
            const user = firebase.auth().currentUser
            const storageRef = firebase.storage().ref()
            const profilePhotoRef = storageRef.child('profilePhoto')
            const photoRef = profilePhotoRef.child(`${user.uid}`)
            const uploadTask = photoRef.put(file)
            this.PhotoUploadState = 'uploading'

            // WATCH FOR UPDATES TO TASK STATE ON uploadTasK, ABOVE
            uploadTask.on(
              firebase.storage.TaskEvent.STATE_CHANGED, // Or 'state_changed'
              function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                // SEND PROGRESS UPDATES TO VUE DATA
                vm.PhotoUploadProgress = progress
              },
              function(error) {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                  case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    vm.PhotoUploadState = 'error'
                    console.log(
                      'error while trying to upload profile photo:',
                      error
                    )
                    break

                  case 'storage/canceled':
                    // User canceled the upload
                    vm.PhotoUploadState = 'error'
                    console.log(
                      'error while trying to upload profile photo:',
                      error
                    )
                    break

                  case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    vm.PhotoUploadState = 'error'
                    console.log(
                      'error while trying to upload profile photo:',
                      error
                    )
                    break
                }
              },
              function() {
                // Upload completed successfully
                uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then(function(downloadURL) {
                    // UPDATE VUE DATA WITH 'COMPLETE' STATE AND DOWNLOAD URL, AND COMMIT NEW DOWNLOAD URL TO STORE
                    console.log('File available at', downloadURL)
                    vm.UploadedPhotoURL = downloadURL
                    let userInfo = { photo: vm.UploadedPhotoURL }
                    vm.$store.commit('updateUserInfo', userInfo)

                    setTimeout(() => {
                      if (vm.instance === 'CreateProfile') {
                        vm.$emit('photoUpdated')
                      }
                    }, appConfig.ux.completionDelay.short)

                    vm.PhotoUploadState = 'complete'
                    // UPDATE FIREBASE USER PROFILE WITH NEW photoURL
                    user
                      .updateProfile({
                        photoURL: downloadURL
                      })
                      .catch(function(error) {
                        console.log(
                          'caught error while updating user profile photo URL: ',
                          error
                        )
                      })
                  })
                  .catch(function(error) {
                    console.log(
                      'caught error while updating user profile photo URL: ',
                      error
                    )
                  })
              }
            )
          } else {
          }
        }
      }
    },
    ChooseProfilePhoto() {
      // TRIGGER CLICK ON HIDDEN FILE INPUT ELEMENT TO OPEN OS'S NATIVE UPLOAD WINDOW
      const fileRef = this.$refs.File
      fileRef.click()
    },
    ResetErrorState() {
      // MAKE SURE ANY ERRORS ARE NOT CROSSING OVER INTO NEXT SLIDE
      this.Error = {
        Active: false,
        Type: 0,
        Text: ''
      }
    }
  },
  created() {
    // IMPORT FILE SIZE LIMIT FROM appConfig.js
    const wdtUser = appConfig.user
    this.FileSizeLimit = wdtUser.profilePhotoSizeLimit
    this.ResetErrorState()
  }
}
</script>

<style scoped lang="scss">
.text-cont {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
  color: $grey;
}

.main-icon {
  margin: 3rem 0;
}

.input-cont {
  flex: 1;
  display: flex;
  justify-content: center;
}

.btn-cont {
  display: flex;
  justify-content: space-around;
}

.skip {
  padding-top: 0.333rem;
  color: $grey;
}

.uploaded-img {
  width: 5rem;
  height: 5rem;
  margin: 3rem 0;
  border-radius: 6px;
}
</style>

<style lang="scss">
</style>
