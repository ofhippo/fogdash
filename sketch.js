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
            
      // TODO: simple target (noon to noon due to our planning and demo meetings... ignore weekends and work hours)
      
      var now = new Date(); // ugh... we already used a now above, but this will be factored elsewhere
      var sprintStartHour = 13; // TODO: move this to the config
      var sprintEndHour = 15;
      
      // TODO: It's bad form to set the hours on this object destructively
      var total = currentMilestone.endDate.setHours(sprintEndHour) - currentMilestone.startDate.setHours(sprintStartHour);
      var current = now - currentMilestone.startDate.setHours(sprintStartHour);
      var ratio = 1 - current/total;
      
      stats.target = Math.round(stats.estimate * ratio);
      
      console.log(stats);
      
      // how many working hours total in the sprint?
      // how far into the sprint are we?
      // this ratio applied to the estimate should be the result
      
      // TODO: factor this over to fogbugz (remember that we will check the milestone less than the other thing)

    });
  }
});