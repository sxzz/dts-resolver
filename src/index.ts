import { existsSync } from 'node:fs'
import process from 'node:process'
import { ResolverFactory } from 'oxc-resolver'
import { dirname } from 'pathe'

const RE_JS = /\.[cm]?js$/
const RE_TS = /\.[cm]?ts$/

export function createResolver({ cwd = process.cwd() }: { cwd?: string } = {}) {
  const resolver = new ResolverFactory({
    mainFields: ['types', 'typings', 'module', 'main'],
    conditionNames: ['types', 'typings', 'import', 'require'],
    extensions: ['.d.ts', '.d.mts', '.d.cts', '.ts', '.mts', '.cts'],
    modules: ['node_modules', 'node_modules/@types'],
  })

  return (id: string, importer?: string): string | null => {
    const directory = importer ? dirname(importer) : cwd

    const resolution = resolver.sync(directory, id)
    if (!resolution.path) return null
    const resolved = resolution.path
    if (RE_JS.test(resolved)) {
      // check dts exists?
      const dts =
        tryExists(resolved.replace(RE_JS, '.d.ts')) ||
        tryExists(resolved.replace(RE_JS, '.d.mts')) ||
        tryExists(resolved.replace(RE_JS, '.d.cts'))
      return ensureTs(dts)
    }

    return ensureTs(resolved)
  }
}

function ensureTs(path: string | null): string | null {
  return path && RE_TS.test(path) ? path : null
}

function tryExists(path: string): string | null {
  return existsSync(path) ? path : null
}
