(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();
  var supportedPaths = ['/info-page-template','/privacy','/privacy-policy','/accessibility','/accessibility-statement'];

  function normalPath(){ return location.pathname.replace(/\/$/,'') || '/'; }
  function shouldRunInfoTemplate(){ return supportedPaths.indexOf(normalPath()) !== -1; }
  if(!shouldRunInfoTemplate()) return;

  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-info-template-css')) return;
    var link=document.createElement('link');
    link.id='ha-info-template-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_INFO_TEMPLATE_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-info-template-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-info-template-content';
    s.src=base+'content.info-page-template.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology info-page-template content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function image(content,key){ return esc((content.images && content.images[key]) || ''); }
  function isActiveUrl(url){ return (url || '').replace(/\/$/,'') === normalPath(); }
  function navLinks(items){
    return (items||[]).map(function(item){
      var cls = item.active || isActiveUrl(item.url) ? ' class="is-active" aria-current="page"' : '';
      return '<a href="'+esc(item.url)+'"'+cls+'>'+esc(item.label)+'</a>';
    }).join('');
  }
  function legalLink(url,label,extraAttrs){
    var active = isActiveUrl(url);
    return '<a'+(active ? ' class="is-active" aria-current="page"' : '')+' href="'+esc(url)+'"'+(extraAttrs || '')+'>'+esc(label)+'</a>';
  }
  function footerLinks(C){
    var footer=C.footer || {};
    return ''+
      '<a href="'+esc(footer.instagramUrl || 'https://www.instagram.com')+'" target="_blank" rel="noopener">Instagram</a>'+ 
      legalLink(footer.privacyUrl || '/privacy','Privacy policy')+
      legalLink(footer.accessibilityUrl || '/accessibility','Accessibility')+
      legalLink(footer.whySellUrl || '/why-we-sell-this-way','Why we sell this way')+
      legalLink(footer.infoTemplateUrl || '/info-page-template','Info page template');
  }
  function paragraphsHtml(paragraphs){
    return (paragraphs||[]).map(function(text){ return '<p>'+esc(text)+'</p>'; }).join('');
  }
  function listHtml(items){
    if(!items || !items.length) return '';
    return '<ul>'+items.map(function(text){ return '<li>'+esc(text)+'</li>'; }).join('')+'</ul>';
  }
  function sectionsHtml(sections){
    return (sections||[]).map(function(section){
      return '<section class="ha-info-template-section"><h2>'+esc(section.heading || '')+'</h2>'+paragraphsHtml(section.paragraphs)+listHtml(section.listItems)+'</section>';
    }).join('');
  }
  function contactLinksHtml(links){
    if(!links || !links.length) return '';
    return '<div class="ha-info-template-contact-links">'+links.map(function(link){
      return '<a href="'+esc(link.url)+'">'+esc(link.label)+'</a>';
    }).join('')+'</div>';
  }
  function contactDetailsHtml(details){
    if(!details || !details.length) return '';
    return details.map(function(text){ return '<p><strong>'+esc(text)+'</strong></p>'; }).join('');
  }
  function contactHtml(contact){
    contact = contact || {};
    return '<aside class="ha-info-template-contact" aria-label="Contact The Hope Anthology"><h2>'+esc(contact.heading || 'Contact')+'</h2>'+contactDetailsHtml(contact.details)+paragraphsHtml(contact.paragraphs)+contactLinksHtml(contact.links)+'</aside>';
  }
  function currentContent(){
    var C=window.HA_INFO_TEMPLATE_CONTENT || {};
    var pagePack = (C.pages && C.pages[normalPath()]) || {
      page: C.page,
      sections: C.sections,
      contact: C.contact
    };
    return {
      base: C,
      pagePack: pagePack || {},
      page: (pagePack && pagePack.page) || C.page || {},
      sections: (pagePack && pagePack.sections) || C.sections || [],
      contact: (pagePack && pagePack.contact) || C.defaultContact || C.contact || {}
    };
  }
  function html(){
    var data=currentContent();
    var C=data.base;
    var page=data.page || {};
    var footer=C.footer || {};
    return ''+
      '<div id="ha-info-template-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><span class="ha-v3-sr-only">The Hope Anthology</span></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-info-template-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-info-template-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+ 
        '<main class="ha-info-template-page" aria-labelledby="ha-info-template-title"><article class="ha-info-template-article"><header class="ha-info-template-header"><p class="ha-info-template-eyebrow">'+esc(page.eyebrow || 'Information page')+'</p><h1 id="ha-info-template-title">'+esc(page.title || 'Info page')+'</h1><p class="ha-info-template-date">'+esc(page.lastUpdated || 'Last updated: June 2026')+'</p><hr class="ha-info-template-rule"></header><div class="ha-info-template-body">'+sectionsHtml(data.sections)+contactHtml(data.contact)+'</div></article></main>'+ 
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div>'+footerLinks(C)+'</div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '© The Hope Anthology 2026')+'</span></div></footer>'+ 
      '</div>';
  }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-info-template-mobile-menu');
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
    document.body.classList.add('ha-info-template-mounted');
    var keep = root;
    Array.prototype.forEach.call(document.body.children,function(child){
      if(child === keep || child.contains(keep)) return;
      if(child.tagName === 'SCRIPT' || child.tagName === 'STYLE' || child.tagName === 'LINK' || child.tagName === 'NOSCRIPT') return;
      child.setAttribute('data-ha-info-template-hidden','true');
      child.style.display='none';
    });
  }
  function mount(){
    if(!shouldRunInfoTemplate()) return;
    var existing=document.getElementById('ha-info-template-v1');
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
