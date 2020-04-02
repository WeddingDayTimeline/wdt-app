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
    }
})