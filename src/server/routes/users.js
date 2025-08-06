import express from 'express'
import mongoose from "mongoose"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

mongoose.connect(`mongodb+srv://obibrown24:${process.env.MONGODB_PASSWORD}@main.dhye8.mongodb.net/?retryWrites=true&w=majority&appName=Main`).then( () => {
  console.log('Connected to MongoDB')
}).catch((error) => {
  console.error('Error connecting to MongoDB', error)
})

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

const user = mongoose.model('User', userSchema)

const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const existingUser = await user.findOne({ email: req.body.email })
        if(existingUser) {
            return res.status(400).send({ message: 'Email already exists' })
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = new user({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })

        await newUser.save()
        return res.status(200).send({ message: 'User registered successfully' })
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error" })
    }
})


router.post('/login', async (req, res) => {
    try{
        //check if user email exists
        const existingUser = await user.findOne({ email: req.body.email })
        if(!existingUser) {
            return res.status(400).send({ message: 'Invalid Credentials' })
        }
        console.log(existingUser)

        //compare passwords
        const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password)
        if(!passwordMatch) {
            return res.status(401).send({ message: 'Invalid Password' })
        } else{
            console.log('pass match')
        }

        //generate JWT token
        const token = jwt.sign({ email: existingUser.email}, 'secret')
        console.log(token)
        res.status(200).json({ token })
    } catch (error) {
        res.status(500).send({ message: `Internal Server Error: ${error}` })
    }
})

export default router