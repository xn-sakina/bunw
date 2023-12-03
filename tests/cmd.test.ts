import { expect, describe, vi, it } from 'vitest'
import { checkOldVersion } from '../src/cmd'

// mock buns/compiled/chalk
vi.mock('buns/compiled/chalk', async (importOriginal) => {
  const mod = (await importOriginal()) as any
  return {
    ...mod.default,
  }
})

describe('checkOldVersion', () => {
  const map: Record<string, boolean /* is old */> = {
    '1.0.0': true,
    '1.0.14': true,
    '1.1.0': false,
    '2.0.0': false,
    '2.0.13': false,
    '1.0.0-alpha': false,
    '1.0.0-beta': false,
  }
  Object.keys(map).forEach((version) => {
    it(`check: ${version}`, () => {
      expect(checkOldVersion(version)).toBe(map[version])
    })
  })
})
