import * as firebase from 'firebase/app'
import 'firebase/auth'
import axios from 'axios'

export default function ({ app, from, store, route, redirect }) {
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
        firebase.initializeApp(config)
        store.commit('updateFirebaseInitState', true)
        // firebase.firestore().settings({cacheSizeBytes: 41943040})    //* KEEP cacheSizeBytes (the value is equal to or close to the default) AS A WORKAROUND TO A BUG, WHERE THE SETTINGS FUNCTION NEEDS ATLEAST ONE ARGUMENT
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          // CHECK IF USER HAS BEEN APPROVED BY ADMIN BY EMAIL LINK
          async function checkIfApproved(email) {
            const get = await app.$axios({
              method: 'get',
              url: '/api/firebase/isUserApproved',
              params: {
                app: 'dig-hub',
                email: email
              }
            })
            if (get.data.approved) {
              // YOU SHALL PASS -- WILL DO NOTHING TO STOP YOU FROM GOING ON AND HAVING AN AWESOME TIME.
            } else {
              return redirect('/')
            }
          }

          try {
            checkIfApproved(user.email)
          } catch (error) {
            console.log('error in auth.js middleware trying to check if user is approved', error);
          }

        } else {
          // User is signed out.
          // IF ROUTE IS NOT THE INDEX ROUTE, OR THE userApproved ROUTE (VIA ADMIN APPROVAL EMAIL LINK), THEN REDIRECT BACK TO INDEX ROUTE
          if (route.fullPath != '/' && route.path != '/userApproved') {
            return redirect('/')
          }
        }
    })

}