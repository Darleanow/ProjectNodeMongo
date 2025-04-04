import { Request, Response } from 'express'
import Spot from '../models/Spot.js'

// Get all spots
export const getAllSpots = async (req: Request, res: Response) => {
  try {
    const spots = await Spot.find().populate('author', 'name email')
    res.json(spots)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Get spot by ID
export const getSpotById = async (req: Request, res: Response) => {
  try {
    const spot = await Spot.findById(req.params.id).populate('author', 'name email')
    
    if (!spot) {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    res.json(spot)
  } catch (err) {
    console.error(err)
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    res.status(500).send('Server Error')
  }
}

// Create a new spot
export const createSpot = async (req: Request, res: Response) => {
  try {
    const { title, description, category, lat, lng, author } = req.body
    
    const newSpot = new Spot({
      title,
      description,
      category,
      coords: { lat, lng },
      author
    })
    
    const spot = await newSpot.save()
    res.json(spot)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Update a spot
export const updateSpot = async (req: Request, res: Response) => {
  try {
    const { title, description, category, lat, lng } = req.body
    
    // Build spot object with proper typing
    const spotFields: {
      title?: string;
      description?: string;
      category?: string;
      coords?: { lat: number; lng: number };
      updatedAt: Date;
    } = {
      updatedAt: new Date()
    }
    
    if (title) spotFields.title = title
    if (description) spotFields.description = description
    if (category) spotFields.category = category
    if (lat && lng) spotFields.coords = { lat, lng }
    
    let spot = await Spot.findById(req.params.id)
    
    if (!spot) {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    // Update
    spot = await Spot.findByIdAndUpdate(
      req.params.id,
      { $set: spotFields },
      { new: true }
    )
    
    res.json(spot)
  } catch (err) {
    console.error(err)
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    res.status(500).send('Server Error')
  }
}

// Delete a spot
export const deleteSpot = async (req: Request, res: Response) => {
  try {
    const spot = await Spot.findById(req.params.id)
    
    if (!spot) {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    await spot.deleteOne()
    
    res.json({ msg: 'Spot removed' })
  } catch (err) {
    console.error(err)
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Spot not found' })
    }
    
    res.status(500).send('Server Error')
  }
}

// Find spots by distance (in kilometers)
export const findSpotsByDistance = async (req: Request, res: Response) => {
  try {
    const { lat, lng, distance = 5 } = req.query
    
    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and longitude are required' })
    }
    
    // Convert distance from kilometers to meters (for MongoDB)
    const distanceInMeters = Number(distance) * 1000
    
    const spots = await Spot.find({
      coords: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: distanceInMeters
        }
      }
    })
    
    res.json(spots)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Render spots list page
export const renderSpotsList = async (req: Request, res: Response) => {
  try {
    const spots = await Spot.find()
    res.render('spots/list', { title: 'Tous les spots', spots })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Render spot detail page
export const renderSpotDetail = async (req: Request, res: Response) => {
  try {
    const spot = await Spot.findById(req.params.id).populate('author', 'name email')
    
    if (!spot) {
      return res.status(404).render('error', { message: 'Spot not found' })
    }
    
    res.render('spots/show', { spot })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

// Render spot creation form
export const renderSpotCreationForm = (req: Request, res: Response) => {
  res.render('spots/create')
}