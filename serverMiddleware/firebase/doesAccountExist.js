import initializeApp from './initializeApp.js'
import deep from '../../utils/deep'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const doesAccountExist = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    const userData = JSON.parse(req.query.userData)
    console.log('userData:', userData)
    const provider = userData.provider
    const login = userData.login
    let user
    // CHECK TO SEE IF ACCOUNT EXISTS
    switch (provider) {
    case 'phone':
      user = await admin.auth().getUserByPhoneNumber(login)
      break
    case 'facebook.com':
      user = await admin.auth().getUser(login)
      break
    }

    if (user) {
      console.log('user:', user)
      res.send(deep({ exists: user.providerData[0].providerId === provider }))
    } else {
      res.send({ exists: false })
    }
  } catch (error) {
    res.send({ exists: false })
    console.log('error caught in doesAccountExist express route -- ', error)
  }
}
