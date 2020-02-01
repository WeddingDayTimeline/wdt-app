const admin = require('firebase-admin');
const dotenv = require('dotenv').config();
import initializeApp from '../initializeApp.js'

export const hasOnboarded = (req, res) => {

    // First check if Firebase has been initialized server-side. If not, then initialize.
    initializeApp();
    
    try {
      
        // CREATE NEW USER WITH ONBOARDED=FALSE DATA IN FIRESTORE
        let db = admin.firestore();

        const uid = req.body.uid;
        const userData = {
            onboarded: true
        };

        let updateDoc = db.collection('users').doc(uid).update(userData);


        // FINISH
        res.send({ success: true })

    } catch(error) {
        res.status(404).end()
    }

}