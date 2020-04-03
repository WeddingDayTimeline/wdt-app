import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'
import { auth } from './middleware/auth'
import { isEmailVerified } from './firebase/isEmailVerified'
import { updateProfile } from './firebase/updateProfile'
const express = require('express')
const app = express()
const helmet = require('helmet')

app.use(helmet())
app.use(auth)
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get('/firebase/isEmailVerified', isEmailVerified)
app.post('/firebase/updateProfile', updateProfile)

module.exports = {
  path: '/serverMiddleware',
  handler: app
}
