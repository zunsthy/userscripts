// ==UserScript==
// @id          weibo-utils
// @name        weibo utils
// @category    utils
// @version     1.0.0
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/WeiboUtils.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/WeiboUtils.user.js
// @author      ZunSThy <zunsthy@gmail.com>
// @description some quick utils method for weibo.com/m.weibo.cn
// @namespace   https://github.com/zunsthy
// @include     https://weibo.com/*
// @include     https://m.weibo.cn/*
// @match       https://weibo.com/*
// @match       https://m.weibo.cn/*
// @grant       none
// ==/UserScript==

((utils) => {
const reUrlStr = /.+?(?=(?:.{4})+$|$)/g
const reMID = /.+?(?=(?:.{7})+$|$)/g

const mUrlHost = 'm.weibo.cn'
const webUrlHost = 'weibo.com'

const reCheckMID = /^\d{15,}/

const map = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const len = map.length

const pInt = (s) => parseInt(s, 10)
const tInt = (n) => n.toString(10)

const wbStringToID = (s) => tInt(s.split('').reduce((r, c) => r * len + map.indexOf(c), 0))
const wbIDToString = (i) => {
  let s = ''
  for (let n = pInt(i); n > 0; r = n % len, s = map[r] + s, n = (n - r) / len);
  return s
}

const toMID = (wid) => {
  let id = ''
  for (let r, i; r = reUrlStr.exec(wid, reUrlStr.lastIndex); id += id ? i.padStart(7, '0') : i)
    i = wbStringToID(r[0])
  return id
}
const toUrlStr = (mid) => {
  let str = ''
  for (let r, s; r = reMID.exec(mid, reMID.lastIndex); str += s)
    s = wbIDToString(r[0])
  return str
}

const trans = (u) => {
  const url = new URL(u)
  const pieces = url.pathname.split('/')
  if (!pieces[2]) reutrn
  if (mUrlHost === url.hostname || reCheckMID.test(pieces[2])) return toUrlStr(pieces[2])
  if (webUrlHost === url.hostname) return toMID(pieces[2])
}

const getShareUrl = (u) => {
  const url = new URL(u)
  const pieces = url.pathname.split('/')
  const mid = reCheckMID.test(pieces[2]) ? pieces[2] : toMID(pieces[2])
  const uid = mUrlHost === url.hostname ? document.querySelector('a.m-img-box').href.match(/\d+/)[0] : pieces[1]
  return `https://${webUrlHost}/${uid}/${mid}`
}

utils.trans = (u = window.location) => trans(u)
utils.getShareUrl = (u = window.location) => getShareUrl(u)
})(window._WBUtils = window._WBUtils || {})
