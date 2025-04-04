import { Schema, model, Types, Document } from 'mongoose'

/**
 * Interface for the metadata associated with an alert.
 * Allows for flexible key-value entries.
 */
export interface IAlertMetadata {
  description?: string
  location?: string
  reportedBy?: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Document interface for a time-series alert.
 * Each alert is linked to a Spot (via `spotId`) and includes a timestamped severity level.
 */
export interface IAlertTimeSeries extends Document {
  spotId: Types.ObjectId
  alertType: 'traffic' | 'weather' | 'safety' | 'event' | 'other'
  severity: number
  metadata: IAlertMetadata
  timestamp: Date
}

/**
 * Mongoose schema for storing alert time-series data.
 * 
 * Time-series collection parameters:
 *   - timeField: 'timestamp'
 *   - metaField: 'spotId'
 *   - granularity: 'seconds'
 * 
 * Note: Time series optimizations only apply if the collection is created manually
 * with `db.createCollection` using the same options.
 */
const alertTimeSeriesSchema = new Schema<IAlertTimeSeries>(
  {
    spotId: {
      type: Schema.Types.ObjectId,
      ref: 'Spot',
      required: true
    },
    alertType: {
      type: String,
      enum: ['traffic', 'weather', 'safety', 'event', 'other'],
      default: 'other',
      required: true
    },
    severity: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'spotId',
      granularity: 'seconds'
    }
  }
)

const AlertTimeSeries = model<IAlertTimeSeries>('AlertTimeSeries', alertTimeSeriesSchema)

export default AlertTimeSeries
