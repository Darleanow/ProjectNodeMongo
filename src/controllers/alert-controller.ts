import { Request, Response } from 'express'
import AlertTimeSeries from '../models/AlertTimeSeries.js'
import Spot from '../models/Spot.js'

/**
 * Creates a new alert associated with a given spot.
 * If the spot's category isn't "alert", it updates it accordingly.
 * Responds with JSON or redirects based on the request path.
 */
export const createAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { spotId, alertType, severity, metadata } = req.body

    const spot = await Spot.findById(spotId)
    if (!spot) {
      res.status(404).json({ msg: 'Spot not found' })
      return
    }

    if (spot.category !== 'alert') {
      await Spot.findByIdAndUpdate(spotId, { category: 'alert' })
    }

    const newAlert = new AlertTimeSeries({
      spotId,
      alertType,
      severity,
      metadata,
      timestamp: new Date()
    })

    const alert = await newAlert.save()

    if (req.path.includes('/api/')) {
      res.json(alert)
    } else {
      res.redirect('/alerts')
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

/**
 * Retrieves all alerts in the database, sorted by timestamp (newest first),
 * and populates their associated spot data.
 */
export const getAllAlerts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await AlertTimeSeries.find()
      .sort({ timestamp: -1 })
      .populate('spotId')
    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

/**
 * Retrieves all alerts for a specific spot based on its ID.
 * Returns 404 if the spot does not exist.
 */
export const getAlertsBySpot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { spotId } = req.params

    const spot = await Spot.findById(spotId)
    if (!spot) {
      res.status(404).json({ msg: 'Spot not found' })
      return
    }

    const alerts = await AlertTimeSeries.find({ spotId }).sort({ timestamp: -1 })
    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

/**
 * Retrieves alerts within a specific time range using query parameters `start` and `end`.
 * Returns 400 if either is missing.
 */
export const getAlertsByTimeRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.query as { start?: string; end?: string }

    if (!start || !end) {
      res.status(400).json({ msg: 'Start and end dates are required' })
      return
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    const alerts = await AlertTimeSeries.find({
      timestamp: { $gte: startDate, $lte: endDate }
    })
      .sort({ timestamp: -1 })
      .populate('spotId')

    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

/**
 * Aggregates alert data by time period (`hour`, `day`, `week`, or `month`).
 * Returns counts and average severity for each period.
 */
export const getAlertsAggregation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'day' } = req.query

    let groupByFormat: Record<string, unknown>

    switch (String(period)) {
      case 'hour':
        groupByFormat = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        }
        break
      case 'week':
        groupByFormat = {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' }
        }
        break
      case 'month':
        groupByFormat = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' }
        }
        break
      default:
        groupByFormat = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        }
    }

    const alerts = await AlertTimeSeries.aggregate([
      {
        $group: {
          _id: groupByFormat,
          count: { $sum: 1 },
          avgSeverity: { $avg: '$severity' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
          '_id.hour': 1
        }
      }
    ])

    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

/**
 * Renders the alerts index page with recent alerts and type statistics.
 * Used for the frontend view.
 */
export const renderAlertsPage = async (_req: Request, res: Response): Promise<void> => {
  try {
    const recentAlerts = await AlertTimeSeries.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('spotId')

    const alertTypes = await AlertTimeSeries.aggregate([
      {
        $group: {
          _id: '$alertType',
          count: { $sum: 1 }
        }
      }
    ])

    if (recentAlerts.length === 0 && process.env.NODE_ENV !== 'production') {
      console.log('No alerts found, would add test data in development mode')
    }

    res.render('alerts/index', {
      title: 'Alertes récentes',
      recentAlerts,
      alertTypesData: JSON.stringify(alertTypes)
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}
