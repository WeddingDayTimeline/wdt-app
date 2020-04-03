import initializeApp from './initializeApp.js'
import deep from '../../utils/deep'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const doesPhoneAccountExist = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    // CHECK TO SEE IF EMAIL IS VERIFIED
    const user = await admin.auth().getUserByPhoneNumber(req.query.phone)
    if (user) {
      res.send(deep({ exists: user.providerData[0].providerId === 'phone' }))
    } else {
      res.send({ exists: false })
    }
  } catch (error) {
    res.send({ exists: false })
    console.log('error caught in doesPhoneAccountExist express route -- ', error)
  }
}
