const admin = require('firebase-admin')
const dotenv = require('dotenv').config()
import initializeApp from '../initializeApp.js'

export const isOriginalSignUpEmail = async (req, res) => {

    // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
    initializeApp();
    
    try {
      
        // CHECK IF CURRENT EMAIL IS ORIGINAL EMAIL FROM SIGN UP
        let db = admin.firestore()
        const uid = req.query.uid
        const email = req.query.email

        let doc = await db.collection('users').doc(uid).get()
        console.log('getDoc:', doc)
        const originalEmail = doc.data().originalEmailAtSignUp
        const isOriginal = (originalEmail === email)

        // FINISH
        res.send({ original: isOriginal })

    } catch(error) {
        console.log('caught error in isOriginalSignUpEmail express route -- :', error)
        res.status(404).end()
    }

}