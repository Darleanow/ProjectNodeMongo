import { Request, Response } from 'express'

/**
 * Renders the homepage of the application.
 */
const home = (req: Request, res: Response): void => {
  res.render('index', { title: 'Accueil' })
}

export default home
