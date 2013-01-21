var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  path = require('path'),
  _ = require('underscore'),
  fogbugz = require('./fogbugz.js'),
  config = require('./config.json');
  
  
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
  res.render('index', { chartStates: config.chartStates });
});

app.get('/feed-me', function(req, res) {
  if (req.query['token'] != config.feedToken) {
    res.statusCode = 403;
    res.send("403 Forbidden, folks.\n");
    return;
  }
  
  if (!req.query['from'] || !req.query['message']) {
    res.statusCode = 400;
    res.send("400 Bad Request: 'from' and 'message' parameters are required.\n");
    return;
  }
  
  io.sockets.emit('feed', {'from': req.query['from'], 'message': req.query['message'], 'when': new Date()});
  
  res.statusCode = 200;
  res.send("OK\n");
});



//
// Socket.io
//

var stats = {},
  currentMilestone;

var emitStats = function() {
  stats && io.sockets.emit('stats', stats);
}

var emitCurrentMilestone = function() {
  currentMilestone && io.sockets.emit('milestone', currentMilestone);
}

io.sockets.on('connection', function (socket) {
  emitCurrentMilestone();
  emitStats();
});

//
// FogBugz polling
//

var fetchStats = function() {
  fogbugz.fetchMilestones(function(err, milestones) {
    if (err) {
      console.error(err);
    } else {
      var now = new Date(),
        latestMilestone;
      
      _.each(milestones, function(milestone) {
        if (!milestone.endDate || !milestone.startDate) return false;
        if (milestone.startDate > now) return false;
        if (latestMilestone && milestone.startDate < latestMilestone.startDate) return false;
        latestMilestone = milestone;
      });
      
      if (latestMilestone) {
        if (currentMilestone != latestMilestone) {
          currentMilestone = latestMilestone;
          emitCurrentMilestone();
        }
        
        fogbugz.fetchCases(currentMilestone, function(err, cases) {
          var latestStats = fogbugz.stats(currentMilestone, cases);

          if (!_.isEqual(latestStats, stats)) {
            stats = latestStats;
            emitStats();
          }
        });
      }
    }
  });
}

setInterval(
  fetchStats, 
  config.pollSeconds * 1000
);


//
// Kick it off
//

fetchStats();

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
