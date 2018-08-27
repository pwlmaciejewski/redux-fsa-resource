import { Actions } from './actions'
import { AnyAction, isType, Action } from 'typescript-fsa'
import { Resource, defaultResource, resourceId, ResourceParams } from './models'
import { RequestModule } from './redux-fsa-request'
import { withActionType, nest, compose, branch, initialState, elevate } from 'redux-hor'
import { Reducer } from 'redux'

export default <R, E>(
  name: string,
  params: ResourceParams,
  actions: Actions<R, E>,
  request: RequestModule<ResourceParams, R, E>
): Reducer<Resource<R, E>> => {
  const baseReducer = (state: Resource<R, E> = defaultResource(name, params), action: AnyAction) => {
    if (isType(action, request.done)) {
      return {
        ...state,
        resource: action.payload.result
      }
    }

    if (isType(action, actions.update)) {
      return {
        ...state,
        resource: action.payload.resource
      }
    }

    return state
  }

  return compose<Resource<R, E>>(
    nest('request', request.reducer)
  )(baseReducer)
}
