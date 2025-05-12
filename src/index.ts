import { createRequire } from 'node:module'
import { dirname, extname } from 'node:path'
import process from 'node:process'

export interface Options {
  cwd?: string
  tsconfig?: string
  resolveNodeModules?: boolean
  ResolverFactory?: typeof import('oxc-resolver').ResolverFactory
}
export type Resolver = (id: string, importer?: string) => string | null

export function createResolver({
  tsconfig,
  cwd = process.cwd(),
  resolveNodeModules = false,
  ResolverFactory,
}: Options = {}): Resolver {
  ResolverFactory ||= (
    createRequire(import.meta.url)(
      'oxc-resolver',
    ) as typeof import('oxc-resolver')
  ).ResolverFactory
  const resolver = new ResolverFactory({
    mainFields: ['types', 'typings', 'module', 'main'],
    conditionNames: ['types', 'typings', 'import', 'require'],
    extensions: [
      '.d.ts',
      '.d.mts',
      '.d.cts',
      '.ts',
      '.mts',
      '.cts',
      '.tsx',
      '.js',
      '.mjs',
      '.cjs',
      '.jsx',
    ],
    extensionAlias: {
      '.js': ['.d.ts', '.ts', '.tsx', '.js', '.jsx'],
      '.jsx': ['.d.ts', '.ts', '.tsx', '.jsx', '.js'],
      '.mjs': ['.d.mts', '.mts', '.mjs'],
      '.cjs': ['.d.cts', '.cts', ' .cjs'],

      '.ts': ['.d.ts', '.ts', '.tsx', '.js', '.jsx'],
      '.tsx': ['.d.ts', '.tsx', '.ts', '.js', '.jsx'],
      '.mts': ['.d.mts', '.mts', '.mjs'],
      '.cts': ['.d.cts', '.cts', '.cjs'],
    },
    modules: resolveNodeModules ? ['node_modules', 'node_modules/@types'] : [],
    tsconfig: tsconfig
      ? { configFile: tsconfig, references: 'auto' }
      : undefined,
  })

  return (id: string, importer?: string): string | null => {
    const directory = importer ? dirname(importer) : cwd

    const resolution = resolver.sync(directory, id)
    if (!resolution.path) return null
    const resolved = resolution.path
    return ensureValue(resolved)
  }
}

const ALLOW_EXTENSIONS = [
  '.js',
  '.cjs',
  '.mjs',
  '.jsx',
  '.ts',
  '.cts',
  '.mts',
  '.tsx',
  '.json',
  '.vue',
  '.svelte',
  '.astro',
]
function ensureValue(value: string | null): string | null {
  return value && ALLOW_EXTENSIONS.includes(extname(value))
    ? value.replaceAll('\\', '/')
    : null
}
