var fogbugz = require('./fogbugz.js'),
  _ = require('underscore');


fogbugz.fetchMilestones(function(err, milestones) {
  if (err) {
    console.error(err);
  } else {
    var now = new Date();
    var currentMilestone = _.find(milestones, function(milestone) {
      return milestone.endDate && (milestone.endDate > now) && milestone.startDate && (milestone.startDate < now);
    });
    
    fogbugz.fetchCases(currentMilestone, function(err, cases) {
      console.log(cases);
    });
  }
});
