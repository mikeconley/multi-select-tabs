# MultiSelect Tabs

MultiSelect Tabs is a WebExtension that introduces a sidebar that allows you to select one or more tabs in your browser window and perform various operations on them.

Currently supported operations:

* Close tabs
* "Gather" tabs (puts selected tabs next to one another)

I originally aired the creation of this WebExtension as part of [The Joy of Coding: Episode 100](https://www.reddit.com/r/WatchPeopleCode/comments/6bpb36/live_weekly_1pm_et_on_wednesdays_watch_a_mozilla/).

# TODO
* Port to React so that we just need to maintain a mirror of tab state in a window
* Add ability to move selected tabs to new windows
* Detect and update after tab movement, either when tabs are dragged within the window, or tabs are dragged in or out of a window
* Add favicons
* Pretty up the style of the sidebar
* Add the ability to filter the list of tabs in the sidebar with a search query (probably matching on tab title or URL)

# Contributing

First, clone this repository locally. Then, in a recent build of [Firefox Nightly](http://nightly.mozilla.org/), go to about:debugging, and choose "Load Temporary Add-on". Browse to the folder where you cloned the repository, and choose the manifest.json file to load the add-on.

When you make changes, just go back to about:debugging and click on "Reload" next to the MultiSelect Tabs entry under Temporary Extensions.

Please send pull requests if you have them. I'd love to make this super useful for people.

