import "../dom.js";

import { mount } from "enzyme";
import React from "react";
import browser from "sinon-chrome";

import SideBar from "components/sidebar";

afterEach(() => browser.reset());

test("<SideBar /> with 0 tabs", done => {
  browser.windows.get.withArgs(123, { populate: true }).returns(
    new Promise(resolve =>
      resolve({
        tabs: [],
      }),
    ),
  );

  const sidebar = mount(<SideBar windowId={123} />);

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

test("<SideBar /> with multiple tabs", done => {
  browser.windows.get.withArgs(123, { populate: true }).returns(
    new Promise(resolve =>
      resolve({
        tabs: [
          {
            id: 0,
            active: true,
            url: "http://example.com",
            favIconUrl: undefined,
            title: "example.com",
          },
          {
            id: 1,
            url: "http://example.com/foo",
            favIconUrl: "http://example.com/favicon.ico",
            title: "example.com/foo",
          },
        ],
      }),
    ),
  );

  const sidebar = mount(<SideBar windowId={123} />);

  setTimeout(() => {
    try {
      expect(browser.windows.get.called).toBe(true);
      expect(sidebar.find("#tabs-list").children().length).toEqual(2);
      done();
    } catch (e) {
      done.fail(e);
    }
  });
});
