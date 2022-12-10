# jotai-ts-transformer

[![CI](https://github.com/ahungrynoob/jotai-ts-transformer/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/ahungrynoob/jotai-ts-transformer/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ahungrynoob/jotai-ts-transformer/branch/master/graph/badge.svg)](https://codecov.io/gh/ahungrynoob/jotai-ts-transformer)
[![Downloads](https://img.shields.io/npm/dm/jotai-ts-transformer.svg?sanitize=true)](https://npmcharts.com/compare/jotai-ts-transformer?minimal=true)

Jotai is based on object references and not keys (like Recoil). This means there's no identifier for atoms. To identify atoms, it's possible to add a `debugLabel` to an atom, which can be found in React devtools.

However, this can quickly become cumbersome to add a `debugLabel` to every atom.

This ts plugin adds a `debugLabel` to every atom, based on its identifier.

The plugin transforms this code:

```js
export const countAtom = atom(0)
```

Into:

```js
export const countAtom = atom(0)
countAtom.debugLabel = 'countAtom'
```

Default exports are also handled, based on the file naming:

```js
// countAtom.ts
export default atom(0)
```

Which transform into:

```js
// countAtom.ts
const countAtom = atom(0)
countAtom.debugLabel = 'countAtom'
export default countAtom
```

## Install
```bash
npm install jotai-ts-transformer --save-dev
```

## Usage

With a `webpack` configuration file:

```js
const { join } = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { createDebugLabelTransformer } = require('jotai-ts-transformer')

module.exports = {
  entry: './tests/fixtures/simple.tsx',

  output: {
    filename: '[name].[hash].js',
    path: join(process.cwd(), 'dist'),
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },

  mode: 'development',

  devtool: 'cheap-module-source-map',

  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: (program) => ({
            before: [
              // <------------------- here
              createDebugLabelTransformer(program, {
                // this can add debug label to your own custom atom
                customAtomNames: ['myCustomAtom']
              }),
            ],
          }),
          compilerOptions: {
            jsxFactory: 'jsx',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader?minimize'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: join(process.cwd(), 'tests', 'fixtures', 'index.html'),
    }),
  ],
}
```
