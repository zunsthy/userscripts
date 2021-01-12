// ==UserScript==
// @id          zunsthy-common-utils
// @name        Common Utils
// @category    utils
// @version     0.0.3
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

  const comparator = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return String.prototype.localeCompare.call(`${a}`, `${b}`);
    }
  };
  const max = (arr, cmp = comparator) => arr.reduce((m, a) => (cmp(m, a) > 0 ? m : a), arr[0]);
  utils.max = max;
  const min = (arr, cmp = comparator) => arr.reduce((m, a) => (cmp(m, a) < 0 ? m : a), arr[0]);
  utils.min = min;

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

  const tBase64StringToUint8Array = (b64str) => {
    const b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const arr = [];
    const buf = [];
    for (let i = 0; i < b64str.length; i++) {
      const c = b64str.charAt(i);
      const idx = b.indexOf(c);
      if (idx === -1) continue;
      arr.push(idx);
    }
    for (let i = 0; i < arr.length; i+=4) {
      const n1 = arr[i];
      const n2 = arr[i+1];
      const n3 = arr[i+2] || 0;
      const n4 = arr[i+3] || 0;
      const c1 = ((n1      ) << 2) | (n2 >> 4);
      const c2 = ((n2 & 0xf) << 4) | (n3 >> 2);
      const c3 = ((n3 & 0x3) << 6) | (n4     );
      buf.push(c1);
      if (n3 !== 64) buf.push(c2);
      if (n4 !== 64) buf.push(c3);
    }
    return new Uint8Array(buf);
  };

  const tUint8ArrayToString = (buf) => {
    const arr = [];
    for (let i = 0; i < buf.length; i++) {
      const c = buf[i];
      const h = c >> 4; // hhhh llll
      if (h < 0x08) {        // 0xxx
        arr.push(String.fromCharCode(c));
      } else if (h < 0x0c) { // 10xx
      } else if (h < 0x0e) { // 110x
        const c2 = buf[++i];
        arr.push(String.fromCodePoint(
            ((c  & 0x1f) << 6)
          | ((c2 & 0x3f)     )
        ));
      } else if (h < 0x0f) { // 1110
        const c2 = buf[++i];
        const c3 = buf[++i];
        arr.push(String.fromCodePoint(
            ((c  & 0x0f) << 12)
          | ((c2 & 0x3f) << 6)
          | ((c3 & 0x3f)     )
        ));
      } else {  // 1111
        console.error(`wrong char code at ${i}: ${n}`);
      }
    }
    return arr.join('');
  };

  utils.tBase64StringToUint8Array = tBase64StringToUint8Array;
  utils.tUint8ArrayToString = tUint8ArrayToString;
  utils.tBase64StringToUtf8String = s => tUint8ArrayToString(tUint8ArrayToString(s));
})();
