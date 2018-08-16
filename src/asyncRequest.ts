import { Reducer } from 'redux'
import { actionCreatorFactory, ActionCreator, Success, Failure, AnyAction, isType } from 'typescript-fsa'

export interface AsyncRequest<E> {
  pending: boolean
  success: boolean
  error?: E
}

export const defaultAsyncRequest = {
  pending: false,
  success: false
}

export interface AsyncRequestModule<P, S, E> {
  reducer: Reducer<AsyncRequest<E>>
  started: ActionCreator<P>
  done: ActionCreator<Success<P, S>>
  failed: ActionCreator<Failure<P, E>>
  reset: ActionCreator<void>
}

export default <P = any, S = any, E = Error>(name: string): AsyncRequestModule<P, S, E> => {
  const actionCreator = actionCreatorFactory(`@REDUX_ASYNC_REQUEST`)

  const async = actionCreator.async<P, S, E>(name.toUpperCase())

  const reset = actionCreator<void>(`${name.toUpperCase()}/RESET`)

  const reducer = (state: AsyncRequest<E> = defaultAsyncRequest, action: AnyAction): AsyncRequest<E> => {
    if (isType(action, async.started)) {
      return {
        pending: true,
        success: false
      }
    }

    if (isType(action, async.done)) {
      return {
        pending: false,
        success: true
      }
    }

    if (isType(action, async.failed)) {
      return {
        pending: false,
        success: false,
        error: action.payload.error
      }
    }

    if (isType(action, reset)) return defaultAsyncRequest

    return state
  }

  return {
    started: async.started,
    done: async.done,
    failed: async.failed,
    reset,
    reducer
  }
}
