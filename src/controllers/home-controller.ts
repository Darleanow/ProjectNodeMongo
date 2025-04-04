import { Request, Response } from 'express'

const home = (req: Request, res: Response): void => {
  res.render('index', { title: 'Accueil' })
}

export default home
