// ==UserScript==
// @id          zunsthy-auto-click-like-qzone
// @name        Auto Click Like (user.qzone.qq.com)
// @icon        https://user.qzone.qq.com/favicon.ico
// @category    utils
// @version     1.0.0
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/AutoClickLike.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/AutoClickLike.user.js
// @author      ZunSThy <zunsthy@gmail.com>
// @description auto click like button when browse qzone infocenter
// @namespace   https://github.com/zunsthy
// @match       https://user.qzone.qq.com/*/infocenter
// @include     https://user.qzone.qq.com/*/infocenter
// @grant       none
// ==/UserScript==

setTimeout(() => {
  let off = false;
  const unlikes = [];
  const checkLikeStatus = el => el.parentNode.classList.contains('item-on');
  const random = n => (Math.floor(Math.random() * n * 2) - n);
  const createInterval = (fn, interval, detal) => {
    const handle = (time) => {
      if (off) return;
      fn();
      setTimeout(handle, time, Math.max(time + random(detal), 100));
    };
    handle(interval);
  };
  const collectUnlike = () => {
    [...document.querySelectorAll('a:not(.item-on) > i.fui-icon.icon-op-praise')].forEach((el) => {
      unlikes.push(el);
    });
  };
  const autoLike = () => {
    const icon = unlikes.shift();
    if (icon) icon.click();
  };

  createInterval(collectUnlike, 8e3, 200);
  createInterval(autoLike, 2e3, 200);

  setTimeout(() => {
    off = true;
  }, 1800e3);
}, 10e3);
