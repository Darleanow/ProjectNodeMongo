import mongoose from 'mongoose'
import AlertTimeSeries from '../../../src/models/AlertTimeSeries'
import dotenv from 'dotenv'

dotenv.config()

const TIMEOUT = 5000

beforeAll(async () => {
    jest.setTimeout(TIMEOUT)
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test-alerts'
    await mongoose.connect(mongoUri)
}, TIMEOUT)

afterAll(async () => {
    await AlertTimeSeries.deleteMany({})
    await mongoose.connection.close()
}, TIMEOUT)

describe('AlertTimeSeries Model', () => {
    beforeEach(async () => {
        await AlertTimeSeries.deleteMany({})
    })

    it('should save a valid alert', async () => {
        const alertData = {
            spotId: new mongoose.Types.ObjectId(),
            alertType: 'weather',
            severity: 3,
            metadata: { location: 'Paris' }
        }
        
        const alert = new AlertTimeSeries(alertData)
        await alert.save()
        
        const savedAlert = await AlertTimeSeries.findById(alert._id).lean()
        
        expect(savedAlert).not.toBeNull()
        if (savedAlert) {
            expect(savedAlert.alertType).toBe('weather')
            expect(savedAlert.severity).toBe(3)
            expect(savedAlert.metadata).toBeDefined()
            expect(savedAlert.metadata).toHaveProperty('location', 'Paris')
            expect(savedAlert.timestamp).toBeInstanceOf(Date)
        }
    })

    it('should fail if spotId is missing', async () => {
        const alert = new AlertTimeSeries({
            alertType: 'weather',
            severity: 2
        })

        await expect(alert.validate()).rejects.toThrow()
    })

    it('should set default alertType to "other"', async () => {
        const alert = new AlertTimeSeries({
            spotId: new mongoose.Types.ObjectId(),
            severity: 4
        })

        expect(alert.alertType).toBe('other')
    })

    it('should fail with invalid alertType', async () => {
        const alert = new AlertTimeSeries({
            spotId: new mongoose.Types.ObjectId(),
            alertType: 'alien',
            severity: 3
        })

        await expect(alert.validate()).rejects.toThrow()
    })

    it('should fail if severity is out of range', async () => {
        const alert = new AlertTimeSeries({
            spotId: new mongoose.Types.ObjectId(),
            alertType: 'traffic',
            severity: 10
        })

        await expect(alert.validate()).rejects.toThrow()
    })
})