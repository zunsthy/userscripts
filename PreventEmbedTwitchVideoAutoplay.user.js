// ==UserScript==
// @name         Prevent Video Autoplay (embed.twitch.tv)
// @namespace    https://github.com/zunsthy
// @version      1.0.0
// @description  Prevent Embed Vedio Autoplay
// @author       zunsthy
// @match        https://embed.twitch.tv/
// @icon         https://twitch.tv/favicon.ico
// @grant        none
// ==/UserScript==

(() => {
  const url = new URL(window.location);
  if (url.searchParams.get('autoplay') !== 'false') {
    url.searchParams.delete('autoplay');
    url.searchParams.set('autoplay', 'false');
    window.location.href = url.toString();
  }
})();
