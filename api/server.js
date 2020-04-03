import hubConfig from '~/hubConfig'

export default $axios => ({
    createUserWithEmail(email, uid, provider) {
        if (process.client) {
            return $axios({
                method: 'post',
                url: '/serverMiddleware/firebase/createUserWithEmail',
                params: {
                    app: hubConfig.api.appName
                },
                data: {
                    email: email,
                    uid: uid,
                    provider: provider
                }
            })
        }
    },
    createUserWithPhone(phone, uid) {
        if (process.client) {
            return $axios({
                method: 'post',
                url: '/serverMiddleware/firebase/createUserWithPhone',
                params: {
                    app: hubConfig.api.appName
                },
                data: {
                    phone: phone,
                    uid: uid,
                }
            })
        }
    },
    hasOnboarded(uid) {
        if (process.client) {
            return $axios({
                method: 'post',
                url: '/serverMiddleware/firebase/firestore/hasOnboarded',
                params: {
                app: hubConfig.api.appName
                },
                data: {
                uid: uid
                }
            })
        }
    },
    checkIfOnboarded(uid) {
        if (process.client) {
            return $axios({
                method: 'post',
                url: '/serverMiddleware/firebase/firestore/checkIfOnboarded',
                params: {
                app: hubConfig.api.appName
                },
                data: {
                uid: uid
                }
            })
        }
    },
    updateProfile(uid, userData) {
        if (process.client) {
            return $axios({
                method: 'post',
                url: '/serverMiddleware/firebase/updateProfile',
                params: {
                app: hubConfig.api.appName
                },
                data: {
                uid: uid,
                userData: userData
                }
            })
        }
    },
    isOriginalContact(uid, contact) {
        if (process.client) {
            return $axios({
                method: 'get',
                url: '/serverMiddleware/firebase/firestore/isOriginalSignUpContact',
                params: {
                    app: hubConfig.api.appName,
                    uid: uid,
                    contact: contact
                }
            })
        }
    },
    isUserApproved(email) {
        if (process.client) {
            return $axios({
                method: 'get',
                url: '/serverMiddleware/firebase/isUserApproved',
                params: {
                app: hubConfig.api.appName,
                email: email
                }
            })
        }
    }
})