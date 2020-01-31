import digConfig from '~/digConfig.js'

export default {
    data() {
        return {
            DigConfig: {},
        };
    },
    created() {
        this.DigConfig = digConfig
    }
}