// ==UserScript==
// @id             iitc-plugin-chat-filter@zunsthy
// @name           IITC Plugin: Chat filter
// @category       Chat
// @version        0.1.0
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://raw.githubusercontent.com/zunsthy/userscripts/master/iitc-plugins/chatfilter.meta.js
// @downloadURL    https://raw.githubusercontent.com/zunsthy/userscripts/master/iitc-plugins/chatfilter.user.js
// @description    Filter chat and remove player's active infomation.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'iitc';
plugin_info.dateTimeVersion = '20170108.21732';
plugin_info.pluginId = 'player-tracker';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////



var BROADCAST_TYPE = 'SYSTEM_BROADCAST';

window.CHATFILTER_SWITCH = false;

window.plugin.chatfilter = {
  downloadText: function(text) {
    var b = new Blob([text], { type: 'text/plain' }),
        url = URL.createObjectURL(b),
        a = document.createElement('a');
    a.download = 'ChatHistory.' + (+new Date) + '.txt';
    a.href = url;
    a.dispatchEvent(new MouseEvent('click'));
    URL.revokeObjectURL(url);
  },

  addSwitchButton: function() {
    var switchButton = $('<td class="chatfilter-switch-cell"><button id="chatfilter-switch">filter</button></td>').click(function() {
      window.CHATFILTER_SWITCH = !window.CHATFILTER_SWITCH;
    });
    $('#chattext').parent().parent().append(switchButton);
  },

  addDownloadButton: function() {
    var switchButton = $('<td class="chatfilter-download-cell"><button id="chatfilter-download">down</button></td>').click(function() {
      $.each([$('#chatall'), $('#chatfaction'), $('#chatalerts')], function(i, el) {
        if (el.is(':hidden')) return;
        var text = el.find('tr').map(function(ii, ele) {
          return ele.textContent || $(ele).text();
        }).get().join('\n');

        window.plugin.chatfilter.downloadText(text);
      });
    });
    $('#chattext').parent().parent().append(switchButton);
  },

  handleData: function(data) {
    // check global switch
    if (!window.CHATFILTER_SWITCH) return;

    data.result.filter(function(row) {
      return (row && row[2] && row[2].plext && row[2].plext.plextType === BROADCAST_TYPE);
    }).forEach(function(row) {
      if (data.processed[row[0]]) delete data.processed[row[0]];
    });
  },

  setup: function() {
    $('<style>').prop('type', 'text/css').html('#chatfilter-switch, #chatfilter-download { width: 60px; color: #f66; border: 0 none; outline: none; text-align: center; background-color: transparent; cursor: pointer; }\n.chatfilter-switch-cell,.chatfilter-download-cell { width: 60px; }').appendTo('head');
    
    window.plugin.chatfilter.addSwitchButton();
    window.plugin.chatfilter.addDownloadButton();

    addHook('publicChatDataAvailable', window.plugin.chatfilter.handleData);
  },
};



var setup = window.plugin.chatfilter.setup;

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
