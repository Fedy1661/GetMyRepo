const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const dist = './dist';

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);
const optimization = () => {
  const config = {};
  return config;
};

const devTool = () => {
  let tool = '';
  if (isDev) tool = 'source-map';
  return tool;
};

const plugins = () => {
  const initial = [
    new HTMLWebpackPlugin({
      // Auto HTML
      template: './src/index.html',
      minify: { collapseWhitespace: isProd }
    }),
    new MiniCSSExtractPlugin({ filename: filename('css') })
  ];
  if (isProd) initial.push(new CleanWebpackPlugin());
  return initial;
};
module.exports = {
  mode: 'development',
  entry: ['@babel/polyfill', './src/index.js'],
  output: {
    filename: filename('js'),
    path: path.resolve(dist)
  },
  devtool: devTool(),
  optimization: optimization(),
  devServer: { port: 3000, hot: isDev },
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: '@svgr/webpack',
            options: {
              babel: false,
              icon: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader,
            options: { hmr: isDev, reloadAll: true }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          }
        ]
      }
    ]
  }
};
