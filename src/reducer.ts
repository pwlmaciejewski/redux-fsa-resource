import { Actions } from './actions'
import { AnyAction, isType, Action, ActionCreator } from 'typescript-fsa'
import { Resource, defaultResource, resourceId, ResourceParams } from './models'
import { RequestModule } from './redux-fsa-request'
import { withActionType, nest, compose, branch, initialState, elevate, trigger, passState, withState } from 'redux-hor'
import { Reducer } from 'redux'
import createResourceReducer from './resourceReducer'
import { HigherOrderReducer } from 'redux-hor/lib/models';

export interface Resources<R, E> {
  [id: string]: Resource<R, E>
}

export default <R, E = Error>(name: string, actions: Actions<R, E>, request: RequestModule<ResourceParams, R, E>) =>
  (state: Resources<R, E> = {}, action: AnyAction): Resources<R, E> => {

    // TODO: should be moved somewhere? To actions maybe.
    const getPayload = (action: AnyAction): ResourceParams | void => {
      if (isType(action, actions.fetchStarted) ||
        isType(action, actions.fetchReset) ||
        isType(action, actions.delete)) return action.payload
      if (isType(action, actions.fetchFailed) || isType(action, actions.fetchDone)) return action.payload.params
      if (isType(action, actions.update)) return action.payload.params
    }

    const getResourceId = (action: AnyAction): string | undefined => {
      const payload = getPayload(action)
      return payload ? resourceId(payload) : undefined
    }

    // TODO: WIP, read it and check if it makes sense. Try to make it better
    nest(
      (state, action) => getResourceId(action),
      (state: Resource<R, E> | undefined, action: Action<ResourceParams>) => {
        const payload = getPayload(action)
        if (!payload) throw new Error('Cannot read action payload')
        return elevate<Resource<R, E>>(createResourceReducer(name, payload, actions, request))
      }
    )


    withActionType(request.started.type,
      elevate((state: Resource<R, E> | undefined, action: Action<any>) => {
        const r = createResourceReducer(name, action.payload, actions, request)
        return r(state, action)
      })
    )

    const resourceReducer: Reducer<Resource<R, E>> = createResourceReducer(name, { params: {}, resource: null }, actions, request)


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
