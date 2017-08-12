var path = require('path');
var webpack = require("webpack");

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: './dist/bundle.js',
    path: path.resolve(__dirname, '')
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
      },
      {
      test: /\.(gif|png|jpe?g|svg)$/i,
      loaders: [
      'file-loader',
        {
          loader: 'image-webpack-loader',
          query: {
            progressive: true,
            optimizationLevel: 7,
            interlaced: false,
            pngquant: {
              quality: '65-90',
              speed: 4
            }
          }
        }
      ]
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