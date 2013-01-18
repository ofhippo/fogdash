(function() {
  
  var statKeys = ['openCases', 'remaining', 'target']
  
  var socket = io.connect(location.protocol + '//' + location.hostname);
  socket.on('stats', function (data) {
    console.log(data);
    
    // TODO: iteration name
    // TODO: case diagram
    
    if (data) {
      _.each(statKeys, function(statKey) {
        data[statKey] && $('#' + statKey).html(data[statKey]);
      });
    }
  });
  
})();