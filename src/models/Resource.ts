import { AsyncRequest, defaultAsyncRequest } from './AsyncRequest'
import * as hash from 'object-hash'

export type ResourceParams = object | number | string | boolean

export interface Resource<T> {
  id: string
  name: string
  params: ResourceParams
  request: AsyncRequest
  resource?: T
}

export interface Resources<T> {
  [id: string]: Resource<T>
}

export const resourceId = (params: ResourceParams): string => {
  if (typeof params === 'object') return `${hash(params)}`
  return params.toString()
}

export const defaultResource = (name: string, params: ResourceParams): Resource<any> => ({
  name,
  params,
  id: resourceId(params),
  request: defaultAsyncRequest
})
