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
  });
});

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
    const tabsCopy = testTabs.map(obj => ({ ...obj }));
    browser.windows.get
      .withArgs(123, { populate: true })
      .returns(new Promise(resolve => resolve({ tabs: tabsCopy })));

    sidebar = mount(<SideBar windowId={testWindowId} />);
    await defer().then(done);
  });

  afterEach(() => (sidebar = undefined));

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
    expect(tabs.at(0).props().tabInfo.id).toBe(testTabs[1].id);
    expect(tabs.at(1).props().tabInfo.id).toBe(testTabs[2].id);
    expect(tabs.at(2).props().tabInfo.id).toBe(testTabs[0].id);
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
    expect(tabs.at(0).props().tabInfo.id).toBe(testTabs[0].id);
    expect(tabs.at(1).props().tabInfo.id).toBe(testTabs[1].id);
    expect(tabs.at(2).props().tabInfo.id).toBe(testTabs[2].id);
    expect(tabs.at(3).props().tabInfo.id).toBe(4);
  });

  test("removing tabs", () => {
    expect(browser.windows.get.called).toBe(true);

    browser.tabs.onRemoved.trigger(testTabs[1].id, {
      windowId: testWindowId,
      isWindowClsoing: false,
    });

    expect(sidebar.state().tabIds).toEqual([testTabs[0].id, testTabs[2].id]);

    const tabs = sidebar.find(TabInfo);
    expect(tabs.length).toBe(2);
    expect(tabs.at(0).props().tabInfo.id).toBe(testTabs[0].id);
    expect(tabs.at(1).props().tabInfo.id).toBe(testTabs[2].id);
  });

  test("updating tabs", () => {
    expect(browser.windows.get.called).toBe(true);

    const tabs = sidebar.find(TabInfo);
    expect(tabs.at(0).props().tabInfo.favIconUrl).toBe(undefined);
    expect(tabs.at(1).props().tabInfo.favIconUrl).toBe(testTabs[1].favIconUrl);

    browser.tabs.onUpdated.trigger(
      testTabs[0].id,
      { favIconUrl: "http://example.com/favicon.ico" },
      testTabs[0],
    );

    expect(sidebar.state().tabsById.get(testTabs[0].id).favIconUrl).toEqual(
      "http://example.com/favicon.ico",
    );

    expect(tabs.at(0).props().tabInfo.favIconUrl).toBe(
      "http://example.com/favicon.ico",
    );

    browser.tabs.onUpdated.trigger(
      testTabs[1].id,
      {
        title: "foo bar baz",
        url: "http://example.com/foobarbaz",
        favIconUrl: undefined,
      },
      testTabs[1],
    );

    expect(tabs.at(1).props().tabInfo.favIconUrl).toEqual(undefined);

    const tabInfo = sidebar.state().tabsById.get(testTabs[1].id);
    expect(tabInfo.title).toEqual("foo bar baz");
    expect(tabInfo.hasOwnProperty("favIconUrl")).toBe(true);
    expect(tabInfo.favIconUrl).toEqual(undefined);
    expect(tabInfo.url).toEqual("http://example.com/foobarbaz");
  });

  test("select all", () => {
    const selectAll = sidebar.find("#select-all");
    const tabs = sidebar.find(TabInfo);
    for (let i = 0; i < tabs.length; i++) {
      expect(tabs.at(i).props().tabInfo.selected).toBe(false);
    }

    selectAll.simulate("change", { target: { checked: true } });
    expect(selectAll.props().checked).toBe(true);
    for (let i = 0; i < tabs.length; i++) {
      expect(tabs.at(i).props().tabInfo.selected).toBe(true);
    }

    selectAll.simulate("change", { target: { checked: false } });
    expect(selectAll.props().checked).toBe(false);
    for (let i = 0; i < tabs.length; i++) {
      expect(tabs.at(i).props().tabInfo.selected).toBe(false);
    } 

    sidebar.find(TabInfo).find("input[type='checkbox']").forEach(node => {
      node.simulate("change", { target: { checked: true } });
    });

    expect(selectAll.props().checked).toBe(false);
    for (let i = 0; i < tabs.length; i++) {
      expect(tabs.at(i).props().tabInfo.selected).toBe(true);
    }

    selectAll.simulate("change", { target: { checked: true } });
    expect(selectAll.props().checked).toBe(true);
    for (let i = 0; i < tabs.length; i++) {
      expect(tabs.at(i).props().tabInfo.selected).toBe(true);
    }

    tabs.at(1).find("input[type='checkbox']").simulate("change", {
      target: { checked: false },
    });

    expect(selectAll.props().checked).toBe(false);
    expect(tabs.at(1).props().tabInfo.selected).toBe(false);
    expect(tabs.at(0).props().tabInfo.selected).toBe(true);
    expect(tabs.at(2).props().tabInfo.selected).toBe(true);
  });
});
