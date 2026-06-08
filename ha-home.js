(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function loadCss(){
    if(document.getElementById('ha-home-v3-css')) return;
    var link=document.createElement('link');
    link.id='ha-home-v3-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_HOME_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-home-v3-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-home-v3-content';
    s.src=base+'content.home.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function safeHtml(value){ return String(value == null ? '' : value); }
  function image(content,key){ return esc((content.images && content.images[key]) || ''); }
  function navLinks(items){ return (items||[]).map(function(item){return '<a href="'+esc(item.url)+'">'+esc(item.label)+'</a>';}).join(''); }

  function html(){
    var C=window.HA_HOME_CONTENT || {};
    var worlds=C.worlds || {panels:[]};
    var collections=C.collections || {cards:[]};
    var hero=C.hero || {};
    var collective=C.collective || {};
    var footer=C.footer || {};
    return ''+
      '<div id="ha-home-v3">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><span class="ha-v3-wordmark">The Hope Anthology</span></a><div class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+
        '<section class="ha-v3-hero"><img class="ha-v3-hero-img" src="'+image(C,'hero')+'" alt="Hope Anthology artwork, making materials and symbolic pieces"><div class="ha-v3-hero-content"><p class="ha-v3-eyebrow">'+esc(hero.eyebrow)+'</p><h1 class="ha-v3-h1">'+safeHtml(hero.headlineHtml)+'</h1><p class="ha-v3-hero-body">'+esc(hero.body)+'</p><div class="ha-v3-ctas"><a class="ha-v3-btn ha-v3-btn-primary" href="'+esc(hero.primaryButtonUrl)+'">'+esc(hero.primaryButtonLabel)+'</a><a class="ha-v3-btn ha-v3-btn-ghost" href="'+esc(hero.secondaryButtonUrl)+'">'+esc(hero.secondaryButtonLabel)+'</a></div></div></section>'+
        '<section class="ha-v3-two"><div class="ha-v3-section-head"><p class="ha-v3-kicker">'+esc(worlds.kicker)+'</p><h2 class="ha-v3-h2">'+esc(worlds.heading)+'</h2></div><div class="ha-v3-panels">'+(worlds.panels||[]).map(function(p){return '<article class="ha-v3-panel"><div class="ha-v3-panel-img"><img src="'+image(C,p.imageKey)+'" alt="'+esc(p.alt)+'"></div><div class="ha-v3-panel-body"><p class="ha-v3-label '+esc(p.tone)+'">'+esc(p.label)+'</p><div class="ha-v3-panel-copy">'+esc(p.copy)+'</div><a class="ha-v3-panel-link '+esc(p.tone)+'" href="'+esc(p.linkUrl)+'">'+esc(p.linkLabel)+'</a></div></article>';}).join('')+'</div></section>'+
        '<section class="ha-v3-collections"><div class="ha-v3-strip-head"><h2 class="ha-v3-strip-title">'+esc(collections.heading)+'</h2><a class="ha-v3-strip-link" href="'+esc(collections.linkUrl)+'">'+esc(collections.linkLabel)+'</a></div><div class="ha-v3-cards">'+(collections.cards||[]).map(function(card){return '<article class="ha-v3-card"><div class="ha-v3-card-img"><img src="'+image(C,card.imageKey)+'" alt="'+esc(card.alt)+'"></div><div class="ha-v3-card-body"><p class="ha-v3-card-kicker">'+esc(card.kicker)+'</p><h3 class="ha-v3-card-title">'+esc(card.title)+'</h3><p class="ha-v3-card-copy">'+esc(card.copy)+'</p><a class="ha-v3-card-link" href="'+esc(card.linkUrl)+'">'+esc(card.linkLabel)+'</a></div></article>';}).join('')+'</div></section>'+
        '<section class="ha-v3-collective"><div><p class="ha-v3-kicker">'+esc(collective.kicker)+'</p><h2>'+esc(collective.heading)+'</h2><p>'+esc(collective.body)+'</p></div><form class="ha-v3-form" action="'+esc(collective.formAction || '/collective')+'" method="'+esc(collective.formMethod || 'get')+'"><input class="ha-v3-input" type="email" name="email" placeholder="'+esc(collective.emailPlaceholder)+'"><button class="ha-v3-btn-gold" type="submit">'+esc(collective.buttonLabel)+'</button><p class="ha-v3-note">'+esc(collective.note)+'</p></form></section>'+
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect & legal</div><a href="'+esc(footer.instagramUrl)+'" target="_blank" rel="noopener">Instagram</a><a href="'+esc(footer.privacyUrl)+'">Privacy policy</a><a href="'+esc(footer.termsUrl)+'">Terms</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div></footer>'+
      '</div>';
  }

  function isHome(){var p=location.pathname.replace(/\/$/,'');return p===''||p==='/';}
  function mount(){
    if(!isHome()) return;
    if(document.getElementById('ha-home-v3')) return;
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    document.body.classList.add('ha-home-v3-active');
    var wrap=document.createElement('div');
    wrap.innerHTML=html();
    anchor.parentNode.insertBefore(wrap.firstChild,anchor);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
    setTimeout(mount,600);
  });
})();
