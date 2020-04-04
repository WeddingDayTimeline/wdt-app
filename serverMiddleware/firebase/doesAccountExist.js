import initializeApp from './initializeApp.js'
import deep from '../../utils/deep'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const doesAccountExist = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    const provider = req.query.userData.method
    let user
    // CHECK TO SEE IF ACCOUNT EXISTS
    switch (provider) {
    case 'phone':
      user = await admin.auth().getUserByPhoneNumber(req.query.userData.login)
      break
    case 'facebook':
      user = await admin.auth().getUser(req.query.userData.login)
      break
    }

    if (user) {
      res.send(deep({ exists: user.providerData[0].providerId === provider }))
    } else {
      res.send({ exists: false })
    }
  } catch (error) {
    res.send({ exists: false })
    console.log('error caught in doesAccountExist express route -- ', error)
  }
}
