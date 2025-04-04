import express from 'express'
import User from '../models/User.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
})

router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body
        const newUser = new User({ name, email })
        await newUser.save()
        res.status(201).json(newUser)
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
})

export default router
