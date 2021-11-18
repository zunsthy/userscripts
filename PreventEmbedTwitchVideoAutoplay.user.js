// ==UserScript==
// @name        Prevent Video Autoplay (embed.twitch.tv)
// @version     1.0.0
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/PreventEmbedTwitchVideoAutoplay.user.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/PreventEmbedTwitchVideoAutoplay.user.js
// @author      ZunSThy <zunsthy@gmail.com>
// @description Prevent Embed Vedio Autoplay
// @namespace   https://github.com/zunsthy
// @include     https://embed.twitch.tv/*
// @match       https://embed.twitch.tv/*
// @icon        https://twitch.tv/favicon.ico
// @grant       none
// ==/UserScript==

(() => {
  const url = new URL(window.location);
  if (url.searchParams.get('autoplay') !== 'false') {
    url.searchParams.delete('autoplay');
    url.searchParams.set('autoplay', 'false');
    window.location.href = url.toString();
  }
})();
