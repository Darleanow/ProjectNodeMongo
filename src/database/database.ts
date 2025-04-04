import { connect } from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const monURI = process.env.MONGO_URI

const connectDB = async () => {
  try {
    await connect(monURI)
    console.log('MongoDB Connected...')
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

export default connectDB
