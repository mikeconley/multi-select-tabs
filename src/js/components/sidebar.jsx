import PropTypes from "prop-types";
import React from "react";

import TabInfo from "components/tabInfo";

export default class SideBar extends React.Component {
  state = {
    activeTabId: null,
    filter: "",
    selectAll: false,
    tabsBydId: new Map(),
    tabIds: [],
    filteredTabs: [],
  };

  constructor() {
    super();

    /*
     * Bind our methods to the instance so we can remove them when the component
     * unmounts.
     */
    this._onTabActivated = this._onTabActivated.bind(this);
    this._onTabCreated = this._onTabCreated.bind(this);
    this._onTabMoved = this._onTabMoved.bind(this);
    this._onTabRemoved = this._onTabRemoved.bind(this);
    this._onTabUpdated = this._onTabUpdated.bind(this);

    this._onFilterChanged = this._onFilterChanged.bind(this);
    this._onSelectionChanged = this._onSelectionChanged.bind(this);
    this._onTabInfoClicked = this._onTabInfoClicked.bind(this);
    this._toggleSelectAll = this._toggleSelectAll.bind(this);
    this._gatherSelected = this._gatherSelected.bind(this);
    this._closeSelected = this._closeSelected.bind(this);
  }

  async componentDidMount() {
    const info = await browser.windows.get(this.props.windowId, {
      populate: true,
    });

    browser.tabs.onActivated.addListener(this._onTabActivated);
    browser.tabs.onCreated.addListener(this._onTabCreated);
    browser.tabs.onMoved.addListener(this._onTabMoved);
    browser.tabs.onRemoved.addListener(this._onTabRemoved);
    browser.tabs.onUpdated.addListener(this._onTabUpdated);

    const tabsById = new Map();
    const tabIds = [];
    let activeTabId = null;

    for (const tab of info.tabs) {
      tabIds.push(tab.id);
      tabsById.set(tab.id, {
        favIconUrl: tab.favIconUrl,
        id: tab.id,
        selected: false,
        title: tab.title,
        url: tab.url,
      });

      if (tab.active) {
        activeTabId = tab.id;
      }
    }

    this.setState({
      ...this.state,
      activeTabId,
      tabsById,
      tabIds,
      filteredTabs: tabIds.slice(),
    });
  }

  componentWillUnmount() {
    browser.tabs.onActivated.removeListener(this._onTabActivated);
    browser.tabs.onCreated.removeListener(this._onTabCreated);
    browser.tabs.onMoved.removeListener(this._onTabMoved);
    browser.tabs.onRemoved.removeListener(this._onTabRemoved);
    browser.tabs.onUpdated.removeListener(this._onTabUpdated);
  }

  render() {
    const {
      activeTabId,
      filter,
      filteredTabs,
      selectAll,
      tabsById,
    } = this.state;

    const tabs = filteredTabs.map(tabId => {
      const tabInfo = tabsById.get(tabId);
      return (
        <TabInfo
          key={tabInfo.id}
          active={activeTabId === tabId}
          tabInfo={tabInfo}
          onClick={this._onTabInfoClicked}
          onSelectionChanged={this._onSelectionChanged}
        />
      );
    });

    return (
      <div id="sidebar">
        <div id="controls">
          <button id="close" onClick={this._closeSelected}>
            Close
          </button>
          <button id="gather" onClick={this._gatherSelected}>
            Gather
          </button>
          <input
            id="filter"
            className="block"
            type="text"
            placeholder="Filter tabs…"
            onChange={this._onFilterChanged}
            value={filter}
          />
          <label className="block">
            <input
              id="select-all"
              type="checkbox"
              checked={selectAll}
              onChange={this._toggleSelectAll}
            />
            Select all tabs
          </label>
        </div>
        <ul id="tabs-list">{tabs}</ul>
      </div>
    );
  }

  _onTabActivated({ windowId, tabId }) {
    if (windowId !== this.props.windowId) {
      return;
    }

    this.setState(Object.assign({}, this.state, { activeTabId: tabId }));
  }

  _onTabCreated(tab) {
    if (tab.windowId !== this.props.windowId) {
      return;
    }

    const { filter, tabsById, tabIds } = this.state;
    tabsById.set(tab.id, {
      favIconUrl: tab.favIconUrl,
      id: tab.id,
      selected: false,
      title: tab.title,
      url: tab.url,
    });

    tabIds.splice(tab.index, 0, tab.id);

    this.setState({
      ...this.state,
      filteredTabs: this._filterTabs(filter),
    });
  }

  _onTabMoved(tabId, { windowId, fromIndex, toIndex }) {
    if (windowId !== this.props.windowId) {
      return;
    }

    const { filter, tabIds } = this.state;

    tabIds.splice(fromIndex, 1);
    tabIds.splice(toIndex, 0, tabId);

    this.setState({
      ...this.state,
      filteredTabs: this._filterTabs(filter),
    });
  }

  _onTabRemoved(tabId, { windowId, isWindowClosing }) {
    if (windowId !== this.props.windowId || isWindowClosing) {
      return;
    }

    const { filter, tabsById, tabIds } = this.state;
    const tabIndex = tabIds.indexOf(tabId);

    tabIds.splice(tabIndex, 1);
    tabsById.delete(tabId);

    this.setState({
      ...this.state,
      filteredTabs: this._filterTabs(this.state.filter),
    });
  }

  _onTabUpdated(tabId, changeInfo, tab) {
    if (tab.windowId != this.props.windowId) {
      return;
    }

    const tabInfo = this.state.tabsById.get(tabId);

    let changed = false;
    for (const key of ["favIconUrl", "title", "url"]) {
      if (changeInfo.hasOwnProperty(key)) {
        changed = true;
        tabInfo[key] = changeInfo[key];
      }
    }

    if (changed) {
      this.setState({
        ...this.state,
        filteredTabs: this._filterTabs(this.state.filter),
      });
    }
  }

  _onSelectionChanged(event, tabId) {
    const { selectAll, tabsById } = this.state;
    tabsById.get(tabId).selected = event.target.checked;

    this.setState(
      selectAll ? { ...this.state, selectAll: false } : { ...this.state },
    );
  }

  _onTabInfoClicked(event, tabId) {
    // If the user has clicked on a tab with either Meta (Cmd on
    // Mac OS keyboards, the "Windows" key on Windows keyboards),
    // or Shift is pressed, then clicking the LI will cause us
    // to switch to the clicked tab instead of selecting it.
    if (event.metaKey || event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      browser.tabs.update(tabId, { active: true });
    }
  }

  _filterTabs(filter) {
    const { tabIds, tabsById } = this.state;

    if (filter.length === 0) {
      return tabIds.slice();
    }

    filter = filter.toLowerCase();

    return tabIds.reduce((tabs, tabId) => {
      const tabInfo = tabsById.get(tabId);

      if (
        tabInfo.url.toLowerCase().includes(filter) ||
        tabInfo.title.toLowerCase().includes(filter)
      ) {
        tabs.push(tabId);
      }

      return tabs;
    }, []);
  }

  _onFilterChanged(event) {
    const filter = event.target.value;

    this.setState({
      ...this.state,
      filter,
      filteredTabs: this._filterTabs(filter),
    });
  }

  _toggleSelectAll(event) {
    const { tabsById } = this.state;
    const selectAll = event.target.checked;
    for (let [tabId, tab] of tabsById) {
      tab.selected = !tab.filtered && selectAll;
    }

    this.setState({
      ...this.state,
      selectAll,
    });
  }

  _getSelectedTabIds() {
    // prettier-ignore
    return Array
      .from(this.state.tabsById.values())
      .reduce((acc, { id, selected }) => {
        if (selected) {
          acc.push(id);
        }

        return acc;
      }, []);
  }

  _closeSelected() {
    browser.tabs.remove(this._getSelectedTabIds());
  }

  _gatherSelected() {
    const selectedTabs = this._getSelectedTabIds();
    const firstId = selectedTabs.shift();
    const index = this.state.tabIds.indexOf(firstId);

    browser.tabs.move(selectedTabs, { windowId: this.props.windowId, index });
  }
}

SideBar.propTypes = {
  windowId: PropTypes.number.isRequired,
};
