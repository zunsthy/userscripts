// ==UserScript==
// @id          zunsthy-mobile-view-cartoon-cartoonmad
// @name        Mobile View Cartoon (cartoonmad)
// @icon        http://www.cartoonmad.com/favicon.ico
// @category    utils
// @version     1.0.4
// @namespace   https://github.com/zunsthy/
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/MobileViewCartoonCartoonmad.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/MobileViewCartoonCartoonmad.user.js
// @description Add a custom style for detail page
// @author      ZunSThy <zunsthy@gmail.com>
// @include     http://www.cartoonmad.com/comic/*
// @include     https://www.cartoonmad.com/comic/*
// @match       http://www.cartoonmad.com/comic/*
// @match       https://www.cartoonmad.com/comic/*
// @grant       none
// ==/UserScript==

(() => {
  const body = document.body;
  const head = document.head;

  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width';
  head.appendChild(viewport);

  const foreach = (arr, func) => Array.prototype.forEach.call(arr, func);

  const append = (el, node) => (
    (node instanceof Node)
    ? el.appendChild(node)
    : (node && node.length)
    ? foreach(node, n => append(el, n))
    : null
  );

  const insertCss = (css) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    head.appendChild(style);
    style.textContent = css;
  };

  const clearNode = (node, depth = 1) => {
    while (depth && node.firstChild) {
      clearNode(node, depth - 1);
      node.removeChild(node.firstChild);
    }
  };

  const processCommonPage = () => {
    // series page
    const id = window.location.href.match(/(\d+).html/)[1];
    if (!id) return;

    const pages = document.querySelector('a.onpage').parentNode.querySelectorAll('a');
    const nav = document.querySelectorAll('td[width="150"] > a.pages');
    const title = document.querySelector('td[width="600"] > center > li').querySelectorAll('a,select');

    const nextId = +id + 1;
    const content = document.querySelector(`a[href="thend.asp"],a[href="${nextId}.html"]`);
    const img = content.querySelector('img');

    if (content.href !== 'thend.asp') {
      const next = document.createElement('link');
      next.rel = 'next';
      next.href = content.href;
      head.appendChild(next);
    }

    const navbar = document.createElement('nav');
    append(navbar, nav);

    const header = document.createElement('header');
    append(header, title);

    const footer = document.createElement('footer');
    append(footer, pages);

    const main = document.createElement('main');
    const link = document.createElement('a');
    link.href = content.href;
    const pic = document.createElement('img');
    pic.src = img.src;
    pic.id = 'cartoon';
    link.appendChild(pic);
    main.appendChild(link);

    const frag = document.createDocumentFragment();
    append(frag, [navbar, header, footer.cloneNode(true), main, footer]);

    link.style.display = 'inline-block';
    pic.style.maxWidth = '100%';

    return frag;
  };

  const processEndPage = () => {
    const homeLinks = document.querySelectorAll('a[href="http://www.cartoonmad.com/"]');
    const homeLink = homeLinks[homeLinks.length - 1];
    const nav = homeLink.parentNode.querySelectorAll('a');

    const navbar = document.createElement('nav');
    navbar.classList.add('last-page')
    append(navbar, nav);

    const frag = document.createDocumentFragment();
    append(frag, [navbar]);

    return frag;
  };

  let newPage = null;

  if (/thend\.asp/.test(window.location.href)) newPage = processEndPage();
  else if (!/\d{4}\d\d+/.test(window.location.href)) return;
  else newPage = processCommonPage();

  const newStyle = `
  nav, header, footer, main { margin: 10px 0; }
  nav > .pages { border: 0 none; padding: 5px; font-size: 14px; }
  nav.last-page > a { display: block; padding: 10px; font-size: 18px; text-align: center; }
  nav.last-page > a:hover { font-size: 18px; }
  footer { width: 100%; white-space: nowrap; overflow: scroll; }
  footer .pages, footer .onpage { display: inline; border: 0 none; font-size: 14px; line-height: 1.4; }
  footer .pages:hover { display: inline; border: 0 none; font-size: 14px; line-height: 1.4; }
  `;

  insertCss(newStyle);
  clearNode(body);
  body.appendChild(newPage);

  const cartoon = document.getElementById('cartoon');
  if (cartoon) {
    cartoon.scrollIntoView(true);
  }
})();