(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function normalPath(){ return location.pathname.replace(/\/$/,'') || '/'; }
  function isHome(){ var p=normalPath(); return p==='/' || p===''; }
  function isBlockedCustomPage(){
    var p=normalPath();
    var blocked = [
      '/story','/the-story',
      '/make','/to-make','/collections/to-make','/collections/stained-glass-patterns'
    ];
    return blocked.indexOf(p) !== -1 ||
      document.getElementById('ha-story-root') ||
      document.getElementById('ha-make-template-v1') ||
      document.body.classList.contains('ha-story-mounted');
  }
  function shouldRunHome(){
    if(isBlockedCustomPage()) return false;
    return isHome() || (script && script.getAttribute('data-ha-home') === 'true' && isHome());
  }

  if(!shouldRunHome()) return;

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
  function hasUrl(value){ return typeof value === 'string' && value.trim() && value.trim() !== '#'; }
  function ctaLabel(label){
    var clean = String(label == null ? '' : label).replace(/\s*[→›»]+\s*$/,'');
    return '<span class="ha-v3-cta-text">'+esc(clean)+'</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span>';
  }
  function linkedImage(className,url,imgHtml,label){
    if(hasUrl(url)) return '<a class="'+className+' ha-v3-image-link" href="'+esc(url)+'" aria-label="'+esc(label || 'Open section')+'">'+imgHtml+'</a>';
    return '<div class="'+className+'">'+imgHtml+'</div>';
  }
  function newsletterForm(collective){
    var action = collective.formAction || '/collective';
    var method = (collective.formMethod || 'get').toLowerCase();
    var emailName = collective.emailFieldName || 'email';
    var provider = collective.provider || 'holding-page';
    return ''+
      '<form class="ha-v3-form" action="'+esc(action)+'" method="'+esc(method)+'" data-provider="'+esc(provider)+'">'+
        '<label class="ha-v3-sr-only" for="ha-v3-collective-email">'+esc(collective.emailLabel || 'Email address')+'</label>'+
        '<input id="ha-v3-collective-email" class="ha-v3-input" type="email" name="'+esc(emailName)+'" placeholder="'+esc(collective.emailPlaceholder || 'Email address')+'" autocomplete="email" required>'+
        '<button class="ha-v3-btn-gold" type="submit">'+ctaLabel(collective.buttonLabel || 'Join the Collective')+'</button>'+
        '<p class="ha-v3-note">'+esc(collective.note)+'</p>'+
      '</form>';
  }

  function html(){
    var C=window.HA_HOME_CONTENT || {};
    var worlds=C.worlds || {panels:[]};
    var collections=C.collections || {cards:[]};
    var hero=C.hero || {};
    var collective=C.collective || {};
    var footer=C.footer || {};
    return ''+
      '<div id="ha-home-v3">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><h1 class="ha-v3-sr-only">The Hope Anthology — Symbolic art and meaningful making</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-v3-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-v3-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+
        '<section class="ha-v3-hero"><img class="ha-v3-hero-img" src="'+image(C,'hero')+'" alt="Hope Anthology artwork, making materials and symbolic pieces"><div class="ha-v3-hero-content"><p class="ha-v3-eyebrow">'+esc(hero.eyebrow)+'</p><h2 class="ha-v3-h1">'+safeHtml(hero.headlineHtml)+'</h2><p class="ha-v3-hero-body">'+esc(hero.body)+'</p><div class="ha-v3-ctas"><a class="ha-v3-btn ha-v3-btn-primary" href="'+esc(hero.primaryButtonUrl)+'">'+ctaLabel(hero.primaryButtonLabel)+'</a><a class="ha-v3-btn ha-v3-btn-ghost" href="'+esc(hero.secondaryButtonUrl)+'">'+ctaLabel(hero.secondaryButtonLabel)+'</a></div></div></section>'+
        '<section class="ha-v3-two"><div class="ha-v3-section-head"><p class="ha-v3-kicker">'+esc(worlds.kicker)+'</p><h2 class="ha-v3-h2">'+esc(worlds.heading)+'</h2></div><div class="ha-v3-panels">'+(worlds.panels||[]).map(function(p){var img='<img src="'+image(C,p.imageKey)+'" alt="'+esc(p.alt)+'">';return '<article class="ha-v3-panel">'+linkedImage('ha-v3-panel-img',p.linkUrl,img,p.label)+'<div class="ha-v3-panel-body"><p class="ha-v3-label '+esc(p.tone)+'">'+esc(p.label)+'</p><div class="ha-v3-panel-copy">'+esc(p.copy)+'</div><a class="ha-v3-panel-link '+esc(p.tone)+'" href="'+esc(p.linkUrl)+'">'+ctaLabel(p.linkLabel)+'</a></div></article>';}).join('')+'</div></section>'+
        '<section class="ha-v3-collections"><div class="ha-v3-strip-head"><h2 class="ha-v3-strip-title">'+esc(collections.heading)+'</h2><a class="ha-v3-strip-link" href="'+esc(collections.linkUrl)+'">'+ctaLabel(collections.linkLabel)+'</a></div><div class="ha-v3-cards">'+(collections.cards||[]).map(function(card){var img='<img src="'+image(C,card.imageKey)+'" alt="'+esc(card.alt)+'">';return '<article class="ha-v3-card">'+linkedImage('ha-v3-card-img',card.linkUrl,img,card.title)+'<div class="ha-v3-card-body"><p class="ha-v3-card-kicker">'+esc(card.kicker)+'</p><h3 class="ha-v3-card-title">'+esc(card.title)+'</h3><p class="ha-v3-card-copy">'+esc(card.copy)+'</p><a class="ha-v3-card-link" href="'+esc(card.linkUrl)+'">'+ctaLabel(card.linkLabel)+'</a></div></article>';}).join('')+'</div></section>'+
        '<section class="ha-v3-collective"><div><p class="ha-v3-kicker">'+esc(collective.kicker)+'</p><h2>'+esc(collective.heading)+'</h2><p>'+esc(collective.body)+'</p></div>'+newsletterForm(collective)+'</section>'+
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect & legal</div><a href="'+esc(footer.instagramUrl)+'" target="_blank" rel="noopener">Instagram</a><a href="'+esc(footer.privacyUrl)+'">Privacy policy</a><a href="'+esc(footer.termsUrl)+'">Terms</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div></footer>'+
      '</div>';
  }

  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-v3-mobile-menu');
    if(!toggle || !menu || toggle.getAttribute('data-bound') === 'true') return;
    toggle.setAttribute('data-bound','true');
    toggle.addEventListener('click',function(){
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      root.classList.toggle('ha-v3-menu-open', !open);
    });
    menu.addEventListener('click',function(event){
      if(event.target && event.target.tagName === 'A'){
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label','Open menu');
        root.classList.remove('ha-v3-menu-open');
      }
    });
  }
  function mount(){
    if(!shouldRunHome()) return;
    if(document.getElementById('ha-home-v3')) return;
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    document.body.classList.add('ha-home-v3-active');
    var wrap=document.createElement('div');
    wrap.innerHTML=html();
    var root = wrap.firstChild;
    anchor.parentNode.insertBefore(root,anchor);
    bindMobileNav(root);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
    setTimeout(mount,600);
  });
})();
