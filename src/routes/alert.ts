import express from 'express'
import {
  createAlert,
  getAllAlerts,
  getAlertsBySpot,
  getAlertsByTimeRange,
  getAlertsAggregation,
  renderAlertsPage
} from '@/controllers/alert-controller.js'

const router = express.Router()

router.post('/api/alerts', createAlert)
router.get('/api/alerts', getAllAlerts)
router.get('/api/alerts/timerange', getAlertsByTimeRange)
router.get('/api/alerts/aggregation', getAlertsAggregation)
router.get('/api/alerts/spot/:spotId', getAlertsBySpot)

router.get('/alerts', renderAlertsPage)

export default router