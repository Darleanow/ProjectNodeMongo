import { Request, Response } from 'express'

export const renderLoginPage = (_req: Request, res: Response): void => {
  res.render('auth/login', { title: 'Connexion' })
}

export const renderRegisterPage = (_req: Request, res: Response): void => {
  res.render('auth/register', { title: 'Inscription' })
}