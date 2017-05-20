import "../dom";

import { shallow } from "enzyme";
import React from "react";

import TabInfo from "components/tabInfo";

const noop = function noop() {};

afterEach(() => browser.reset());

test("Rendering <TabInfo favIconUrl='...' />", () => {
  const info = {
    favIconUrl: "http://example.com/favicon.ico",
    id: 1,
    selected: false,
    title: "example.com",
    url: "http://example.com",
  };

  const tabInfo = shallow(
    <TabInfo
      active={false}
      tabInfo={info}
      onClick={noop}
      onSelectionChanged={noop}
    />,
  );

  expect(
    tabInfo.matchesElement(
      <li>
        <label>
          <input type="checkbox" />
          <img className="favicon" src="http://example.com/favicon.ico" />
          example.com
        </label>
      </li>,
    ),
  ).toBe(true);
});

test("Rendering <TabInfo favIconUrl={undefined} />", () => {
  const info = {
    id: 1,
    selected: false,
    title: "example.com",
    url: "http://example.com",
  };
  const tabInfo = shallow(
    <TabInfo
      active={false}
      tabInfo={info}
      onClick={noop}
      onSelectionChanged={noop}
    />,
  );

  const favIcon = tabInfo.find(".favicon");
  expect(favIcon.exists()).toBe(true);
  expect(favIcon.prop("src")).toBe(undefined);
  expect(tabInfo.hasClass("active")).toBe(false);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBeFalsy();
  expect(tabInfo.find("label").text()).toEqual("example.com");
});

test("Rendering <TabInfo active={true} />", () => {
  const info = {
    id: 1,
    selected: false,
    title: "example.com",
    url: "http://example.com",
  };
  const tabInfo = shallow(
    <TabInfo
      active={true}
      tabInfo={info}
      onClick={noop}
      onSelectionChanged={noop}
    />,
  );

  expect(tabInfo.hasClass("active")).toBe(true);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBeFalsy();
  expect(tabInfo.find("label").text()).toEqual("example.com");
});

test("Rendering <TabInfo selected={true} />", () => {
  const info = {
    id: 1,
    selected: true,
    title: "example.com",
    url: "http://example.com",
  };
  const tabInfo = shallow(
    <TabInfo
      active={false}
      tabInfo={info}
      onClick={noop}
      onSelectionChanged={noop}
    />,
  );

  expect(tabInfo.hasClass("active")).toBe(false);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBe(true);
  expect(tabInfo.find("label").text()).toEqual("example.com");
});

test("Rendering <TabInfo selected={true} active={true} />", () => {
  const info = {
    id: 1,
    selected: true,
    title: "example.com",
    url: "http://example.com",
  };
  const tabInfo = shallow(
    <TabInfo
      active={true}
      tabInfo={info}
      onClick={noop}
      onSelectionChanged={noop}
    />,
  );

  expect(tabInfo.hasClass("active")).toBe(true);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBe(true);
  expect(tabInfo.find("label").text()).toEqual("example.com");
});
