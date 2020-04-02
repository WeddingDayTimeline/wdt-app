import initializeApp from './initializeApp.js'
const admin = require('firebase-admin')
const dotenv = require('dotenv').config()

export const approveUser = async (req, res) => {
  // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
  initializeApp()

  async function firebaseApproveUser(email) {
    // SET FIREBSAE CUSTOM CLAIM FOR USER'S APPROVED STATE. THIS ROUTE IS CALLED WHEN AN ADMIN CLICKS ON A USER APPROVAL LINK IN THEIR EMAIL.
    const user = await admin.auth().getUserByEmail(email)
    if (user.customClaims && user.customClaims.approved === true) {
      return
    }
    return admin.auth().setCustomUserClaims(user.uid, {
      approved: true
    })
  }

  try {
    await firebaseApproveUser(req.query.email)
    // SUCCESS=TRUE IN QUERY STRING
    res.redirect(
      `${process.env.PRODUCTION_URL}/userApproved?success=true&email=${req.query.email}`
    )
  } catch (error) {
    console.log('error caught in approveUser express route -- ', error)
    // SUCCESS-FALSE IN QUERY STRING
    res.redirect(
      `${process.env.PRODUCTION_URL}/userApproved?success=false&email=${req.query.email}`
    )
  }
}
