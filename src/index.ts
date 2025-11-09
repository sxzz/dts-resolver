import { dirname, extname } from 'node:path'
import process from 'node:process'
import type { NapiResolveOptions } from 'oxc-resolver'

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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ResolverFactory ||= (require('oxc-resolver') as typeof import('oxc-resolver'))
    .ResolverFactory

  const sharedConfigs = {
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
      '.cjs': ['.d.cts', '.cts', '.cjs'],

      '.ts': ['.d.ts', '.ts', '.tsx', '.js', '.jsx'],
      '.tsx': ['.d.ts', '.tsx', '.ts', '.js', '.jsx'],
      '.mts': ['.d.mts', '.mts', '.mjs'],
      '.cts': ['.d.cts', '.cts', '.cjs'],
    },
    modules: resolveNodeModules ? ['node_modules', 'node_modules/@types'] : [],
    tsconfig: tsconfig
      ? { configFile: tsconfig, references: 'auto' }
      : undefined,
  } satisfies NapiResolveOptions

  const typesResolver = new ResolverFactory({
    ...sharedConfigs,
    mainFields: ['types', 'typings'],
    conditionNames: ['types', 'typings'],
  })
  const modulesResolver = typesResolver.cloneWithOptions({
    ...sharedConfigs,
    mainFields: ['module', 'main'],
    conditionNames: ['import', 'require'],
  })

  return (id: string, importer?: string): string | null => {
    const directory = importer ? dirname(importer) : cwd

    let resolution = typesResolver.sync(directory, id)
    // TODO: this is not safe currently,
    // because the typesResolver may resolve to the `"default"` entry
    // instead of `"types"` or `"typings"`.
    // We don't have a way to check this currently.
    // @see https://github.com/oxc-project/oxc-resolver/blob/main/src/lib.rs#L1713-L1714
    if (!resolution.path) {
      // If resolve types entries failed, then try resolving modules entries
      resolution = modulesResolver.sync(directory, id)
      if (!resolution.path) {
        return null
      }
    }

    const resolved = resolution.path
    return ensureValue(resolved)
  }
}

const ALLOW_EXTENSIONS = new Set([
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
])
function ensureValue(value: string | null): string | null {
  return value && ALLOW_EXTENSIONS.has(extname(value))
    ? value.replaceAll('\\', '/')
    : null
}
