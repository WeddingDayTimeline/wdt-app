<template>
  <div id="auth-page-wrapper">
    <vs-progress class="progress" v-if="Loading || Thinking" indeterminate :height="3" color="primary"></vs-progress>
    <vs-card id="auth-card">
      <div v-if="!ForgotMode" id="auth-card-header" slot="header">
        {{ HeaderCopy }}
      </div>
      <div v-if="ForgotMode" id="auth-card-header" slot="header">
        Reset Password
      </div>
      <div v-if="!NewUserScreen" id="logo-cont">
        <div id="logo">
          DIG hub
        </div>
      </div>
      <div v-if="!NewUserScreen" id="input-cont" :class="Loading ? 'mostly-hidden' : ''">
        <ValidationObserver ref="SignUpInObserver" tag="div" v-slot="{ invalid }" slim>
          <div id="input-cont-inner">
            <ValidationProvider class="input-validation-provider" rules="email" mode="lazy" v-slot="{ errors }" ref="EmailValidation">
              <vs-input class="input" icon-no-border icon="email" :placeholder="SignInMode ? 'Email' : 'Choose an email'" type="email" v-model="Input.Email" autofocus="true" :readonly="DisableFields"/>
              <span class="validation-errors no-click">{{ errors[0] }}</span>
            </ValidationProvider>
            <p v-if="ForgotMode && !ResetPasswordBtnClicked" class="reset-instructions">Please enter the email associated with your account.</p>
            <p v-if="ForgotMode && ResetPasswordBtnClicked" class="reset-instructions">Success! Please check your email for your password reset link.</p>
            <ValidationProvider class="input-validation-provider" rules="alpha_dash|min:8" v-slot="{ errors }" ref="PasswordValidation">
              <vs-input :class="ForgotMode ? 'no-click hide' : ''" class="input" icon-no-border icon="lock" :placeholder="SignInMode ? 'Password' : 'Create a password'" type="password" v-model="Input.Password" :readonly="DisableFields"/>
              <span class="validation-errors no-click">{{ errors[0] }}</span>
            </ValidationProvider>
            <a class="forgot forgot-password" :class="!SignInMode || Error.Active || ForgotMode ? 'no-click hide' : ''" @click="ForgotPassword()">Forgot password?</a>
            <vs-alert v-if="Error.Active" class="error no-click" active="true" color="danger" icon="erroroutline" >
              {{ Error.Text }}
              <span v-if="Error.Type === 0 || Error.Type === 3">
                <br>
                <a class="forgot" @click="ForgotPassword()">Forgot your password?</a>
              </span>
            </vs-alert>
            <vs-button v-if="SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="SignIn()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">{{ SubmitBtnColor === 'success' ? '' : 'Sign in' }}</vs-button>
            <vs-button v-if="!SignInMode && !ForgotMode" class="submit-btn full-width-button" :class="SubmitBtnColor === 'success' ? 'no-click' : ''" :color="SubmitBtnColor" type="relief" @click="SignUp()" :icon="SubmitBtnColor === 'success' ? 'done' : ''" :disabled="SubmitBtnDisabled">{{ SubmitBtnColor === 'success' ? '' : 'Create Account' }}</vs-button>
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
        </ValidationObserver>
      </div>
      <div v-if="NewUserScreen" id="new-user-screen-cont">
        <div v-if="NewUserSlide === 0" id="new-user-slide-0" class="new-user-slide">
          <div class="new-user-slide-text">
            <vs-button class="new-user-slide-main-icon" radius color="success" size="large" type="filled" icon="done"></vs-button><br><br>
            <span class="new-user-slide-text">Next, lets finish creating your profile...</span>
          </div>
          <div class="new-user-slide-btn-cont">
            <vs-button class="med-width-button" color="primary" type="filled" @click="() => { NewUserSlide++ }">Next</vs-button>
          </div>
        </div>
        <ValidationObserver ref="NameObserver" tag="div" v-slot="{ invalid }" slim>
          <div v-if="NewUserSlide === 1" id="new-user-slide-1" class="new-user-slide">
              <div class="new-user-slide-text">
                First, let's start with your name:<br><br>
              </div>
              <div class="new-user-slide-input">
                <ValidationProvider rules="required" v-slot="{ errors }" ref="NameRequired">
                  <vs-input class="input" placeholder="Full name" type="text" v-model="Input.Name" autofocus="true" :readonly="DisableFields"/>
                  <span class="validation-errors no-click">{{ errors[0] }}</span>
                </ValidationProvider>
              </div>
              <div class="new-user-slide-btn-cont">
                <vs-button class="med-width-button" color="primary" type="filled" @click="UpdateProfileName()">Next</vs-button>
              </div>
          </div>
        </ValidationObserver>
          <div v-if="NewUserSlide === 2" id="new-user-slide-2" class="new-user-slide">
              <div class="new-user-slide-text">
                <vs-button v-if="!UploadedPhotoURL" class="new-user-slide-main-icon" radius :color="PhotoUploadState === null ? 'success' : PhotoUploadBtnState.color" size="large" type="filled" icon="done"></vs-button>
                <img v-if="UploadedPhotoURL" :src="UploadedPhotoURL" class="uploaded-img" /><br><br>
                <span :style="{ opacity: (PhotoUploadState === null ? 1 : 0) }">Now, you can upload a profile image.<br><br><span class="skip weight300i">...to skip this for now, click Next.</span></span>
              </div>
              <div class="new-user-slide-input">
                  <input type="file" id="file" @change="UpdateProfilePhoto($event)" hidden ref="File" />
                <vs-progress v-if="PhotoUploadState === 'uploading'" :percent="PhotoUploadProgress" color="#cfd8dc"></vs-progress>
              </div>
              <vs-alert v-if="Error.Active" class="error" active="true" color="danger" icon="erroroutline" >
                {{ Error.Text }}
              </vs-alert>
              <div class="new-user-slide-btn-cont">
                <vs-button class="full-width-button flex-1" :class="PhotoUploadState === 'complete' || PhotoUploadState === 'error' ? 'no-click' : ''" :color="PhotoUploadBtnState.color" :icon="PhotoUploadBtnState.icon" type="filled" @click="ChooseProfilePhoto()">{{ !PhotoUploadState ? 'Choose Photo' : '' }}</vs-button>
                <vs-button v-if="PhotoUploadState != 'uploading' && PhotoUploadState != 'complete'" class="med-width-button" color="primary" type="filled" @click="() => { NewUserSlide++ }" :disabled="PhotoUploadState === 'uploading' ? true : false">Next</vs-button>
              </div>
          </div>
        <div v-if="NewUserSlide === 3" id="new-user-slide-3" class="new-user-slide">
          <div class="new-user-slide-text">
            <vs-button class="new-user-slide-main-icon" radius color="rgba(31, 116, 255, 0.5)" size="large" type="filled" icon="email"></vs-button><br><br>
            <div class="text-inner">
              <span class="next-steps weight400">Next steps:</span><br><br><br>
              <vs-button class="mini-number-icon float-left" radius color="rgba(31, 116, 255, 0.5)" size="small" type="filled">1</vs-button> Check your email to verify your account<br><br>
              <vs-button class="mini-number-icon float-left" radius color="rgba(31, 116, 255, 0.5)" size="small" type="filled">2</vs-button> Ask your manager to check their email so they can approve your account.<br><br>
              <vs-button class="mini-number-icon float-left" radius color="rgba(31, 116, 255, 0.5)" size="small" type="filled">3</vs-button> Refresh this page, and get started!
            </div>
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
import 'firebase/firestore'
import Logo from '~/components/Logo.vue'
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import digConfig from '~/digConfig.js';

export default {
  name: 'auth',
  components: {
    Logo,
    ValidationProvider,
    ValidationObserver
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
      PhotoUploadBtnState: { icon: 'cloud_upload', color: 'primary' },
      OnboardedConfirmed: false,
      FileSizeLimit: 3000000,    // FALLBACK SET TO 3MB HERE, BUT DON'T CHANGE THIS NUMBER, CHANGE IT IN digConfig.js
    };
  },
  watch: {
    NewUserSlide: async function () {
      // IF USER REACHES THE LAST newUser SLIDE, CHECK IF USER HAS BEEN APPROVED
      if (this.NewUserSlide === 3) {
        const user = firebase.auth().currentUser;
        const get = await this.$axios({
          method: 'get',
          url: '/api/firebase/isUserApproved',
          params: {
            app: 'dig-hub',
            email: user.email
          }
        })
        .catch(function(error) {
          console.log('caught error in newUserSlide watcher axios call to isUserApproved:', error);
        })

        // IF APPROVED AND EMAIL IS VERIFIED, REDIRECT TO DASHBOARD
        if (get.data.approved && get.data.emailVerified) {
          this.$root.context.redirect('/dash')
        }
      }

      // MAKE SURE ANY ERRORS ARE NOT CROSSING OVER INTO NEXT SLIDE
      this.ResetErrorState();
    },
    PhotoUploadState: function () {
      // CHANGE PHOTO UPLOAD BUTTON ICON AND COLOR BASED ON UPLOAD STATE
      let state = this.PhotoUploadState;
      if (state === 'uploading') {
        this.PhotoUploadBtnState = { icon: 'cloud_queue', color: '#cfd8dc' }
      } else if (state === 'complete') {
        this.PhotoUploadBtnState = { icon: 'cloud_done', color: 'success' }
        setTimeout(() => {
          this.NewUserSlide++;
        }, 3000);
      } else if (state === 'error') {
        this.PhotoUploadBtnState = { icon: 'cloud_off', color: 'danger' }
      }
    }
  },
  computed: {
    HeaderCopy() {
      if (!this.NewUserScreen) {
        return this.SignInMode ? 'Sign In' : 'Sign Up'
      } else {
        return this.NewUserSlide !== 3 ? 'Create Profile' : 'Next Steps'
      }
    }
  },
  methods: {
    SignIn() {
      let vm = this;
      // CHECK IF FIELDS ARE VALID, USING ValidateSignInUpFields() ASYNC METHOD
      this.ValidateSignInUpFields()
      .then(function(valid) {
        if (valid) {

          vm.Thinking = true;
          vm.SubmitBtnDisabled = true;
          vm.DisableFields = true;
          vm.Error.Active ? vm.Error.Active = false : null;
          // SIGN INTO FIREBASE WITH EMAIL AND PASSWORD
          firebase.auth().signInWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
          .then(function(response) {
            // IF SUCCESS, GET UI READY
            vm.SubmitBtnColor = 'success';
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
          })
          .catch(function(error) {
            // ERRORS FOR VUESAX ALERT COMPONENTS HERE
            const errorCode = error.code;
            const errorMessage = error.message;
            // FIRST, UPDATE UI
            vm.SubmitBtnTempColor('warning');
            vm.SubmitBtnDisabled = false;
            vm.DisableFields = false;
            vm.Thinking = false;

            // DISPLAY ERROR-SPECIFIC MESSAGES TO this.Error
            if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/user-disabled') {
              vm.Error = { Active: true, Type: 0, Text: 'Incorrect email or password.' }
            } else if (errorCode === 'auth/invalid-email') {
              vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
            }
          });

        }
      })
      .catch(function(error) {
        console.log('caught error while validating fields in this.SignIn():', error);
      })

      
    },
    SignUp() {
      let vm = this;
      // CHECK IF FIELDS ARE VALID, USING ValidateSignInUpFields() ASYNC METHOD
      this.ValidateSignInUpFields()
      .then(function(valid) {
        if (valid) {
          // FIRST, PREPARE UI
          vm.Thinking = true;
          vm.SubmitBtnDisabled = true;
          vm.DisableFields = true;
          vm.Error.Active ? vm.Error.Active = false : null;
          
          // CREATE FIREBASE USER WITH EMAIL AND PASSWORD
          firebase.auth().createUserWithEmailAndPassword(vm.Input.Email, vm.Input.Password)
          .then(async function(response) {
            // THEN CALL NEWUSERFLOW, WHICH CALLS newUser API ROUTE TO SEND ADMIN APPROVAL EMAIL AND SET ONBOARDED STATE IN FIRESTORE USER DOC
            await vm.NewUserFlow(response.user.email, response.user.uid)
            .then(function(res) {
              if (res) {
                // PREPARE UI
                vm.SubmitBtnColor = 'success';
                vm.SubmitBtnDisabled = false;
                vm.Thinking = false;
                vm.DisableFields = false;
                vm.SubmitBtnColor = 'success';
              }
              // SEND VERIFICATION EMAIL TO USER
              vm.SendVerificationEmail();
            })
            .catch(function(error) {
              console.log('caught error while awaiting this.newUserFlow function:', error);
            })
          })
          .catch(function(error) {
            vm.DisableFields = false;
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
              vm.Error = { Active: true, Type: 3, Text: `Looks like this email is already associated with an active account.` }
            } else if (errorCode === 'auth/invalid-email') {
              vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
            } else {
              console.log('caught error while attempting to create firebase user with email/password, ', 'errorCode:', errorCode, ' errorMessage:', errorMessage);
            }

            // PREPARE UI
            vm.SubmitBtnTempColor('warning');
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
          });
        }
      })
      .catch(function(error) {
        console.log('caught error while validating fields in this.SignUp():', error);
      })
    },
    GoogleSignIn() {
      // CREATE NEW GOOGLE AUTH PROVIDER AND SIGNIN, REDIRECTING BACK TO THIS PAGE AFTERWARDS
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
    async NewUserFlow(email, uid, provider = 'password') {
      // AXIOS CALL FOR newUser API ROUTE TO SEND ADMIN APPROVAL EMAIL AND SET ONBOARDED:FALSE DEFAULT STATE IN FIRESTORE USER DOC
      try {
        const post = await this.$axios({
          method: 'post',
          url: '/api/firebase/newUser',
          params: {
            app: 'dig-hub'
          },
          data: {
            email: email,
            uid: uid,
            provider: provider
          }
        });
        if (post.data.success) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.log('caught error while making axios call to newUser api route:', error);
        return false
      }
    },
    async SendVerificationEmail() {
      // SEND VERIFICATION EMAIL TO NEW USER
      const user = firebase.auth().currentUser;

      await user.sendEmailVerification()
      .catch(function(error) {
        console.log('error sending verification email to new user');
      });
    },
    SignUpMode(toMode = null) {
      // CHANGE SIGNIN MODE (SIGN-IN OR SIGN-UP)
      this.Input.Email = '';
      this.Input.Password = '';

      if (toMode === null) {
        if (this.SignInMode) {
          this.SignInMode = false;
        } else {
          this.SignInMode = true
        }
      } else if (toMode === 'signIn') {
        // PREPARE UI
        this.SignInMode = true;
        this.SubmitBtnColor = 'primary';
        this.PasswordResetEmailSent = false;
      } 

      // CLEAN UP UI
      this.ForgotMode = false;
      this.Error.Active ? this.Error.Active = false : null
    },
    ForgotPassword() {
      // ON 'Forgot Password' LINK CLICK
      this.ForgotMode = true;
      this.SignInMode = true;
      this.ResetPasswordBtnClicked === true ? this.ResetPasswordBtnClicked = false : null;
      this.Error.Active ? this.Error.Active = false : null;
    },
    ResetPassword() {
      let vm = this;
      // CHECK IF FIELDS ARE VALID, USING ValidateSignInUpFields() ASYNC METHOD
      this.ValidateSignInUpFields()
      .then(function(valid) {
        if (valid) {
          // SEND RESET PASSWORD EMAIL
          // FIRST PREPARE UI
          vm.Thinking = true;
          vm.ResetPasswordBtnClicked = true;
          vm.SubmitBtnDisabled = true;
          vm.DisableFields = true;
          vm.Error.Active ? vm.Error.Active = false : null;

          // SEND THE EMAIL
          firebase.auth().sendPasswordResetEmail(vm.Input.Email)
          .then(function() {
            // PREPARE UI
            vm.SubmitBtnColor = 'success';
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
            vm.PasswordResetEmailSent = true;
          })
          .catch(function(error) {
            // CREATE ERROR SPECIFIC MESSAGES FOR VUESAX ALERT COMPONENT
            vm.DisableFields = false;
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === 'auth/user-not-found') {
              vm.Error = { Active: true, Type: 2, Text: `We couldn't find an accout associated with this email. Please try again.` }
            } else if (errorCode === 'auth/invalid-email') {
              vm.Error = { Active: true, Type: 1, Text: 'This seems to be an invalid email. Please try again.' }
            } else {
              console.log('error caught while sending password reset email, ', 'errorCode:', errorCode, ' errorMessage:', errorMessage);
            }

            // PREPARE UI 
            vm.SubmitBtnTempColor('warning');
            vm.SubmitBtnDisabled = false;
            vm.Thinking = false;
          });
        }
      })
      .catch(function(error) {
        console.log('caught error while validating fields in this.ResetPassword(): ', error);
      })
    },
    SubmitBtnTempColor(color) {
      // UPON ERROR, TEMPORARILY CHANGE COLOR, THEN CHANGE IT BACK TO PRIMARY
      this.SubmitBtnColor = color;
      setTimeout(() => {
        this.SubmitBtnColor = 'primary';
      }, 4500);
    },
    OnKeyUpEnter() {
      // DIFFERENT FUNCTIONS FOR ENTER-KEY-PRESS EVENT DEPENDING ON STATE OR NEW-USER SLIDE
      if (!this.NewUserScreen) {
        if (this.SignInMode && !this.ForgotMode) {
          this.SignIn()
        } else if (!this.SignInMode && !this.ForgotMode) {
          this.SignUp()
        } else if (this.ForgotMode) {
          this.ResetPassword()
        }
      } else {
        if (this.NewUserSlide === 0) {
          this.NewUserSlide++
        } else if (this.NewUserSlide === 1) {
          this.UpdateProfileName()
        } else if (this.NewUserSlide > 1) {
          return null
        } 
      }
    },
    async UpdateProfileName() {
      let vm = this;
      // CHECK IF NAME FIELD IS VALID IF SO, COMPLETE FUNCTION
      const isValid = await vm.$refs.NameObserver.validate();
      if (!isValid) {
        // 
      } else if (isValid) {

        // UPDATE PROFILE NAME UPON COMPLETING FORM, THEN GO TO NEXT NEW-USER SLIDE, THEN CALL HasOnboarded FUNCTION TO SET FIREBASE USER DOC TO ONBOARDED:TRUE
        const user = firebase.auth().currentUser;

        user.updateProfile({
          displayName: vm.Input.Name
        }).then(function() {
          vm.NewUserSlide++
          vm.HasOnboarded(user.uid);
        }).catch(function(error) {
          console.log('caught error while updating user profile display name: ', error);
        });
      }

    },
    ChooseProfilePhoto() {
      // TRIGGER CLICK ON HIDDEN FILE INPUT ELEMENT TO OPEN OS'S NATIVE UPLOAD WINDOW
      let fileRef = this.$refs.File;
      fileRef.click();
    },
    async UpdateProfilePhoto(event) {
      let vm = this;
      this.ResetErrorState();

      const files = event.target.files;
      // IF A NEW FILE WAS UPLOADED

      if (files.length) {
        // GET THE FILE
        const file = files[0];
        console.log('file:', file);
        // VALIDATION
        let validation = { size: false, type: false}

        if (file.size <= vm.FileSizeLimit) {
          validation.size = true;
          if (file.type.includes('image')) {
            validation.type = true;
          } else {
            vm.Error = { Active: true, Type: 4, Text: 'Must be an image file' }
          }
        } else {
          vm.Error = { Active: true, Type: 4, Text: 'File size must be less than 3 mb' }
        }

        if (validation.size && validation.type) {
          // UPLOAD IT TO profilePhoto FOLDER IN FIREBASE STORAGE
          const user = firebase.auth().currentUser;
          const storageRef = firebase.storage().ref();
          const profilePhotoRef = storageRef.child('profilePhoto');
          const photoRef = profilePhotoRef.child(`${user.uid}`);
          const uploadTask = photoRef.put(file);
          this.PhotoUploadState = 'uploading';

          // WATCH FOR UPDATES TO TASK STATE ON uploadTasK, ABOVE
          uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function(snapshot) {
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              // SEND PROGRESS UPDATES TO VUE DATA
              vm.PhotoUploadProgress = progress;
            }, function(error) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                vm.PhotoUploadState = 'error'
                console.log('error while trying to upload profile photo:', error);
                break;

              case 'storage/canceled':
                // User canceled the upload
                vm.PhotoUploadState = 'error'
                console.log('error while trying to upload profile photo:', error);
                break;

              case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                vm.PhotoUploadState = 'error'
                console.log('error while trying to upload profile photo:', error);
                break;
            }
          }, function() {
            // Upload completed successfully
            // UPDATE VUE DATA WITH 'COMPLETE' STATE AND DOWNLOAD URL
            uploadTask.snapshot.ref.getDownloadURL()
            .then(function(downloadURL) {
              console.log('File available at', downloadURL);
              vm.PhotoUploadState = 'complete';
              vm.UploadedPhotoURL = downloadURL;
            });
          });
        } else {
          return
        }
      }
    },
    async HasOnboarded(uid) {
      // TRIGGER AXIOS CALL WHEN ONBOARDING HAS COMPLETED (IN THIS CASE, ONBOARDING IS JUST UPDATING PROFILE NAME)
      try {
        const post = await this.$axios({
          method: 'post',
          url: '/api/firebase/firestore/hasOnboarded',
          params: {
            app: 'dig-hub'
          },
          data: {
            uid: uid
          }
        });
        if (post.data.success) {
          this.OnboardedConfirmed = true
          return true
        } else {
          this.OnboardedConfirmed = false
          return false
        }
      } catch (error) {
        console.error('error while making axios call to hasOnboarded api route', error);
        return false
      }
    },
    async CheckIfOnboarded() {
      let vm = this;
      const user = firebase.auth().currentUser;
      let db = firebase.firestore();
      await db.collection('users').doc(user.uid).get()
      .then(function(doc) {
          if (doc.exists) {
              if (doc.data().onboarded) {
                vm.OnboardedConfirmed = true
                return true
              } else {
                vm.OnboardedConfirmed = false
                return false
              }
          } else {
              // doc.data() will be undefined in this case
          }
      }).catch(function(error) {
          console.log("Error getting firestore user document to check onboarded state:", error);
      });
    },
    async ValidateSignInUpFields() {
      // CHECK IF EMAIL FIELD IS VALID IF SO, RETURN TRUE
      const isValid = await this.$refs.SignUpInObserver.validate();
      if (!isValid) {
        return false
      } else if (isValid) {
        return true
      }
    },
    ResetErrorState() {
      // MAKE SURE ANY ERRORS ARE NOT CROSSING OVER INTO NEXT SLIDE
      this.Error = {
        Active: false,
        Type: 0,
        Text: '',
      }
    }
  },
  created() {
    // IMPORT FILE SIZE LIMIT FROM digConfig.js
    const digUser = digConfig.user
    this.FileSizeLimit = digUser.profilePhotoSizeLimit;
    this.ResetErrorState();
  },
  mounted() {
    let vm = this;
    firebase.auth().onAuthStateChanged(function(user) {
        // IF USER IS SIGNED IN
        if (user) {
          async function checkIfGoogleSignIn() {
              // CHECK IF USER WAS SIGNED IN WITH GOOGLE METHOD OR NOT.
              let provider = user.providerData[0].providerId;

              if (provider === 'google.com') {
                // IF SO, TRIGGER NewUserFlow FOR SENDING ADMIN APPROVAL EMAIL
                await vm.NewUserFlow(user.email, user.uid, provider);
                // AND TRIGGER HasOnBoarded TO SET ONBOARDED STATE IN FIRESTORE USER DOC
                await vm.HasOnboarded(user.uid)
                .then(function() {
                  return true
                })
                .catch(function(error) {
                  console.log('caught error in vm.HasOnboarded():', error)
                });
              };
              return true
          }

          async function checkIfApproved(email) {
              // CHECK IF USER HAS BEEN APPROVED BY ADMIN YET
              const get = await vm.$axios({
                method: 'get',
                url: '/api/firebase/isUserApproved',
                params: {
                  app: 'dig-hub',
                  email: email
                }
              })

              // CHECK IF USER HAS FINISHED ONBOARDING
              await vm.CheckIfOnboarded();
              
              if (vm.OnboardedConfirmed) {
                if (get.data.approved && get.data.emailVerified) {
                // IF ONBOARDED IS COMPLETE AND ADMIN HAS APPROVED BY EMAIL LINK, YOU PASS!
                  vm.$root.context.redirect('/dash')
                } else {
                  // PREPARE UI & STATE
                  vm.JustSignedUp = true;
                  vm.NewUserScreen = true;
                  vm.NewUserSlide = 3;
                  vm.SignInMode = true;
                  vm.Loading = false;
                  vm.Thinking = false;
                }
              } else {
                // PREPARE UI & STATE
                vm.JustSignedUp = true;
                vm.NewUserScreen = true;
                vm.NewUserSlide = 0;
                vm.SignInMode = true;
                vm.Loading = false;
                vm.Thinking = false;
              }
          }

          try {
            // CALL THE FUNCTIONS DECLARED ABOVE, IN ORDER
            checkIfGoogleSignIn()
            .then(function() {
              checkIfApproved(user.email)
              .catch(function(error) {
                console.log('caught error in mounted() -- checkIfApproved():', error);
              })
            })
            .catch(function(error) {
              console.log('caught error in mounted() -- checkIfSoogleSignIn():', error);
            })
          } catch (error) {
            console.log('caught error in try/catch in mounted()', error);
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
  min-height: 22rem;
}

#auth-card-header {
  color: material-color('blue-grey', '300');
  cursor: default;
}

::v-deep .vs-card--content {
  height: calc(100% - 38.4px);    // 38.4px is header height and is consistent.
}

#new-user-screen-cont {
  height: 100%;
  padding: .666rem;
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

.input, .input-validation-provider {
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



.new-user-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.new-user-slide-main-icon {
  margin: 3rem 0;
}

.new-user-slide-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
  color: material-color('blue-grey', '600');
}

.new-user-slide-text .text-inner {

}

#new-user-slide-1 .new-user-slide-text {
  flex: 1;
  justify-content: center;
}

.new-user-slide-input {
    flex: 1;
    display: flex;
    justify-content: center;
}

.new-user-slide-btn-cont {
    display: flex;
    justify-content: flex-end;
}

#new-user-slide-2 .new-user-slide-btn-cont {
    justify-content: space-around;
}

.skip {
  padding-top: .333rem;
  color: material-color('blue-grey', '300');
}

.uploaded-img {
  width: 5rem;
  height: 5rem;
  margin: 3rem 0;
  border-radius: 6px;
}

.next-steps {
  margin-left: 2.25rem;
  color: material-color('blue-grey', '400');
}


.validation-errors {
  display: block;
  margin: -.5rem 0 0;
  color: $danger;
  font-style: italic;
}

</style>


<style lang="scss">

</style>
