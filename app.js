var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');
var usersRouter = require('./routes/users');
var contactsRouter = require('./routes/contacts');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const methodOverride = require('method-override')
const errorHandler = require('errorhandler')

var favicon = require('serve-favicon')

const swaggerFile = path.join(__dirname, 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerFile);


var app = express();

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.use('/ui', (req, res, next) => {
  swaggerDocument.host = req.header('x-forwarded-host');
  req.swaggerDoc = swaggerDocument;
  next();
}, swaggerUi.serve, swaggerUi.setup());


if ('development' == app.get('env')) {
  app.use(errorHandler());
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/contacts', contactsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use('/ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((req, res) => res.status(400).json({ error: 'Bad request' }));

module.exports = app;
