This is a quick and dirty dashboard for FogBugz. It is written for [DECK Monitoring](https://github.com/deck/)'s workflow and displays the follow for the current milestone:

* Number of points (FogBug hours) remaining vs target (noon to noon due to our planning and demo meetings)
* Number of cases remaining
* A chart of the cases by status (column) and category (color)

# Up and Running

Copy the `config-example.json` to `config.json`. You'll need a token. See [the FogBugz documentation](http://fogbugz.stackexchange.com/fogbugz-xml-api) for details on how to retrieve it. The `team` property is the FogBugz project id (`ixFixFor` in FB API speak).

# License

The license is good old BSD 3-clause.