import { actionCreatorFactory, ActionCreator, Success, Failure } from 'typescript-fsa'

export interface Actions<P, S, E> {
  started: ActionCreator<P>
  done: ActionCreator<Success<P, S>>
  failed: ActionCreator<Failure<P, E>>
  reset: ActionCreator<P>
}

export default <P = any, S = any, E = Error>(name: string): Actions<P, S, E> => {
  const actionCreator = actionCreatorFactory(`@REDUX_FSA_REQUEST`)

  const async = actionCreator.async<P, S, E>(name.toUpperCase())

  const reset = actionCreator<P>(`${name.toUpperCase()}/RESET`)

  return {
    started: async.started,
    done: async.done,
    failed: async.failed,
    reset
  }
}
