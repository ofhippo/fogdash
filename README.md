This is a simple dashboard for FogBugz. It is written for [DECK Monitoring](https://github.com/deck/)'s workflow and displays the follow for the current milestone:

* Number of points (FogBug hours) remaining vs target (noon to noon due to our planning and demo meetings)
* Number of cases remaining
* A chart of the cases by status (column) and category (color)

# Up and Running

Copy the `config-example.json` to `config.json` and update the properties to meet your needs.

* `url`: The full url of your FogBugz api including "api.asp"
* `token`: You'll need a token. See [the FogBugz documentation](http://fogbugz.stackexchange.com/fogbugz-xml-api) for details on how to retrieve it.
* `team`: The FogBugz project id (`ixFixFor` in FB API speak)
* `sprintStartHour`: The hour of the day (0-23) that your sprint starts. We use this to exclude the planning meeting.
* `sprintEndHour`: The hour of the day (0-23) that marks the end of your sprint. We use this exclude the demo and retrospective.

# License

The license is the good old BSD 3-clause.