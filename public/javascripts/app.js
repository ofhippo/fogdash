(function() {
  
  var statKeys = ['openCases', 'remaining', 'target']
  
  var socket = io.connect(location.protocol + '//' + location.hostname);
  
  socket.on('stats', function (data) {
    console.log(data);
    
    if (data) {
      _.each(statKeys, function(statKey) {
        data[statKey] && $('#' + statKey).html(data[statKey]);
      });
    }
  });
  
  socket.on('milestone', function (data) {
    if (data) {
      data['title'] && $('#milestoneTitle').html(data['title']);
    }
  });
  
})();