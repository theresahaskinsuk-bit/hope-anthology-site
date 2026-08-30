(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-v3-css')) return;
    var link=document.createElement('link');
    link.id='ha-v3-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_FOR_ORGANISATIONS_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-for-organisations-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-for-organisations-content';
    s.src=base+'content.for-organisations.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology For Organisations content file could not be loaded.'); done(); };
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
  function ctaLabel(label){
    var clean = String(label == null ? '' : label).replace(/\s*[→›»]+\s*$/,'');
    return '<span class="ha-v3-cta-text">'+esc(clean)+'</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span>';
  }
  function navLinks(items){
    var current = location.pathname.replace(/\/$/,'') || '/';
    return (items||[]).map(function(item){
      var href = item.url || '#';
      var active = (href.replace(/\/$/,'') || '/') === current;
      return '<a href="'+esc(href)+'"'+(active ? ' aria-current="page"' : '')+'>'+esc(item.label === 'Collaborate' ? 'For Artists' : (item.label === 'My Story' ? 'The Story' : item.label))+'</a>';
    }).join('');
  }
  function card(item){
    return '<article class="ha-v3-card"><div class="ha-v3-card-body"><h2 class="ha-v3-card-title">'+esc(item.heading)+'</h2><p class="ha-v3-card-copy">'+safeHtml(item.bodyHtml)+'</p></div></article>';
  }
  function whySection(why){
    return '<section class="ha-col-current" aria-label="Why this is built this way"><div class="ha-col-current-grid"><div class="ha-col-conversation-copy"><p class="ha-col-eyebrow">'+esc(why.eyebrow)+'</p><p>'+safeHtml(why.quoteHtml)+'</p><div class="ha-v3-panel-link">'+esc(why.aside)+'</div></div><div><p class="ha-v3-card-copy">'+esc((why.paragraphs||[])[0])+'</p><p class="ha-v3-card-copy">'+esc((why.paragraphs||[])[1])+'</p></div></div></section>';
  }
  function contactSection(contact){
    var email = contact.emailAddress || 'theresa@thehopeanthology.art';
    var href = 'mailto:' + email;
    return '<section class="ha-col-main" aria-label="Contact"><div class="ha-make-feature"><div class="ha-make-feature-copy"><h2>'+esc(contact.heading)+'</h2><p>'+esc((contact.paragraphs||[])[0])+'</p><p>'+esc((contact.paragraphs||[])[1])+'</p></div><div class="ha-make-feature-copy"><a class="ha-c-btn ha-c-btn-teal" href="'+esc(href)+'">'+ctaLabel(contact.emailLabel || 'Email Theresa')+'</a><p class="ha-v3-card-copy">Email: <a href="'+esc(href)+'">'+esc(email)+'</a></p></div></div></section>';
  }
  function html(){
    var C=window.HA_FOR_ORGANISATIONS_CONTENT || {};
    var page=C.page || {};
    var why=C.why || {};
    var contact=C.contact || {};
    var footer=C.footer || {};
    return ''+
      '<div id="ha-for-organisations-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><h1 class="ha-v3-sr-only">Collaborate — The Hope Anthology</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-col-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-col-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+
        '<main class="ha-col-main">'+
          '<header class="ha-col-header"><p class="ha-col-eyebrow">'+esc(page.eyebrow)+'</p><h2>'+safeHtml(page.headlineHtml)+'</h2><p>'+esc(page.intro)+'</p></header>'+
          '<section class="ha-col-white-section" aria-label="Three principles"><div class="ha-v3-cards">'+(C.cards||[]).map(card).join('')+'</div></section>'+
          whySection(why)+
          contactSection(contact)+
        '</main>'+
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt="The Hope Anthology botanical star"><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'<a href="/for-organisations">For organisations</a>'+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div><a href="'+esc(footer.privacyUrl)+'">Privacy policy</a><a href="'+esc(footer.accessibilityUrl)+'">Accessibility</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div></footer>'+
      '</div>';
  }
  function isForOrganisations(){ return (location.pathname.replace(/\/$/,'') || '/') === '/for-organisations'; }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-col-mobile-menu');
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
  function suppressSquarespaceFallback(root){
    if(!root) return;
    root.setAttribute('data-fallback-suppressed','true');
    Array.prototype.forEach.call(document.body.children,function(node){
      if(node === root) return;
      if(/^(SCRIPT|STYLE|LINK|NOSCRIPT)$/i.test(node.tagName)) return;
      node.setAttribute('data-ha-for-organisations-hidden','true');
      node.hidden=true;
    });
  }
  function mount(){
    if(!isForOrganisations()) return;
    var existingRoot = document.getElementById('ha-for-organisations-v1');
    if(existingRoot){
      suppressSquarespaceFallback(existingRoot);
      bindMobileNav(existingRoot);
      return;
    }
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    var wrap=document.createElement('div');
    wrap.innerHTML=html();
    var root=wrap.firstChild;
    anchor.parentNode.insertBefore(root,anchor);
    suppressSquarespaceFallback(root);
    bindMobileNav(root);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
    setTimeout(mount,600);
    setTimeout(mount,1400);
  });
})();
