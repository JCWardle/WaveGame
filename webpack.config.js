var path = require('path');
var webpack = require("webpack");

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: './dist/bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: ['.ts', '.tsx','.js']
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  ]
};