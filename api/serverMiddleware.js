export default $axios => ({
    // index() {
    //     return $axios.$get(`${resource}`)
    // }
    createUser(email, uid, provider = 'password') {
        return $axios({
            method: 'post',
            url: '/serverMiddleware/firebase/createUser',
            params: {
                app: 'dig-hub'
            },
            data: {
                email: email,
                uid: uid,
                provider: provider
            }
        })
    }
})