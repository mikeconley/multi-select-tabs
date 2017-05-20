import "../dom.js";

import { mount } from "enzyme";
import React from "react";
import browser from "sinon-chrome";

import SideBar from "components/sidebar";
import TabInfo from "components/tabInfo";

afterEach(() => browser.reset());

const testWindowId = 123;

test("<SideBar /> with 0 tabs", done => {
  browser.windows.get.withArgs(testWindowId, { populate: true }).returns(
    new Promise(resolve =>
      resolve({
        tabs: [],
      }),
    ),
  );

  const sidebar = mount(<SideBar windowId={testWindowId} />);

  setTimeout(() => {
    try {
      expect(browser.windows.get.called).toBe(true);
      expect(sidebar.find("#tabs-list").children().length).toEqual(0);
      done();
    } catch (e) {
      done.fail(e);
    }
  });
});

describe("<SideBar /> with multiple tabs", () => {
  const testTabs = [
    {
      id: 0,
      active: true,
      url: "http://example.com",
      title: "example.com",
    },
    {
      id: 1,
      url: "http://example.com/foo",
      favIconUrl: "http://example.com/favicon.ico",
      title: "example.com/foo",
    },
    {
      id: 2,
      url: "http://example.com/bar",
      title: "example.com/bar",
    },
  ];

  beforeEach(() => {
    browser.windows.get
      .withArgs(123, { populate: true })
      .returns(new Promise(resolve => resolve({ tabs: testTabs.slice() })));
  });

  test("rendering", done => {
    const sidebar = mount(<SideBar windowId={testWindowId} />);

    setTimeout(() => {
      try {
        expect(browser.windows.get.called).toBe(true);
        expect(sidebar.find("#tabs-list").children().length).toEqual(
          testTabs.length,
        );
        done();
      } catch (e) {
        done.fail(e);
      }
    });
  });

  test("moving tabs", done => {
    const sidebar = mount(<SideBar windowId={testWindowId} />);

    setTimeout(() => {
      try {
        expect(browser.windows.get.called).toBe(true);

        browser.tabs.onMoved.trigger(testTabs[0].id, {
          windowId: testWindowId,
          fromIndex: 0,
          toIndex: 2
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

        done();
      } catch (e) {
        done.fail(e);
      }
    });
  });
});
