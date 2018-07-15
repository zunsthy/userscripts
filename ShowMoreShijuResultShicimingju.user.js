// ==UserScript==
// @id          zunsthy-show-more-shiju-result-shicimingju
// @name        Show More ShiJu Result (shicimingju.com)
// @icon        http://www.shicimingju.com/favicon.ico
// @category    utils
// @version     1.0.0
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/ShowMoreShijuResultShicimingju.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/ShowMoreShijuResultShicimingju.user.js
// @author      ZunSThy <zunsthy@gmail.com>
// @description default unfold 'show more result' on shiju result page in shicimiju.com
// @namespace   https://github.com/zunsthy
// @match       http://www.shicimingju.com/chaxun/shiju/*
// @include     http://www.shicimingju.com/chaxun/shiju/*
// @grant       none
// ==/UserScript==

(() => {
  Array.prototype.forEach.call(
    document.querySelectorAll('.sub-item.sub-item-hide'),
    (el) => {
      el.classList.remove('sub-item-hide');
      el.classList.add('sub-item-show');
  	}
  );
  
  Array.prototype.forEach.call(
    document.querySelectorAll('.more-chaxun-result'),
    (el) => {
      el.href = '#';
      el.target = '';
      el.onclick = ev => ev.preventDefault();
  	}
  );
  
  Array.prototype.forEach.call(
    document.querySelectorAll('.ddd-div'),
    (el) => {
      el.style.display = 'none';
    }
  );
})();
