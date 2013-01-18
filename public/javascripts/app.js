$(function() {
  
  var statKeys = ['openCases', 'remaining', 'target'];
  var caseString = "&#x25A7; ";
  
  var chartMap = {};
  _.each($('#statusChart th'), function(el, i) {
    chartMap[$(el).text()] = $('#statusChart td').eq(i);
  });
  var chartLast = $('#statusChart td').last();
  
  var socket = io.connect(location.protocol + '//' + location.hostname);
  
  socket.on('stats', function (data) {
    console.log(data);
    
    if (data) {
      _.each(statKeys, function(statKey) {
        data[statKey] && $('#' + statKey).html(data[statKey]);
      });
      
      // TODO: we need a function that pulls a new color for each bugType 
      // TODO: and a legend would be nice
      
      _.each(data['status'], function(state, stateName) {
        var cell = chartMap[stateName] || chartLast;
        cell.text("");

        _.each(state, function(bug, bugType) {
          console.log(stateName, bugType, bug.estimate, cell);
          _.times(bug.estimate, function() {
            cell.append(caseString);
          });
        });
      });
    }
  });
  
  socket.on('milestone', function (data) {
    if (data) {
      data['title'] && $('#milestoneTitle').html(data['title']);
    }
  });
  
});