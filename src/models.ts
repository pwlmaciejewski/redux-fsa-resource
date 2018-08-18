import { Request, defaultRequest } from './redux-fsa-request'
import * as hash from 'object-hash'

export type ResourceParams = object | number | string | boolean

export interface Resource<T, E> {
  id: string
  name: string
  params: ResourceParams
  request: Request<E>
  resource?: T
}

export const resourceId = (params: ResourceParams): string => {
  if (typeof params === 'object') return `${hash(params)}`
  return params.toString()
}

export const defaultResource = (name: string, params: ResourceParams): Resource<any, any> => ({
  name,
  params,
  id: resourceId(params),
  request: defaultRequest
})
