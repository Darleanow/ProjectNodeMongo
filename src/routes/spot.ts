import express from 'express'
import {
  getAllSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot,
  findSpotsByDistance,
  renderSpotsList,
  renderSpotDetail,
  renderSpotCreationForm
} from '../controllers/spot-controller.js'

const router = express.Router()

// API Routes
router.get('/api/spots', getAllSpots)
router.get('/api/spots/nearby', findSpotsByDistance)
router.get('/api/spots/:id', getSpotById)
router.post('/api/spots', createSpot)
router.put('/api/spots/:id', updateSpot)
router.delete('/api/spots/:id', deleteSpot)

// View Routes
router.get('/spots', renderSpotsList)
router.get('/spots/create', renderSpotCreationForm)
router.get('/spots/:id', renderSpotDetail)
router.post('/spots', createSpot)

export default router