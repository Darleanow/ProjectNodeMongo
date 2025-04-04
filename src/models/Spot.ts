import { Schema, model, Types, Document } from 'mongoose'

/**
 * Mongoose document interface for a Spot on the map.
 * Each spot includes a title, description, category, location coordinates and an author.
 */
export interface ISpot extends Document {
  title: string
  description: string
  category: 'good-place' | 'alert' | 'event' | 'other'
  coords: {
    type: string
    coordinates: [number, number] // [lng, lat] order
  }
  author: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

/**
 * Mongoose schema for map spots with support for GeoJSON coordinates.
 * 
 * Indexes:
 *   - 2dsphere index on `coords` to support geospatial queries (e.g., `$near`)
 */
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
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number],
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