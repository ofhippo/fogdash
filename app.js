var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  path = require('path');
  
  
//
// Configuration
//

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.enable('trust proxy');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//
// Express routes
//

app.get('/', function(req, res){
  res.render('index', { title: 'FogDash' });
});


//
// Socket.io
//

var rnd = 42;

var emitRnd = function() {
  io.sockets.emit('rnd', {value: rnd});
}

setInterval(function() {
  rnd = Math.round(Math.random() * 100);
  emitRnd();
}, 10 * 1000);

io.sockets.on('connection', function (socket) {
  emitRnd();
});

//
// Kick it off
//

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
