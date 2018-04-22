// ==UserScript==
// @id          zunsthy-mobile-view-cartoon-cartoonmad
// @name        Mobile View Cartoon (cartoonmad)
// @category    utils
// @version     1.0.1
// @namespace   https://github.com/zunsthy/
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/MobileViewCartoonCartoonmad.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/MobileViewCartoonCartoonmad.user.js
// @description Add a custom download object
// @author      ZunSThy <zunsthy@gmail.com>
// @include     http://www.cartoonmad.com/comic/*
// @match       http://www.cartoonmad.com/comic/*
// @grant       none
// ==/UserScript==

(() => {
  const body = document.body;
  const head = document.head;

  const append = (el, node) => (
    (node instanceof Node)
    ? el.appendChild(node)
    : (node && node.length)
    ? Array.prototype.forEach.call(node, n => append(el, n))
    : null
  );

  const processCommonPage = () => {
    // series page
    const id = window.location.href.match(/(\d+).html/)[1];
    if (!id) return;

    const pages = document.querySelector('a.onpage').parentNode.querySelectorAll('a');
    const nav = document.querySelectorAll('td[width="150"] > a.pages');
    const title = document.querySelector('td[width="600"] > center > li').childNodes;

    const nextId = +id + 1;
    const content = document.querySelector(`a[href="thend.asp"],a[href="${nextId}.html"]`);
    const img = content.querySelector('img');

    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width';
    head.appendChild(viewport);

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
    link.appendChild(pic);
    main.appendChild(link);

    const frag = document.createDocumentFragment();
    append(frag, [navbar, header, footer.cloneNode(true), main, footer]);

    link.style.display = 'block';
    pic.style.maxWidth = '100%';
    navbar.style.marginBottom = '10px';
    header.style.marginBottom = '10px';
    footer.style.marginBottom = '10px';
    main.style.marginTop = '10px';
    main.style.marginBottom = '10px';

    body.removeChild(body.firstChild);
    body.removeChild(body.firstChild);
    body.removeChild(body.firstChild);
    body.appendChild(frag);
  };

  const processEndPage = () => {
    const homeLinks = document.querySelectorAll('a[href="http://www.cartoonmad.com/"]');
    const homeLink = homeLinks[homeLinks.length - 1];
    const nav = homeLink.parentNode.querySelectorAll('a');
    
    const navbar = document.createElement('nav');
    append(navbar, nav);
    console.log(navbar);

    const frag = document.createDocumentFragment();
    append(frag, [navbar]);

    body.removeChild(body.firstChild);
    body.removeChild(body.firstChild);
    body.removeChild(body.firstChild);
    body.removeChild(body.firstChild);
    body.removeChild(body.firstChild);

    body.appendChild(frag);
  };

  if (/thend\.asp/.test(window.location.href)) processEndPage();
  else if (!/\d{4}\d\d+/.test(window.location.href)) return;
  else processCommonPage();
})();