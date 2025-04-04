import { mockReq, mockRes } from 'sinon-express-mock'
import type { Request, Response } from 'express'
import * as controller from '../../../src/controllers/alert-controller'
import AlertTimeSeries from '../../../src/models/AlertTimeSeries'
import Spot from '../../../src/models/Spot'

jest.mock('../../../src/models/AlertTimeSeries')
jest.mock('../../../src/models/Spot')

describe('Alert Controller - createAlert', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return 404 if the spot does not exist', async () => {
        ; (Spot.findById as jest.Mock).mockResolvedValue(null)

        const req = mockReq({
            body: { spotId: 'not-found-id' },
            path: '/api/alerts'
        })
        const res = mockRes()

        await controller.createAlert(req as unknown as Request, res as unknown as Response)

        expect(res.status.calledWith(404)).toBe(true)
        expect(res.json.calledWith({ msg: 'Spot not found' })).toBe(true)
    })

    it('should create a new alert and return JSON if path is API and category is not alert', async () => {
        const mockSpot = { _id: 'abc', category: 'event' }
        const mockAlert = { _id: 'xyz', alertType: 'weather' }

            ; (Spot.findById as jest.Mock).mockResolvedValue(mockSpot)
            ; (Spot.findByIdAndUpdate as jest.Mock).mockResolvedValue({})
            ; (AlertTimeSeries.prototype.save as jest.Mock).mockResolvedValue(mockAlert)

        const req = mockReq({
            body: {
                spotId: 'abc',
                alertType: 'weather',
                severity: 3,
                metadata: { info: 'Paris' }
            },
            path: '/api/alerts'
        })
        const res = mockRes()

        await controller.createAlert(req as unknown as Request, res as unknown as Response)

        expect(Spot.findByIdAndUpdate).toHaveBeenCalledWith('abc', { category: 'alert' })
        expect(AlertTimeSeries.prototype.save).toHaveBeenCalled()
        expect(res.json.calledWith(mockAlert)).toBe(true)
    })

    it('should not update category if it is already "alert"', async () => {
        const mockSpot = { _id: 'abc', category: 'alert' }
        const mockAlert = { _id: 'xyz', alertType: 'weather' }

            ; (Spot.findById as jest.Mock).mockResolvedValue(mockSpot)
            ; (AlertTimeSeries.prototype.save as jest.Mock).mockResolvedValue(mockAlert)

        const req = mockReq({
            body: {
                spotId: 'abc',
                alertType: 'weather',
                severity: 3,
                metadata: { info: 'Paris' }
            },
            path: '/api/alerts'
        })
        const res = mockRes()

        await controller.createAlert(req as unknown as Request, res as unknown as Response)

        expect(Spot.findByIdAndUpdate).not.toHaveBeenCalled()
        expect(AlertTimeSeries.prototype.save).toHaveBeenCalled()
        expect(res.json.calledWith(mockAlert)).toBe(true)
    })

    it('should redirect to /alerts if path is not an API endpoint', async () => {
        const mockSpot = { _id: 'abc', category: 'event' }
        const mockAlert = { _id: 'xyz', alertType: 'weather' }

            ; (Spot.findById as jest.Mock).mockResolvedValue(mockSpot)
            ; (AlertTimeSeries.prototype.save as jest.Mock).mockResolvedValue(mockAlert)

        const req = mockReq({
            body: {
                spotId: 'abc',
                alertType: 'weather',
                severity: 3,
                metadata: { info: 'Paris' }
            },
            path: '/form/alert'
        })
        const res = mockRes()

        await controller.createAlert(req as unknown as Request, res as unknown as Response)

        expect(res.redirect.calledWith('/alerts')).toBe(true)
    })

    it('should handle internal server errors gracefully', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { }) // silence console

            ; (Spot.findById as jest.Mock).mockRejectedValue(new Error('DB Error'))

        const req = mockReq({
            body: { spotId: 'abc' },
            path: '/api/alerts'
        })
        const res = mockRes()

        await controller.createAlert(req as unknown as Request, res as unknown as Response)

        expect(res.status.calledWith(500)).toBe(true)
        expect(res.send.calledWith('Server Error')).toBe(true)
    })
})
