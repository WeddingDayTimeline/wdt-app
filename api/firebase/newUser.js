const admin = require('firebase-admin');
const dotenv = require('dotenv').config();
import initializeApp from './initializeApp.js'

export const newUser = (req, res) => {

    // First check if Firebase has been initialized server-side. If not, then initialize.
    initializeApp();

    
    try {
      
        // SEND EMAIL TO ADMIN FOR APPROVAL, SINCE NOT JUST ANYONE CAN SIGN UP AND USE THE APP
        const sendgridApiKey = process.env.SENDGRID_KEY;
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(sendgridApiKey);
        
        console.log('req.body.email:', req.body.email);
        let link = `${process.env.PRODUCTION_URL}/api/firebase/approveUser?email=${req.body.email}&app=dig-hub`;
        let html = (`Someone just signed up for a new account for <strong>${process.env.PROJECT_NAME}</strong> and needs your approval.<br><br>Please visit the link below to approve.<br><br>${link}<br><br>Thanks!<br>Your ${process.env.PROJECT_NAME} bot`);
        const msg = {
            to: process.env.USER_APPROVAL_EMAIL,
            from: process.env.USER_APPROVAL_EMAIL,
            subject: `A new ${process.env.PROJECT_NAME} user needs your approval.`,
            text: `An automated messsage from ${process.env.PROJECT_NAME}1`,
            html: html,
        };

        sgMail.send(msg)


        // CREATE NEW USER WITH ONBOARDED=FALSE DATA IN FIRESTORE
        let db = admin.firestore();

        const uid = req.body.uid;
        const userData = {
            onboarded: false
        };

        let setDoc = db.collection('users').doc(uid).set(userData);


        // FINISH
        res.send({ success: true })

    } catch(error) {
        res.status(404).end()
    }

}