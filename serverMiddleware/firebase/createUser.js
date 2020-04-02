import hubConfig from '../../hubConfig'
import initializeApp from './initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const createUser = (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  try {
    // SEND EMAIL TO ADMIN FOR APPROVAL, SINCE NOT JUST ANYONE CAN SIGN UP AND USE THE APP
    const sendgridApiKey = process.env.SENDGRID_KEY
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(sendgridApiKey)

    const link = `${process.env.PRODUCTION_URL}/serverMiddleware/firebase/approveUser?email=${req.body.email}&app=${hubConfig.api.appName}`
    const html = `${req.body.email} just signed up for a new account for <strong>${process.env.PROJECT_NAME}</strong> and needs your approval.<br><br>Please visit the link below to approve.<br><br>${link}<br><br>Thanks!<br>Your ${process.env.PROJECT_NAME} bot`

    const msg = {
      to: process.env.USER_APPROVAL_EMAIL,
      from: process.env.USER_APPROVAL_EMAIL,
      subject: `A new ${process.env.PROJECT_NAME} user needs your approval.`,
      text: `An automated messsage from ${process.env.PROJECT_NAME}1`,
      html
    }

    sgMail.send(msg)

    // ADD FIRESTORE DATA. ONBOARDED TRUE IF USED GOOGLE SIGNUP METHOD, ELSE FALSE. ADD ORIGINAL EMAIL TO USER'S DATA.
    const db = admin.firestore()

    const uid = req.body.uid
    console.log('req.body.email:', req.body.email)
    const userData = {
      onboarded: req.body.provider === 'google.com',
      originalEmailAtSignUp: req.body.email
    }

    const setDoc = db
      .collection('users')
      .doc(uid)
      .set(userData)

    // FINISH
    res.send({ success: true })
  } catch (error) {
    console.log('caught error in createUser express route -- :', error)
    res.status(404).end()
  }
}
