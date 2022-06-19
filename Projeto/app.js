var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var musicasRouter = require('./routes/musicas');
var artistasRouter =  require('./routes/artistas');
var albunsRouter =  require('./routes/albuns');
var submeterRouter =  require('./routes/submeter');
var autenticarRouter =  require('./routes/autenticar');
var usersRouter =  require('./routes/users');
var playlistsRouter =  require('./routes/playlists');

var app = express();

// MongoDB
var mongoose = require("mongoose")
var mongoDB = "mongodb://127.0.0.1/RPCW2022"
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
var db = mongoose.connection
db.on("error", () => { console.log("Erro na conexão ao MongoDB") })
db.once("open", () => { console.log("Conexão ao MongoDB realizada com sucesso...") })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/musicas', musicasRouter);
app.use('/artistas', artistasRouter);
app.use('/albuns', albunsRouter);
app.use('/submeter', submeterRouter);
app.use('/autenticar', autenticarRouter);
app.use('/users', usersRouter);
app.use('/playlists', playlistsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
