import "../dom";

import { shallow } from "enzyme";
import React from "react";

import TabInfo from "components/tabInfo";

afterEach(() => browser.reset());

test("Rendering <TabInfo favIconUrl='...' />", () => {
  const tabInfo = shallow(
    <TabInfo
      tabId={1}
      url="http://example.com"
      favIconUrl="http://example.com/favicon.ico"
      title="example.com"
    />,
  );

  expect(
    tabInfo.matchesElement(
      <li className="">
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
  const tabInfo = shallow(
    <TabInfo tabId={1} url="http://example.com" title="example.com" />,
  );

  expect(tabInfo.find("img").length).toBe(0);
  expect(tabInfo.hasClass("filtered")).toBe(false);
  expect(tabInfo.hasClass("active")).toBe(false);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBeFalsy();
  expect(tabInfo.find("label").text()).toEqual("example.com");
});

test("Rendering <TabInfo filtered={true} />", () => {
  const tabInfo = shallow(
    <TabInfo
      tabId={1}
      url="http://example.com"
      title="example.com"
      filtered={true}
    />,
  );

  expect(tabInfo.hasClass("filtered")).toBe(true);
  expect(tabInfo.hasClass("active")).toBe(false);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBeFalsy();
  expect(tabInfo.find("label").text()).toEqual("example.com");
});

test("Rendering <TabInfo active={true} />", () => {
  const tabInfo = shallow(
    <TabInfo
      tabId={1}
      url="http://example.com"
      title="example.com"
      active={true}
    />,
  );

  expect(tabInfo.hasClass("active")).toBe(true);
  expect(tabInfo.hasClass("filtered")).toBe(false);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBeFalsy();
  expect(tabInfo.find("label").text()).toEqual("example.com");
});

test("Rendering <TabInfo filtered={true} active={true} />", () => {
  const tabInfo = shallow(
    <TabInfo
      tabId={1}
      url="http://example.com"
      title="example.com"
      active={true}
      filtered={true}
    />,
  );

  expect(tabInfo.hasClass("filtered")).toBe(true);
  expect(tabInfo.hasClass("active")).toBe(true);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBeFalsy();
  expect(tabInfo.find("label").text()).toEqual("example.com");
});

test("Rendering <TabInfo selected={true} />", () => {
  const tabInfo = shallow(
    <TabInfo
      tabId={1}
      url="http://example.com"
      title="example.com"
      selected={true}
    />,
  );

  expect(tabInfo.hasClass("filtered")).toBe(false);
  expect(tabInfo.hasClass("active")).toBe(false);
  expect(tabInfo.find("[type='checkbox']").props().checked).toBe(true);
  expect(tabInfo.find("label").text()).toEqual("example.com");
});
