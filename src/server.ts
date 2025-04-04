import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import connectDB from '@/database/database.js'
import spotRoutes from './routes/spot.js'
import alertRoutes from './routes/alert.js'
import userRoutes from './routes/user.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// View engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../views'))

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))

// Connect DB
connectDB()

// Routes
app.get('/', (req, res) => res.render('index', { title: 'Accueil' }))
app.get('/map', (req, res) => res.render('map', { title: 'Carte' }))

// Main routes
app.use(spotRoutes)
app.use(alertRoutes)
app.use(userRoutes)

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`)
})