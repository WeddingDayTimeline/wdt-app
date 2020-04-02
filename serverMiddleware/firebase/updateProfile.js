import initializeApp from './initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const updateProfile = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    console.log('req.body.uid:', req.body.uid)
    console.log('req.body.userData:', req.body.userData)
    const update = await admin
      .auth()
      .updateUser(req.body.uid, req.body.userData)
    if (update) {
      res.send({ success: true, user: update })
    }
  } catch (error) {
    console.log('error caught in updateProfile express route -- ', error)
    res.status(404).end()
  }
}
