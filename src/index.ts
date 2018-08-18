import createActions, { Actions } from './actions'
import createReducer, { Resources } from './reducer'
import createRequest from './redux-fsa-request'
import { ResourceParams, Resource, defaultResource } from './models'
import { AnyAction } from 'typescript-fsa'

export { default as createActions, Actions } from './actions'
export { default as createReducer, Resources } from './reducer'
export * from './models'

export interface ResourceModule<R, E> extends Actions<R, E> {
  name: string
  create: (params: ResourceParams) => Resource<R, E>
  createReducer: (innerReducer?: (state: Resources<R, E>, action: AnyAction) => Resources<R, E>) =>
    (state: Resources<R, E>, action: AnyAction) => Resources<R, E>
}

export default <R, E = Error>(name: string): ResourceModule<R, E> => {
  const request = createRequest<ResourceParams, R, E>(`${name.toUpperCase()}_RESOURCE`)
  const actions = createActions<R, E>(name, request)
  const reducer = createReducer<R, E>(name, actions, request)

  return {
    ...actions,
    name,
    create: (params: ResourceParams): Resource<R, E> => defaultResource(name, params),
    createReducer: (innerReducer?: (state: Resources<R, E>, action: AnyAction) => Resources<R, E>) =>
      (state: Resources<R, E> = {}, action: AnyAction) => {
        if (innerReducer) {
          state = innerReducer(state, action)
        }
        return reducer(state, action)
      }
  }
}
