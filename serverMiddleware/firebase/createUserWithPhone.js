import hubConfig from '../../hubConfig'
import initializeApp from './initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const createUserWithPhone = (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    // ADD FIRESTORE DATA. ONBOARDED TRUE IF USED GOOGLE SIGNUP METHOD, ELSE FALSE. ADD ORIGINAL CONTACT TO USER'S DATA.
    const db = admin.firestore()

    const uid = req.body.uid
    console.log('req.body.phone:', req.body.phone)
    const userData = {
      onboarded: false,
      originalContactAtSignUp: req.body.phone
    }

    const setDoc = db
      .collection('users')
      .doc(uid)
      .set(userData)

    // FINISH
    res.send({ success: true })
  } catch (error) {
    console.log('caught error in createUserWithPhone express route -- :', error)
    res.status(404).end()
  }
}
