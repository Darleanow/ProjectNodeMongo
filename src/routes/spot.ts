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

/**
 * GET /api/spots
 * → Get all spots with author info.
 *
 * GET /api/spots/nearby?lat=..&lng=..&distance=5
 * → Find spots within a radius (in km) of a lat/lng coordinate.
 *
 * GET /api/spots/:id
 * → Get a single spot by ID.
 *
 * POST /api/spots
 * → Create a new spot (title, description, category, coordinates, author).
 *
 * PUT /api/spots/:id
 * → Update a spot’s details (title, description, category, coordinates).
 *
 * DELETE /api/spots/:id
 * → Remove a spot by ID.
 *
 * GET /spots
 * → Render the full list of spots for the frontend.
 *
 * GET /spots/:id
 * → Render a detail page for a specific spot.
 */
router.get('/api/spots', getAllSpots)
router.get('/api/spots/nearby', findSpotsByDistance)
router.get('/api/spots/:id', getSpotById)
router.post('/api/spots', createSpot)
router.put('/api/spots/:id', updateSpot)
router.delete('/api/spots/:id', deleteSpot)

router.get('/spots', renderSpotsList)
router.get('/spots/:id', renderSpotDetail)

export default router