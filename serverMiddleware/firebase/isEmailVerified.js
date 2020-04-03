import initializeApp from './initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const isEmailVerified = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    // CHECK TO SEE IF EMAIL IS VERIFIED
    const user = await admin.auth().getUserByEmail(req.query.email)
    res.send({ emailVerified: user.emailVerified })
  } catch (error) {
    console.log('error caught in isEmailVerified express route -- ', error)
    res.status(404).end()
  }
}
