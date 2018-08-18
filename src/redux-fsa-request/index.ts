import createActions, { Actions } from './actions'
import createReducer from './reducer'
import { Request } from './models'
import { Reducer } from 'redux'

export * from './models'
export { default as createActions, Actions } from './actions'
export { default as createReducer } from './reducer'

export interface RequestModule<P, S, E> extends Actions<P, S, E> {
  reducer: Reducer<Request<E>>
}

export default <P = any, S = any, E = Error>(name: string): RequestModule<P, S, E> => {
  const actions = createActions<P, S, E>(name)
  const reducer = createReducer<P, S, E>(actions)
  return {
    ...actions,
    reducer
  }
}
