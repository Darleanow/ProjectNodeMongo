import { mockReq, mockRes } from 'sinon-express-mock'
import home from '../../src/controllers/home-controller'

describe('HomeController', () => {
  test('should render index page with title', async () => {
    const req = mockReq()
    const res = mockRes()

    await home(req, res)

    expect(res.render.calledOnce).toBe(true)
    expect(res.render.firstCall.args[0]).toBe('index')
    expect(res.render.firstCall.args[1]).toEqual({ title: 'Accueil' })
  })
})
