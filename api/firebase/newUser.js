const admin = require('firebase-admin');
const dotenv = require('dotenv').config();

export const newUser = (req, res) => {

    // First check if Firebase has been initialized server-side. If not, then initialize.
    if (!admin.apps.length) {

        try {
            const creds = {
                type: process.env.FB_ADMIN_TYPE,
                project_id: process.env.FB_ADMIN_PROJECT_ID,
                private_key_id: process.env.FB_ADMIN_PRIVATE_KEY_ID,
                private_key: process.env.FB_ADMIN_PRIVATE_KEY,
                client_email: process.env.FB_ADMIN_CLIENT_EMAIL,
                client_id: process.env.FB_ADMIN_CLIENT_ID,
                auth_uri: process.env.FB_ADMIN_AUTH_URI,
                token_uri: process.env.FB_ADMIN_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.FB_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
                client_x509_cert_url: process.env.FB_ADMIN_CLIENT_X509_CERT_URL
            }
            console.log('creds:', creds);

            admin.initializeApp({
                credential: admin.credential.cert(creds),
                databaseURL: 'https://dig-hub.firebaseio.com'
            })
        } catch(err) {
            console.error('write error')
            console.error(err)
            res.status(404).end()
        }

    }

    
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
        res.send({ success: true })

    } catch(error) {
        res.status(404).end()
    }

}