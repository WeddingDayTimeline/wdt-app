import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'
import { auth } from './middleware/auth'
import { newUser } from './firebase/newUser'
import { approveUser } from './firebase/approveUser'
const express = require('express')
const app = express()
const helmet = require('helmet')

app.use(helmet())
app.use(auth)
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

app.post('/firebase/newUser', newUser)
app.get('/firebase/approveUser', approveUser)

module.exports = {
   path: '/api',
   handler: app
}