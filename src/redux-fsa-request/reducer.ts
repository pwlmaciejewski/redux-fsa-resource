import { Reducer } from 'redux'
import { AnyAction, isType, Failure, Action } from 'typescript-fsa'
import { Request, defaultRequest } from './models'
import { Actions } from './actions'
import { initialState, withActionType, compose, always, withState, elevate } from 'redux-hor'

export default <P = any, S = any, E = Error>(actions: Actions<P, S, E>): Reducer<Request<E>> => {
  const started = withActionType(actions.started.type, withState<Request<E>>({
    pending: true,
    success: false
  }))

  const done = withActionType(actions.done.type, withState<Request<E>>({
    pending: false,
    success: true
  }))

  const failed = withActionType(actions.failed.type, elevate<Request<E>, Action<Failure<P, E>>>((state, action) => ({
    pending: false,
    success: false,
    error: action.payload.error
  })))

  const reset = withActionType(actions.reset.type, withState(defaultRequest))

  return compose(
    started,
    done,
    failed,
    reset
  )(initialState(defaultRequest))
}
