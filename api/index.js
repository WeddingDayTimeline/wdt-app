import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'
import { auth } from './middleware/auth'
import { newUser } from './firebase/newUser'
import { approveUser } from './firebase/approveUser'
import { isUserApproved } from './firebase/isUserApproved'
import { isOriginalSignUpEmail } from './firebase/firestore/isOriginalSignUpEmail'
import { hasOnboarded } from './firebase/firestore/hasOnboarded'
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
app.get('/firebase/isUserApproved', isUserApproved)
app.get('/firebase/firestore/isOriginalSignUpEmail', isOriginalSignUpEmail)

app.post('/firebase/firestore/hasOnboarded', hasOnboarded)

module.exports = {
   path: '/api',
   handler: app
}