import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'
import { auth } from './middleware/auth'
import { createUserWithEmail } from './firebase/createUserWithEmail'
import { createUserWithPhone } from './firebase/createUserWithPhone'
import { approveUser } from './firebase/approveUser'
import { isUserApproved } from './firebase/isUserApproved'
import { isOriginalSignUpContact } from './firebase/firestore/isOriginalSignUpContact'
import { hasOnboarded } from './firebase/firestore/hasOnboarded'
import { checkIfOnboarded } from './firebase/firestore/checkIfOnboarded'
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

app.get('/firebase/approveUser', approveUser)
app.get('/firebase/isUserApproved', isUserApproved)
app.get('/firebase/firestore/isOriginalSignUpContact', isOriginalSignUpContact)

app.post('/firebase/createUserWithEmail', createUserWithEmail)
app.post('/firebase/createUserWithPhone', createUserWithPhone)
app.post('/firebase/firestore/hasOnboarded', hasOnboarded)
app.post('/firebase/firestore/checkIfOnboarded', checkIfOnboarded)
app.post('/firebase/updateProfile', updateProfile)

module.exports = {
  path: '/serverMiddleware',
  handler: app
}
