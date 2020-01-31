const admin = require('firebase-admin');
const dotenv = require('dotenv').config();

export const isUserApproved = (req, res) => {

    console.log('isUserApproved!');

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


    async function firebaseApproveUser(email) {
        const user = await admin.auth().getUserByEmail(email);
        console.log('user:', user);
        console.log('------------------ firebaseApproveUser');
        if (user.customClaims && user.customClaims.approved === true) {
            console.log('user.customClaims 1:', user.customClaims);
            res.send({ approved: true })
        } else {
            res.send({ approved: false })
        }

    }

    try {
        firebaseApproveUser(req.query.email)
    } catch (error) {
        console.log(error);
        res.status(404).end()
    }


}