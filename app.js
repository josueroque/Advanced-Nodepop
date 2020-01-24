'use strict';
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwtAuth = require('./lib/jwtAuth');
const i18n = require('./lib/i18nSetup');
//var __dirname;
require('dotenv').config();


var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('view engine', 'html');
// app.engine('html', require('ejs').__express);

//Middlewares
if (process.env.LOG_FORMAT !== 'nolog') {
  app.use(logger(process.env.LOG_FORMAT || 'dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(i18n.init);

/**
 * Database conection 
 */
require('./lib/conMongoose');

require('./models/Anuncio');
require('./models/Usuario');

/**
 * API Routes
 */
// app.use('/apiv1/agentes', require('./routes/apiv1/agentes'));

app.locals.title = 'Nodepop';

app.use('/apiv1/authenticate', require('./routes/apiv1/authenticate'));
app.use('/apiv1/anuncios', jwtAuth(), require('./routes/apiv1/anuncios'));

/**
 * Web app routes
 */
app.use('/',        require('./routes/index'));
app.use('/users',   require('./routes/users'));
//app.post('/login', loginController.post);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
//  const err = new Error(__('not_found'));
const err = new Error('Directory not found');
  err.status = 404;
  next(err);
})

// error handler
app.use(function (err, req, res, next) {
  if (err.array) { // validation error
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req)
      ? { message: __('not_valid'), errors: err.mapped() }
      : `${__('not_valid')} - ${errInfo.param} ${errInfo.msg}`;
  }

  // establezco el status a la respuesta
  err.status = err.status || 500;
  res.status(err.status);

  // si es un 500 lo pinto en el log
  if (err.status && err.status >= 500) console.error(err);

  // si es una petición al API respondo JSON...
  if (isAPI(req)) {
    res.json({ success: false, error: err.message })
    return;
  }

  // ...y si no respondo con HTML...

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.render('error');
})

function isAPI (req) {
  return req.originalUrl.indexOf('/api') === 0;
}

module.exports = app;
