/**
 * Root for your util libraries.
 *
 * You can import them in the src/template/index.ts,
 * or in the specific file.
 *
 * Note that this repo uses ES Modules, so you have to explicitly specify
 * .js extension (yes, .js not .ts - even for TypeScript files)
 * for imports that are not imported from node_modules.
 *
 * For example:
 *
 *   correct:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.js'
 *     import { myUtil } from '../utils/index.js'
 *
 *   incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.ts'
 *     import { myUtil } from '../utils/index.ts'
 *
 *   also incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib'
 *     import { myUtil } from '../utils'
 *
 */

export function iife<R>(f: () => R): R {
  return f()
}

// Stolen from https://stackoverflow.com/a/53292113 and made inclusive
export function rangeInclusive(start = 0, end = 0, step = 1) {
  if (start === end || step === 0) {
    return []
  }

  const diff = Math.abs(end - start) + 1 // +1 makes this inclusive (for my purposes anyway)
  const length = Math.ceil(diff / step)

  return start > end
    ? Array.from({ length }, (_value, key) => start - key * step)
    : Array.from({ length }, (_value, key) => start + key * step)
}

export const splitBy = (separator: string) => (text: string) =>
  text.split(separator)

export const sum = (l: number, r: number) => l + r
