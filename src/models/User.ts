import { Schema, model } from 'mongoose'

/**
 * Basic user schema.
 * Stores a unique email, a name, and an automatic creation date.
 */

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
})

const User = model('User', UserSchema)
export default User
