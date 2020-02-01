const admin = require('firebase-admin');
const dotenv = require('dotenv').config();
import initializeApp from './initializeApp.js'

export const isUserApproved = (req, res) => {

    console.log('isUserApproved!');

    // FIRST CHECK IF FIREBASE HAS BEEN INITIALIZED SERVER-SIDE. IF NOT, THEN INITIALIZE.
    initializeApp();

    // CHECK TO SEE IF USER HAS BEEN APPROVED
    async function checkIfApproved(email) {
        const user = await admin.auth().getUserByEmail(email);
        if (user.customClaims && user.customClaims.approved === true) {
            res.send({ approved: true, emailVerified: user.emailVerified })
        } else {
            res.send({ approved: false, emailVerified: user.emailVerified })
        }

    }

    try {
        checkIfApproved(req.query.email)
    } catch (error) {
        console.log('error caught in isUserApproved express route -- ', error);
        res.status(404).end()
    }


}