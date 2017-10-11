import PropTypes from "prop-types";
import React from "react";

import TabInfo from "components/tabInfo";

export default class SideBar extends React.Component {
  state = {
    activeTabId: null,
    filter: "",
    selectAll: false,
    selectByClick: false,
    tabsById: new Map(),
    tabIds: [],
    filteredTabs: [],
    moreActionsShown: false,
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
    this._onTabAttached = this._onTabAttached.bind(this);
    this._onTabDetached = this._onTabDetached.bind(this);

    this._onFilterChanged = this._onFilterChanged.bind(this);
    this._onSelectionChanged = this._onSelectionChanged.bind(this);
    this._onTabInfoClicked = this._onTabInfoClicked.bind(this);
    this._toggleSelectAll = this._toggleSelectAll.bind(this);
    this._gatherSelected = this._gatherSelected.bind(this);
    this._hasPinnedTabs = this._hasPinnedTabs.bind(this);
    this._closeSelected = this._closeSelected.bind(this);
    this._reloadSelected = this._reloadSelected.bind(this);
    this._pinSelected = this._pinSelected.bind(this);
    this._moveSelectedToNewWindow = this._moveSelectedToNewWindow.bind(this);
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
    browser.tabs.onDetached.addListener(this._onTabDetached);
    browser.tabs.onAttached.addListener(this._onTabAttached);

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
        pinned: tab.pinned,
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
    browser.tabs.onDetached.removeListener(this._onTabDetached);
    browser.tabs.onAttached.removeListener(this._onTabAttached);
  }

  render() {
    const {
      activeTabId,
      filter,
      filteredTabs,
      selectAll,
      tabIds,
      tabsById,
      moreActionsShown,
    } = this.state;

    const tabs = filteredTabs.map(tabId => {
      const tabInfo = tabsById.get(tabId);
      const tabFilteredIndex = filteredTabs.indexOf(tabId);


      return (
        <TabInfo
          key={tabInfo.id}
          active={activeTabId === tabId}
          tabInfo={tabInfo}
          onClick={this._onTabInfoClicked}
          onSelectionChanged={this._onSelectionChanged}
          pinned={tabInfo.pinned} />
      );
    });

    const pinnedInfoTitle = this._hasPinnedTabs(filteredTabs)
      ? <li id="pinInfo">Pinned tabs</li>
      : null;

    const selectedTabsCount = this._getSelectedTabIds().length;
    const moreActionsClasses = !moreActionsShown ? "hidden" : "";

    const hasSelectedPinnedTabs = this._hasPinnedTabs(
      this._getSelectedTabIds(),
    );

    return (
      <div id="sidebar">
        <div id="controls">
          <div id="counter">
            {selectedTabsCount} / {this.state.tabIds.length} tabs selected
          </div>
          <div id="actions">
            <button
              id="close"
              onClick={() => this._closeSelected()}
              disabled={hasSelectedPinnedTabs}>
              Close
            </button>
            <button
              id="gather"
              onClick={() => this._gatherSelected()}
              disabled={hasSelectedPinnedTabs}>
              Gather
            </button>
            <button id="more" onClick={() => this._toggleMore()}>
              ...
            </button>
          </div>
          <div id="moreActions" className={moreActionsClasses}>
            <button
              id="moveToWindow"
              onClick={() => this._moveSelectedToNewWindow()}>
              Create new window
            </button>
            <button id="reload" onClick={() => this._reloadSelected()}>
              Reload
            </button>
            <button id="pin" onClick={() => this._pinSelected()}>
              (Un)Pin
            </button>
          </div>
        </div>
        <div id="content">
          <input
            id="filter"
            className="block"
            type="text"
            placeholder="Filter tabs…"
            onChange={e => this._onFilterChanged(e)} />
          <label className="block">
            <input
              id="select-all"
              type="checkbox"
              onChange={e => this._toggleSelectAll(e)}
              checked={selectAll} />
            Select all tabs
          </label>

          <label className="block">
            <input
              id="select-click"
              type="checkbox"
              onChange={e => this._toggleSelectClick(e)} />
            Select by clicking on tabs
          </label>

          <ul id="tabs-list">
            {pinnedInfoTitle}
            {tabs}
          </ul>
        </div>
      </div>
    );
  }

  _onTabActivated({ windowId, tabId }) {
    if (windowId !== this.props.windowId) {
      return;
    }

    const state = this.state;
    const newTabsById = new Map(state.tabsById.entries());
    const newTab = newTabsById.get(tabId);
    if (state.selectByClick && !newTab.filtered) {
      this._onSelectionChanged({ target: { checked: true } }, tabId);
    }

    this.setState({
      activeTabId: tabId,
      tabsById: newTabsById,
    });
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
      pinned: tab.pinned,
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

    // When attaching a tab to a window
    // updated can be called before
    // _onTabAttached was called.
    if (tabInfo == undefined) {
      return;
    }

    let changed = false;
    for (const key of ["favIconUrl", "title", "url", "pinned"]) {
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

  async _onTabAttached(tabId, attachInfo) {
    const tab = await browser.tabs.get(tabId);
    this._onTabCreated(tab);
  }

  _onTabDetached(tabId, detachInfo) {
    this._onTabRemoved(tabId, {
      windowId: detachInfo.oldWindowId,
      isWindowClosing: false,
    });
  }

  _onSelectionChanged(event, tabId) {
    const { tabsById, filteredTabs, selectAll } = this.state;

    tabsById.get(tabId).selected = event.target.checked;

    const hasOnlySelectedTabs = filteredTabs.every(id => tabsById.get(id).selected);
    
    if (hasOnlySelectedTabs) {
      this.setState({ ...this.state, selectAll: true });
    } else {
      this.setState(
        selectAll ? { ...this.state, selectAll: false } : { ...this.state },
      );
    }
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

  _toggleMore() {
    this.setState({ moreActionsShown: !this.state.moreActionsShown });
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
    const { selectAll } = this.state;

    const filteredTabs = this._filterTabs(filter);
    const tabsById = this._selectAll(
      filteredTabs,
      selectAll,
      this.state.tabsById,
    );

    this.setState({
      ...this.state,
      filter,
      filteredTabs: filteredTabs,
      tabsById,
    });
  }

  _toggleSelectAll(event) {
    const { filteredTabs, tabsById } = this.state;
    const selectAll = event.target.checked;

    this.setState({
      ...this.state,
      selectAll,
      tabsById: this._selectAll(filteredTabs, selectAll, tabsById),
    });
  }

  _selectAll(filteredTabs, selectAll, tabsById) {
    const newTabsById = new Map(
      Array.from(tabsById.entries()).map(([k, v]) => [
        k,
        Object.assign({}, v, { selected: !selectAll }),
      ]),
    );

    for (const tabId of filteredTabs) {
      newTabsById.get(tabId).selected = selectAll;
    }

    return newTabsById;
  }

  _toggleSelectClick(event) {
    this.setState({ selectByClick: event.target.checked });
  }

  _getSelectedTabIds() {
    // prettier-ignore
    return Array
      .from(this.state.tabsById.values())
      .reduce((selectedTabs, { id, selected }) => {
        if (selectedTabs && selected) {
          selectedTabs.push(id);
        }

        return selectedTabs;
      }, []);
  }

  _hasPinnedTabs(filteredTabs) {
    const { tabsById } = this.state;

    return filteredTabs.some(id => tabsById.get(id).pinned);
  }

  _closeSelected() {
    browser.tabs.remove(this._getSelectedTabIds());
  }

  _reloadSelected() {
    const selectedTabIds = this._getSelectedTabIds();

    for (const id of selectedTabIds) {
      browser.tabs.reload(id);
    }
  }

  _pinSelected() {
    const selectedTabIds = this._getSelectedTabIds();
    const { tabsById } = this.state;

    selectedTabIds.forEach(tabId => {
      const currentPinStatus = tabsById.get(tabId).pinned;
      browser.tabs.update(tabId, { pinned: !currentPinStatus });
    });
  }

  async _moveSelectedToNewWindow() {
    const selectedTabs = this._getSelectedTabIds();
    const newWindow = await browser.windows.create({
      tabId: selectedTabs.shift(),
    });
    browser.tabs.move(selectedTabs, { windowId: newWindow.id, index: 1 });
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
