const admin = require('firebase-admin');
const dotenv = require('dotenv').config();
import initializeApp from './initializeApp.js'

export const isUserApproved = (req, res) => {

    console.log('isUserApproved!');

    // First check if Firebase has been initialized server-side. If not, then initialize.
    initializeApp();

    async function checkIfApproved(email) {
        const user = await admin.auth().getUserByEmail(email);
        console.log('user:', user);
        console.log('------------------ firebaseApproveUser');
        if (user.customClaims && user.customClaims.approved === true) {
            console.log('user.customClaims 1:', user.customClaims);
            res.send({ approved: true, emailVerified: user.emailVerified })
        } else {
            res.send({ approved: false, emailVerified: user.emailVerified })
        }

    }

    try {
        
        checkIfApproved(req.query.email)
    } catch (error) {
        console.log(error);
        res.status(404).end()
    }


}