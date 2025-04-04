import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Spot, { ISpot } from '../../../src/models/Spot'
import { Error as MongooseError } from 'mongoose'

let mongoServer: MongoMemoryServer


interface ValidationError extends Error {
    name: string;
    errors: {
        [path: string]: {
            message: string;
            name: string;
            properties: any;
            kind: string;
            path: string;
            value?: any;
        };
    };
}

describe('Spot Model', () => {
    beforeAll(async () => {

        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()
        await mongoose.connect(uri)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    afterEach(async () => {

        await Spot.deleteMany({})
    })

    it('should create a spot successfully with valid data', async () => {
        const spotData = {
            title: 'Test Spot',
            description: 'A test spot description',
            category: 'good-place',
            coords: {
                type: 'Point',
                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()
        }

        const spot = new Spot(spotData)
        const savedSpot = await spot.save()


        expect(savedSpot._id).toBeDefined()
        expect(savedSpot.title).toBe(spotData.title)
        expect(savedSpot.description).toBe(spotData.description)
        expect(savedSpot.category).toBe(spotData.category)
        expect(savedSpot.coords.type).toBe(spotData.coords.type)
        expect(savedSpot.coords.coordinates).toEqual(spotData.coords.coordinates)
        expect(savedSpot.author.toString()).toBe(spotData.author.toString())
        expect(savedSpot.createdAt).toBeDefined()
        expect(savedSpot.updatedAt).toBeDefined()
    })

    it('should fail validation when required fields are missing', async () => {
        const incompleteSpot = new Spot({

            category: 'event',
            coords: {
                type: 'Point',
                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()
        })

        let error: unknown = null
        try {
            await incompleteSpot.save()
        } catch (err) {
            error = err
        }


        if (!(error instanceof Error)) {
            fail('Expected an error but got: ' + error)
            return
        }


        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')


        const validationError = error as MongooseError.ValidationError
        expect(validationError.errors.title).toBeDefined()
        expect(validationError.errors.description).toBeDefined()
    })

    it('should fail validation with invalid category', async () => {
        const spotWithInvalidCategory = new Spot({
            title: 'Invalid Category Spot',
            description: 'This spot has an invalid category',
            category: 'invalid-category',
            coords: {
                type: 'Point',
                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()
        })

        let error: unknown = null
        try {
            await spotWithInvalidCategory.save()
        } catch (err) {
            error = err
        }


        if (!(error instanceof Error)) {
            fail('Expected an error but got: ' + error)
            return
        }


        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')


        const validationError = error as MongooseError.ValidationError
        expect(validationError.errors.category).toBeDefined()
    })

    it('should fail validation with invalid coordinates', async () => {
        const spotWithInvalidCoords = new Spot({
            title: 'Invalid Coords Spot',
            description: 'This spot has invalid coordinates',
            category: 'event',
            coords: {
                type: 'Point',
                coordinates: ['not-a-number', 48.8566]
            } as any,
            author: new mongoose.Types.ObjectId()
        })

        let error: unknown = null
        try {
            await spotWithInvalidCoords.save()
        } catch (err) {
            error = err
        }


        if (!(error instanceof Error)) {
            fail('Expected an error but got: ' + error)
            return
        }


        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')


        const validationError = error as MongooseError.ValidationError
        expect(validationError.errors['coords.coordinates']).toBeDefined()
    })

    it('should fail validation with invalid coordinates type', async () => {
        const spotWithInvalidCoordsType = new Spot({
            title: 'Invalid Coords Type Spot',
            description: 'This spot has an invalid coordinates type',
            category: 'event',
            coords: {
                type: 'Line',
                coordinates: [2.3522, 48.8566]
            } as any,
            author: new mongoose.Types.ObjectId()
        })

        let error: unknown = null
        try {
            await spotWithInvalidCoordsType.save()
        } catch (err) {
            error = err
        }


        if (!(error instanceof Error)) {
            fail('Expected an error but got: ' + error)
            return
        }


        expect(error).toBeDefined()
        expect(error.name).toBe('ValidationError')


        const validationError = error as MongooseError.ValidationError
        expect(validationError.errors['coords.type']).toBeDefined()
    })

    it('should have timestamps (createdAt, updatedAt) after saving', async () => {
        const spot = new Spot({
            title: 'Timestamped Spot',
            description: 'This spot should have timestamps',
            category: 'good-place',
            coords: {
                type: 'Point',
                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()
        })

        const savedSpot = await spot.save()


        expect(savedSpot.createdAt).toBeInstanceOf(Date)
        expect(savedSpot.updatedAt).toBeInstanceOf(Date)


        expect(savedSpot.createdAt.getTime()).toBeCloseTo(savedSpot.updatedAt.getTime(), -2)
    })

    it('should update the updatedAt timestamp when modified', async () => {

        const spot = new Spot({
            title: 'Update Test Spot',
            description: 'This spot will be updated',
            category: 'good-place',
            coords: {
                type: 'Point',
                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()
        })

        const savedSpot = await spot.save()
        const originalUpdatedAt = savedSpot.updatedAt


        await new Promise(resolve => setTimeout(resolve, 100))


        savedSpot.title = 'Updated Title'
        const updatedSpot = await savedSpot.save()


        expect(updatedSpot.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
        expect(updatedSpot.createdAt.getTime()).toBe(savedSpot.createdAt.getTime())
    })

    it('should support default value for category', async () => {
        const spotWithoutCategory = new Spot({
            title: 'Default Category Spot',
            description: 'This spot should use the default category',
            coords: {
                type: 'Point',
                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()

        })

        const savedSpot = await spotWithoutCategory.save()


        expect(savedSpot.category).toBe('other')
    })

    it('should support default value for coordinates type', async () => {
        const spotWithoutCoordsType = new Spot({
            title: 'Default Coords Type Spot',
            description: 'This spot should use the default coordinates type',
            category: 'event',
            coords: {

                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()
        })

        const savedSpot = await spotWithoutCoordsType.save()


        expect(savedSpot.coords.type).toBe('Point')
    })


    it('should find spots within a given distance using geospatial query', async () => {

        const parisSpot = new Spot({
            title: 'Paris Spot',
            description: 'A spot in Paris',
            category: 'good-place',
            coords: {
                type: 'Point',
                coordinates: [2.3522, 48.8566]
            },
            author: new mongoose.Types.ObjectId()
        })

        const londonSpot = new Spot({
            title: 'London Spot',
            description: 'A spot in London',
            category: 'good-place',
            coords: {
                type: 'Point',
                coordinates: [-0.1278, 51.5074]
            },
            author: new mongoose.Types.ObjectId()
        })


        await Promise.all([parisSpot.save(), londonSpot.save()])


        const nearParis = await Spot.find({
            coords: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [2.3522, 48.8566]
                    },
                    $maxDistance: 50000
                }
            }
        })


        const nearLondon = await Spot.find({
            coords: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [-0.1278, 51.5074]
                    },
                    $maxDistance: 50000
                }
            }
        })


        expect(nearParis.length).toBe(1)
        expect(nearParis[0].title).toBe('Paris Spot')

        expect(nearLondon.length).toBe(1)
        expect(nearLondon[0].title).toBe('London Spot')
    })
})