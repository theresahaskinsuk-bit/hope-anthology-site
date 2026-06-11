(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : 'https://cdn.jsdelivr.net/gh/theresahaskinsuk-bit/hope-anthology-site@main/';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || 'ha-style-stability-v12-1') : 'ha-style-stability-v12-1';
  var currentPath = null;
  var runTimer = null;
  var renderCount = 0;
  var rootIds = ['ha-home-v3','ha-collections-v1','ha-keep-collection-v1','ha-make-template-v1','ha-story-root','ha-collaborate-v1','ha-collective-v1','ha-why-v1','ha-info-template-v1'];
  var bodyClasses = ['ha-home-v3-active','ha-collections-v1-active','ha-keep-collection-v1-active','ha-make-template-v1-active','ha-make-template-active','ha-story-active','ha-collaborate-v1-active','ha-collective-v1-active','ha-why-v1-active','ha-info-template-v1-active'];
  window.HA_STABILITY_VERSION = version;

  function path(){ return location.pathname.replace(/\/$/,'') || '/'; }
  function specForPath(p){
    if(p==='/' || p==='') return {key:'home', root:'ha-home-v3', contentId:'ha-home-v3-content', content:'content.home.js', renderer:'ha-home.js'};
    if(p==='/collections') return {key:'collections', root:'ha-collections-v1', contentId:'ha-collections-content', content:'content.collections.js', renderer:'ha-collections.js'};
    if(p==='/collections/woodland-folk' || p==='/woodland-folk') return {key:'woodland', root:'ha-keep-collection-v1', contentId:'ha-keep-collections-content', content:'content.keep-collections.js', renderer:'ha-keep-collection.js'};
    if(p==='/collections/meaning-alphabet' || p==='/meaning-alphabet') return {key:'meaning-alphabet', root:'ha-keep-collection-v1', contentId:'ha-keep-collections-content', content:'content.keep-collections.js', renderer:'ha-keep-collection.js'};
    if(p==='/collections/angel-numbers' || p==='/angel-numbers') return {key:'angel-numbers', root:'ha-keep-collection-v1', contentId:'ha-keep-collections-content', content:'content.keep-collections.js', renderer:'ha-keep-collection.js'};
    if(p==='/collections/farm-folk' || p==='/farm-folk') return {key:'farm-folk', root:'ha-keep-collection-v1', contentId:'ha-keep-collections-content', content:'content.keep-collections.js', renderer:'ha-keep-collection.js'};
    if(p==='/collections/everyday-anchors' || p==='/everyday-anchors') return {key:'everyday-anchors', root:'ha-keep-collection-v1', contentId:'ha-keep-collections-content', content:'content.keep-collections.js', renderer:'ha-keep-collection.js'};
    if(p==='/collections/stained-glass-patterns' || p==='/collections/stained-glass' || p==='/stained-glass-patterns') return {key:'stained-glass', root:'ha-make-template-v1', contentId:'ha-make-template-content', content:'content.make-template.js', renderer:'ha-make-template.js'};
    if(p==='/story' || p==='/the-story') return {key:'story', root:'ha-story-root', contentId:'ha-story-content', content:'content.story.js', renderer:'ha-story.js'};
    if(p==='/collaborate' || p==='/collaborations') return {key:'collaborate', root:'ha-collaborate-v1', contentId:'ha-collaborate-content', content:'content.collaborate.js', renderer:'ha-collaborate.js'};
    if(p==='/collective' || p==='/the-collective') return {key:'collective', root:'ha-collective-v1', contentId:'ha-collective-content', content:'content.collective.js', renderer:'ha-collective.js'};
    if(p==='/why-we-sell-this-way' || p==='/why-we-sell-this-way-1') return {key:'why', root:'ha-why-v1', contentId:'ha-why-content', content:'content.why-we-sell-this-way.js', renderer:'ha-why-we-sell-this-way.js'};
    if(p==='/privacy' || p==='/privacy-policy' || p==='/accessibility' || p==='/accessibility-statement') return {key:'info', root:'ha-info-template-v1', contentId:'ha-info-template-content', content:'content.info-page-template.js', renderer:'ha-info-page-template.js'};
    return null;
  }
  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css')) return;
    var link=document.createElement('link');
    link.id='ha-stability-v12-1-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }
  function loadContent(spec, done){
    if(!spec){ done(); return; }
    if(document.getElementById(spec.contentId)){ done(); return; }
    var s=document.createElement('script');
    s.id=spec.contentId;
    s.src=base+spec.content+'?v='+encodeURIComponent(version);
    s.async=false;
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology v12.1 could not load '+spec.content); done(); };
    document.head.appendChild(s);
  }
  function removeDynamicRendererScripts(){
    Array.prototype.forEach.call(document.querySelectorAll('script[data-ha-v12-renderer="true"]'), function(node){ node.parentNode && node.parentNode.removeChild(node); });
  }
  function cleanupForRoute(keepRoot){
    rootIds.forEach(function(id){ if(id !== keepRoot){ var n=document.getElementById(id); if(n && n.parentNode) n.parentNode.removeChild(n); } });
    bodyClasses.forEach(function(cls){ document.body.classList.remove(cls); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-ha-collaborate-hidden],[data-ha-collective-hidden],[data-ha-why-hidden],[data-ha-info-hidden],[data-ha-story-hidden]'), function(node){
      node.style.removeProperty('display');
      node.style.removeProperty('visibility');
      node.removeAttribute('data-ha-collaborate-hidden');
      node.removeAttribute('data-ha-collective-hidden');
      node.removeAttribute('data-ha-why-hidden');
      node.removeAttribute('data-ha-info-hidden');
      node.removeAttribute('data-ha-story-hidden');
    });
  }
  function loadRenderer(spec){
    renderCount += 1;
    removeDynamicRendererScripts();
    var s=document.createElement('script');
    s.id='ha-v12-1-renderer-'+spec.key+'-'+renderCount;
    s.setAttribute('data-ha-v12-renderer','true');
    s.src=base+spec.renderer+'?v='+encodeURIComponent(version)+'&r='+renderCount;
    s.async=false;
    s.onerror=function(){ console.warn('Hope Anthology v12.1 could not load '+spec.renderer); };
    document.head.appendChild(s);
  }
  function run(force){
    if(!document.body) return;
    loadCss();
    var p=path();
    var spec=specForPath(p);
    if(!spec) return;
    if(!force && currentPath===p && document.getElementById(spec.root)) return;
    currentPath=p;
    cleanupForRoute(spec.root);
    loadContent(spec, function(){ loadRenderer(spec); });
  }
  function schedule(force){
    clearTimeout(runTimer);
    runTimer=setTimeout(function(){ run(!!force); }, 120);
  }
  function patchHistory(name){
    var original=history[name];
    if(!original || original.__haV121Patched) return;
    history[name]=function(){
      var result=original.apply(this, arguments);
      window.dispatchEvent(new Event('ha:v12-route-change'));
      return result;
    };
    history[name].__haV121Patched=true;
  }
  patchHistory('pushState');
  patchHistory('replaceState');
  window.addEventListener('popstate', function(){ schedule(true); });
  window.addEventListener('hashchange', function(){ schedule(true); });
  window.addEventListener('pageshow', function(){ schedule(false); });
  window.addEventListener('ha:v12-route-change', function(){ schedule(true); });
  document.addEventListener('DOMContentLoaded', function(){ schedule(false); });
  if(document.readyState!=='loading') schedule(false);
  if(window.MutationObserver){
    var observer=new MutationObserver(function(){
      var spec=specForPath(path());
      if(spec && !document.getElementById(spec.root)) schedule(true);
    });
    if(document.documentElement) observer.observe(document.documentElement, {childList:true, subtree:true});
  }
})();
