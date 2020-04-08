import appConfig from '~/appConfig'

export default $axios => ({
    updateProfile(uid, userData) {
        if (process.client) {
            return $axios({
                    method: 'post',
                    url: '/serverMiddleware/firebase/updateProfile',
                    params: {
                    app: appConfig.api.appName
                },
                data: {
                    uid: uid,
                    userData: userData
                }
            })
        }
    },
    isEmailVerified(email) {
        if (process.client) {
            return $axios({
                method: 'get',
                url: '/serverMiddleware/firebase/isEmailVerified',
                params: {
                    app: appConfig.api.appName,
                    email: email
                }
            })
        }
    },
    doesAccountExist(userData) {
        if (process.client) {
            return $axios({
                method: 'get',
                url: '/serverMiddleware/firebase/doesAccountExist',
                params: {
                    app: appConfig.api.appName,
                    userData: userData
                }
            })
        }
    }
})