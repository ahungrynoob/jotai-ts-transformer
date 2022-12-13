const { resolve } = require('path')

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')

const {
  createDebugLabelTransformer,
  createReactRefreshTransformer,
} = require('./lib/index')

module.exports = {
  entry: './tests/fixtures/index.tsx',
  output: {
    filename: '[name].[contenthash].js',
    path: resolve(process.cwd(), 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: (program) => ({
            before: [
              createDebugLabelTransformer(program),
              createReactRefreshTransformer(program),
              ReactRefreshTypeScript(),
            ],
          }),
          compilerOptions: {
            module: 'esnext',
            allowJs: true,
            declaration: false,
            jsx: 'react-jsx',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },

  mode: 'production',

  optimization: { minimize: false },

  plugins: [new ReactRefreshWebpackPlugin()],
}
