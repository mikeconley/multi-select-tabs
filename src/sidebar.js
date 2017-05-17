const MultiSelectTabs = {
  _windowId: null,

  get $tabsList() {
    delete this.$tabsList;
    this.$tabsList = document.getElementById("tabs-list");
    return this.$tabsList;
  },

  get $close() {
    delete this.$close;
    this.$close = document.getElementById("close");
    return this.$close;
  },

  get $gather() {
    delete this.$gather;
    this.$gather = document.getElementById("gather");
    return this.$gather;
  },

  /**
   * Initialize by first getting the list of tabs
   * for this window from the tabs API.
   */
  async init() {
    // First thing's first - we need to get our
    // window Id;
    let windowInfo = await browser.windows.getCurrent({populate: true});
    this._windowId = windowInfo.id;

    this.$close.addEventListener("click", this);
    this.$gather.addEventListener("click", this);

    browser.tabs.onActivated.addListener((activeInfo) => {
      this.onTabActivated(activeInfo);
    });

    browser.tabs.onCreated.addListener((tab) => {
      this.onTabCreated(tab);
    });

    browser.tabs.onRemoved.addListener((tab, removeInfo) => {
      this.onTabRemoved(tab, removeInfo);
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.onTabUpdated(tab, changeInfo);
    });

    this.renderTabs(windowInfo.tabs);
  },

  handleEvent(event) {
    switch(event.target.id) {
      case "close": {
        this.onClose(event);
        break;
      }
      case "gather": {
        this.onGather(event);
        break;
      }
    }
  },

  get selectedTabIds() {
    let selected = this.$tabsList.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(selected).map(cb => parseInt(cb.dataset.tabId, 10));
  },

  // Tab events
  onTabActivated(activeInfo) {
    if (activeInfo.windowId != this._windowId) {
      return;
    }

    let currentActive =
      this.$tabsList.querySelector('input[type="checkbox"][active]');
    currentActive.removeAttribute("active");

    let tabId = activeInfo.tabId;

    let newActive =
      this.$tabsList.querySelector(`input[type="checkbox"][data-tab-id="${tabId}"]`);
    newActive.setAttribute("active", true);
  },

  onTabCreated(tab) {
    if (tab.windowId != this._windowId) {
      return;
    }

    let index = tab.index;
    let li = this.createTabLIItem(tab);
    let listChildren = Array.from(this.$tabsList.children);
    if (index < listChildren.length) {
      let refNode = listChildren[index];
      this.$tabsList.insertBefore(li, refNode);
    } else {
      this.$tabsList.appendChild(li);
    }
  },

  onTabRemoved(tabId, removeInfo) {
    if (removeInfo.windowId != this._windowId || removeInfo.isWindowClosing) {
      return;
    }

    let checkbox =
      this.$tabsList.querySelector(`input[type="checkbox"][data-tab-id="${tabId}"]`);
    let target = checkbox.closest("li");
    if (target) {
      target.remove();
    }
  },

  onTabUpdated(tab, changeInfo) {
    if (tab.windowId != this._windowId) {
      return;
    }

    let tabId = tab.id;
    let label =
      this.$tabsList.querySelector(`input[type="checkbox"][data-tab-id="${tabId}"] ~ label`);
    label.textContent = tab.title;
  },

  // User events in the sidebar
  onClose(event) {
    browser.tabs.remove(this.selectedTabIds);
  },

  onGather(event) {
    let selectedTabs = this.selectedTabIds;
    let firstId = selectedTabs.shift();

    let checkbox =
      this.$tabsList.querySelector(`input[type="checkbox"][data-tab-id="${firstId}"]`);
    let firstLi = checkbox.closest("li");
    let index = Array.from(this.$tabsList.children).indexOf(firstLi) + 1;

    browser.tabs.move(selectedTabs, { windowId: this._windowId, index });
  },

  createTabLIItem(tab) {
    let tabId = "tab-" + tab.id;
    let li = document.createElement("li");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = tabId;
    checkbox.dataset.tabId = tab.id;

    let label = document.createElement("label");
    label.textContent = tab.title;
    label.setAttribute("for", tabId);

    if (tab.active) {
      checkbox.setAttribute("active", "true");
    }

    li.appendChild(checkbox);
    li.appendChild(label);
    return li;
  },

  renderTabs(tabs) {
    let frag = document.createDocumentFragment();
    for (let tab of tabs) {
      let li = this.createTabLIItem(tab);
      frag.appendChild(li);
    }

    this.$tabsList.appendChild(frag);
  }
};

addEventListener("load", () => {
  MultiSelectTabs.init();
});
