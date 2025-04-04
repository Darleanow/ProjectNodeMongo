import { Request, Response, NextFunction } from 'express'
import firebase from '../config/firebase-admin.js'
import User from '../models/User.js'

// Extended Request type to include user information
export interface AuthRequest extends Request {
  user?: {
    uid: string
    email: string
    name: string
    photoURL?: string
    providerId?: string
    mongoId?: string
  }
}

/**
 * Authentication middleware to verify Firebase ID token
 * and retrieve user information
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split('Bearer ')[1]
  
  if (!token) {
    req.user = undefined
    return next()
  }

  try {
    // Use Firebase Admin to verify the token
    const decodedToken = await firebase.auth().verifyIdToken(token)
    
    // Extract provider info
    const providerId = decodedToken.firebase?.sign_in_provider || 'unknown'
    
    // Find existing user
    let user = await User.findOne({ firebaseUid: decodedToken.uid })
    
    // Get display name from token
    const name = decodedToken.name || 
                 decodedToken.displayName || 
                 (decodedToken.email ? decodedToken.email.split('@')[0] : 'Anonymous User')
    
    if (!user) {
      // Create a new user if not found
      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || 'anonymous@example.com',
        name,
        photoURL: decodedToken.picture || null,
        displayName: decodedToken.name || null,
        providerId
      })
      await user.save()
    } else {
      // Update user on login
      user.lastLogin = new Date()
      
      // Update profile info if from Google
      if (providerId === 'google.com') {
        user.photoURL = decodedToken.picture || user.photoURL
        user.displayName = decodedToken.name || user.displayName
        user.name = name
        user.providerId = providerId
      }
      
      await user.save()
    }
    
    // Attach user info to request (avoiding _id format to satisfy ESLint)
    const mongoId = String(user.get('_id'))
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: user.name,
      photoURL: user.photoURL,
      providerId,
      mongoId
    }
    
    return next()
  } catch (error) {
    console.error('Error verifying token:', error)
    req.user = undefined
    return next()
  }
}

/**
 * Simple middleware to require authentication
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' })
  }
  return next()
}