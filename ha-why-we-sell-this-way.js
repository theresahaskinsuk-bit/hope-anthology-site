(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function normalPath(){ return location.pathname.replace(/\/$/,'') || '/'; }
  function shouldRunWhy(){ return normalPath()==='/why-we-sell-this-way'; }
  if(!shouldRunWhy()) return;

  function loadCss(){
    if(document.getElementById('ha-stability-v12-css') || document.getElementById('ha-why-css')) return;
    var link=document.createElement('link');
    link.id='ha-why-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_WHY_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-why-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-why-content';
    s.src=base+'content.why-we-sell-this-way.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Why we sell this way content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function image(content,key){ return esc((content.images && content.images[key]) || ''); }
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
      '<a class="is-active" aria-current="page" href="'+esc(footer.whySellUrl || '/why-we-sell-this-way')+'">Why we sell this way</a>';
  }
  function paragraphsHtml(paragraphs){
    return (paragraphs||[]).map(function(text){ return '<p>'+esc(text)+'</p>'; }).join('');
  }
  function sectionsHtml(sections){
    return (sections||[]).map(function(section){
      return '<section class="ha-why-section"><h2>'+esc(section.heading || '')+'</h2>'+paragraphsHtml(section.paragraphs)+'</section>';
    }).join('');
  }
  function contactHtml(contact){
    contact = contact || {};
    var link = contact.emailUrl ? '<p><a class="ha-why-contact-link" href="'+esc(contact.emailUrl)+'">'+esc(contact.emailLabel || 'Get in touch')+'</a></p>' : '';
    return '<aside class="ha-why-contact" aria-label="Contact The Hope Anthology"><h2>'+esc(contact.heading || 'Need to ask something first?')+'</h2>'+paragraphsHtml(contact.paragraphs)+link+'</aside>';
  }
  function html(){
    var C=window.HA_WHY_CONTENT || {};
    var page=C.page || {};
    var footer=C.footer || {};
    return ''+
      '<div id="ha-why-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><span class="ha-v3-sr-only">The Hope Anthology</span></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-why-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-why-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+ 
        '<main class="ha-why-page" aria-labelledby="ha-why-title"><article class="ha-why-article"><header class="ha-why-header"><p class="ha-why-eyebrow">'+esc(page.eyebrow || 'How orders work')+'</p><h1 id="ha-why-title">'+esc(page.title || 'Why we sell this way')+'</h1><p class="ha-why-date">'+esc(page.lastUpdated || 'Last updated: June 2026')+'</p></header><div class="ha-why-body">'+sectionsHtml(C.sections)+contactHtml(C.contact)+'</div></article></main>'+ 
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div>'+footerLinks(C)+'</div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '© The Hope Anthology 2026')+'</span></div></footer>'+ 
      '</div>';
  }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-why-mobile-menu');
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
    document.body.classList.add('ha-why-mounted');
    var keep = root;
    Array.prototype.forEach.call(document.body.children,function(child){
      if(child === keep || child.contains(keep)) return;
      if(child.tagName === 'SCRIPT' || child.tagName === 'STYLE' || child.tagName === 'LINK' || child.tagName === 'NOSCRIPT') return;
      child.setAttribute('data-ha-why-hidden','true');
      child.style.display='none';
    });
  }
  function mount(){
    if(!shouldRunWhy()) return;
    var existing=document.getElementById('ha-why-v1');
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
