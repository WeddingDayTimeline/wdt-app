import hubConfig from '~/hubConfig'

export default $axios => ({
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
    isEmailVerified(email) {
        if (process.client) {
            return $axios({
                method: 'get',
                url: '/serverMiddleware/firebase/isEmailVerified',
                params: {
                    app: hubConfig.api.appName,
                    email: email
                }
            })
        }
    }
})