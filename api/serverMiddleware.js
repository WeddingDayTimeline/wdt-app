import hubConfig from '~/hubConfig'

export default $axios => ({
    createUser(email, uid, provider) {
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
    },
    hasOnboarded(uid) {
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
})