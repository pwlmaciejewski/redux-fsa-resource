import 'jest'
import { resourceId } from '../../src'
import * as hash from 'object-hash'

describe('resource model', () => {
  describe('resourceId', () => {
    it('should generate correct name for boolean parames', () => {
      expect(resourceId(true)).toBe('true')
    })

    it('should generate correct name for string params', () => {
      expect(resourceId('foo')).toBe('foo')
    })

    it('should generate correct name for number params', () => {
      expect(resourceId(1)).toBe('1')
    })

    it('should generate correct name for object params', () => {
      const params = { foo: 'bar' }
      expect(resourceId(params)).toBe(hash(params))
    })
  })
})
