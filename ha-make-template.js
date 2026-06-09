(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();
  var HIDDEN_H1_STYLE = 'position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;';

  function loadCss(){
    if(document.getElementById('ha-v3-css')) return;
    var link=document.createElement('link');
    link.id='ha-v3-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }
  function loadContent(done){
    if(window.HA_MAKE_TEMPLATE_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-make-template-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-make-template-content';
    s.src=base+'content.make-template.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Make template content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }
  function esc(value){return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function safeHtml(value){return String(value == null ? '' : value);}
  function isAbsoluteUrl(value){return /^(https?:)?\/\//.test(String(value || '')) || /^data:/.test(String(value || '')) || /^\//.test(String(value || ''));}
  function assetUrl(value){value=String(value == null ? '' : value); if(!value) return ''; return isAbsoluteUrl(value) ? value : base + value.replace(/^\.\//,'');}
  function image(C,key){return esc(assetUrl((C.images && C.images[key]) || ''));}
  function hasUrl(value){return typeof value === 'string' && value.trim() && value.trim() !== '#';}
  function isExternal(value){return /^https?:\/\//.test(String(value || ''));}
  function linkAttrs(url){return isExternal(url) ? ' target="_blank" rel="noopener"' : '';}
  function ctaLabel(label){var clean=String(label == null ? '' : label).replace(/\s*[→›»]+\s*$/,''); return '<span class="ha-v3-cta-text">'+esc(clean)+'</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span>';}
  function navLinks(items){var current=location.pathname.replace(/\/$/,'') || '/'; return (items||[]).map(function(item){var href=item.url || '#'; var active=(href.replace(/\/$/,'') || '/')===current; return '<a href="'+esc(href)+'"'+(active ? ' aria-current="page"' : '')+'>'+esc(item.label)+'</a>';}).join('');}
  function linkOrSpan(cls,url,label){return hasUrl(url) ? '<a class="'+cls+'" href="'+esc(url)+'"'+linkAttrs(url)+'>'+ctaLabel(label)+'</a>' : '<span class="'+cls+' ha-make-disabled" aria-disabled="true">'+esc(label || 'Coming soon')+'</span>';}
  function tagList(tags){return (tags||[]).map(function(tag){return '<span>'+esc(tag)+'</span>';}).join('');}
  function breadcrumbs(items){return '<nav class="ha-make-breadcrumb" aria-label="Breadcrumb">'+(items||[]).map(function(item,index){var last=index===(items.length-1); var label=esc(item.label); return (index ? '<span class="ha-make-breadcrumb-sep" aria-hidden="true">›</span>' : '') + (last || !item.url ? '<span aria-current="page">'+label+'</span>' : '<a href="'+esc(item.url)+'">'+label+'</a>');}).join('')+'</nav>';}
  function newsletterForm(collective){var action=collective.formAction || '/collective'; var method=(collective.formMethod || 'get').toLowerCase(); var emailName=collective.emailFieldName || 'email'; var provider=collective.provider || 'holding-page'; return '<form class="ha-c-form ha-make-form" action="'+esc(action)+'" method="'+esc(method)+'" data-provider="'+esc(provider)+'"><label class="ha-v3-sr-only" for="ha-make-email">'+esc(collective.emailLabel || 'Email address')+'</label><input id="ha-make-email" class="ha-c-input" type="email" name="'+esc(emailName)+'" placeholder="'+esc(collective.emailPlaceholder || 'Email address')+'" autocomplete="email" required><button class="ha-c-btn ha-c-btn-teal" type="submit">'+ctaLabel(collective.buttonLabel || 'Join the Collective')+'</button><p class="ha-c-note">'+esc(collective.note || '')+'</p></form>';}
  function projectCard(C,card,index){return '<article class="ha-make-card"><a class="ha-make-card-img ha-v3-image-link" href="'+esc(hasUrl(card.primaryUrl) ? card.primaryUrl : '#make-population-notes')+'" aria-label="'+esc(card.title)+'"><img src="'+image(C,card.imageKey)+'" alt="'+esc(card.alt || card.title)+'"></a><div class="ha-make-card-body"><div class="ha-make-card-meta"><span>'+esc(card.status || 'Coming soon')+'</span><span>'+esc(card.difficulty || '')+'</span><span>'+esc(card.format || '')+'</span></div><h3>'+esc(card.title)+'</h3><p>'+esc(card.body)+'</p><div class="ha-make-tags">'+tagList(card.tags)+'</div>'+linkOrSpan('ha-make-card-link',card.primaryUrl,card.primaryLabel || 'Coming soon')+'</div></article>';}
  function html(){
    var C=window.HA_MAKE_TEMPLATE_CONTENT || {};
    var page=C.page || {}; var hero=C.hero || {}; var featured=C.featured || {}; var collective=C.collective || {}; var footer=C.footer || {}; var notes=C.populationNotes || {};
    return '<div id="ha-make-template-v1">'+
      '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><h1 class="ha-v3-sr-only" style="'+HIDDEN_H1_STYLE+'">'+esc(page.hiddenHeading || page.title || 'To Make')+'</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-make-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-make-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+
      '<main class="ha-make-main">'+breadcrumbs(C.breadcrumbs)+
        '<section class="ha-make-hero"><div class="ha-make-hero-copy"><p class="ha-make-eyebrow">'+esc(hero.eyebrow || 'To Make')+'</p><h2>'+safeHtml(hero.headingHtml || '')+'</h2><p>'+esc(hero.intro || '')+'</p><div class="ha-make-actions"><a class="ha-c-btn ha-c-btn-gold" href="'+esc(hero.primaryUrl || '#make-projects')+'">'+ctaLabel(hero.primaryLabel || 'Browse projects')+'</a>'+linkOrSpan('ha-c-btn ha-c-btn-ghost',hero.secondaryUrl,hero.secondaryLabel || 'Guide')+'</div></div><div class="ha-make-hero-media"><img src="'+image(C,hero.imageKey || 'hero')+'" alt="'+esc(hero.imageAlt || '')+'"></div></section>'+
        '<section class="ha-make-stats" aria-label="Make template summary">'+(C.stats||[]).map(function(stat){return '<article><strong>'+esc(stat.number)+'</strong><span>'+esc(stat.label)+'</span></article>';}).join('')+'</section>'+
        '<section class="ha-make-feature"><div class="ha-make-feature-media"><img src="'+image(C,featured.imageKey || 'featured')+'" alt="'+esc(featured.alt || featured.title || '')+'"></div><div class="ha-make-feature-copy"><p class="ha-make-eyebrow">'+esc(featured.eyebrow || 'Featured make')+'</p><h2>'+esc(featured.title || '')+'</h2><p>'+esc(featured.body || '')+'</p><div class="ha-make-feature-meta"><span>'+esc(featured.status || '')+'</span><span>'+esc(featured.difficulty || '')+'</span><span>'+esc(featured.format || '')+'</span></div><div class="ha-make-tags">'+tagList(featured.tags)+'</div><div class="ha-make-actions">'+linkOrSpan('ha-c-btn ha-c-btn-teal',featured.primaryUrl,featured.primaryLabel || 'Coming soon')+linkOrSpan('ha-c-btn ha-c-btn-ghost',featured.secondaryUrl,featured.secondaryLabel || 'Preview soon')+'</div></div></section>'+
        '<section id="make-projects" class="ha-make-projects"><div class="ha-make-section-head"><p class="ha-make-eyebrow">Project library</p><h2>Make modules ready to populate</h2><p>These placeholder cards are sized for readable tabs, meaning-style copy, highlight chips, and final product links.</p></div><div class="ha-make-grid">'+(C.projects||[]).map(function(card,index){return projectCard(C,card,index);}).join('')+'</div></section>'+
        '<section class="ha-make-resources" aria-label="Supporting make resources">'+(C.resources||[]).map(function(item){return '<article><span>'+esc(item.label)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.body)+'</p></article>';}).join('')+'</section>'+
        '<section id="make-population-notes" class="ha-make-population"><p class="ha-make-eyebrow">Population workflow</p><h2>'+esc(notes.heading || 'Ready for the contact sheet')+'</h2><p>'+esc(notes.body || '')+'</p></section>'+
        '<section class="ha-c-collective ha-make-collective"><div><p class="ha-c-eyebrow">'+esc(collective.kicker || 'The Collective')+'</p><h2>'+esc(collective.heading || '')+'</h2><p>'+esc(collective.body || '')+'</p></div>'+newsletterForm(collective)+'</section>'+
      '</main>'+
      '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect & legal</div><a href="'+esc(footer.instagramUrl || '#')+'" target="_blank" rel="noopener">Instagram</a><a href="'+esc(footer.privacyUrl || '/privacy-policy')+'">Privacy policy</a><a href="'+esc(footer.termsUrl || '/terms')+'">Terms</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '© The Hope Anthology')+'</span></div></footer>'+
    '</div>';
  }
  function isMakeRoute(){var p=location.pathname.replace(/\/$/,'') || '/'; return p==='/make' || p==='/to-make' || p==='/collections/to-make' || /local-preview-make/i.test(p) || (script && script.getAttribute('data-ha-make-template') === 'true');}
  function bindMobileNav(root){var toggle=root.querySelector('.ha-v3-menu-toggle'); var menu=root.querySelector('#ha-make-mobile-menu'); if(!toggle || !menu || toggle.getAttribute('data-bound')==='true') return; toggle.setAttribute('data-bound','true'); toggle.addEventListener('click',function(){var open=toggle.getAttribute('aria-expanded')==='true'; toggle.setAttribute('aria-expanded',String(!open)); toggle.setAttribute('aria-label',open ? 'Open menu' : 'Close menu'); root.classList.toggle('ha-v3-menu-open',!open);}); menu.addEventListener('click',function(event){if(event.target && event.target.tagName==='A'){toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open menu'); root.classList.remove('ha-v3-menu-open');}});}
  function mount(){if(!isMakeRoute()) return; if(document.getElementById('ha-make-template-v1')) return; var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild; if(!anchor){setTimeout(mount,150); return;} document.body.classList.add('ha-make-template-active'); var wrap=document.createElement('div'); wrap.innerHTML=html(); var root=wrap.firstChild; anchor.parentNode.insertBefore(root,anchor); bindMobileNav(root);}
  loadCss();
  loadContent(function(){if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount(); setTimeout(mount,600);});
})();
