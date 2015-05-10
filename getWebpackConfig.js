var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');

module.exports = function(options) {
  var config = {
    entry: [
      './src/js/main.js'
    ],
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'app.js',
      publicPath: '/'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin()
    ],
    resolve: {
      extensions: ['', '.js']
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loaders: ['babel?stage=0'],
          include: path.join(__dirname, 'src/js')
        },
      ]
    },
  };

  if (options.environment === 'dev') {
    config.devtool = 'source-map';
    Array.prototype.unshift.call(
      config.entry,
      'webpack-dev-server/client?http://0.0.0.0:8000',
      'webpack/hot/only-dev-server'
    );
    config.plugins = [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ];
    config.module.loaders[0].loaders.unshift('react-hot');
  }

  config.module.loaders.unshift({
    test: require.resolve("react"),
    loader: "expose?React"
  });

  return config;
};
