# MultiSelect Tabs

MultiSelect Tabs is a WebExtension that introduces a sidebar that allows you to
select one or more tabs in your browser window and perform various operations on
them.

Currently supported operations:

* Close tabs
* "Gather" tabs (puts selected tabs next to one another)

I originally aired the creation of this WebExtension as part of
[The Joy of Coding: Episode 100][ep100].


[ep100]: https://www.reddit.com/r/WatchPeopleCode/comments/6bpb36/live_weekly_1pm_et_on_wednesdays_watch_a_mozilla/


## Installation

[MultiSelect Tabs can be installed in Firefox Nightly (55) here][addon]

[addon]: https://addons.mozilla.org/en-US/firefox/addon/multiselect-tabs/


## Contributing

Dependencies are managed with [yarn][yarn]. Install them by running `yarn`. You
can then build the extension by running:


```
yarn run webpack
```

To build for production (e.g., for publishing on [addons.mozilla.org][amo]),
set the `NODE_ENV` environment variable to `PRODUCTION`. i.e,

```
export NODE_ENV=PRODUCTION
yarn run webpack
```

This will result in the bundle using the production version of React.

To test this addon, you require a recent build if [Firefox Nightly][nighty]. Go
to `about:debugging` and choose `Load Temporary Add-On`. Browse to your local
checkout and select `manifest.json` to load the add-on. Make sure you have
built the addon by running the commands above or this will not work.

To reload your addon, browse back to `about:debugging` and click `Reload` next
next to the `MultiSelect Tabs` entry under `Temporary Extensions`.

You can make webpack re-build the extension whenever files change. To do this, run:

```
yarn run webpack -- -w
```

You will still have to reload the extension as above.


To contribute a patch, fork this repository and send a pull request. I'd love to
make this super useful for people.

[amo]: https://addons.mozilla.org/
[debugging]: about:debugging
[nightly]: http://nightly.mozilla.org/
[yarn]: https://github.com/yarnpkg/yarn


## TODO

* Add ability to move selected tabs to new windows
* Detect and update after tabs are dragged in or out of a window
* Add favicons
* Pretty up the style of the sidebar
* Add the ability to filter the list of tabs in the sidebar with a search query
  (probably matching on tab title or URL)
