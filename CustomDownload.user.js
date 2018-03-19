// ==UserScript==
// @id          zunsthy-custom-download
// @name        Custom Download
// @category    utils
// @version     0.1.0
// @namespace   https://github.com/zunsthy/
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/CustomDownload.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/CustomDownload.user.js
// @description Add a custom download object
// @author      ZunSThy <zunsthy@gmail.com>
// @include     http://*
// @include     https://*
// @match       http://*/*
// @match       https://*/*
// @grant       none
// ==/UserScript==

((mimes) => {
  const UTF8_BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);

  const write = (content, { ext = '', bom = false }) => {
    const mime = mimes[(ext || '').slice(1)] || mimes.bin;
    const blob = new Blob([bom ? UTF8_BOM : '', content], { type: mime });
    return URL.createObjectURL(blob);
  };

  const writeFile = (content, filename = 'download', opts = {}) => {
    const dot = filename.lastIndexOf('.');
    const ext = opts.ext || (dot !== -1 ? filename.slice(dot + 1) : '');

    const uri = write(content, Object.assign({ ext }, opts));
    const name = dot === -1 ? filename + '.' + ext : filename;

    if (opts.method === 'window') {
      window.open(uri);
    } else {
      const a = document.createElement('a');
      a.download = name;
      a.href = uri;
      a.dispatchEvent(new MouseEvent('click'));
    }
    URL.revokeObjectURL(uri);
  };

  window._DL = {
    write,
    writeFile,
    mimes,
  };
})({
"atom":"application/atom+xml","json":"application/json","map":"application/json","topojson":"application/json","jsonld":"application/ld+json","rss":"application/rss+xml","geojson":"application/vnd.geo+json","rdf":"application/xml","xml":"application/xml","js":"application/javascript","webmanifest":"application/manifest+json","webapp":"application/x-web-app-manifest+json","appcache":"text/cache-manifest","mid":"audio/midi","midi":"audio/midi","kar":"audio/midi","aac":"audio/mp4","f4a":"audio/mp4","f4b":"audio/mp4","m4a":"audio/mp4","mp3":"audio/mpeg","oga":"audio/ogg","ogg":"audio/ogg","opus":"audio/ogg","ra":"audio/x-realaudio","wav":"audio/x-wav","bmp":"image/bmp","gif":"image/gif","jpeg":"image/jpeg","jpg":"image/jpeg","png":"image/png","svg":"image/svg+xml","svgz":"image/svg+xml","tif":"image/tiff","tiff":"image/tiff","wbmp":"image/vnd.wap.wbmp","webp":"image/webp","jng":"image/x-jng","3gp":"video/3gpp","3gpp":"video/3gpp","f4p":"video/mp4","f4v":"video/mp4","m4v":"video/mp4","mp4":"video/mp4","mpeg":"video/mpeg","mpg":"video/mpeg","ogv":"video/ogg","mov":"video/quicktime","webm":"video/webm","flv":"video/x-flv","mng":"video/x-mng","asf":"video/x-ms-asf","asx":"video/x-ms-asf","wmv":"video/x-ms-wmv","avi":"video/x-msvideo","cur":"image/x-icon","ico":"image/x-icon","doc":"application/msword","xls":"application/vnd.ms-excel","ppt":"application/vnd.ms-powerpoint","docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","xlsx":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation","woff":"application/font-woff","woff2":"application/font-woff2","eot":"application/vnd.ms-fontobject","ttc":"application/x-font-ttf","ttf":"application/x-font-ttf","otf":"font/opentype","ear":"application/java-archive","jar":"application/java-archive","war":"application/java-archive","hqx":"application/mac-binhex40","bin":"application/octet-stream","deb":"application/octet-stream","dll":"application/octet-stream","dmg":"application/octet-stream","exe":"application/octet-stream","img":"application/octet-stream","iso":"application/octet-stream","msi":"application/octet-stream","msm":"application/octet-stream","msp":"application/octet-stream","safariextz":"application/octet-stream","pdf":"application/pdf","ai":"application/postscript","eps":"application/postscript","ps":"application/postscript","rtf":"application/rtf","kml":"application/vnd.google-earth.kml+xml","kmz":"application/vnd.google-earth.kmz","wmlc":"application/vnd.wap.wmlc","7z":"application/x-7z-compressed","bbaw":"application/x-bb-appworld","torrent":"application/x-bittorrent","crx":"application/x-chrome-extension","cco":"application/x-cocoa","jardiff":"application/x-java-archive-diff","jnlp":"application/x-java-jnlp-file","run":"application/x-makeself","oex":"application/x-opera-extension","pl":"application/x-perl","pm":"application/x-perl","pdb":"application/x-pilot","prc":"application/x-pilot","rar":"application/x-rar-compressed","rpm":"application/x-redhat-package-manager","sea":"application/x-sea","swf":"application/x-shockwave-flash","sit":"application/x-stuffit","tcl":"application/x-tcl","tk":"application/x-tcl","crt":"application/x-x509-ca-cert","der":"application/x-x509-ca-cert","pem":"application/x-x509-ca-cert","xpi":"application/x-xpinstall","xhtml":"application/xhtml+xml","xsl":"application/xslt+xml","zip":"application/zip","css":"text/css","htm":"text/html","html":"text/html","shtml":"text/html","mml":"text/mathml","txt":"text/plain","vcard":"text/vcard","vcf":"text/vcard","xloc":"text/vnd.rim.location.xloc","jad":"text/vnd.sun.j2me.app-descriptor","wml":"text/vnd.wap.wml","vtt":"text/vtt","htc":"text/x-component"
});
