import {JSDOM} from "jsdom";
import browser from "sinon-chrome";

const copyProps = function copyProps(src, target) {
  const props = Object
    .getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop));

  Object.defineProperties(target, props);
}

global.browser = browser;
global.window = new JSDOM("<!doctype html><html><body></body></html>").window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};

copyProps(window, global);
