import { actionCreatorFactory, AnyAction, isType, ActionCreator, AsyncActionCreators, Success, Failure } from 'typescript-fsa'
import { ResourceParams, Resource, resourceId, defaultResource, Resources } from './models/Resource'
import * as hor from 'redux-hor'
import createAsyncRequest, { AsyncRequest, defaultAsyncRequest } from './asyncRequest'

export const initialState = {}

export interface UpdateResourceParams<R> {
  params: ResourceParams,
  resource: R
}

export interface ResourceModule<R, E> {
  name: string
  create: (params: ResourceParams) => Resource<R, E>
  fetchStarted: ActionCreator<ResourceParams>
  fetchDone: ActionCreator<Success<ResourceParams, R>>
  fetchFailed: ActionCreator<Failure<ResourceParams, E>>
  fetchReset: ActionCreator<void>
  update: ActionCreator<UpdateResourceParams<R>>
  delete: ActionCreator<ResourceParams>
  createReducer: (innerReducer?: (state: Resources<R, E>, action: AnyAction) => Resources<R, E>) =>
    (state: Resources<R, E>, action: AnyAction) => Resources<R, E>
}

export default <R, E = Error>(name: string): ResourceModule<R, E> => {
  const actionPrefix = `@REDUX_FSA_RESOURCE/${name.toUpperCase()}`

  const actionCreator = actionCreatorFactory(actionPrefix)

  const asyncRequest = createAsyncRequest<ResourceParams, R, E>(actionPrefix)

  const updateResource = actionCreator<UpdateResourceParams<R>>('UPDATE_RESOURCE')

  const deleteResource = actionCreator<ResourceParams>('DELETE_RESOURCE')

  const resourceReducer = (state: Resources<R, E> = initialState, action: AnyAction): Resources<R, E> => {
    if (isType(action, asyncRequest.started)) {
      const params = action.payload
      const resId = resourceId(params)
      const resource = state[resId] || defaultResource(name, params)
      const request = asyncRequest.reducer(resource.request, action)
      return {
        ...state,
        [resId]: {
          ...resource,
          request
        }
      }
    }

    if (isType(action, asyncRequest.done)) {
      const params = action.payload.params
      const resId = resourceId(params)
      const resource = state[resId] || defaultResource(name, params)
      const request = asyncRequest.reducer(resource.request, action)
      return {
        ...state,
        [resId]: {
          ...resource,
          request,
          resource: action.payload.result
        }
      }
    }

    if (isType(action, asyncRequest.failed)) {
      const params = action.payload.params
      const resId = resourceId(params)
      const resource = state[resId] || defaultResource(name, params)
      const request = asyncRequest.reducer(resource.request, action)
      return {
        ...state,
        [resId]: {
          ...resource,
          request
        }
      }
    }

    if (isType(action, updateResource)) {
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

    if (isType(action, deleteResource)) {
      const newState = { ...state }
      delete newState[resourceId(action.payload)]
      return newState
    }

    return state
  }

  const createReducer = (innerReducer?: (state: Resources<R, E>, action: AnyAction) => Resources<R, E>) =>
    (state: Resources<R, E> = initialState, action: AnyAction) => {
      if (innerReducer) {
        state = innerReducer(state, action)
      }
      return resourceReducer(state, action)
    }

  return {
    name,
    create: (params: ResourceParams): Resource<R, E> => defaultResource(name, params),
    fetchStarted: asyncRequest.started,
    fetchDone: asyncRequest.done,
    fetchFailed: asyncRequest.failed,
    fetchReset: asyncRequest.reset,
    update: updateResource,
    delete: deleteResource,
    createReducer
  }
}
