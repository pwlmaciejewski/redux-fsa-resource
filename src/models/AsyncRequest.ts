export interface AsyncRequest {
  pending: boolean
  success: boolean
  error?: Error
}

export const defaultAsyncRequest = {
  pending: false,
  success: false
}
