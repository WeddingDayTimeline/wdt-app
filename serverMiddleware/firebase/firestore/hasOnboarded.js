const admin = require('firebase-admin');
const dotenv = require('dotenv').config();
import initializeApp from '../initializeApp.js'

export const hasOnboarded = (req, res) => {

    // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
    initializeApp();
    
    try {
      
        // UPDATE USER WITH ONBOARDED=TRUE DATA IN FIRESTORE
        let db = admin.firestore();
        const uid = req.body.uid;

        const userData = {
            onboarded: true
        };

        let getDoc = db.collection('users').doc(uid).get()
        .then(doc => {
            // IF DOC DOESNT EXIST THEN USE 'SET' VERB TO CREATE A NEW DOC
            if (!doc.exists) {
              let updateDoc = db.collection('users').doc(uid).set(userData);
            } else {
                // IF DOC EXISTS THEN USE 'UPDATE' VERB SO AS TO NOT OVERWRITE ANYTHING YOU DON'T WANT TO
              let updateDoc = db.collection('users').doc(uid).update(userData);
            }
          })
          .catch(err => {
            console.log('Error getting document in hasOnboarded express route', err);
          });

        // FINISH
        res.send({ success: true })

    } catch(error) {
        console.log('caught error in hasOnboarded express route -- :', error);
        res.status(404).end()
    }

}