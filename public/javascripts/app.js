$(function() {
  
  // a few display options
  var caseSymbol = "&#x25A7;";
  var colors = ["#90CA77", "#81C6DD", "#E9B64D", "#732C7B", "#dd6600", "#207A57", "#186A99", "#999999"];
  var statKeys = ['openCases', 'remaining', 'target'];

  // a color mapping function
  var colorMap = {};
  var getColor = function(bugType) {
    if (!colorMap[bugType]) {
      colorMap[bugType] = colors.shift();
    }
    
    return colorMap[bugType];
  }
  
  // make a map object for quick table cell lookup from bug status name
  var chartMap = {};
  _.each($('#statusChart th'), function(el, i) {
    chartMap[$(el).text()] = $('#statusChart td').eq(i);
  });
  var chartLast = $('#statusChart td').last();
  
  // connect the socket
  var socket = io.connect(location.protocol + '//' + location.hostname);
  
  socket.on('stats', function (data) {
    console.log(data);
    
    if (data) {
      // top big number stats
      _.each(statKeys, function(statKey) {
        _.has(data, statKey) && $('#' + statKey).html(data[statKey]);
      });

      // bug status chart
      _.each(data['status'], function(state, stateName) {
        var cell = chartMap[stateName] || chartLast;
        cell.empty();

        _.each(state, function(bugGroup, bugType) {
          var color = getColor(bugType);
          _.each(bugGroup.bugs, function(bug) {
            var title = bug.title.replace(/'/g, "&#39;");
            var remaining = Math.round(bug.estimate - bug.elapsed);
            var altText = bugType + " #" + bug.id + ": " + title + " (" + remaining + " remaining)";
            var blurb = "<span style='color: " + color + "' title='" + altText + "'>" + caseSymbol + "</span> ";
            cell.append(blurb);
          });
        });
      });
      
      // color legend
      $('#colorLegend').empty();
      _.each(colorMap, function(color, key) {
        $('#colorLegend').append("<span style='color: " + color + "'>" + key + "</span> ");
      });
    }
  });
  
  socket.on('milestone', function(data) {
    if (data) {
      data['title'] && $('#milestoneTitle').html(data['title']);
    }
  });
  
  var postTemplate = _.template("<div class='post'><h2><%= from %> <span><%= (new Date(when)).toString() %></span></h2><p><%= message %></div>");
  
  socket.on('feed', function(data) {
    if (data) {
      var $feed = $('#feed'),
        $children = $feed.children();
      
      if ($children.length > 2) { $children.last().remove(); }
      $feed.prepend(postTemplate(data));
    }
  });
  
});