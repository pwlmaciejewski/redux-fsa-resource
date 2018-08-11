import 'jest'
import createResource, { initialState, defaultAsyncRequest } from '../src'

describe('create resource', () => {
  describe('reducer', () => {
    const resource = createResource('foo')

    it('should update request on getResource action started', () => {
      const action = resource.get.started('bar')
      const newState = resource.reducer(initialState, action)
      expect(newState).toEqual({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: {
            pending: true,
            success: false
          }
        }
      })
    })

    it('should not update the resource if action started of some other resurce', () => {
      const otherResource = createResource('abc')
      const action = otherResource.get.started('bar')
      const newState = resource.reducer(initialState, action)
      expect(newState).toEqual(initialState)
    })

    it('should update request and save resource on getResource action done', () => {
      const action = resource.get.done({
        params: 'bar',
        result: 'baz'
      })
      const newState = resource.reducer(initialState, action)
      expect(newState).toEqual({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: {
            pending: false,
            success: true
          },
          resource: 'baz'
        }
      })
    })

    it('should update resource on updateResource action', () => {
      const action = resource.update({
        params: 'bar',
        resource: 'baz'
      })
      const error = new Error('some error')
      const newState = resource.reducer({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: {
            pending: false,
            success: false,
            error
          }
        }
      }, action)
      expect(newState).toEqual({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: {
            pending: false,
            success: false,
            error
          },
          resource: 'baz'
        }
      })
    })

    it('should create resource on updateResource action when resource does not exist', () => {
      const action = resource.update({
        params: 'bar',
        resource: 'baz'
      })
      const newState = resource.reducer(initialState, action)
      expect(newState).toEqual({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: defaultAsyncRequest,
          resource: 'baz'
        }
      })
    })

    it('should update request and save error on getResource action failed', () => {
      const error = new Error('some error')
      const action = resource.get.failed({
        params: 'bar',
        error
      })
      const newState = resource.reducer(initialState, action)
      expect(newState).toEqual({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: {
            pending: false,
            success: false,
            error
          }
        }
      })
    })

    it('should delete resource on deleteResource action', () => {
      const error = new Error('some error')
      const action = resource.delete('bar')
      const newState = resource.reducer({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: {
            pending: false,
            success: false,
            error
          }
        }
      }, action)
      expect(newState).toEqual({})
    })
  })
})