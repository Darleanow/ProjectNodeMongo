import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  firebaseUid: string
  photoURL?: string
  displayName?: string
  providerId?: string
  createdAt: Date
  lastLogin?: Date
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, required: true, unique: true },
  photoURL: { type: String },
  displayName: { type: String },
  providerId: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
})

const User = model<IUser>('User', UserSchema)
export default User