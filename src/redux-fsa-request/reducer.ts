import { Reducer } from 'redux'
import { AnyAction, isType } from 'typescript-fsa'
import { Request, defaultRequest } from './models'
import { Actions } from './actions'

export default <P = any, S = any, E = Error>(actions: Actions<P, S, E>): Reducer<Request<E>> =>
  (state: Request<E> = defaultRequest, action: AnyAction): Request<E> => {
    if (isType(action, actions.started)) {
      return {
        pending: true,
        success: false
      }
    }

    if (isType(action, actions.done)) {
      return {
        pending: false,
        success: true
      }
    }

    if (isType(action, actions.failed)) {
      return {
        pending: false,
        success: false,
        error: action.payload.error
      }
    }

    if (isType(action, actions.reset)) return defaultRequest

    return state
  }
