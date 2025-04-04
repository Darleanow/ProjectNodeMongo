import 'dotenv/config'
import bodyparser from 'body-parser'
import express from 'express'
import cors from 'cors'
import initRouter from '@/routes/router'
import connectDB from '@/database/database'
import userRoutes from '@/routes/user'

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

connectDB();
initRouter(app)

app.use('/api/users', userRoutes)

app.listen(port, () => { console.log(`Server running on port ${port}`) })
