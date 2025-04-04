import express from 'express'
import home from '../controllers/home-controller'

const router = express.Router()

/**
 * GET /
 * → Render the homepage of the application.
 *
 * This route is registered via a function that applies it to the app instance directly.
 */
router.get('/', home)

export default (app: express.Application) => app.use(router)
