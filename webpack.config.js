var webpack = require('webpack');
var path = require('path');
var chalk = require('chalk');

// Webpack plugins
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// Collect environment variables
var env = process.env.NODE_ENV || 'dev';

// Resolve modules, source, build and static paths
var dir_src = path.resolve(__dirname, 'src');
var dir_build = path.resolve(__dirname, 'build');
var dir_static = path.resolve(__dirname, 'static');
var dir_modules = path.resolve(__dirname, 'node_modules');

// Webpack config
module.exports = {

  // Source maps (helps with debugging)
  devtool: env == 'dev' ? 'eval-source-map' : 'hidden-source-map',

  // Entry point
  entry: path.resolve(dir_src, 'index.js'),

  // Bundle output, index.js is fine so you can do require('modulename');
  // without explicitly calling the .js file
  output: {
    path: dir_build,
    publicPath: "/",
    filename: 'tree-mirror.js',
    libraryTarget: 'this'
  },

  // Static directory for serve
  devServer: {
    contentBase: dir_static,
    progress: true,
    stats: 'errors-only',
    watchOptions: {poll: 500},
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 1111
  },

  module: {
    loaders: [
      // Linter configuration
      {
        test: /\.js$/,
        loader: "eslint-loader",
        exclude: /node_modules/,
        query: {
          rules: {
            "quotes": ["off", "double"]
          }
        }
      },

      // Babel with tree-shaking configuration
      {
        test: dir_src,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0'],

          // All of the plugins of babel-preset-es2015,
          // minus babel-plugin-transform-es2015-modules-commonjs
          plugins: [
            'transform-class-properties',
            'transform-es2015-template-literals',
            'transform-es2015-literals',
            'transform-es2015-function-name',
            'transform-es2015-arrow-functions',
            'transform-es2015-block-scoped-functions',
            'transform-es2015-classes',
            'transform-es2015-object-super',
            'transform-es2015-shorthand-properties',
            'transform-es2015-computed-properties',
            'transform-es2015-for-of',
            'transform-es2015-sticky-regex',
            'transform-es2015-unicode-regex',
            'check-es2015-constants',
            'transform-es2015-spread',
            'transform-es2015-parameters',
            'transform-es2015-destructuring',
            'transform-es2015-block-scoping',
            'transform-es2015-typeof-symbol',
            ['transform-regenerator', { async: false, asyncGenerators: false }],
          ],
        },
      }
    ]
  },

  // NOTE: empty extension doesn't work in 2.1.0-beta.21
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    modules: [
      dir_src,
      dir_modules
    ]
  },

  plugins: [
    // Copy plugin
    // new CopyWebpackPlugin([{
    //   from: path.resolve(dir_build, 'index.js'),
    //   to: path.resolve(dir_static, 'index.js')
    // }]),

    // Define plugin; Allows you to define variables that can be used in your
    // javascript files
    new webpack.DefinePlugin({
      __STRING__: `"${env}"`,
      __DEV__: (env == 'dev')
    }),

    // Loader options
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),

    // Module occurence order optimization
    //new webpack.optimize.OccurenceOrderPlugin(true),

    // Minification optimization
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      },
      sourceMap: false
    }),

    // Chunking
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: Infinity,
    //   filename: 'vendor.bundle.js'
    // }),

    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin(),

    // Progress bar
    new ProgressBarPlugin({
      format: chalk.bold('  build  ') + '[:bar] ' + chalk.green(':percent') + ' (:elapseds) - :msg ',
      width: 40,
      clear: false
    })
  ],

  // Nice colored output
  stats: { colors: true }
}
