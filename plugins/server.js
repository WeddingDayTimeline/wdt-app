import sm from '~/api/server'
export default (ctx, inject) => {
  /*
   * Inject the abstracted/organized serverMiddleware calls in the context (ctx.app.$server)
   * And in the Vue instances (this.$server in your components)
   */
  const server = sm(ctx.$axios)
  inject('server', server)
}
