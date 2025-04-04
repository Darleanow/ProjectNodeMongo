import { mockReq, mockRes } from 'sinon-express-mock'
import type { Request, Response } from 'express'
import * as controller from '../../../src/controllers/spot-controller'
import Spot from '../../../src/models/Spot.js'


const mockSpotModel = Spot as jest.Mocked<typeof Spot>


jest.mock('../../../src/models/Spot.js', () => {
    const mockModel = {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        prototype: {
            save: jest.fn()
        }
    };
    return {
        __esModule: true,
        default: mockModel
    };
});

describe('Spot Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getAllSpots', () => {
        it('should return all spots with populated author fields', async () => {
            const mockSpots = [
                { _id: 'abc', title: 'Spot 1', author: { name: 'John', email: 'john@example.com' } },
                { _id: 'def', title: 'Spot 2', author: { name: 'Jane', email: 'jane@example.com' } }
            ]

            const populateMock = jest.fn().mockResolvedValue(mockSpots)
            jest.spyOn(mockSpotModel, 'find').mockReturnValue({ populate: populateMock } as any)

            const req = mockReq()
            const res = mockRes()

            await controller.getAllSpots(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.find).toHaveBeenCalled()
            expect(populateMock).toHaveBeenCalledWith('author', 'name email')
            expect(res.json.calledWith(mockSpots)).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })

            jest.spyOn(mockSpotModel, 'find').mockImplementation(() => {
                throw new Error('Database error')
            })

            const req = mockReq()
            const res = mockRes()

            await controller.getAllSpots(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })

    describe('getSpotById', () => {
        it('should return a spot when found', async () => {
            const mockSpot = { _id: 'abc', title: 'Test Spot', author: { name: 'John', email: 'john@example.com' } }

            const populateMock = jest.fn().mockResolvedValue(mockSpot)
            jest.spyOn(mockSpotModel, 'findById').mockReturnValue({ populate: populateMock } as any)

            const req = mockReq({ params: { id: 'abc' } })
            const res = mockRes()

            await controller.getSpotById(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.findById).toHaveBeenCalledWith('abc')
            expect(populateMock).toHaveBeenCalledWith('author', 'name email')
            expect(res.json.calledWith(mockSpot)).toBe(true)
        })

        it('should return 404 when spot is not found', async () => {
            const populateMock = jest.fn().mockResolvedValue(null)
            jest.spyOn(mockSpotModel, 'findById').mockReturnValue({ populate: populateMock } as any)

            const req = mockReq({ params: { id: 'nonexistent' } })
            const res = mockRes()

            await controller.getSpotById(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(404)).toBe(true)
            expect(res.json.calledWith({ msg: 'Spot not found' })).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })

            jest.spyOn(mockSpotModel, 'findById').mockImplementation(() => {
                throw new Error('Database error')
            })

            const req = mockReq({ params: { id: 'abc' } })
            const res = mockRes()

            await controller.getSpotById(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })

    describe('createSpot', () => {
        it('should create a new spot and return it', async () => {
            const mockRequestBody = {
                title: 'New Spot',
                description: 'A new test spot',
                category: 'event',
                lat: '48.8584',
                lng: '2.2945',
                author: 'user123'
            }

            const mockSavedSpot = {
                _id: 'new123',
                ...mockRequestBody,
                coords: {
                    type: 'Point',
                    coordinates: [2.2945, 48.8584]
                }
            }


            const saveMock = jest.fn().mockResolvedValue(mockSavedSpot)



            const originalModule = jest.requireMock('../../../src/models/Spot.js');
            const originalDefault = originalModule.default;


            originalModule.default = function () {
                return { save: saveMock };
            };

            const req = mockReq({ body: mockRequestBody })
            const res = mockRes()

            await controller.createSpot(req as unknown as Request, res as unknown as Response)


            originalModule.default = originalDefault;


            expect(saveMock).toHaveBeenCalled()
            expect(res.json.calledWith(mockSavedSpot)).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })


            const errorSaveMock = jest.fn().mockImplementation(() => {
                throw new Error('Validation error')
            })


            const originalModule = jest.requireMock('../../../src/models/Spot.js');
            const originalDefault = originalModule.default;


            originalModule.default = function () {
                return { save: errorSaveMock };
            };

            const req = mockReq({
                body: {
                    title: 'New Spot',
                    lat: '48.8584',
                    lng: '2.2945'
                }
            })
            const res = mockRes()

            await controller.createSpot(req as unknown as Request, res as unknown as Response)


            originalModule.default = originalDefault;

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })

    describe('updateSpot', () => {
        it('should update an existing spot with all provided fields', async () => {
            const mockRequestBody = {
                title: 'Updated Spot',
                description: 'An updated description',
                category: 'alert',
                lat: '48.8584',
                lng: '2.2945'
            }

            const mockUpdatedSpot = {
                _id: 'abc123',
                ...mockRequestBody,
                coords: {
                    type: 'Point',
                    coordinates: [2.2945, 48.8584]
                }
            }

            jest.spyOn(mockSpotModel, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedSpot as any)

            const req = mockReq({
                params: { id: 'abc123' },
                body: mockRequestBody
            })
            const res = mockRes()

            await controller.updateSpot(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'abc123',
                {
                    $set: expect.objectContaining({
                        title: 'Updated Spot',
                        description: 'An updated description',
                        category: 'alert',
                        coords: {
                            type: 'Point',
                            coordinates: [2.2945, 48.8584]
                        },
                        updatedAt: expect.any(Date)
                    })
                },
                { new: true }
            )
            expect(res.json.calledWith(mockUpdatedSpot)).toBe(true)
        })

        it('should update with only the fields provided', async () => {
            const mockRequestBody = {
                title: 'Updated Title Only'
            }

            const mockUpdatedSpot = {
                _id: 'abc123',
                title: 'Updated Title Only',
                description: 'Original description',
                category: 'event'
            }

            jest.spyOn(mockSpotModel, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedSpot as any)

            const req = mockReq({
                params: { id: 'abc123' },
                body: mockRequestBody
            })
            const res = mockRes()

            await controller.updateSpot(req as unknown as Request, res as unknown as Response)


            expect(mockSpotModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'abc123',
                {
                    $set: expect.objectContaining({
                        title: 'Updated Title Only',
                        updatedAt: expect.any(Date)
                    })
                },
                { new: true }
            )
            expect(res.json.calledWith(mockUpdatedSpot)).toBe(true)
        })

        it('should return 404 when spot to update is not found', async () => {
            jest.spyOn(mockSpotModel, 'findByIdAndUpdate').mockResolvedValue(null as any)

            const req = mockReq({
                params: { id: 'nonexistent' },
                body: { title: 'Updated Title' }
            })
            const res = mockRes()

            await controller.updateSpot(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(404)).toBe(true)
            expect(res.json.calledWith({ msg: 'Spot not found' })).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })

            jest.spyOn(mockSpotModel, 'findByIdAndUpdate').mockImplementation(() => {
                throw new Error('Database error')
            })

            const req = mockReq({
                params: { id: 'abc123' },
                body: { title: 'Updated Title' }
            })
            const res = mockRes()

            await controller.updateSpot(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })

    describe('deleteSpot', () => {
        it('should delete a spot and return success message', async () => {
            const mockSpot = {
                _id: 'abc123',
                title: 'Spot to delete',
                deleteOne: jest.fn().mockResolvedValue(undefined)
            }

            jest.spyOn(mockSpotModel, 'findById').mockResolvedValue(mockSpot as any)

            const req = mockReq({ params: { id: 'abc123' } })
            const res = mockRes()

            await controller.deleteSpot(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.findById).toHaveBeenCalledWith('abc123')
            expect(mockSpot.deleteOne).toHaveBeenCalled()
            expect(res.json.calledWith({ msg: 'Spot removed' })).toBe(true)
        })

        it('should return 404 when spot to delete is not found', async () => {
            jest.spyOn(mockSpotModel, 'findById').mockResolvedValue(null as any)

            const req = mockReq({ params: { id: 'nonexistent' } })
            const res = mockRes()

            await controller.deleteSpot(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(404)).toBe(true)
            expect(res.json.calledWith({ msg: 'Spot not found' })).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })

            jest.spyOn(mockSpotModel, 'findById').mockImplementation(() => {
                throw new Error('Database error')
            })

            const req = mockReq({ params: { id: 'abc123' } })
            const res = mockRes()

            await controller.deleteSpot(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })

    describe('findSpotsByDistance', () => {
        it('should find spots within a given distance', async () => {
            const mockSpots = [
                { _id: 'abc', title: 'Nearby Spot 1' },
                { _id: 'def', title: 'Nearby Spot 2' }
            ]

            jest.spyOn(mockSpotModel, 'find').mockResolvedValue(mockSpots as any)

            const req = mockReq({
                query: { lat: '48.8584', lng: '2.2945', distance: '10' }
            })
            const res = mockRes()

            await controller.findSpotsByDistance(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.find).toHaveBeenCalledWith({
                coords: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [2.2945, 48.8584]
                        },
                        $maxDistance: 10000
                    }
                }
            })
            expect(res.json.calledWith(mockSpots)).toBe(true)
        })

        it('should use default distance when not provided', async () => {
            const mockSpots = [{ _id: 'abc', title: 'Nearby Spot' }]

            jest.spyOn(mockSpotModel, 'find').mockResolvedValue(mockSpots as any)

            const req = mockReq({
                query: { lat: '48.8584', lng: '2.2945' }
            })
            const res = mockRes()

            await controller.findSpotsByDistance(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.find).toHaveBeenCalledWith({
                coords: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [2.2945, 48.8584]
                        },
                        $maxDistance: 5000
                    }
                }
            })
            expect(res.json.calledWith(mockSpots)).toBe(true)
        })

        it('should return 400 when lat is missing', async () => {
            const req = mockReq({
                query: { lng: '2.2945', distance: '5' }
            })
            const res = mockRes()

            await controller.findSpotsByDistance(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(400)).toBe(true)
            expect(res.json.calledWith({ msg: 'Latitude and longitude are required' })).toBe(true)
        })

        it('should return 400 when lng is missing', async () => {
            const req = mockReq({
                query: { lat: '48.8584', distance: '5' }
            })
            const res = mockRes()

            await controller.findSpotsByDistance(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(400)).toBe(true)
            expect(res.json.calledWith({ msg: 'Latitude and longitude are required' })).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })

            jest.spyOn(mockSpotModel, 'find').mockImplementation(() => {
                throw new Error('Geo query error')
            })

            const req = mockReq({
                query: { lat: '48.8584', lng: '2.2945', distance: '5' }
            })
            const res = mockRes()

            await controller.findSpotsByDistance(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })

    describe('renderSpotsList', () => {
        it('should render the spots list page with all spots', async () => {
            const mockSpots = [
                { _id: 'abc', title: 'Spot 1' },
                { _id: 'def', title: 'Spot 2' }
            ]

            jest.spyOn(mockSpotModel, 'find').mockResolvedValue(mockSpots as any)

            const req = mockReq()
            const res = mockRes()

            await controller.renderSpotsList(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.find).toHaveBeenCalled()
            expect(res.render.calledWith('spots/list', {
                title: 'Tous les spots',
                spots: mockSpots
            })).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })

            jest.spyOn(mockSpotModel, 'find').mockImplementation(() => {
                throw new Error('Database error')
            })

            const req = mockReq()
            const res = mockRes()

            await controller.renderSpotsList(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })

    describe('renderSpotDetail', () => {
        it('should render the spot detail page when spot is found', async () => {
            const mockSpot = {
                _id: 'abc123',
                title: 'Test Spot',
                author: { name: 'John', email: 'john@example.com' }
            }

            const populateMock = jest.fn().mockResolvedValue(mockSpot)
            jest.spyOn(mockSpotModel, 'findById').mockReturnValue({ populate: populateMock } as any)

            const req = mockReq({ params: { id: 'abc123' } })
            const res = mockRes()

            await controller.renderSpotDetail(req as unknown as Request, res as unknown as Response)

            expect(mockSpotModel.findById).toHaveBeenCalledWith('abc123')
            expect(populateMock).toHaveBeenCalledWith('author', 'name email')
            expect(res.render.calledWith('spots/show', { spot: mockSpot })).toBe(true)
        })

        it('should render error page with 404 status when spot is not found', async () => {
            const populateMock = jest.fn().mockResolvedValue(null)
            jest.spyOn(mockSpotModel, 'findById').mockReturnValue({ populate: populateMock } as any)

            const req = mockReq({ params: { id: 'nonexistent' } })
            const res = mockRes()

            await controller.renderSpotDetail(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(404)).toBe(true)
            expect(res.render.calledWith('error', { message: 'Spot not found' })).toBe(true)
        })

        it('should handle errors properly', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { })

            jest.spyOn(mockSpotModel, 'findById').mockImplementation(() => {
                throw new Error('Database error')
            })

            const req = mockReq({ params: { id: 'abc123' } })
            const res = mockRes()

            await controller.renderSpotDetail(req as unknown as Request, res as unknown as Response)

            expect(res.status.calledWith(500)).toBe(true)
            expect(res.send.calledWith('Server Error')).toBe(true)
        })
    })
})