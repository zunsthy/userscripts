// ==UserScript==
// @id          zunsthy-common-utils
// @name        Common Utils
// @category    utils
// @version     0.0.1
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/CommonUtils.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/CommonUtils.user.js
// @author      ZunSThy <zunsthy@gmail.com>
// @description some common methods
// @namespace   https://github.com/zunsthy
// @include     http://*
// @include     https://*
// @match       http://*/*
// @match       https://*/*
// @grant       none
// ==/UserScript==

(() => {
  const utils = window._utils = {};

  utils.random = n => Math.floor(Math.random() * n);
  const orandom = n => Math.random() * 2 - 1;
  utils.orandom = orandom;

  utils.normalDistrubution = (n) => {
    const m = n + n % 2;
    const arr = new Float64Array(m);

    for (let i = 0; i < m; i += 2) {
      let x, y, r;
      do {
        x = orandom();
        y = orandom();
        r = x * x + y * y;
      } while (r >= 1 || r === 0);
      const f = Math.sqrt(-2 * Math.log(r) / r);
      arr[i] = x * f;
      arr[i + 1] = y * f;
    }
    return arr;
  };

  const noop = () => {};
  utils.noop = noop;

  utils.seq = n => Array.apply(null, { length: n }).map(Function.call, Number);
  const flatten = arr => (Array.isArray(arr) ? Array.prototype.concat([], arr.map(flatten)) : arr);

  const compare = (a, b) => (a - b);
  const max = (arr, cmp = compare) => arr.reduce((m, a) => (cmp(m, a) > 0 ? m : a, arr[0]));
  utils.max = max;
  utils.min = (arr, cmp = compare) => arr.reduce((m, a) => (cmp(m, a) < 0 ? m : a, arr[0]));

  utils.blobToText = (blob, cb) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (ev) => {
      cb(ev.srcElement.result);
    });
    reader.readAsText(blob);
  };
  utils.blobToText2 = (blob, cb) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (ev) => {
      const result = ev.srcElement.result;
      cb(new TextDecoder('utf-8').decode(result));
    });
    reader.readAsArrayBuffer(blob);
  };

  utils.getCookies = () => {
    const cookies = Object.create(null);
    if (!document.cookie) return cookies;
    document.cookie.split('; ').forEach((str) => {
      const sp = str.indexOf('=');
      const name = decodeURIComponent(str.slice(0, sp));
      const value = decodeURIComponent(str.slice(sp + 1));

      cookies[name] = value;
    });
    return cookies;
  };

  const getParsedUrl = (url) => new URL(url || location.href);
  utils.getParsedUrl = getParsedUrl;
  utils.getQuery = (url) => getParsedUrl(url).searchParams();

  utils.histogram = (arr, min, max, step) => {
    const n = Math.ceil((max - min) / step);
    const out = new Int32Array(n);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] >= min && arr[i] <= max) {
        out[Math.floor((arr[i] - min) / step)]++;
      }
    }
    return out;
  };

  utils.printHistogram = (his, width, print) => {
    const m = max(his);
    const chart = new Int32Array(his.length);
    for (let i = 0; i < his.length; i++) {
      chart[i] = his[i] / max * width;
      if (print) print(chart[i]);
    }
    return chart;
  };

  utils.serialExecute = list => (finnal = noop) =>
    list.reverse().reduce((next, last) => (err, data) => err ? next(data) : last(data, next), finnal);

  const walker = function *(type, root) {
    const walker = document.createTreeWalker(
      root || document.body,
      type || NodeFilter.SHOW_TEXT,
      null,
      false);
    while (walker.nextNode()) yield walker.currentNode;
  };
  utils.walker = walker;
  utils.getAllElements = () => walker(NodeFilter.SHOW_ELEMENT);

  utils.nodeIterator = function *(type, root) {
    const result = document.createNodeIterator(
      root || document.body,
      type || NodeFilter.SHOW_TEXT);
    while (result.nextNode()) yield result.referenceNode;
  };

  utils.xpathIterator = function *(path, root) {
    const result = document.evaluate(
      path || '//*/text()',
      root || document,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null);
    let node = null;
    while (node = result.iterateNext()) yield node;
  };

  utils.nodeByType = function *(type) {
    const list = document.querySelectorAll('body, body *');
    const ntype = type || Node.TEXT_NODE;
    const nodeList = [];
    for (let i = 0; i < list.length; i++) {
      const children = list[i].childNodes;
      if (!children || !children.length) continue;
      for (let j = 0; j < children.length; j++) {
        if (children[j].nodeType === ntype) {
          yield children[j];
        }
      }
    }
    return nodeList;
  };

  const pad = (str, bit = 2, padding = '0') => padding.repeat(bit).concat(str).slice(-bit);
  utils.pad = pad;

  utils.copy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };

  const formatDate = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  utils.formatDate = formatDate;
  const formatTime = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  utils.formatTime = formatTime;
  utils.formatDateTime = (date = new Date()) => formatDate(date) + ' ' + foramtTime(date);
})();
