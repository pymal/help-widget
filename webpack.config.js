const path = require('path');
const webpack = require('webpack');
var copyWebpackPlugin = require('copy-webpack-plugin');
const bundleOutputDir = './dist';
const openBrowser = require('react-dev-utils/openBrowser');

module.exports = (env) => {
  const isDevBuild = !(env && env.prod);

  console.log('env=', env);
  console.log('isDevBuild=', isDevBuild);

  return [{
    entry: './src/index.ts',
    output: {
      filename: 'widget.js',
      path: path.resolve(bundleOutputDir),
    },
    devServer: {
      host: 'localhost',
      port: 8080,
      hot: true,
      onListening: function (devServer) {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
        const addr = devServer.server.address();
        openBrowser(`http://${addr.address}:${addr.port}`);
      },
      static: {
        directory: path.resolve(bundleOutputDir),
      },
      allowedHosts: 'all',
      client: {
        // Shows a full-screen overlay in the browser when there are compiler errors or warnings.
        overlay: true,
      },
      //contentBase: bundleOutputDir
    },
    plugins: isDevBuild
      ? [new webpack.SourceMapDevToolPlugin(), new copyWebpackPlugin({
        patterns: [
          { from: "dev/" },
        ]
      })]
      : [],
    optimization: {
      minimize: !isDevBuild
    },
    mode: isDevBuild ? 'development' : 'production',
    module: {
      rules: [
        // packs SVG's discovered in url() into bundle
        { test: /\.svg/, use: 'svg-url-loader' },
        {
          test: /\.css$/i,
          use: [
            {
              loader: 'style-loader',
              options: { injectType: 'singletonStyleTag' }
            },
            {
              // allows import CSS as modules
              loader: 'css-loader',
              options: {
                modules: {
                  // css class names format
                  localIdentName: '[name]-[local]-[hash:base64:5]'
                },
                sourceMap: isDevBuild
              }
            }
          ]
        },
        // use babel-loader for TS and JS modeles,
        // starting v7 Babel babel-loader can transpile TS into JS,
        // so no need for ts-loader
        // note, that in dev we still use tsc for type checking
        {
          test: /\.(js|ts|tsx|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    'targets': {
                      'browsers': ['IE 11, last 2 versions']
                    },
                    // makes usage of @babel/polyfill because of IE11
                    // there is at least async functions and for..of
                    useBuiltIns: 'entry',
                    corejs: '3.27.2'
                  }],
                  [
                    // enable transpiling ts => js
                    "@babel/typescript",
                    // tell babel to compile JSX using into Preact
                    { jsxPragma: "h" }
                  ]
                ],
                'plugins': [
                  // syntax sugar found in React components
                  '@babel/proposal-class-properties',
                  '@babel/proposal-object-rest-spread',
                  // transpile JSX/TSX to JS
                  ['@babel/plugin-transform-react-jsx', {
                    // we use Preact, which has `Preact.h` instead of `React.createElement`
                    pragma: 'h',
                    pragmaFrag: 'Fragment'
                  }]
                ]
              }
            }
          ]
        }]
    },
    resolve: {
      extensions: ['*', '.js', '.ts', '.tsx']
    }
  }];
};
