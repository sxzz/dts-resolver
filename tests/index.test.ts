import { resolve, relative } from 'node:path'
import process from 'node:process'
import { describe, expect, test } from 'vitest'
import { createResolver } from '../src'

const resolver = createResolver()

describe('resolver', () => {
  test('node modules', () => {
    expectPath(resolver('node:fs')).toBe(null)
    expectPath(resolver('node')).toMatchInlineSnapshot(
      `"@types/node/index.d.ts"`,
    )
  })

  test('magic-string-ast', () => {
    expectPath(resolver('magic-string-ast')).toMatchInlineSnapshot(
      `"magic-string-ast/dist/index.d.ts"`,
    )
    expectPath(
      resolver('magic-string-ast/dist/index.js'),
    ).toMatchInlineSnapshot(`"magic-string-ast/dist/index.d.ts"`)
  })

  test('magic-string', () => {
    expectPath(resolver('magic-string')).toMatchInlineSnapshot(
      `"magic-string/dist/magic-string.es.d.mts"`,
    )
  })

  test('fast-glob', () => {
    expectPath(resolver('fast-glob')).toMatchInlineSnapshot(
      `"fast-glob/out/index.d.ts"`,
    )
  })

  test('@babel/*', () => {
    expectPath(resolver('@babel/parser')).toMatchInlineSnapshot(
      `"@babel/parser/typings/babel-parser.d.ts"`,
    )
    expectPath(resolver('@babel/types')).toMatchInlineSnapshot(
      `"@babel/types/lib/index-legacy.d.ts"`,
    )
  })

  test('@types/*', () => {
    expectPath(resolver('yargs')).toMatchInlineSnapshot(
      `"@types/yargs/index.d.mts"`,
    )

    expectPath(resolver('debug')).toMatchInlineSnapshot(
      `"@types/debug/index.d.ts"`,
    )
  })

  test('vue', () => {
    expectPath(resolver('vue')).toMatchInlineSnapshot(`"vue/dist/vue.d.mts"`)
    expectPath(resolver('@vue/reactivity')).toMatchInlineSnapshot(
      `"@vue/reactivity/dist/reactivity.d.ts"`,
    )
  })

  test.only('paths', () => {
    const tsconfig = resolve(__dirname, './tsconfig-test.json')
    const resolver = createResolver({ tsconfig })
    expectPath(resolver('lib/alias.ts', __filename)).toMatchInlineSnapshot(
      `"tests/fixtures/alias.ts"`,
    )
  })

  test('not exists', () => {
    expectPath(resolver('whatever')).toMatchInlineSnapshot(`null`)
  })
})

function expectPath(path: string | null) {
  if (typeof path === 'string')
    path = relative(process.cwd(), path)
      .replaceAll('\\', '/')
      .replaceAll(/.+node_modules\//g, '')
  return expect(path)
}
