import initializeApp from '../initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const hasOnboarded = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    // UPDATE USER WITH ONBOARDED=TRUE DATA IN FIRESTORE
    const db = admin.firestore()
    const uid = req.body.uid
    console.log('uid:', uid)

    const userData = {
      onboarded: true
    }

    const doc = await db
      .collection('users')
      .doc(uid)
      .get()
    // IF DOC DOESNT EXIST THEN USE 'SET' VERB TO CREATE A NEW DOC
    if (!doc.exists) {
      console.log('doc dont exist')
      const updateDoc = db
        .collection('users')
        .doc(uid)
        .set(userData)
    } else {
      console.log('doc exists!')
      // IF DOC EXISTS THEN USE 'UPDATE' VERB SO AS TO NOT OVERWRITE ANYTHING YOU DON'T WANT TO
      const updateDoc = db
        .collection('users')
        .doc(uid)
        .update(userData)
    }

    // FINISH
    res.send({ success: true })
  } catch (error) {
    console.log('caught error in hasOnboarded express route -- :', error)
    res.status(404).end()
  }
}
