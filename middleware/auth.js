import * as firebase from 'firebase/app'
import 'firebase/auth'

export default function ({ from, store, route, redirect }) {

    // console.log('from:', from);

    if (!firebase.apps.length) {
        const config = {
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.FB_AUTH_DOMAIN,
            databaseURL: process.env.FB_DATABASE_URL,
            projectId: process.env.FB_PROJECT_ID,
            storageBucket: process.env.FB_STORAGE_BUCKET,
            messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
            appId: process.env.FB_APP_ID
        }
        console.log('config:', config);
        firebase.initializeApp(config)
        store.commit('updateFirebaseInitState', true)
        
        // firebase.firestore().settings({cacheSizeBytes: 41943040})    //* KEEP cacheSizeBytes (the value is equal to or close to the default) AS A WORKAROUND TO A BUG, WHERE THE SETTINGS FUNCTION NEEDS ATLEAST ONE ARGUMENT
    }


    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          console.log('user signed in!');

          let displayName = user.displayName;
          let email = user.email;
          let emailVerified = user.emailVerified;
          let photoURL = user.photoURL;
          let isAnonymous = user.isAnonymous;
          let uid = user.uid;
          let providerData = user.providerData;
          // ...
        } else {
          // User is signed out.
          console.log('no user signed in.');
          if (route.fullPath != '/') {
            return redirect('/')
          }
        }
    })

}