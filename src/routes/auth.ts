import express from 'express'
import { renderLoginPage, renderRegisterPage } from '../controllers/auth-controller.js'

const router = express.Router()

router.get('/auth/login', renderLoginPage)
router.get('/auth/register', renderRegisterPage)

export default router