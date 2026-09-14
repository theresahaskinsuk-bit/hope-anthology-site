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

  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function normalPath(){ return location.pathname.replace(/\/$/,'') || '/'; }
  function shouldRunContact(){ return normalPath()==='/contact'; }
  if(!shouldRunContact()) return;

  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-contact-css')) return;
    var link=document.createElement('link');
    link.id='ha-contact-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_CONTACT_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-contact-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-contact-content';
    s.src=base+'content.contact.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Contact content file could not be loaded.'); done(); };
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
  function footerLinks(){
    return ''+
      '<a href="/contact">Contact</a>'+
      '<a href="https://www.instagram.com/hopeanthology/" target="_blank" rel="noopener" aria-label="Instagram (opens in a new tab)">Instagram</a>'+
      '<a href="/privacy">Privacy policy</a>'+
      '<a href="/accessibility">Accessibility</a>';
  }
  function paragraphsHtml(paragraphs){
    return (paragraphs||[]).map(function(text){ return '<p>'+esc(text)+'</p>'; }).join('');
  }
  function sectionHtml(section){
    section = section || {};
    var email = section.email ? '<p><a class="ha-contact-email" href="'+esc(section.email.url)+'">'+esc(section.email.label)+'</a></p>' : '';
    var cta = section.cta ? '<p><a class="ha-contact-cta" href="'+esc(section.cta.url)+'">'+esc(section.cta.label)+'</a></p>' : '';
    var link = section.link ? '<p><a class="ha-contact-link" href="'+esc(section.link.url)+'"'+(section.link.target ? ' target="'+esc(section.link.target)+'"' : '')+(section.link.rel ? ' rel="'+esc(section.link.rel)+'"' : '')+(section.link.ariaLabel ? ' aria-label="'+esc(section.link.ariaLabel)+'"' : '')+'>'+esc(section.link.label)+'</a></p>' : '';
    var privacy = section.privacy ? '<p>'+esc(section.privacy.before)+'<a class="ha-contact-link" href="'+esc(section.privacy.url)+'">'+esc(section.privacy.label)+'</a>'+esc(section.privacy.after)+'</p>' : '';
    return '<section class="ha-contact-section"><h2>'+esc(section.heading || '')+'</h2>'+paragraphsHtml(section.paragraphs)+email+cta+link+privacy+'</section>';
  }
  function sectionsHtml(sections){
    return (sections||[]).map(sectionHtml).join('');
  }
  function html(){
    var C=window.HA_CONTACT_CONTENT || {};
    var page=C.page || {};
    var footer=C.footer || {};
    return ''+
      '<div id="ha-contact-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><span class="ha-v3-sr-only">The Hope Anthology</span></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-contact-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-contact-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+ 
        '<main class="ha-contact-page" aria-labelledby="ha-contact-title"><article class="ha-contact-article"><header class="ha-contact-header"><h1 id="ha-contact-title">'+esc(page.title || 'How to get in touch')+'</h1><p class="ha-contact-intro">'+esc(page.intro || '')+'</p></header><div class="ha-contact-body">'+sectionsHtml(C.sections)+'</div></article></main>'+ 
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'<a href="/for-organisations">For Organisations</a>'+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div>'+footerLinks()+'</div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '© The Hope Anthology 2026')+'</span></div></footer>'+
      '</div>';
  }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-contact-mobile-menu');
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
    document.body.classList.add('ha-contact-mounted');
    var keep = root;
    Array.prototype.forEach.call(document.body.children,function(child){
      if(child === keep || child.contains(keep)) return;
      if(child.tagName === 'SCRIPT' || child.tagName === 'STYLE' || child.tagName === 'LINK' || child.tagName === 'NOSCRIPT') return;
      child.setAttribute('data-ha-contact-hidden','true');
      child.style.display='none';
    });
  }
  function mount(){
    if(!shouldRunContact()) return;
    var existing=document.getElementById('ha-contact-v1');
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
