// ==UserScript==
// @id          zunsthy-auto-cookie-click
// @name        Auto Cookie Click
// @icon        https://orteil.dashnet.org/cookieclicker/img/favicon.ico
// @category    utils
// @version     0.1.1
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/AutoCookieClick.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/AutoCookieClick.user.js
// @author      ZunSThy <zunsthy@gmail.com>
// @description auto click cookie button when offscreen
// @namespace   https://github.com/zunsthy
// @match        https://orteil.dashnet.org/cookieclicker/
// @include      https://orteil.dashnet.org/cookieclicker/
// @grant       none
// ==/UserScript==

(() => {
  const bigCookieClick = () => {
    const btn = document.getElementById('bigCookie');
    btn.click();
  };
  const shimmerCookieClick = () => {
    const container = document.getElementById('shimmers');
    const btns = container.querySelectorAll('.shimmer');
    if (btns.length > 1) {
          btns.forEach((btn, i) => {
         if (btn.style.opacity > 0.9 && i < 3) {
           btn.click();
         }
        });
    } else if (btns.length === 1) {
      const btn = btns[0];
      if (btn.style.opacity > 0.99999) {
        btn.click();
      }
    }
  };

  const defaultOption = {
    interval: 500,
    bigCookieClick: false,
    shimmerCookieClick: true,
  };
  window._startCheat = (option = defaultOption) => {
    const opt = Object.assign({}, defaultOption, option);
    if (typeof window._stopCheat === 'function') {
      window._stopCheat();
    }
    const k = setInterval(() => {
      opt.bigCookieClick && bigCookieClick();
      opt.shimmerCookieClick && shimmerCookieClick();
    }, opt.interval || defaultOption.interval);
  };
  window._stopCheat = () => {
    clearInterval(k);
  };
})();
