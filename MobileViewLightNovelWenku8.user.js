// ==UserScript==
// @id          zunsthy-mobile-view-light-novel-wenku8
// @name        Mobile View Novel (wenku8)
// @category    utils
// @icon        http://www.wenku8.net/favicon.ico
// @version     1.0.0
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/MobileViewLightNovelWenku8.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/MobileViewLightNovelWenku8.user.js
// @author      ZunSThy <zunsthy@gmail.com>
// @description some common methods
// @namespace   https://github.com/zunsthy
// @include     http://www.wenku8.net/novel/*/*/*.htm
// @include     https://www.wenku8.net/novel/*/*/*.htm
// @match       http://www.wenku8.net/novel/*/*/*.htm
// @match       https://www.wenku8.net/novel/*/*/*.htm
// @grant       none
// ==/UserScript==

(() => {
  const insertCss = (css) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    style.textContent = css;
  };

  const removeEl = (el) => {
console.log(el);
    el.parentNode.removeChild(el);
  };

  const cssPatch = `
body { font-family: sans-serif; }
#adv1, #adv5 { display: none; }
#footlink { font-size: 2rem; }
  `;

  insertCss(cssPatch);

  const form = document.getElementById('adtop');
  const bgColorSelect = form.querySelector('select[name="bcolor"]');
  const fontColorSelect = form.querySelector('select[name="txtcolor"]');
  const fontSizeSelect = form.querySelector('select[name="fonttype"]');

  const moreBgColorOption = document.createElement('option');
  const deepGrayColor = '#cb9';
  moreBgColorOption.value = deepGrayColor;
  moreBgColorOption.style.backgroundColor = deepGrayColor;
  moreBgColorOption.textContent = '棕黄';
  bgColorSelect.appendChild(moreBgColorOption);

  const moreFontColorOption = document.createElement('option');
  const blackColor = '#333';
  moreFontColorOption.value = blackColor;
  moreFontColorOption.textContent = '近黑';
  fontColorSelect.appendChild(moreFontColorOption);

  const moreFontSizeOption1 = document.createElement('option');
  moreFontSizeOption1.value = '32px'
  moreFontSizeOption1.textContent = '32px';
  fontSizeSelect.appendChild(moreFontSizeOption1);

  const moreFontSizeOption2 = document.createElement('option');
  moreFontSizeOption2.value = '40px';
  moreFontSizeOption2.textContent = '40px';
  fontSizeSelect.appendChild(moreFontSizeOption2);

  setTimeout(() => {
    document.querySelectorAll('[id^="adv"]').forEach(removeEl);
    document.querySelectorAll('.adsbygoogle').forEach(removeEl);
    document.querySelectorAll('iframe').forEach(removeEl);
  });
})();
