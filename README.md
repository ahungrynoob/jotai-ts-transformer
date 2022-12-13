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
                // This can add debug label to your own custom atom
                customAtomNames: ['myCustomAtom']
              }),
              createReactRefreshTransformer(program, {
                // This plugin adds support for React Refresh for Jotai atoms. This makes sure that state isn't reset, when developing using React Refresh.
                customAtomNames: ['myCustomAtom']
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
