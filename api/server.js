import hubConfig from '~/hubConfig'

export default $axios => ({
    createUser(email, uid, provider) {
        if (process.client) {
            return $axios({
                method: 'post',
                url: '/serverMiddleware/firebase/createUser',
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
    isOriginalEmail(uid, email) {
        if (process.client) {
            return $axios({
                method: 'get',
                url: '/serverMiddleware/firebase/firestore/isOriginalSignUpEmail',
                params: {
                    app: hubConfig.api.appName,
                    uid: uid,
                    email: email
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