import { AsyncRequest, defaultAsyncRequest } from './asyncRequest'
import * as hash from 'object-hash'

export type ResourceParams = object | number | string

export interface Resource<T> {
  id: string
  params: ResourceParams
  request: AsyncRequest
  resource?: T
}

export const resourceId = (params: ResourceParams): string => {
  if (typeof params === 'object') return `${hash(params)}`
  return params.toString()
}

export const defaultResource = (params: ResourceParams) => ({
  params,
  id: resourceId(params),
  request: defaultAsyncRequest
})
