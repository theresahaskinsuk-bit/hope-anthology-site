(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : 'https://cdn.jsdelivr.net/gh/theresahaskinsuk-bit/hope-anthology-site@main/';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || 'ha-style-stability-v12') : 'ha-style-stability-v12';
  window.HA_STABILITY_VERSION = version;

  function path(){ return location.pathname.replace(/\/$/,'') || '/'; }
  function loadScript(id, file, done){
    if(document.getElementById(id)){ if(done) done(); return; }
    var s=document.createElement('script');
    s.id=id;
    s.src=base+file+'?v='+encodeURIComponent(version);
    s.async=false;
    if(done) s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology v12 could not load '+file); if(done) done(); };
    document.head.appendChild(s);
  }
  function loadCss(){
    if(document.getElementById('ha-stability-v12-css')) return;
    var link=document.createElement('link');
    link.id='ha-stability-v12-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }
  function pageForPath(p){
    if(p==='/' || p==='') return ['ha-home-v3-content','content.home.js','ha-home-v3-renderer','ha-home.js'];
    if(p==='/collections') return ['ha-collections-content','content.collections.js','ha-collections-renderer','ha-collections.js'];
    if(p==='/collections/woodland-folk' || p==='/woodland-folk') return ['ha-keep-collections-content','content.keep-collections.js','ha-keep-collection-renderer','ha-keep-collection.js'];
    if(p==='/collections/stained-glass-patterns' || p==='/collections/stained-glass' || p==='/stained-glass-patterns') return ['ha-make-template-content','content.make-template.js','ha-make-template-renderer','ha-make-template.js'];
    if(p==='/story' || p==='/the-story') return ['ha-story-content','content.story.js','ha-story-renderer','ha-story.js'];
    if(p==='/collaborate' || p==='/collaborations') return ['ha-collaborate-content','content.collaborate.js','ha-collaborate-renderer','ha-collaborate.js'];
    if(p==='/collective' || p==='/the-collective') return ['ha-collective-content','content.collective.js','ha-collective-renderer','ha-collective.js'];
    if(p==='/why-we-sell-this-way' || p==='/why-we-sell-this-way-1') return ['ha-why-content','content.why-we-sell-this-way.js','ha-why-renderer','ha-why-we-sell-this-way.js'];
    if(p==='/privacy' || p==='/privacy-policy' || p==='/accessibility' || p==='/accessibility-statement') return ['ha-info-template-content','content.info-page-template.js','ha-info-template-renderer','ha-info-page-template.js'];
    return null;
  }
  function run(){
    loadCss();
    var spec = pageForPath(path());
    if(!spec) return;
    loadScript(spec[0], spec[1], function(){ loadScript(spec[2], spec[3]); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
