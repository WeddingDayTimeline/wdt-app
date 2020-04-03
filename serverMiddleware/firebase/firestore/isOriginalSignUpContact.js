import initializeApp from '../initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const isOriginalSignUpContact = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    // CHECK IF CURRENT EMAIL IS ORIGINAL CONTACT FROM SIGN UP
    const db = admin.firestore()
    const uid = req.query.uid
    const contact = req.query.contact

    const doc = await db
      .collection('users')
      .doc(uid)
      .get()
    console.log('getDoc:', doc)
    console.log('doc.data():', doc.data())
    const originalContact = doc.data().originalContactAtSignUp
    const isOriginal = originalContact === contact

    // FINISH
    res.send({ original: isOriginal })
  } catch (error) {
    console.log(
      'caught error in isOriginalSignUpContact express route -- :',
      error
    )
    res.status(404).end()
  }
}
