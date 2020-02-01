const admin = require('firebase-admin');
const dotenv = require('dotenv').config();
import initializeApp from './initializeApp.js'

export const approveUser = (req, res) => {

    // First check if Firebase has been initialized server-side. If not, then initialize.
    initializeApp();


    async function firebaseApproveUser(email) {
        const user = await admin.auth().getUserByEmail(email);
        console.log('user:', user);
        if (user.customClaims && user.customClaims.approved === true) {
            console.log('user.customClaims 1:', user.customClaims);
            return;
        }
        return admin.auth().setCustomUserClaims(user.uid, {
            approved: true
        })
    }

    try {
        firebaseApproveUser(req.query.email);
        res.redirect(`${process.env.PRODUCTION_URL}/userApproved?success=true&email=${req.query.email}`);
    } catch (error) {
        console.log(error);
        res.redirect(`${process.env.PRODUCTION_URL}/userApproved?success=false&email=${req.query.email}`);
    }


}