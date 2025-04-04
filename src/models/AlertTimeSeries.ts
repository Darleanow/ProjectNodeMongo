import { Schema, model, Types, Document } from 'mongoose'

export interface IAlertMetadata {
  description?: string
  location?: string
  reportedBy?: string
  [key: string]: string | number | boolean | undefined
}

export interface IAlertTimeSeries extends Document {
  spotId: Types.ObjectId
  alertType: 'traffic' | 'weather' | 'safety' | 'event' | 'other'
  severity: number
  metadata: IAlertMetadata
  timestamp: Date
}

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
