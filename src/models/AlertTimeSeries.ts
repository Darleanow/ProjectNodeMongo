import { Document, model, Schema } from 'mongoose'

/**
 * Interface for metadata record
 */
export interface IAlertMetadata {
  description?: string
  location?: string
  reportedBy?: string
  [key: string]: string | number | boolean | undefined  // Allow additional custom fields
}

/**
 * Interface to model the Alert Time Series Schema for TypeScript.
 * This uses MongoDB Time Series collections to track alerts over time
 * @param spotId: ObjectId - Reference to the spot
 * @param alertType: string - Type of alert
 * @param severity: number - Severity level (1-5)
 * @param metadata: object - Additional metadata about the alert
 * @param timestamp: Date - When the alert was recorded
 */
export interface IAlertTimeSeries extends Document {
  spotId: Schema.Types.ObjectId
  alertType: string
  severity: number
  metadata: IAlertMetadata
  timestamp: Date
}

const alertTimeSeriesSchema: Schema = new Schema({
  spotId: {
    type: Schema.Types.ObjectId,
    ref: 'Spot',
    required: true,
  },
  alertType: {
    type: String,
    required: true,
    enum: ['traffic', 'weather', 'safety', 'event', 'other'],
    default: 'other',
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  // Time series requires these options
  timeseries: {
    timeField: 'timestamp',
    metaField: 'spotId',
    granularity: 'seconds',
  },
})

const AlertTimeSeries = model<IAlertTimeSeries>('AlertTimeSeries', alertTimeSeriesSchema)

export default AlertTimeSeries