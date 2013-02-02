var request = require('request'),
  _ = require('underscore'),
  xml2js = require('xml2js'),
  config = require('./config.json');

exports.fetchMilestones = function(callback) {
  var parser = new xml2js.Parser();
  
  var parseBody = function(body) {
    parser.parseString(body, function(parseError, result) {
      if (parseError) {
        callback(parseError);
      } else {
        var fixfors = result.response.fixfors[0].fixfor;
        var milestones = _.map(fixfors, function(fixfor) {
          return {
            title: fixfor.sFixFor[0],
            startDate: _.isString(fixfor.dtStart[0]) ? new Date(fixfor.dtStart[0]) : null,
            endDate: _.isString(fixfor.dt[0]) ? new Date(fixfor.dt[0]) : null
          }
        });
        callback(null, milestones);
      }
    });
  }
  
  request.get({
    url: config.url, 
    qs:{ 
      token: config.token,
      cmd: "listFixFors",
      ixFixFor: config.team
    }}, 
    function(requestError, response, body) {
      if (requestError) {
        callback(requestError);
      } else {
        parseBody(body);
      }
  });
}

exports.fetchCases = function(milestone, callback) {
  var parser = new xml2js.Parser();
  
  var parseBody = function(body) {
    parser.parseString(body, function(parseError, result) {
      if (parseError) {
        callback(parseError);
      } else {
        var casesResult = result.response.cases[0]['case'];
        var cases = _.map(casesResult, function(c) {
          return {
            id: Number(c.ixBug[0]),
            isOpen: (c.fOpen[0] == 'true'),
            title: c.sTitle[0],
            status: c.sStatus[0],
            category: c.sCategory[0],
            estimate: Number(c.hrsCurrEst[0]),
            elapsed: Number(c.hrsElapsed[0])
          }
        });
        callback(null, cases);
      }
    });
  }
  
  request.get({
    url: config.url, 
    qs:{ 
      token: config.token,
      cmd: "search",
      q: "fixfor:'" + milestone.title + "'",
      cols: "sCategory,sTitle,sStatus,hrsCurrEst,hrsElapsed,ixBug,fOpen"
    }},
    function(requestError, response, body) {
      if (requestError) {
        callback(requestError);
      } else {
        parseBody(body);
      }
  });
}

exports.stats = function(milestone, cases) {
  var stats = {
    estimate: 0,
    elapsed: 0,
    openCases: 0,
    status: {}
  }
  
  _.each(cases, function(bug) {
    stats.estimate += bug.estimate;
    stats.elapsed += bug.elapsed;
    if (bug.isOpen) { stats.openCases++; }
    
    stats.status[bug.status] || (stats.status[bug.status] = {});
    stats.status[bug.status][bug.category] || (stats.status[bug.status][bug.category] = {estimate: 0, count: 0});
    stats.status[bug.status][bug.category].estimate += bug.estimate;
    stats.status[bug.status][bug.category].count += 1;
  });
  
  stats.remaining = stats.estimate - stats.elapsed;
        
  // Note: this is a simplish target (does not think about work hours)
  var weekday = function(date){
    return !_.contains([0,6], date.getDay());
  };

  var nextDate = function(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  };

  var now = new Date(),
    sprintStart = new Date(milestone.startDate),
    sprintEnd = new Date(milestone.endDate),
    workingDaysLeft = 0,
    workingDaysTotal = 0;
  
  for (var date = sprintStart; date <= sprintEnd; date = nextDate(date)) {
    if (weekday(date)) {
      workingDaysTotal++;
      if(date >= now) { workingDaysLeft++; }
    }
  }

  stats.target = Math.round(100 * workingDaysLeft / workingDaysTotal);
  return stats;
}