import { actionCreatorFactory, AnyAction, isType, ActionCreator, AsyncActionCreators } from 'typescript-fsa'
import { ResourceParams, Resource, resourceId, defaultResource, Resources } from './models/Resource'
import { defaultAsyncRequest } from './models/AsyncRequest'

export const initialState = {}

export interface UpdateResourceParams<R> {
  params: ResourceParams,
  resource: R
}

export interface ResourceModule<R> {
  name: string
  create: (params: ResourceParams) => Resource<R>
  get: AsyncActionCreators<ResourceParams, R, Error>
  update: ActionCreator<UpdateResourceParams<R>>
  delete: ActionCreator<ResourceParams>
  createReducer: (innerReducer?: (state: Resources<R>, action: AnyAction) => Resources<R>) =>
    (state: Resources<R>, action: AnyAction) => Resources<R>
}

export default <R>(name: string): ResourceModule<R> => {
  const actionCreator = actionCreatorFactory(`@REDUX_FSA_RESOURCE/${name.toUpperCase()}`)

  const getResource = actionCreator.async<ResourceParams, R, Error>('GET_RESOURCE')

  const updateResource = actionCreator<UpdateResourceParams<R>>('UPDATE_RESOURCE')

  const deleteResource = actionCreator<ResourceParams>('DELETE_RESOURCE')

  const resourceReducer = (state: Resources<R> = initialState, action: AnyAction): Resources<R> => {
    if (isType(action, getResource.started)) {
      const params = action.payload
      const resource: Resource<R> = {
        name,
        params,
        id: resourceId(params),
        request: {
          ...defaultAsyncRequest,
          pending: true
        }
      }
      return {
        ...state,
        [resourceId(params)]: resource
      }
    }

    if (isType(action, getResource.done)) {
      const { params, result } = action.payload
      const resource: Resource<R> = {
        name,
        params,
        id: resourceId(params),
        request: {
          ...defaultAsyncRequest,
          success: true
        },
        resource: result
      }
      return {
        ...state,
        [resourceId(params)]: resource
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

    if (isType(action, getResource.failed)) {
      const { params, error } = action.payload
      const resource: Resource<R> = {
        name,
        params,
        id: resourceId(params),
        request: {
          ...defaultAsyncRequest,
          error
        }
      }
      return {
        ...state,
        [resourceId(params)]: resource
      }
    }

    if (isType(action, deleteResource)) {
      const newState = { ...state }
      delete newState[resourceId(action.payload)]
      return newState
    }

    return state
  }

  const createReducer = (innerReducer?: (state: Resources<R>, action: AnyAction) => Resources<R>) =>
    (state: Resources<R> = initialState, action: AnyAction) => {
      if (innerReducer) {
        state = innerReducer(state, action)
      }
      return resourceReducer(state, action)
    }

  return {
    name,
    create: (params: ResourceParams): Resource<R> => defaultResource(name, params),
    get: getResource,
    update: updateResource,
    delete: deleteResource,
    createReducer
  }
}
