# dts-resolver [![npm](https://img.shields.io/npm/v/dts-resolver.svg)](https://npmjs.com/package/dts-resolver)

[![Unit Test](https://github.com/sxzz/dts-resolver/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/dts-resolver/actions/workflows/unit-test.yml)

Resolves TypeScript declaration files for dependencies, powered by [oxc-resolver](https://oxc.rs/docs/guide/usage/resolver.html).

## Install

```bash
npm i dts-resolver
```

## Usage

```ts
import { createResolver } from 'dts-resolver'

const resolver = createResolver({
  // optional
  cwd: process.cwd(),
})

resolver('fast-glob') // .../node_modules/fast-glob/out/index.d.ts
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2025 [三咲智子 Kevin Deng](https://github.com/sxzz)
