# jotai-ts-transformer

[![CI](https://github.com/ahungrynoob/jotai-ts-transformer/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/ahungrynoob/jotai-ts-transformer/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ahungrynoob/jotai-ts-transformer/branch/master/graph/badge.svg)](https://codecov.io/gh/ahungrynoob/jotai-ts-transformer)
[![Downloads](https://img.shields.io/npm/dm/jotai-ts-transformer.svg?sanitize=true)](https://npmcharts.com/compare/jotai-ts-transformer?minimal=true)

This package includes two ts-transformers: `debug-label-transformer` and `react-refresh-transformer`, corresponding to [jotai-babel-plugins](https://jotai.org/docs/api/babel).

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

const { createDebugLabelTransformer, createReactRefreshTransformer } = require('jotai-ts-transformer')

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
                // This can add debug label to your own custom atom function imported from custom library
                customAtomNames: [{
                  functionNames: ['myCustomAtom'],
                  library: 'jotai-my-custom-lib'
                }]
              }),
              createReactRefreshTransformer(program, {
                // This plugin adds support for React Refresh for Jotai atoms. This makes sure that state isn't reset, when developing using React Refresh.
                customAtomNames: [{
                  functionNames: ['myCustomAtom'],
                  library: 'jotai-my-custom-lib'
                }]
              })
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

This package has already included all the third party jotai libs recommended by jotai official. Here they are:
```typescript
const builtInAtomFunctionNames = [
  // Core
  {
    functionNames: [
      'atom',
      'atomFamily',
      'atomWithDefault',
      'atomWithObservable',
      'atomWithReducer',
      'atomWithReset',
      'atomWithStorage',
      'freezeAtom',
      'loadable',
      'selectAtom',
      'splitAtom',
      'unstable_unwrap',
    ],
    library: [
      JOTAI_LIB_NAME,
      JOTAI_VANILLA_NAME,
      `${JOTAI_LIB_NAME}/utils`,
      `${JOTAI_VANILLA_NAME}/utils`,
    ],
  },
  {
    functionNames: ['atomWithMachine'],
    library: 'jotai-xstate',
  },
  {
    functionNames: ['atomWithImmer'],
    library: 'jotai-immer',
  },
  {
    functionNames: ['atomWithProxy'],
    library: 'jotai-valtio',
  },
  {
    functionNames: ['atomWithRecoilValue'],
    library: 'jotai-recoil',
  },
  {
    functionNames: ['atomWithCache'],
    library: 'jotai-cache',
  },
  {
    functionNames: ['validateAtoms', 'atomWithValidate'],
    library: 'jotai-form',
  },
  {
    functionNames: ['focusAtom'],
    library: 'jotai-optics',
  },
  {
    functionNames: ['atomWithHash', 'atomWithLocation'],
    library: 'jotai-location',
  },
  {
    functionNames: ['atomWithStore'],
    library: ['jotai-redux', 'jotai-zustand'],
  },
  {
    functionNames: ['atomWithQuery'],
  },
  {
    functionNames: ['atomWithMutation', 'atomWithSubscription'],
    library: ['jotai-trpc', 'jotai-relay'],
  },
]

```