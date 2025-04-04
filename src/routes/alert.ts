import express from 'express'
import {
  createAlert,
  getAllAlerts,
  getAlertsBySpot,
  getAlertsByTimeRange,
  getAlertsAggregation,
  renderAlertsPage
} from '../controllers/alert-controller.js'

const router = express.Router()

/**
 * POST /api/alerts
 * → Create a new alert and associate it with a spot.
 *
 * GET /api/alerts
 * → Retrieve all alerts, sorted by most recent.
 *
 * GET /api/alerts/timerange?start=ISO&end=ISO
 * → Retrieve alerts within a specific time range.
 *
 * GET /api/alerts/aggregation?period=hour|day|week|month
 * → Aggregate alerts by time period (count, average severity).
 *
 * GET /api/alerts/spot/:spotId
 * → Get all alerts for a specific spot by ID.
 *
 * GET /alerts
 * → Render the alert summary page in the frontend.
 */
router.post('/api/alerts', createAlert)
router.get('/api/alerts', getAllAlerts)
router.get('/api/alerts/timerange', getAlertsByTimeRange)
router.get('/api/alerts/aggregation', getAlertsAggregation)
router.get('/api/alerts/spot/:spotId', getAlertsBySpot)

router.get('/alerts', renderAlertsPage)

export default router