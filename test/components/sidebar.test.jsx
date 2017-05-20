import "../dom";
import { defer } from "../util";

import { mount } from "enzyme";
import React from "react";
import browser from "sinon-chrome";

import SideBar from "components/sidebar";
import TabInfo from "components/tabInfo";

const testWindowId = 123;

afterEach(() => browser.reset());

describe("<SideBar /> with no tabs", () => {
  let sidebar;

  beforeEach(async done => {
    browser.windows.get
      .withArgs(testWindowId, { populate: true })
      .returns(new Promise(resolve => resolve({ tabs: [] })));

    sidebar = mount(<SideBar windowId={testWindowId} />);
    await defer().then(done);
  });

  test("rendering", () => {
    expect(browser.windows.get.called).toBe(true);
    expect(sidebar.find("#tabs-list").children().length).toEqual(0);
  })
})

describe("<SideBar /> with multiple tabs", () => {
  const testTabs = [
    {
      id: 0,
      active: true,
      url: "http://example.com",
      title: "example.com",
      windowId: testWindowId,
    },
    {
      id: 1,
      url: "http://example.com/foo",
      favIconUrl: "http://example.com/favicon.ico",
      title: "example.com/foo",
      windowId: testWindowId,
    },
    {
      id: 2,
      url: "http://example.com/bar",
      title: "example.com/bar",
      windowId: testWindowId,
    },
  ];

  let sidebar;

  beforeEach(async done => {
    const tabsCopy = testTabs.map(obj => ({...obj}));
    browser.windows.get
      .withArgs(123, { populate: true })
      .returns(new Promise(resolve => resolve({ tabs: tabsCopy })));

    sidebar = mount(<SideBar windowId={testWindowId} />);
    await defer().then(done);
  });

  afterEach(() => sidebar = undefined);

  test("rendering", () => {
    expect(browser.windows.get.called).toBe(true);
    expect(sidebar.find("#tabs-list").children().length).toEqual(
      testTabs.length,
    );
  });

  test("moving tabs", () => {
    expect(browser.windows.get.called).toBe(true);

    browser.tabs.onMoved.trigger(testTabs[0].id, {
      windowId: testWindowId,
      fromIndex: 0,
      toIndex: 2,
    });

    expect(sidebar.state().tabIds).toEqual([
      testTabs[1].id,
      testTabs[2].id,
      testTabs[0].id,
    ]);

    const tabs = sidebar.find(TabInfo);

    expect(tabs.length).toBe(3);
    expect(tabs.at(0).props().tabId).toBe(testTabs[1].id);
    expect(tabs.at(1).props().tabId).toBe(testTabs[2].id);
    expect(tabs.at(2).props().tabId).toBe(testTabs[0].id);
  });

  test("creating tabs", () => {
    expect(browser.windows.get.called).toBe(true);

    browser.tabs.onCreated.trigger({
      favIconUrl: "http://example.com/baz.ico",
      id: 4,
      title: "example.com/baz",
      url: "http://example.com/baz",
      windowId: testWindowId,
      index: 3,
    });

    expect(sidebar.state().tabIds).toEqual([
      testTabs[0].id,
      testTabs[1].id,
      testTabs[2].id,
      4,
    ]);

    const tabs = sidebar.find(TabInfo);

    expect(tabs.length).toBe(4);
    expect(tabs.at(0).props().tabId).toBe(testTabs[0].id);
    expect(tabs.at(1).props().tabId).toBe(testTabs[1].id);
    expect(tabs.at(2).props().tabId).toBe(testTabs[2].id);
    expect(tabs.at(3).props().tabId).toBe(4);
  });

  test("removing tabs", () => {
    expect(browser.windows.get.called).toBe(true);

    browser.tabs.onRemoved.trigger(testTabs[1].id, {
      windowId: testWindowId,
      isWindowClsoing: false,
    });

    expect(sidebar.state().tabIds).toEqual([
      testTabs[0].id,
      testTabs[2].id,
    ]);

    const tabs = sidebar.find(TabInfo);

    expect(tabs.length).toBe(2);
    expect(tabs.at(0).props().tabId).toBe(testTabs[0].id);
    expect(tabs.at(1).props().tabId).toBe(testTabs[2].id);
  });

  test("updating tabs", () => {
    expect(browser.windows.get.called).toBe(true);
    
    let tabs = sidebar.find(TabInfo);
    expect(tabs.at(0).find("img").length).toBe(0);
    expect(tabs.at(1).find("img").length).toBe(1);

    browser.tabs.onUpdated.trigger(
      testTabs[0].id,
      { favIconUrl: "http://example.com/favicon.ico" },
      testTabs[0],
    );

    expect(sidebar.state().tabsById.get(testTabs[0].id).favIconUrl).toEqual(
      "http://example.com/favicon.ico",
    );

    expect(tabs.at(0).find("img").length).toBe(1);
    
    browser.tabs.onUpdated.trigger(
      testTabs[1].id,
      {
        title: "foo bar baz",
        url: "http://example.com/foobarbaz",
        favIconUrl: undefined,
      },
      testTabs[1],
    );

    const tabInfo = sidebar.state().tabsById.get(testTabs[1].id);

    expect(tabInfo.title).toEqual("foo bar baz");
    expect(tabInfo.hasOwnProperty("favIconUrl")).toBe(true);
    expect(tabInfo.favIconUrl).toEqual(undefined);
    expect(tabInfo.url).toEqual("http://example.com/foobarbaz");

    expect(tabs.at(1).find("img").length).toBe(0);
  });
});
