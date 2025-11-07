import path from 'node:path'
import process from 'node:process'
import * as ts from 'typescript'
import { describe, expect, test } from 'vitest'
import { createResolver } from '../src'

const resolver = createResolver({ resolveNodeModules: true })

function buildExts(name: string) {
  return [
    name,
    `${name}.js`,
    `${name}.mjs`,
    `${name}.cjs`,
    `${name}.ts`,
    `${name}.mts`,
    `${name}.cts`,
    `${name}.jsx`,
    `${name}.tsx`,
    `${name}.d`,
  ]
}

describe('resolver', () => {
  const CASES: Array<string> = [
    'node',
    'magic-string-ast',
    'magic-string',
    'fast-glob',
    '@babel/parser',
    '@babel/generator', // definitely typed
    '@babel/types', // typesVersions field
    'yargs',
    'debug',
    'vue',
    '@vue/reactivity',
    'pathe',
    'oxc-resolver',
    'eslint',

    './fixtures/js-with-dts',
    ...buildExts('./fixtures/js-with-dts/index'),
    ...buildExts('./fixtures/same-name/main'),
    './fixtures/jsx',
    './fixtures/jsx.js',
    './fixtures/jsx.jsx',
    './fixtures/jsx.ts',
    './fixtures/jsx.tsx',

    './fixtures/tsx',
    './fixtures/jsx.ts',
    './fixtures/jsx.tsx',
    './fixtures/jsx.js',
    './fixtures/jsx.jsx',

    '../src',
    '../src/index',
    '../src/index.ts',
    '../src/index.js',

    '../package.json',
    '../tsconfig.json',
    '../eslint.config.js',

    'node:fs',
    'whatever',
    '../package',
    '../README.md',
    '../pnpm-lock.yaml',
    '../.gitignore',
  ]

  test.each(CASES)('%s', (id) => {
    const resolved = resolver(id, __filename)
    const tsResolved = tsResolve(id, __filename)
    expect(resolved).toBe(tsResolved)
  })

  test('@babel/types', () => {
    expectPath(resolver('@babel/types')).toMatchInlineSnapshot(
      `"@babel/types/lib/index-legacy.d.ts"`,
    )
  })

  test('paths', () => {
    const tsconfig = path.resolve(__dirname, './tsconfig-test.json')
    const resolver = createResolver({ tsconfig })
    expect(resolver('lib/alias.ts', __filename)).toBe(
      tsResolve('lib/alias.ts', __filename, tsconfig),
    )
  })
})

function expectPath(value: string | null) {
  if (typeof value === 'string')
    value = path
      .relative(process.cwd(), value)
      .replaceAll('\\', '/')
      .replaceAll(/.+node_modules\//g, '')
  return expect(value)
}

function tsResolve(id: string, importer: string, tsconfig?: string) {
  let compilerOptions: ts.CompilerOptions = {}
  if (tsconfig) {
    const readResult = ts.readConfigFile(tsconfig, ts.sys.readFile)
    const config = ts.parseJsonConfigFileContent(
      readResult.config,
      ts.sys,
      path.dirname(tsconfig),
    )
    compilerOptions = config.options
  }
  const resolved = ts.resolveModuleName(
    id,
    importer,
    {
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      resolveJsonModule: true,
      ...compilerOptions,
    },
    ts.sys,
  )
  return resolved.resolvedModule?.resolvedFileName ?? null
}
