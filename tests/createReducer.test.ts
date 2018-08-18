import 'jest'
import createResource from '../src'
import { defaultRequest } from '../src/redux-fsa-request'
import * as sinon from 'sinon'

const initialState = {}

describe('create resource', () => {
  describe('reducer', () => {
    const resource = createResource('foo')

    it('should update request on getResource action started', () => {
      const action = resource.fetchStarted('bar')
      const newState = resource.createReducer()(initialState, action)
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
      const action = otherResource.fetchStarted('bar')
      const newState = resource.createReducer()(initialState, action)
      expect(newState).toEqual(initialState)
    })

    it('should update request and save resource on getResource action done', () => {
      const action = resource.fetchDone({
        params: 'bar',
        result: 'baz'
      })
      const newState = resource.createReducer()(initialState, action)
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
      const newState = resource.createReducer()({
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
      const newState = resource.createReducer()(initialState, action)
      expect(newState).toEqual({
        'bar': {
          name: 'foo',
          id: 'bar',
          params: 'bar',
          request: defaultRequest,
          resource: 'baz'
        }
      })
    })

    it('should update request and save error on getResource action failed', () => {
      const error = new Error('some error')
      const action = resource.fetchFailed({
        params: 'bar',
        error
      })
      const newState = resource.createReducer()(initialState, action)
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
      const newState = resource.createReducer()({
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

    it('should execute inner reducer', () => {
      const innerReducer = sinon.stub().returnsArg(0)
      resource.createReducer(innerReducer)({}, resource.update({
        params: 'foo',
        resource: 'bar'
      }))
      expect(innerReducer.calledOnce).toBe(true)
    })
  })
})
