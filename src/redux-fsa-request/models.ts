export interface Request<E> {
  pending: boolean
  success: boolean
  error?: E
}

export const defaultRequest: Request<any> = {
  pending: false,
  success: false
}
