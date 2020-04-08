import appConfig from '../../appConfig'
export const auth = (req, res, next) => {
  // THIS JUST MAKES SURE THAT THERE'S A 'wdt-app' PARAMETER IN EVERY REQUEST TO MAKE SURE THEY ARE COMING FROM THE APP
  if (req.query.app !== appConfig.api.appName) {
    return res.status(400).send({ message: 'Not authorized' })
  }

  next()
}
