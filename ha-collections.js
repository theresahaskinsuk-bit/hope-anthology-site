(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function loadCss(){
    if(document.getElementById('ha-stability-v12-css') || document.getElementById('ha-v3-css')) return;
    var link=document.createElement('link');
    link.id='ha-v3-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_COLLECTIONS_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-collections-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-collections-content';
    s.src=base+'content.collections.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Collections content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function safeHtml(value){ return String(value == null ? '' : value); }
  function isAbsoluteUrl(value){ return /^(https?:)?\/\//.test(String(value || '')) || /^data:/.test(String(value || '')) || /^\//.test(String(value || '')); }
  function assetUrl(value){
    value = String(value == null ? '' : value);
    if(!value) return '';
    return isAbsoluteUrl(value) ? value : base + value.replace(/^\.\//,'');
  }
  function image(content,key){ return esc(assetUrl((content.images && content.images[key]) || '')); }
  function hasUrl(value){ return typeof value === 'string' && value.trim() && value.trim() !== '#'; }
  function isExternal(value){ return /^https?:\/\//.test(String(value || '')); }
  function linkAttrs(url){ return isExternal(url) ? ' target="_blank" rel="noopener"' : ''; }
  function ctaLabel(label){
    var clean = String(label == null ? '' : label).replace(/\s*[→›»]+\s*$/,'');
    return '<span class="ha-v3-cta-text">'+esc(clean)+'</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span>';
  }
  function navLinks(items){
    var current = location.pathname.replace(/\/$/,'') || '/';
    return (items||[]).map(function(item){
      var href = item.url || '#';
      var active = (href.replace(/\/$/,'') || '/') === current;
      return '<a href="'+esc(href)+'"'+(active ? ' aria-current="page"' : '')+'>'+esc(item.label)+'</a>';
    }).join('');
  }
  function newsletterForm(collective){
    var action = collective.formAction || '/collective';
    var method = (collective.formMethod || 'get').toLowerCase();
    var emailName = collective.emailFieldName || 'email';
    var provider = collective.provider || 'holding-page';
    return ''+
      '<form class="ha-c-form" action="'+esc(action)+'" method="'+esc(method)+'" data-provider="'+esc(provider)+'">'+
        '<label class="ha-v3-sr-only" for="ha-c-collective-email">'+esc(collective.emailLabel || 'Email address')+'</label>'+ 
        '<input id="ha-c-collective-email" class="ha-c-input" type="email" name="'+esc(emailName)+'" placeholder="'+esc(collective.emailPlaceholder || 'Email address')+'" autocomplete="email" required>'+ 
        '<button class="ha-c-btn ha-c-btn-teal" type="submit">'+ctaLabel(collective.buttonLabel || 'Join the Collective')+'</button>'+ 
        '<p class="ha-c-note">'+esc(collective.note || '')+'</p>'+ 
      '</form>';
  }
  function collectionRow(C,item,index){
    var rev = index % 2 === 1 ? ' ha-c-row-rev' : '';
    return '<article class="ha-c-row'+rev+'">'+
      '<a class="ha-c-row-img ha-v3-image-link" href="'+esc(item.linkUrl)+'" aria-label="'+esc(item.title)+'">'+
        '<img src="'+image(C,item.imageKey)+'" alt="'+esc(item.alt)+'">'+
      '</a>'+ 
      '<div class="ha-c-row-content">'+
        '<p class="ha-c-eyebrow">To Keep</p>'+ 
        '<h3>'+esc(item.title)+'</h3>'+ 
        '<p>'+esc(item.body)+'</p>'+ 
        '<a class="ha-c-btn ha-c-btn-teal" href="'+esc(item.linkUrl)+'">'+ctaLabel(item.linkLabel)+'</a>'+ 
        (item.note ? '<p class="ha-c-coming-note">'+esc(item.note)+'</p>' : '')+
      '</div>'+ 
    '</article>';
  }
  function html(){
    var C=window.HA_COLLECTIONS_CONTENT || {};
    var page=C.page || {};
    var keep=C.keepWorld || {collections:[]};
    var make=C.makeWorld || {collection:{},coming:[]};
    var collective=C.collective || {};
    var footer=C.footer || {};
    var makeCollection=make.collection || {};
    return ''+
      '<div id="ha-collections-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><h1 class="ha-v3-sr-only">The Collections — The Hope Anthology</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-c-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-c-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+ 
        '<main class="ha-c-main">'+
          '<header class="ha-c-header"><p class="ha-c-eyebrow">'+esc(page.eyebrow)+'</p><h2>'+safeHtml(page.headlineHtml)+'</h2><p>'+esc(page.intro)+'</p></header>'+ 
          '<section class="ha-c-doors" aria-label="Two Hope Anthology worlds">'+(C.doors||[]).map(function(door){return '<a class="ha-c-door" href="'+esc(door.url)+'"><img src="'+image(C,door.imageKey)+'" alt="'+esc(door.alt)+'"><span class="ha-c-door-gradient" aria-hidden="true"></span><span class="ha-c-door-content"><span class="ha-c-door-world">'+esc(door.world)+'</span><span class="ha-c-door-title">'+safeHtml(door.titleHtml)+'</span><span class="ha-c-door-body">'+esc(door.body)+'</span><span class="ha-c-door-count">'+esc(door.count)+'</span><span class="ha-c-door-arrow">'+esc(door.arrow)+'</span></span></a>';}).join('')+'</section>'+ 
          '<section id="'+esc(keep.id || 'to-keep')+'" class="ha-c-world ha-c-world-keep"><div class="ha-c-world-inner"><p class="ha-c-eyebrow">'+esc(keep.eyebrow)+'</p><h2>'+esc(keep.heading)+'</h2><p>'+esc(keep.intro)+'</p></div></section>'+ 
          '<section class="ha-c-keep-list">'+(keep.collections||[]).map(function(item,index){return collectionRow(C,item,index);}).join('')+'</section>'+ 
          '<section id="'+esc(make.id || 'to-make')+'" class="ha-c-world ha-c-world-make"><div class="ha-c-world-inner"><p class="ha-c-eyebrow">'+esc(make.eyebrow)+'</p><h2>'+esc(make.heading)+'</h2><p>'+esc(make.intro)+'</p></div></section>'+ 
          '<section class="ha-c-make-feature"><a class="ha-c-make-img ha-v3-image-link" href="'+esc(makeCollection.linkUrl)+'" aria-label="'+esc(makeCollection.title)+'"><img src="'+image(C,makeCollection.imageKey)+'" alt="'+esc(makeCollection.alt)+'"></a><div class="ha-c-make-content"><p class="ha-c-eyebrow">To Make</p><h3>'+esc(makeCollection.title)+'</h3><p>'+esc(makeCollection.body)+'</p><div class="ha-c-make-actions"><a class="ha-c-btn ha-c-btn-gold" href="'+esc(makeCollection.linkUrl)+'">'+ctaLabel(makeCollection.linkLabel)+'</a>'+ (hasUrl(makeCollection.secondaryUrl) ? '<a class="ha-c-btn ha-c-btn-ghost" href="'+esc(makeCollection.secondaryUrl)+'"'+linkAttrs(makeCollection.secondaryUrl)+'>'+esc(makeCollection.secondaryLabel)+'</a>' : '') +'</div></div></section>'+ 
          '<section class="ha-c-coming" aria-label="Coming soon To Make mediums">'+(make.coming||[]).map(function(card){return '<article class="ha-c-coming-card"><h3>'+esc(card.title)+'</h3><p>'+esc(card.body)+'</p>'+(card.linkUrl ? '<a class="ha-c-coming-link" href="'+esc(card.linkUrl)+'">'+ctaLabel(card.linkLabel)+'</a>' : '<span>'+esc(card.tag)+'</span>')+'</article>';}).join('')+'</section>'+ 
          '<section class="ha-c-collective"><div><p class="ha-c-eyebrow">'+esc(collective.kicker)+'</p><h2>'+esc(collective.heading)+'</h2><p>'+esc(collective.body)+'</p></div>'+newsletterForm(collective)+'</section>'+ 
        '</main>'+ 
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect & legal</div><a href="'+esc(footer.instagramUrl)+'" target="_blank" rel="noopener">Instagram</a><a href="'+esc(footer.privacyUrl)+'">Privacy policy</a><a href="'+esc(footer.termsUrl)+'">Terms</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div></footer>'+ 
      '</div>';
  }

  function isCollections(){ var p=location.pathname.replace(/\/$/,''); return p==='/collections'; }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-c-mobile-menu');
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
    if(!isCollections()) return;
    if(document.getElementById('ha-collections-v1')) return;
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    document.body.classList.add('ha-collections-v1-active');
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
