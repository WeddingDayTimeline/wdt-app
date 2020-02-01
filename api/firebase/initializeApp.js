const admin = require('firebase-admin');
const dotenv = require('dotenv').config();

export default function () {

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
                databaseURL: process.env.FB_DATABASE_URL
            })
            
            return
        } catch(err) {
            console.error('write error')
            console.error(err)
            return res.status(404).end()
        }

    }

}