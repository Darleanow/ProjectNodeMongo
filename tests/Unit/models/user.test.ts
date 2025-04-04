import mongoose from 'mongoose'
import User from '../../../src/models/User'
import dotenv from 'dotenv'


dotenv.config()

const TIMEOUT = 30000

beforeAll(async () => {
    jest.setTimeout(TIMEOUT)

    const mongoUri = process.env.MONGO_URI!
    await mongoose.connect(mongoUri)
}, TIMEOUT)

afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
}, TIMEOUT)

describe('User Model', () => {

    beforeEach(async () => {
        await User.deleteMany({})
    })

    it('should save a valid user', async () => {
        const user = new User({
            name: 'Alice',
            email: 'alice@example.com'
        })

        const saved = await user.save()
        expect(saved._id).toBeDefined()
        expect(saved.name).toBe('Alice')
        expect(saved.email).toBe('alice@example.com')
        expect(saved.createdAt).toBeInstanceOf(Date)
    })

    it('should fail without name', async () => {
        const user = new User({ email: 'bob@example.com' })
        await expect(user.validate()).rejects.toThrow()
    })

    it('should fail without email', async () => {
        const user = new User({ name: 'Bob' })
        await expect(user.validate()).rejects.toThrow()
    })

    it('should enforce unique email constraint', async () => {
        await User.create({ name: 'Carol', email: 'carol@example.com' })

        const duplicate = new User({ name: 'Caroline', email: 'carol@example.com' })
        await expect(duplicate.save()).rejects.toThrow()
    })
})