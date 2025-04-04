import { mockReq, mockRes } from 'sinon-express-mock'
import type { Request, Response } from 'express'
import home from '../../../src/controllers/home-controller'

describe('Home Controller', () => {
    it('should render the home page with title "Accueil"', () => {
        const req = mockReq()
        const res = mockRes()

        home(req as unknown as Request, res as unknown as Response)

        expect(res.render.calledOnce).toBe(true)
        expect(res.render.calledWith('index', { title: 'Accueil' })).toBe(true)
    })
})
