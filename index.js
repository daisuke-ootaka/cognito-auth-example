'use strict'

//====================================================================================================
// Libralies
//====================================================================================================
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var historyFallback = require('connect-history-api-fallback');
let express = require('express');
let path = require('path');

//====================================================================================================
// Configuration
//====================================================================================================
var compiler = webpack(webpackConfig);

let app = express();
app.set('port', (process.env.PORT || 5000));
app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));
app.use(historyFallback());

//====================================================================================================
// Served Contents
//====================================================================================================
app.use('/', express.static(path.join(__dirname, 'dist')));

//====================================================================================================
// Start Server
//====================================================================================================
app.listen(app.get('port'), function() {
  console.log('Served: http://localhost:' + app.get('port'));
});
