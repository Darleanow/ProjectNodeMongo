import { Schema, model, Types, Document } from 'mongoose'

export interface ISpot extends Document {
  title: string
  description: string
  category: 'good-place' | 'alert' | 'event' | 'other'
  coords: {
    lat: number
    lng: number
  }
  author: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const spotSchema = new Schema<ISpot>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['good-place', 'alert', 'event', 'other'],
      default: 'other',
      required: true
    },
    coords: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

spotSchema.index({ coords: '2dsphere' })

const Spot = model<ISpot>('Spot', spotSchema)

export default Spot
