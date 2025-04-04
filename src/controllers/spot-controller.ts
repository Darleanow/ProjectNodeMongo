import { Request, Response } from 'express'
import Spot from '../models/Spot'

export const getAllSpots = async (req: Request, res: Response): Promise<void> => {
  try {
    const spots = await Spot.find().populate('author', 'name email')
    res.json(spots)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

export const getSpotById = async (req: Request, res: Response): Promise<void> => {
  try {
    const spot = await Spot.findById(req.params.id).populate('author', 'name email')
    if (!spot) {
      res.status(404).json({ msg: 'Spot not found' })
      return
    }
    res.json(spot)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

export const createSpot = async (req: Request, res: Response): Promise<void> => {
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

export const updateSpot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, lat, lng } = req.body

    const spotFields: Partial<{
      title: string
      description: string
      category: string
      coords: { lat: number; lng: number }
      updatedAt: Date
    }> = {
      updatedAt: new Date()
    }

    if (title) spotFields.title = title
    if (description) spotFields.description = description
    if (category) spotFields.category = category
    if (lat && lng) spotFields.coords = { lat, lng }

    const spot = await Spot.findByIdAndUpdate(req.params.id, { $set: spotFields }, { new: true })

    if (!spot) {
      res.status(404).json({ msg: 'Spot not found' })
      return
    }

    res.json(spot)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

export const deleteSpot = async (req: Request, res: Response): Promise<void> => {
  try {
    const spot = await Spot.findById(req.params.id)

    if (!spot) {
      res.status(404).json({ msg: 'Spot not found' })
      return
    }

    await spot.deleteOne()
    res.json({ msg: 'Spot removed' })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

export const findSpotsByDistance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, distance = 5 } = req.query as {
      lat?: string
      lng?: string
      distance?: string | number
    }

    if (!lat || !lng) {
      res.status(400).json({ msg: 'Latitude and longitude are required' })
      return
    }

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

export const renderSpotsList = async (_req: Request, res: Response): Promise<void> => {
  try {
    const spots = await Spot.find()
    res.render('spots/list', { title: 'Tous les spots', spots })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

export const renderSpotDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const spot = await Spot.findById(req.params.id).populate('author', 'name email')
    if (!spot) {
      res.status(404).render('error', { message: 'Spot not found' })
      return
    }
    res.render('spots/show', { spot })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
}

export const renderSpotCreationForm = (_req: Request, res: Response): void => {
  res.render('spots/create')
}
