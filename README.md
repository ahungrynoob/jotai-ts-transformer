# jotai-label-ts-plugin

[![CircleCI](https://circleci.com/gh/ahungrynoob/jotai-label-ts-plugin.svg?style=svg)](https://circleci.com/gh/ahungrynoob/jotai-label-ts-plugin)
[![codecov](https://codecov.io/gh/ahungrynoob/jotai-label-ts-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/ahungrynoob/jotai-label-ts-plugin)
[![Downloads](https://img.shields.io/npm/dm/jotai-label-ts-plugin.svg?sanitize=true)](https://npmcharts.com/compare/jotai-label-ts-plugin?minimal=true)

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

## Usage

With a `webpack` configuration file:

```js
const { join } = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { jotaiLabelTransformer } = require('jotai-label-ts-plugin')

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
          getCustomTransformers: () => ({
            before: [
              // <------------------- here
              jotaiLabelTransformer,
            ],
          }),
          compilerOptions: {
            // set jsx pragma to jsx or alias which is from the @emotion/react package to enable css property in jsx component
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
