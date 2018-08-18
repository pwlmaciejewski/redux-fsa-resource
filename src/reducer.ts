import { Actions } from './actions'
import { AnyAction, isType } from 'typescript-fsa'
import { Resource, defaultResource, resourceId, ResourceParams } from './models'
import { RequestModule } from './redux-fsa-request'

export interface Resources<T, E> {
  [id: string]: Resource<T, E>
}

export default <R, E = Error>(name: string, actions: Actions<R, E>, request: RequestModule<ResourceParams, R, E>) =>
  (state: Resources<R, E> = {}, action: AnyAction): Resources<R, E> => {
    if (isType(action, request.started)) {
      const params = action.payload
      const resId = resourceId(params)
      const resource = state[resId] || defaultResource(name, params)
      const req = request.reducer(resource.request, action)
      return {
        ...state,
        [resId]: {
          ...resource,
          request: req
        }
      }
    }

    if (isType(action, request.done)) {
      const params = action.payload.params
      const resId = resourceId(params)
      const resource = state[resId] || defaultResource(name, params)
      const req = request.reducer(resource.request, action)
      return {
        ...state,
        [resId]: {
          ...resource,
          request: req,
          resource: action.payload.result
        }
      }
    }

    if (isType(action, request.failed)) {
      const params = action.payload.params
      const resId = resourceId(params)
      const resource = state[resId] || defaultResource(name, params)
      const req = request.reducer(resource.request, action)
      return {
        ...state,
        [resId]: {
          ...resource,
          request: req
        }
      }
    }

    if (isType(action, actions.update)) {
      const { params, resource } = action.payload
      const resourceState = state[resourceId(params)] || defaultResource(name, params)
      return {
        ...state,
        [resourceId(params)]: {
          ...resourceState,
          resource
        }
      }
    }

    if (isType(action, actions.delete)) {
      const newState = { ...state }
      delete newState[resourceId(action.payload)]
      return newState
    }

    return state
  }
