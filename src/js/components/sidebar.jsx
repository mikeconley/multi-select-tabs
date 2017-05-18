import PropTypes from "prop-types";
import React from "react";

export default class SideBar extends React.Component {
  state = {
    activeTabId: null,
    tabsBydId: new Map(),
    tabIds: [],
  };

  async componentDidMount() {
    const info = await browser.windows.get(this.props.windowId, {
      populate: true,
    });

    browser.tabs.onActivated.addListener(this._onTabActivated.bind(this));
    browser.tabs.onCreated.addListener(this._onTabCreated.bind(this));
    browser.tabs.onMoved.addListener(this._onTabMoved.bind(this));
    browser.tabs.onRemoved.addListener(this._onTabRemoved.bind(this));
    browser.tabs.onUpdated.addListener(this._onTabUpdated.bind(this));

    const tabsById = new Map();
    const tabIds = [];
    let activeTabId = null;

    for (const tab of info.tabs) {
      tabIds.push(tab.id);
      tabsById.set(tab.id, {
        faviconUrl: tab.faviconUrl,
        id: tab.id,
        selected: false,
        title: tab.title,
      });

      if (tab.active) {
        activeTabId = tab.id;
      }
    }

    this.setState({ activeTabId, tabsById, tabIds });
  }

  render() {
    const { activeTabId, tabsById, tabIds } = this.state;
    const tabs = tabIds.map(tabId =>
      this._renderTab(tabId, activeTabId == tabId, tabsById.get(tabId)),
    );

    return (
      <div id="sidebar">
        <div id="controls">
          <button id="close" onClick={() => this._closeSelected()}>
            Close
          </button>
          <button id="gather" onClick={() => this._gatherSelected()}>
            Gather
          </button>
        </div>
        <ul>{tabs}</ul>
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

    const { tabsById, tabIds } = this.state;
    tabsById.set(tab.id, {
      faviconUrl: tab.faviconUrl,
      id: tab.id,
      title: tab.title,
    });

    tabIds.splice(tab.index, 0, tab.id);

    this.setState(Object.assign({}, this.state));
  }

  _onTabMoved(tabId, { windowId, fromIndex, toIndex }) {
    if (windowId !== this.props.windowId) {
      return;
    }

    const { tabIds } = this.state;

    tabIds.splice(fromIndex, 1);
    tabIds.splice(toIndex, 0, tabId);

    this.setState(Object.assign({}, this.state));
  }

  _onTabRemoved(tabId, { windowId, isWindowClosing }) {
    if (windowId !== this.props.windowId || isWindowClosing) {
      return;
    }

    const { tabsById, tabIds } = this.state;
    const tabIndex = tabIds.indexOf(tabId);

    tabIds.splice(tabIndex, 1);
    tabsById.delete(tabId);

    this.setState(Object.assign({}, this.state));
  }

  _onTabUpdated(tabId, changeInfo, tab) {
    if (tab.windowId != this.props.windowId) {
      return;
    }

    const tabInfo = this.state.tabsById.get(tabId);

    let changed = false;
    for (const key of ["faviconURL", "title"]) {
      if (changeInfo[key]) {
        changed = true;
        tabInfo[key] = changeInfo[key];
      }
    }

    if (changed) {
      this.setState(Object.assign({}, this.state));
    }
  }

  _onSelectionChanged(event, tabId) {
    const { tabsById } = this.state;
    tabsById.get(tabId).selected = event.target.checked;

    this.setState(Object.assign({}, this.state));
  }

  _renderTab(tabId, isTabActive, { selected, title }) {
    const className = isTabActive ? { className: "active" } : {};

    return (
      <li key={tabId}>
        <label {...className}>
          <input
            type="checkbox"
            checked={selected}
            onChange={e => this._onSelectionChanged(e, tabId)}
          />
          {title}
        </label>
      </li>
    );
  }

  _getSelectedTabIds() {
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
    console.log(this._getSelectedTabIds());
    browser.tabs.remove(this._getSelectedTabIds());
  }

  _gatherSelected() {
    const selectedTabs = this._getSelectedTabIds();
    const firstId = selectedTabs.shift();
    const index = this.state.tabIds.indexOf(firstId);

    browser.tabs.move(selectedTabs, { windowId: this.props.windowId, index })
  }
}

SideBar.PropTypes = {
  windowId: PropTypes.number,
};
