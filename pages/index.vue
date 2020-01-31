<template>
  <div id="auth-page-wrapper">
    <vs-progress class="progress" v-if="Loading || Thinking" indeterminate :height="3" color="primary"></vs-progress>
    <vs-card id="auth-card">
      <div v-if="!ForgotMode" id="auth-card-header" slot="header">
        {{ SignInMode ? 'Sign In' : 'Sign Up' }}
      </div>
      <div v-if="ForgotMode" id="auth-card-header" slot="header">
        Reset Password
      </div>
      <div id="logo-cont">
        <div id="logo">
          DIG hub
        </div>
      </div>
      <div v-if="!NewUserScreen" id="input-cont" :class="Loading ? 'mostly-hidden' : ''">
        <div id="input-cont-inner">
          <vs-input class="input" icon-no-border icon="email" :placeholder="SignInMode ? 'Email' : 'Choose an email'" type="email" v-model="Input.Email" autofocus="true" :readonly="DisableFields"/>
          <p v-if="ForgotMode && !ResetPasswordBtnClicked" class="reset-instructions">Please enter the email associated with your account.</p>
          <p v-if="ForgotMode && ResetPasswordBtnClicked" class="reset-instructions">Success! Please check your email for your password reset link.</p>
          <vs-input :class="ForgotMode ? 'no-click hide' : ''" class="input" icon-no-border icon="lock" :placeholder="SignInMode ? 'Password' : 'Create a password'" type="password" v-model="Input.Password" :readonly="DisableFields"/>
          <a class="forgot forgot-password" :class="!SignInMode || Error.Active || ForgotMode ? 'no-click hide' : ''" @click="ForgotPassword()">Forgot password?</a>
          <vs-alert v-if="Error.Active" class="error" active="true" color="danger" icon="erroroutline" >
            {{ Error.Text }}
            <span v-if="Error.Type === 0 || Error.Type === 3">
              <br>
              <a class="forgot" @click="ForgotPassword()">Forgot your password?</a>
            </span>
          </vs-alert>
          <vs-button v-if="SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="SignIn()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">Sign in</vs-button>
          <vs-button v-if="!SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="SignUp()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">Create Account</vs-button>
          <vs-button v-if="ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="ResetPassword()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">{{ SubmitBtnColor !== 'success' ? 'Reset Password' : 'Email Sent' }}</vs-button>
          <div id="google-option-cont">
            <div class="or-cont"><hr><span class="or">or</span><hr></div>
            <vs-button v-if="!ForgotMode" class="google-signin-btn full-width-button" color="#4285F4" type="flat" @click="GoogleSignIn()" :disabled="SubmitBtnDisabled">
              <div class="google-logo"></div>
              Sign in with Google
            </vs-button>
          </div>
          <div v-if="!PasswordResetEmailSent && !JustSignedUp" id="bottom">
            {{ SignInMode ? 'Need an account? ' : 'Have an account? ' }}<a :class="SignInMode ? '' : 'primary'" @click="SignUpMode()">{{ SignInMode ? 'Sign up' : 'Sign in' }}</a>
          </div>
          <div v-else id="bottom">
            <a class="primary" @click="SignUpMode('signIn')">Sign in</a>
          </div>
        </div>
      </div>
      <div v-if="NewUserScreen" id="new-user-screen-cont">
        <div v-if="NewUserSlide === 0" id="new-user-slide-0" class="new-user-slide">
          <div class="new-user-slide-text">
            Success!<br><br>
            Now, lets finish up your profile...
          </div>
          <vs-button class="full-width-button" color="primary" type="filled" @click="() => { NewUserSlide++ }">Next</vs-button>
        </div>
        <div v-if="NewUserSlide === 1" id="new-user-slide-1" class="new-user-slide">
          <div class="new-user-slide-text">
            First, let's start with your name:<br><br>
          </div>
          <vs-input class="input" placeholder="Full name" type="text" v-model="Input.Name" autofocus="true" :readonly="DisableFields"/>
          <vs-button class="full-width-button" color="primary" type="filled" @click="UpdateProfileName()">Next</vs-button>
        </div>
        <div v-if="NewUserSlide === 2" id="new-user-slide-2" class="new-user-slide">
          <div class="new-user-slide-text">
            Great!<br><br>
            Now, you can upload a profile image. To skip this for now, click Next.<br><br>
          </div>
          <input type="file" id="file" @change="UpdateProfilePhoto($event)" hidden ref="File" />
          <img v-if="UploadedPhotoURL" :src="UploadedPhotoURL" class="uploaded-img" />
          <vs-progress v-if="PhotoUploadState === 'uploading'" :percent="PhotoUploadProgress" color="#cfd8dc"></vs-progress>
          <vs-button class="full-width-button" :class="PhotoUploadState === 'complete' || PhotoUploadState === 'error' ? 'no-click' : ''" :color="PhotoUploadBtnState.color" :icon="PhotoUploadBtnState.icon" type="filled" @click="ChooseProfilePhoto()">{{ !PhotoUploadState ? 'Choose Photo' : '' }}</vs-button>
          <vs-button class="full-width-button" color="primary" type="filled" @click="() => { NewUserSlide++ }" :disabled="PhotoUploadState === 'uploading' ? true : false">Next</vs-button>
        </div>
        <div v-if="NewUserSlide === 3" id="new-user-slide-3" class="new-user-slide">
          <div class="new-user-slide-text">
            Perfect!<br><br>
            Since this is a private app, you'll need to ask your manager to check their email so they can approve your account.<br><br>
            Once approved, just refresh this page and sign in to get started!
          </div>
        </div>
      </div>
    </vs-card>
    <GlobalEvents @keyup.enter="OnKeyUpEnter()"></GlobalEvents>
  </div>
</template>


<script>
import {mapGetters} from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import Logo from '~/components/Logo.vue'

export default {
  name: 'auth',
  components: {
    Logo
  },
  data() {
    return {
      Loading: true,
      Thinking: false,
      FirebaseUIInit: false,
      SignInMode: true,
      ForgotMode: false,
      Input: {
        Email: '',
        Password: '',
        Name: ''
      },
      Options: {
        RememberMe: false
      },
      Error: {
        Active: false,
        Type: 0,
        Text: '',
      },
      SubmitBtnColor: 'primary',
      SubmitBtnDisabled: false,
      ResetPasswordBtnClicked: false,
      PasswordResetEmailSent: false,
      DisableFields: false,
      JustSignedUp: false,
      NewUserScreen: false,
      NewUserSlide: null,
      PhotoUploadState: null,
      PhotoUploadProgress: 0,
      UploadedPhotoURL: '',
      PhotoUploadBtnState: { icon: 'cloud_upload', color: 'primary' }
    };
  },
  watch: {
    NewUserSlide: function () {
      console.log(this.NewUserSlide);
    },
    PhotoUploadState: function () {
      let state = this.PhotoUploadState;
      if (state === 'uploading') {
        this.PhotoUploadBtnState = { icon: 'cloud_queue', color: '#cfd8dc' }
      } else if (state === 'complete') {
        this.PhotoUploadBtnState = { icon: 'cloud_done', color: 'success' }
      } else if (state === 'error') {
        this.PhotoUploadBtnState = { icon: 'cloud_off', color: 'danger' }
      }
    }
  },
  computed: {
    ...mapGetters({
      // GetFirebaseInit: 'getFirebaseInit',
    })
  },
  methods: {
    SignIn() {
      console.log('SignIn()');
      let vm = this;
      
      this.Thinking = true;
      this.SubmitBtnDisabled = true;
      this.DisableFields = true;
      this.Error.Active ? this.Error.Active = false : null;
      firebase.auth().signInWithEmailAndPassword(this.Input.Email, this.Input.Password)
      .then(function(response) {
        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        vm.GoodToGo()
      })
      .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        vm.SubmitBtnTempColor('warning');
        vm.SubmitBtnDisabled = false;
        vm.DisableFields = false;
        vm.Thinking = false;

        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/user-disabled') {
          vm.Error = { Active: true, Type: 0, Text: 'Incorrect email or password.' }
        } else if (errorCode === 'auth/invalid-email') {
          vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
        }
        // ...
      });
    },
    SignUp() {
      console.log('SignUp()');
      this.Thinking = true;
      this.SubmitBtnDisabled = true;
      this.DisableFields = true;
      this.Error.Active ? this.Error.Active = false : null;
      let vm = this;
      
      firebase.auth().createUserWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
      .then(async function(response) {
        console.log('--------- about to send');
        await vm.NewUserFlow(response.user.email)
        .then(function(res) {
          console.log('res:', res);
          console.log('----------got response');
          if (res) {
            vm.SubmitBtnColor = 'success';
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
            vm.SubmitBtnColor = 'success';
            console.log('response:', response);
            vm.GoodToGo()
          }
        })
        .catch(function(err) {
          console.log('err:', err);
        })

        // ...
      })
      .catch(function(error) {
        // Handle Errors here.
        vm.DisableFields = false;
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/email-already-in-use') {
          vm.Error = { Active: true, Type: 3, Text: `Looks like this email is already associated with an active account.` }
        } else if (errorCode === 'auth/invalid-email') {
          vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
        } else {
          console.log('errorCode:', errorCode, ' errorMessage:', errorMessage);
        }

        vm.SubmitBtnTempColor('warning');
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        // ...
      });
    },
    GoogleSignIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
    async NewUserFlow(email) {
      try {
        const post = await this.$axios({
          method: 'post',
          url: '/api/firebase/newUser',
          params: {
            app: 'dig-hub'
          },
          data: {
            email: email
          }
        });
        if (post.data.success) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error(error);
        return false
      }
    },
    SignUpMode(toMode = null) {
      this.Input.Email = '';
      this.Input.Password = '';

      if (toMode === null) {
        if (this.SignInMode) {
          this.SignInMode = false;
        } else {
          this.SignInMode = true
        }
      } else if (toMode === 'signIn') {
        this.SignInMode = true;
        this.SubmitBtnColor = 'primary';
        this.PasswordResetEmailSent = false;
      } 

      this.ForgotMode = false;
      this.Error.Active ? this.Error.Active = false : null
    },
    ForgotPassword() {
      this.ForgotMode = true;
      this.SignInMode = true;
      this.ResetPasswordBtnClicked === true ? this.ResetPasswordBtnClicked = false : null;
      this.Error.Active ? this.Error.Active = false : null;
    },
    ResetPassword() {
      this.Thinking = true;
      this.ResetPasswordBtnClicked = true;
      this.SubmitBtnDisabled = true;
      this.DisableFields = true;
      this.Error.Active ? this.Error.Active = false : null;
      let vm = this;

      firebase.auth().sendPasswordResetEmail(vm.Input.Email)
      .then(function() {
        // Email sent.
        vm.SubmitBtnColor = 'success';

        vm.SubmitBtnColor = 'success';
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
        vm.PasswordResetEmailSent = true;
      }).catch(function(error) {
        // An error happened.
        vm.DisableFields = false;
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/user-not-found') {
          vm.Error = { Active: true, Type: 2, Text: `We couldn't find an accout associated with this email. Please try again.` }
        } else if (errorCode === 'auth/invalid-email') {
          vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
        } else {
          console.log('errorCode:', errorCode, ' errorMessage:', errorMessage);
        }

        vm.SubmitBtnTempColor('warning');
        vm.SubmitBtnDisabled = false;
        vm.Thinking = false;
      });
    },
    SubmitBtnTempColor(color) {
      this.SubmitBtnColor = color;
      setTimeout(() => {
        this.SubmitBtnColor = 'primary';
      }, 4500);
    },
    OnKeyUpEnter() {
      if (this.SignInMode && !this.ForgotMode) {
        this.SignIn()
      } else if (!this.SignInMode && !this.ForgotMode) {
        this.SignUp()
      } else if (this.ForgotMode) {
        this.ResetPassword()
      }
    },
    GoodToGo() {
      console.log('----- Good to go!');
    },
    // ClickNewUserSlideBtn() {
    //   if (this.NewUserSlide <= 3) {
    //     this.NewUserSlide++
    //   } else {
    //     // 
    //   }
    // },
    UpdateProfileName() {
      let vm = this;
      const user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: vm.Input.Name
      }).then(function() {
        // Update successful.
        vm.NewUserSlide++
      }).catch(function(error) {
        // An error happened.
        console.log(error);
      });

      console.log('user.displayName:', user.displayName);

    },
    ChooseProfilePhoto() {
      let fileRef = this.$refs.File;
      fileRef.click();
    },
    UpdateProfilePhoto(event) {
      let vm = this;
      console.log('event:', event);
      const files = event.target.files;
      if (files.length) {
        const file = files[0];
        const user = firebase.auth().currentUser;
        const storageRef = firebase.storage().ref();
        const profilePhotoRef = storageRef.child('profilePhoto');
        const photoRef = profilePhotoRef.child(`${user.uid}`);
        const uploadTask = photoRef.put(file);
        this.PhotoUploadState = 'uploading';

        // FILE UPLOAD TASK WITH STATE CHANGES FOR PROGRESS BAR
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function(snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            vm.PhotoUploadProgress = progress;
          }, function(error) {

          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              vm.PhotoUploadState = 'error'
              break;

            case 'storage/canceled':
              // User canceled the upload
              vm.PhotoUploadState = 'error'
              break;

            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              vm.PhotoUploadState = 'error'
              break;
          }
        }, function() {
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
            vm.PhotoUploadState = 'complete';
            vm.UploadedPhotoURL = downloadURL;
          });
        });


        // .then(function(snapshot) {
        //   console.log('Uploaded a blob or file!');
        //   console.log('snapshot:', snapshot);
        // });

      } else {
        return
      }
    }
  },
  mounted() {
    let vm = this;
    firebase.auth().onAuthStateChanged(function(user) {
        console.log('onAuthStateChanged()');
        if (user) {
          // User is signed in.
          let displayName = user.displayName;
          let email = user.email;
          let emailVerified = user.emailVerified;
          let photoURL = user.photoURL;
          let isAnonymous = user.isAnonymous;
          let uid = user.uid;
          let providerData = user.providerData;
          console.log('displayName:', displayName);
          console.log('email:', email);
          console.log('emailVerified:', emailVerified);
          console.log('photoURL:', photoURL);
          console.log('isAnonymous:', isAnonymous);
          console.log('uid:', uid);
          console.log('providerData:', providerData);
          console.log('signed in!');
          console.log('user:', user);


          async function checkIfApproved(email) {
            console.log('email:', email);
              const get = await vm.$axios({
                method: 'get',
                url: '/api/firebase/isUserApproved',
                params: {
                  app: 'dig-hub',
                  email: email
                }
              })
              if (get.data.approved) {
                // YOU SHALL PASS
                console.log('get.data.approved:', get.data.approved);
                vm.$root.context.redirect('/dash')
              } else {
                console.log('user exists but not yet approved');
                vm.JustSignedUp = true;
                vm.NewUserScreen = true;
                vm.NewUserSlide = 0;
                vm.SignInMode = true;
                vm.Loading = false;
                vm.Thinking = false;
              }
          }

          try {
            checkIfApproved(user.email)
          } catch (error) {
            console.log(error);
          }


        } else {
          // User is signed out.
          vm.Loading = false
        }
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

.progress {
  width: calc(22rem - .5rem);
  margin-bottom: -3px;
}

.loading #auth-card-header, .loading #input-cont, .loading #input-cont * {
  opacity: 0;
}

.mostly-hidden {
  opacity: .1;
}

#auth-card {
  width: 22rem;
  max-width: 100%;
  height: auto;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
  cursor: default;
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

#input-cont, #input-cont-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input {
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
  margin-top: -.5rem;
  color: $primary;
}

.check.remember-me, .forgot-password {
  font-size: .75rem;
}

.submit-btn {
  margin: 2.5rem 0 .5rem;
}

#google-option-cont {
  display: flex;
  flex-direction: column;
  width: auto;
  margin: 1.2rem 0 0;
}

#google-option-cont .or-cont{
  display: flex;
  width: 200px;
  margin: 0 0 .333rem;
}

#google-option-cont hr {
  flex: 1;
  background-color: transparent;
  border-bottom: 1px solid material-color('blue-grey', '100');
  border-top: none;
  border-right: none;
  border-left: none;
}

#google-option-cont .or{
  margin: -.5rem .666rem 0;
  color: material-color('blue-grey', '200');
  cursor: default;
}

#bottom {
  margin-top: 4rem;
  color: material-color('blue-grey', '300');
  cursor: default;
}

#bottom a {
  margin: 0 0 0 .2rem;
  color: material-color('blue-grey', '300');
  cursor: pointer;
}

#bottom a:hover {
  color: $primary;
}

#bottom a.primary, .error span {
  color: $primary;
}

.error {
  max-width: 220px;
  height: min-content !important;
}

.error * {
  line-height: 1.333rem;
}

.reset-instructions {
  max-width: 200px;
  color: material-color('blue-grey', '500');
}


.new-user-slide-text {
  font-size: 1rem;
  color: material-color('blue-grey', '600');
}

.uploaded-img {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
}


</style>


<style lang="scss">

</style>
