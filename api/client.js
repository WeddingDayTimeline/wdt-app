import * as firebase from 'firebase/app'
import 'firebase/auth'

export default () => ({
    async reAuthenticate(email, password) {
        if (process.client) {
            const user = firebase.auth().currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(
                email, 
                password
            )
            return await user.reauthenticateWithCredential(credential)
        }
    },
    async updatePassword(newPassword) {
        if (process.client) {
            const user = firebase.auth().currentUser;
            user.updatePassword(newPassword)
        }
    },
    signOut() {
        if (process.client) {
            firebase.auth().signOut()
        }
    },
    useDeviceLanguage() {
        if (process.client) {
            return firebase.auth().useDeviceLanguage()
        }
    },
    reCaptchaVerifier() {
        return new firebase.auth.RecaptchaVerifier('sign-in-btn', {
            size: 'invisible',
            callback: function(response) {
              // ReCAPTCHA solved.
              console.log('passed recaptcha!')
            }
        })
    },
    async signUpInWithPhoneNumber(number) {
        console.log('window.recaptchaVerifier:', window.recaptchaVerifier)
        console.log('number:', number)
        return await firebase.auth().signInWithPhoneNumber(number, window.recaptchaVerifier)
    },
    async verifyCode(code) {
        return await confirmationResult.confirm(code)
    }
})