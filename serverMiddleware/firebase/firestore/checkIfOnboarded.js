const admin = require('firebase-admin');
const dotenv = require('dotenv').config();
import initializeApp from '../initializeApp.js'

export const checkIfOnboarded = async (req, res) => {

    // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
    initializeApp();
    
    try {
      
        // UPDATE USER WITH ONBOARDED=TRUE DATA IN FIRESTORE
        let db = admin.firestore();
        const uid = req.body.uid;

        let doc = db.collection('users').doc(uid).get()
        const onboarded = (await doc).data().onboarded

        // FINISH
        res.send({ onboarded: onboarded })

    } catch(error) {
        console.log('caught error in hasOnboarded express route -- :', error);
        res.status(404).end()
    }

}