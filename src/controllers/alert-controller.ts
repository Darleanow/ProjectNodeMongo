// Modified alert-controller.ts
import { Request, Response } from 'express'
import AlertTimeSeries from '../models/AlertTimeSeries.js'
import Spot from '../models/Spot.js'

// Create a new alert
export const createAlert = async (req: Request, res: Response) => {
  try {
    const { spotId, alertType, severity, metadata } = req.body
    
    // Check if the spot exists
    const spot = await Spot.findById(spotId)
    if (!spot) {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    // Ensure the spot is categorized as an alert
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
    
    // Check if this is an API request or form submission
    const isApi = req.path.includes('/api/')
    if (isApi) {
      res.json(alert)
    } else {
      res.redirect('/alerts')
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Get all alerts
export const getAllAlerts = async (req: Request, res: Response) => {
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

// Get alerts for a specific spot
export const getAlertsBySpot = async (req: Request, res: Response) => {
  try {
    const { spotId } = req.params
    
    // Check if the spot exists
    const spot = await Spot.findById(spotId)
    if (!spot) {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    const alerts = await AlertTimeSeries.find({ spotId })
      .sort({ timestamp: -1 })
    
    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Get alerts within a time range
export const getAlertsByTimeRange = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query
    
    if (!start || !end) {
      return res.status(400).json({ msg: 'Start and end dates are required' })
    }
    
    const startDate = new Date(String(start))
    const endDate = new Date(String(end))
    
    const alerts = await AlertTimeSeries.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ timestamp: -1 }).populate('spotId')
    
    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Get alerts with time series aggregation (e.g., alerts per day)
export const getAlertsAggregation = async (req: Request, res: Response) => {
  try {
    const { period = 'day' } = req.query
    
    let groupByFormat
    
    switch (String(period)) {
      case 'hour':
        groupByFormat = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        }
        break
      case 'day':
        groupByFormat = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
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
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
      }
    ])
    
    res.json(alerts)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Render alerts page with chart - MODIFIED to ensure alerts display correctly
export const renderAlertsPage = async (req: Request, res: Response) => {
  try {
    // Get the most recent alerts for display
    const recentAlerts = await AlertTimeSeries.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('spotId')
    
    // Get alert types for chart
    const alertTypes = await AlertTimeSeries.aggregate([
      {
        $group: {
          _id: '$alertType',
          count: { $sum: 1 }
        }
      }
    ])
    
    // Add some test data if no alerts exist (helps with debugging)
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