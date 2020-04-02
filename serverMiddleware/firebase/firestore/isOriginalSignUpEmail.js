import initializeApp from '../initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const isOriginalSignUpEmail = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    // CHECK IF CURRENT EMAIL IS ORIGINAL EMAIL FROM SIGN UP
    const db = admin.firestore()
    const uid = req.query.uid
    const email = req.query.email

    const doc = await db
      .collection('users')
      .doc(uid)
      .get()
    console.log('getDoc:', doc)
    console.log('doc.data():', doc.data())
    const originalEmail = doc.data().originalEmailAtSignUp
    const isOriginal = originalEmail === email

    // FINISH
    res.send({ original: isOriginal })
  } catch (error) {
    console.log(
      'caught error in isOriginalSignUpEmail express route -- :',
      error
    )
    res.status(404).end()
  }
}
