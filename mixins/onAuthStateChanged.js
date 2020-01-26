import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase/app'
import 'firebase/auth'

export default {
    mounted() {
        let vm = this;
        firebase.auth().onAuthStateChanged(function(user) {
            console.log('onAuthStateChanged()');
            if (user) {
              // User is signed in.
              console.log('signed in!');
              
              vm.$store.commit('updateAuthState', true)
            
              let displayName = user.displayName;
              let email = user.email;
              let emailVerified = user.emailVerified;
              let photoURL = user.photoURL;
              let isAnonymous = user.isAnonymous;
              let uid = user.uid;
              let providerData = user.providerData;
              // ...
            } else {
              console.log('not signed in.');
              vm.$store.commit('updateAuthState', false)
              // User is signed out.
              // ...
            }
        })
    }
}

