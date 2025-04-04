import { connect } from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const monURI = process.env.MONGO_URI
if (!monURI) {
  throw new Error('❌ MONGO_URI is not defined in environment variables')
}

const connectDB = async () => {
  try {
    await connect(monURI)
    console.log('✅ MongoDB Connected')
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ Mongo connection error:', err.message)
    } else {
      console.error('❌ Unknown error during DB connection:', err)
    }
    process.exit(1)
  }
}

export default connectDB
