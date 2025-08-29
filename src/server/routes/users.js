import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

mongoose.connect(`mongodb+srv://obibrown24:${process.env.MONGODB_PASSWORD}@main.dhye8.mongodb.net/?retryWrites=true&w=majority&appName=Main`).then(() => {
  console.log('Connected to MongoDB')
}).catch((error) => {
  console.error('Error connecting to MongoDB', error)
})

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
})

const User = mongoose.model('User', userSchema)

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    })

    await newUser.save()
    return res.status(200).send({ message: 'User registered successfully' })
  } catch (error) {
    return res.status(500).send({ message: 'Internal Server Error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    // check if user email exists
    const existingUser = await User.findOne({ email: req.body.email })
    if (!existingUser) {
      return res.status(403).send({ message: 'User does not exist' })
    }

    // compare passwords
    const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password)
    if (!passwordMatch) {
      return res.status(401).send({ message: 'Invalid Password' })
    }

    // generate JWT token
    const refreshToken = jwt.sign({email: existingUser.email, username: existingUser.username}, process.env.REFRESH_TOKEN_SECRET)

    // store refresh tokens
    refreshTokens.push(refreshToken)

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      path: '/users'
    })

    res.status(200).send()
  } catch (error) {
    res.status(500).send({ message: `Internal Server Error: ${error}` })
  }
})

router.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.cookies.refresh_token)
  res.clearCookie('refresh_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/users'
  })
  res.status(204).send({ message: 'succesfully logged out' })
})

let refreshTokens = []

router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refresh_token

  if (refreshToken == null) return res.status(401).send({ message: 'No token provided' })
  if (!refreshTokens.includes(refreshToken)) return res.status(401).send({ message: 'Invalid token' })

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.stataus(401).send({ message: 'Invalid Credentials' })

    const newAccessToken = generateAccessToken({ email: user.email, username: user.username })
    res.status(200).send({ accessToken: newAccessToken })
  })
})

router.get('/posts', authenticateToken, (req, res) => {
  return res.status(200).send({ message: req.user })
})

function generateAccessToken (user) {
  return jwt.sign({
    email: user.email,
		username: user.username
  }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '1h' })
}

export function authenticateToken (req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.status(401).send({ message: 'No token provided' })

  jwt.verify(token, process.env.AUTH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).send({ message: 'Unauthorized' })
    req.user = user
    next()
  })
}

export default router
