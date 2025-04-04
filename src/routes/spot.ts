import express from 'express'
import {
  getAllSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot,
  findSpotsByDistance,
  renderSpotsList,
  renderSpotDetail
} from '../controllers/spot-controller.js'

const router = express.Router()

router.get('/api/spots', getAllSpots)
router.get('/api/spots/nearby', findSpotsByDistance)
router.get('/api/spots/:id', getSpotById)
router.post('/api/spots', createSpot)
router.put('/api/spots/:id', updateSpot)
router.delete('/api/spots/:id', deleteSpot)

router.get('/spots', renderSpotsList)
router.get('/spots/:id', renderSpotDetail)

export default router