(function(){
  let isTopLevel = false;

  try {
    isTopLevel = window.self === window.top;
  } catch (error) {
    isTopLevel = false;
  }

  if (
    !isTopLevel ||
    (window.location.hostname !== 'thehopeanthology.art' &&
      window.location.hostname !== 'www.thehopeanthology.art')
  ) {
    return;
  }

  var SHOW_PRICES = false;
  var path = location.pathname.replace(/\/+$/, '') || '/';
  if(!/^\/to-make\/[^/]+$/.test(path)) return;
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();
  window.HA_ARTIST_PAGE_BOOT = {world:'make',base:base,version:version,showPrices:SHOW_PRICES};
  var id='ha-artist-page-template-script';
  if(document.getElementById(id)) return;
  var core=document.createElement('script');
  core.id=id;
  core.src=base+'ha-artist-page-template.js?v='+encodeURIComponent(version);
  core.onerror=function(){ console.warn('Hope Anthology artist-page template could not be loaded.'); };
  document.head.appendChild(core);
})();
