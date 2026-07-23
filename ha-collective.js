(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function normalPath(){ return location.pathname.replace(/\/$/,'') || '/'; }
  function shouldRunCollective(){ var p=normalPath(); return p==='/collective' || p==='/the-collective'; }
  if(!shouldRunCollective()) return;

  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-collective-css')) return;
    var link=document.createElement('link');
    link.id='ha-collective-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_COLLECTIVE_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-collective-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-collective-content';
    s.src=base+'content.collective.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Collective content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function safeHtml(value){ return String(value == null ? '' : value); }
  function image(content,key){ return esc((content.images && content.images[key]) || ''); }
  function hasUrl(value){ return typeof value === 'string' && value.trim() && value.trim() !== '#'; }
  function ctaLabel(label){
    var clean = String(label == null ? '' : label).replace(/\s*[→›»]+\s*$/,'');
    return '<span class="ha-v3-cta-text">'+esc(clean)+'</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span>';
  }
  function navLinks(items){
    return (items||[]).map(function(item){
      var cls = item.active ? ' class="is-active" aria-current="page"' : '';
      return '<a href="'+esc(item.url)+'"'+cls+'>'+esc(item.label)+'</a>';
    }).join('');
  }
  function footerLinks(C){
    var footer=C.footer || {};
    return ''+
      '<a href="'+esc(footer.instagramUrl || 'https://www.instagram.com')+'" target="_blank" rel="noopener">Instagram</a>'+
      '<a href="'+esc(footer.privacyUrl || '/privacy')+'">Privacy policy</a>'+
      '<a href="'+esc(footer.accessibilityUrl || '/accessibility')+'">Accessibility</a>'+
      '<a href="'+esc(footer.whySellUrl || '/why-we-sell-this-way')+'">Why I sell this way</a>';
  }
  function formHtml(form){
    form = form || {};
    var action = form.formAction || '/collective';
    var method = (form.formMethod || 'get').toLowerCase();
    var emailName = form.emailFieldName || 'email';
    var consentName = form.consentName || 'consent';
    return ''+
      '<aside class="ha-collective-form-panel" aria-label="Join the Collective">'+
        '<p class="ha-collective-form-eyebrow">'+esc(form.heading || 'Join the Collective')+'</p>'+
        '<form class="ha-collective-form" action="'+esc(action)+'" method="'+esc(method)+'" data-provider="'+esc(form.provider || 'holding-page')+'">'+
          '<label class="ha-v3-sr-only" for="ha-collective-email">'+esc(form.emailLabel || 'Email address')+'</label>'+
          '<input id="ha-collective-email" class="ha-collective-input" type="email" name="'+esc(emailName)+'" placeholder="'+esc(form.emailPlaceholder || 'Your email address')+'" autocomplete="email" required>'+
          '<label class="ha-collective-consent"><input type="checkbox" name="'+esc(consentName)+'" value="yes" required><span>'+esc(form.consentLabel || 'I agree to receive occasional emails from The Hope Anthology and can unsubscribe at any time.')+'</span></label>'+
          '<button class="ha-v3-btn-gold ha-collective-submit" type="submit">'+ctaLabel(form.buttonLabel || 'Join the Collective')+'</button>'+
          '<p class="ha-collective-note">'+esc(form.note || 'No spam. Unsubscribe whenever.')+'</p>'+
        '</form>'+
      '</aside>';
  }
  function bodyHtml(paragraphs){
    return (paragraphs||[]).map(function(text){
      var cls = /^\(.+\)$/.test(text) ? ' class="ha-collective-aside-copy"' : '';
      return '<p'+cls+'>'+esc(text)+'</p>';
    }).join('');
  }
  function html(){
    var C=window.HA_COLLECTIVE_CONTENT || {};
    var hero=C.hero || {};
    var footer=C.footer || {};
    return ''+
      '<div id="ha-collective-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><span class="ha-v3-sr-only">The Hope Anthology</span></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-collective-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-collective-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+
        '<main class="ha-collective-page">'+
          '<section class="ha-collective-hero" aria-labelledby="ha-collective-title"><div class="ha-collective-hero-left"><p class="ha-collective-eyebrow">'+esc(hero.eyebrow || 'Collective')+'</p><h1 id="ha-collective-title" class="ha-collective-h1">'+safeHtml(hero.headlineHtml || 'Something worth being <em>part of.</em>')+'</h1></div><div class="ha-collective-hero-rule" aria-hidden="true"></div></section>'+
          '<section class="ha-collective-copy-section"><div class="ha-collective-copy">'+bodyHtml(C.body)+'</div>'+formHtml(C.form)+'</section>'+
        '</main>'+
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect & legal</div>'+footerLinks(C)+'</div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '© The Hope Anthology 2026')+'</span></div></footer>'+
      '</div>';
  }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-collective-mobile-menu');
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
    document.body.classList.add('ha-collective-mounted');
    var keep = root;
    Array.prototype.forEach.call(document.body.children,function(child){
      if(child === keep || child.contains(keep)) return;
      if(child.tagName === 'SCRIPT' || child.tagName === 'STYLE' || child.tagName === 'LINK' || child.tagName === 'NOSCRIPT') return;
      child.setAttribute('data-ha-collective-hidden','true');
      child.style.display='none';
    });
  }
  function mount(){
    if(!shouldRunCollective()) return;
    var existing=document.getElementById('ha-collective-v1');
    if(existing){ suppressSquarespaceFallback(existing); return; }
    if(!document.body){ setTimeout(mount,150); return; }
    var wrap=document.createElement('div');
    wrap.innerHTML=html();
    var root=wrap.firstChild;
    document.body.insertBefore(root,document.body.firstChild);
    bindMobileNav(root);
    suppressSquarespaceFallback(root);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
    setTimeout(mount,600);
    setTimeout(mount,1400);
  });
})();
