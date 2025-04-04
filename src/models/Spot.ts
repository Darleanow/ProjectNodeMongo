import { Document, model, Schema } from 'mongoose'

/**
 * Interface to model the Spot Schema for TypeScript.
 * @param title:string - Title of the spot
 * @param description:string - Description of the spot
 * @param category:string - Category of the spot (e.g., "restaurant", "alert", "event")
 * @param coords:object - Coordinates of the spot
 * @param author:string - Author of the spot (reference to User ID)
 * @param createdAt:Date - Creation date
 * @param updatedAt:Date - Last update date         
 */
export interface ISpot extends Document {
  title: string
  description: string
  category: string
  coords: {
    lat: number
    lng: number
  }
  author: string
  createdAt: Date
  updatedAt: Date
}

const spotSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['good-place', 'alert', 'event', 'other'],
    default: 'other',
  },
  coords: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create 2dsphere index for geospatial queries
spotSchema.index({ 'coords': '2dsphere' })

const Spot = model<ISpot>('Spot', spotSchema)

export default Spot