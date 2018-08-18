import { ActionCreator, Failure, actionCreatorFactory, Success } from 'typescript-fsa'
import { ResourceParams } from './models'
import { RequestModule } from './redux-fsa-request'

export interface UpdateResourceParams<R> {
  params: ResourceParams,
  resource: R
}

export interface Actions<R, E> {
  fetchStarted: ActionCreator<ResourceParams>
  fetchDone: ActionCreator<Success<ResourceParams, R>>
  fetchFailed: ActionCreator<Failure<ResourceParams, E>>
  fetchReset: ActionCreator<void>
  update: ActionCreator<UpdateResourceParams<R>>
  delete: ActionCreator<ResourceParams>
}

export default <R, E>(name: string, request: RequestModule<ResourceParams, R, E>): Actions<R, E> => {
  const actionCreator = actionCreatorFactory(`@REDUX_FSA_RESOURCE/${name.toUpperCase()}`)

  const updateResource = actionCreator<UpdateResourceParams<R>>('UPDATE')

  const deleteResource = actionCreator<ResourceParams>('DELETE')

  return {
    fetchStarted: request.started,
    fetchDone: request.done,
    fetchFailed: request.failed,
    fetchReset: request.reset,
    update: updateResource,
    delete: deleteResource
  }
}
