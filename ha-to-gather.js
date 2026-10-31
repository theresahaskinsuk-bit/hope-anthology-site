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
  function shouldRunGather(){ return normalPath()==='/to-gather'; }
  if(!shouldRunGather()) return;

  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-to-gather-css')) return;
    var link=document.createElement('link');
    link.id='ha-to-gather-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_TO_GATHER_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-to-gather-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-to-gather-content';
    s.src=base+'content.to-gather.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology To Gather content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  /* Only <em> is allowed through in headings; everything else is escaped. */
  function safeHeading(value){
    return esc(value).replace(/&lt;em&gt;/g,'<em>').replace(/&lt;\/em&gt;/g,'</em>');
  }
  function image(content,key){ return esc((content.images && content.images[key]) || ''); }
  function navLinks(items){
    return (items||[]).map(function(item){
      var cls = item.active ? ' class="is-active" aria-current="page"' : '';
      return '<a href="'+esc(item.url)+'"'+cls+'>'+esc(item.label)+'</a>';
    }).join('');
  }
  function footerExplore(items){
    return (items||[]).map(function(item){ return '<a href="'+esc(item.url)+'">'+esc(item.label)+'</a>'; }).join('');
  }
  function footerLinks(){
    return ''+
      '<a href="/contact">Contact</a><a href="/collective">Collective</a>'+
      '<a href="https://www.instagram.com/hopeanthology/" target="_blank" rel="noopener" aria-label="Instagram (opens in a new tab)">Instagram</a>'+
      '<a href="/privacy">Privacy policy</a>'+
      '<a href="/accessibility">Accessibility</a>';
  }
  function img(i,cls){
    if(!i || !i.src) return '';
    return '<img class="'+cls+'" src="'+esc(i.src)+'" alt="'+esc(i.alt||'')+'" loading="lazy" decoding="async">';
  }
  function cardHtml(card){
    card = card || {};
    return '<article class="ha-tg-card">'+
      '<div class="ha-tg-card-img">'+img(card.image,'ha-tg-card-photo')+'</div>'+
      '<h3><em>'+esc(card.lead)+'</em> '+esc(card.rest)+'</h3>'+
      '<p>'+esc(card.text)+'</p>'+
    '</article>';
  }
  function html(){
    var C=window.HA_TO_GATHER_CONTENT || {};
    var hero=C.hero || {}, update=C.update || {}, ways=C.ways || {}, invite=C.invite || {}, footer=C.footer || {};
    var paras=(hero.paragraphs||[]).map(function(t){ return '<p>'+esc(t)+'</p>'; }).join('');
    return ''+
      '<div id="ha-to-gather-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><span class="ha-v3-sr-only">The Hope Anthology</span></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-to-gather-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-to-gather-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+
        '<main class="ha-tg-page">'+
          '<section class="ha-tg-hero" aria-labelledby="ha-tg-title"><div class="ha-tg-wrap ha-tg-hero-grid">'+
            '<div class="ha-tg-hero-top"><p class="ha-tg-eyebrow">'+esc(hero.eyebrow || 'To Gather')+'</p><h1 id="ha-tg-title">'+safeHeading(hero.headingHtml || 'To Gather')+'</h1></div>'+
            '<div class="ha-tg-hero-body">'+paras+'</div>'+
            (hero.image && hero.image.src ? '<figure class="ha-tg-hero-figure">'+img(hero.image,'ha-tg-hero-photo')+'</figure>' : '')+
          '</div></section>'+
          (update.text ? '<section class="ha-tg-update" aria-labelledby="ha-tg-update-title"><div class="ha-tg-wrap"><div class="ha-tg-update-box"><h2 id="ha-tg-update-title">'+esc(update.heading || 'A little update')+'</h2><p>'+esc(update.text)+'</p></div></div></section>' : '')+
          '<section class="ha-tg-ways" aria-labelledby="ha-tg-ways-title"><div class="ha-tg-wrap"><h2 id="ha-tg-ways-title">'+esc(ways.heading || 'Ways to gather')+'</h2><div class="ha-tg-cards">'+(ways.cards||[]).map(cardHtml).join('')+'</div></div></section>'+
          '<section class="ha-tg-invite" aria-labelledby="ha-tg-invite-title"><div class="ha-tg-wrap"><h2 id="ha-tg-invite-title">'+esc(invite.heading || '')+'</h2><p>'+esc(invite.text || '')+'</p>'+
            (invite.buttonUrl ? '<a class="ha-c-btn ha-c-btn-gold ha-tg-btn" href="'+esc(invite.buttonUrl)+'"><span class="ha-v3-cta-text">'+esc(invite.buttonLabel || 'Email Theresa')+'</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span></a>' : '')+
          '</div></section>'+
        '</main>'+
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Explore</div><a href="/">Home</a>'+footerExplore(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Collaborate</div><a href="/for-artists">For Artists</a><a href="/for-organisations">For Organisations</a>'+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect</div>'+footerLinks()+'</div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '© The Hope Anthology 2026')+'</span></div></footer>'+
      '</div>';
  }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-to-gather-mobile-menu');
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
    document.body.classList.add('ha-to-gather-mounted');
    var keep = root;
    Array.prototype.forEach.call(document.body.children,function(child){
      if(child === keep || child.contains(keep)) return;
      if(child.tagName === 'SCRIPT' || child.tagName === 'STYLE' || child.tagName === 'LINK' || child.tagName === 'NOSCRIPT') return;
      child.setAttribute('data-ha-to-gather-hidden','true');
      child.style.display='none';
    });
  }
  function mount(){
    if(!shouldRunGather()) return;
    var existing=document.getElementById('ha-to-gather-v1');
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
