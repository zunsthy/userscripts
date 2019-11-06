// ==UserScript==
// @id          zunsthy-mobile-view-light-novel-wenku8
// @name        Mobile View Novel (wenku8)
// @category    utils
// @icon        http://www.wenku8.net/favicon.ico
// @version     1.0.1
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

function loadSet() {
  var bcolor = ReadCookies("bcolor");
  if (bcolor) document.bgColor = bcolor;

  var fonttype = ReadCookies("fonttype");
  var txtcolor = ReadCookies("txtcolor");
  var contentobj = document.getElementById('content');
if (fonttype) contentobj.style.fontSize = bcolor;
if (txtcolor) contentobj.style.color = txtcolor;

  // var speed = ReadCookies("scrollspeed") || '5';
  // scrollspeed.value=tmpstr;
// setSpeed();
}

(() => {
  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width';
  document.head.appendChild(viewport);

  const insertCss = (css) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    style.textContent = css;
  };

  const removeEl = (el) => {
    el.parentNode.removeChild(el);
  };

  const cssPatch = `
body { font-family: sans-serif; }
#adv1, #adv5 { display: none; }
#adtop, #footlink { font-size: 1.5rem; }
#adtop { width: 100% }
#headlink { min-width: unset; }
intput, select { font-size: 100%; }
br { font-size: 0.25em; }
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
  moreFontSizeOption1.value = '1.5em';
  moreFontSizeOption1.textContent = '1.5em';
  fontSizeSelect.appendChild(moreFontSizeOption1);

  const moreFontSizeOption2 = document.createElement('option');
  moreFontSizeOption2.value = '2em';
  moreFontSizeOption2.textContent = '2em';
  fontSizeSelect.appendChild(moreFontSizeOption2);

  setTimeout(() => {
    document.querySelectorAll('[id^="adv"]').forEach(removeEl);
    document.querySelectorAll('.adsbygoogle').forEach(removeEl);
    document.querySelectorAll('iframe').forEach(removeEl);

    loadSet();
  });
})();
