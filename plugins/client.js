import cl from '~/api/client'

export default (ctx, inject) => {
  // Inject the abstracted/organized client-side calls in the context and to vue instance (ctx.app.$client, this.$client)
  const client = cl(ctx)
  inject('client', client)
}
