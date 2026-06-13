(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function hasSharedStylesheet(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-v3-css')) return true;
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for(var i=0;i<links.length;i++){
      var href = links[i].href || '';
      if(/hope-anthology-site/i.test(href) && /styles\.css/i.test(href)) return true;
    }
    return false;
  }

  function loadCss(){
    if(hasSharedStylesheet()) return;
    var link=document.createElement('link');
    link.id='ha-v3-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_MAKE_TEMPLATE_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-make-template-content');
    if(existing){ existing.addEventListener('load', done); existing.addEventListener('error', done); return; }
    var s=document.createElement('script');
    s.id='ha-make-template-content';
    s.src=base+'content.make-template.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Make template content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function injectScopedTheme(){
    if(document.getElementById('ha-make-keep-structured-theme')) return;
    var style=document.createElement('style');
    style.id='ha-make-keep-structured-theme';
    style.textContent='body.ha-make-template-v1-active > #sections,body.ha-make-template-v1-active > main:not(.ha-kc-main),body.ha-make-template-v1-active #sections,body.ha-make-template-v1-active #footer-sections,body.ha-make-template-v1-active .Header,body.ha-make-template-v1-active header.Header,body.ha-make-template-v1-active #header,body.ha-make-template-v1-active .page-title,body.ha-make-template-v1-active .entry-title,body.ha-make-template-v1-active .collection-title,body.ha-make-template-v1-active .sqs-block-html > h1,body.ha-make-template-v1-active .sqs-block-content > h1{display:none!important;}body.ha-make-template-v1-active{background:var(--ha-cream,#F2F3EF);}#ha-make-template-v1{--ha-teal:#265b70;--ha-dark:#364449;--ha-cream:#F2F3EF;--ha-linen:#ECEEF0;--ha-gold:#FED22F;--ha-twine:#8B6040;background:var(--ha-cream);min-height:100vh;}#ha-make-template-v1 #ha-keep-collection-v1{--teal:var(--ha-teal);--dark:var(--ha-dark);--cream:var(--ha-cream);--linen:var(--ha-linen);--twine:var(--ha-twine);--gold:var(--ha-gold);--muted:#4f5a5d;--muted-strong:#414c4f;background:var(--cream);}#ha-make-template-v1 .ha-v3-nav{background:var(--ha-teal)!important;}#ha-make-template-v1 .ha-v3-brand:hover .ha-v3-logo,#ha-make-template-v1 .ha-v3-brand:focus-visible .ha-v3-logo{filter:none!important;}#ha-make-template-v1 .ha-v3-nav .ha-v3-links{gap:32px!important;align-items:center!important;}#ha-make-template-v1 .ha-v3-nav .ha-v3-links a,#ha-make-template-v1 .ha-v3-nav .ha-v3-links a:visited{font-family:\'Lora\',Georgia,serif!important;font-size:14px!important;font-weight:400!important;line-height:1.4!important;color:var(--ha-cream)!important;text-decoration:none!important;text-underline-offset:5px!important;text-decoration-thickness:1px!important;}#ha-make-template-v1 .ha-v3-nav .ha-v3-links a:hover,#ha-make-template-v1 .ha-v3-nav .ha-v3-links a:focus-visible,#ha-make-template-v1 .ha-v3-nav .ha-v3-links a[aria-current="page"]{color:#fff!important;text-decoration:underline!important;text-decoration-color:#fff!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-breadcrumb{background:var(--ha-teal)!important;color:rgba(242,243,239,.74)!important;border:0!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-breadcrumb a{color:rgba(242,243,239,.84)!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-current{color:rgba(242,243,239,.96)!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-header{background:var(--ha-teal)!important;padding-top:52px;border:0!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-header h2,#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-header p:not(.ha-kc-eyebrow){color:var(--ha-cream)!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-header h2 em{color:var(--ha-gold)!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-eyebrow{color:rgba(242,243,239,.8)!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-stats strong{color:var(--ha-gold)!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-stats small{color:rgba(242,243,239,.78)!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-bar{background:var(--cream);border-bottom:.5px solid rgba(54,68,73,.1);padding:14px 48px;display:flex;align-items:center;gap:10px;position:sticky;top:72px;z-index:80;overflow-x:auto;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-label{font-size:12px;font-weight:600;color:var(--muted-strong);white-space:nowrap;font-family:\'DM Sans\',sans-serif;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-chip{font-size:12px;padding:6px 14px;border-radius:20px;border:.5px solid rgba(54,68,73,.24);color:var(--muted-strong);cursor:pointer;white-space:nowrap;font-family:\'DM Sans\',sans-serif;background:transparent;line-height:1.2;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-chip.is-active{background:var(--ha-teal);color:var(--ha-cream);border-color:var(--ha-teal);}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-count{margin-left:auto;font-size:12px;color:var(--muted-strong);white-space:nowrap;font-family:\'DM Sans\',sans-serif;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-section-group{margin-bottom:40px;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-section-group:last-child{margin-bottom:0;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-card h3{font-size:18px;font-weight:700;color:var(--dark);margin:0 0 12px;line-height:1.2;font-family:\'DM Sans\',sans-serif;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-btn-secondary{background:rgba(54,68,73,.07);color:var(--muted);border:.5px solid rgba(54,68,73,.14);}#ha-make-template-v1 #ha-keep-collection-v1 .ha-kc-card[data-ha-collab="true"] .ha-kc-btn-secondary{background:var(--twine);color:var(--cream);border:0;}@media (max-width:900px){#ha-make-template-v1 #ha-keep-collection-v1 .ha-v3-menu-toggle{display:inline-flex!important;position:relative;z-index:102;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-v3-nav .ha-v3-links{position:absolute!important;top:72px!important;left:0!important;right:0!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:0!important;background:var(--ha-teal)!important;border-top:.5px solid rgba(242,243,239,.18)!important;padding:8px 24px 18px!important;opacity:0!important;visibility:hidden!important;transform:translateY(-8px)!important;pointer-events:none!important;}#ha-make-template-v1 #ha-keep-collection-v1.ha-v3-menu-open .ha-v3-nav .ha-v3-links{opacity:1!important;visibility:visible!important;transform:translateY(0)!important;pointer-events:auto!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-v3-nav .ha-v3-links a{display:block!important;width:100%!important;padding:12px 0!important;border-bottom:.5px solid rgba(242,243,239,.12)!important;font-size:16px!important;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-bar{padding:12px 24px;top:72px;}#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-count{margin-left:0;}}@media (max-width:640px){#ha-make-template-v1 #ha-keep-collection-v1 .ha-make-filter-bar{top:64px;}}';
    document.head.appendChild(style);
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
  function imageValue(content,value){
    var images = content.images || {};
    return assetUrl(images[value] || value || '');
  }
  function image(content,key){ return esc(imageValue(content,key)); }
  function hasUrl(value){ return typeof value === 'string' && value.trim() && value.trim() !== '#'; }
  function isExternalUrl(value){ return /^https?:\/\//i.test(String(value || '')); }
  function linkAttrs(url){ return isExternalUrl(url) ? ' target="_blank" rel="noopener"' : ''; }
  function ctaLabel(label){
    var clean = String(label == null ? '' : label).replace(/\s*[→›»↗]+\s*$/,'');
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
  function breadcrumbHtml(content){
    var items = content.breadcrumbs || [];
    return '<div class="ha-kc-breadcrumb" aria-label="Breadcrumb">'+items.map(function(item,index){
      var isLast = index === items.length - 1 || !item.url;
      var part = isLast ? '<span class="ha-kc-current">'+esc(item.label)+'</span>' : '<a href="'+esc(item.url)+'">'+esc(item.label)+'</a>';
      return part + (index < items.length - 1 ? '<span class="ha-kc-sep" aria-hidden="true">›</span>' : '');
    }).join('')+'</div>';
  }
  function productImageSet(item){
    var set = item.images || {};
    var fallback = item.imageKey || '';
    return {
      workbench: set.workbench || fallback,
      lifestyle: set.lifestyle || fallback,
      inside: set.inside || fallback
    };
  }
  function productImageAltSet(item){
    var set = item.imageAlts || {};
    var fallback = item.alt || item.title || '';
    return {
      workbench: set.workbench || fallback,
      lifestyle: set.lifestyle || fallback,
      inside: set.inside || fallback
    };
  }
  function cardImage(content,item){
    var set = productImageSet(item);
    var alts = productImageAltSet(item);
    var first = set.workbench ? 'workbench' : (set.lifestyle ? 'lifestyle' : (set.inside ? 'inside' : ''));
    if(first){
      return '<img src="'+esc(imageValue(content,set[first]))+'" alt="'+esc(alts[first] || item.alt || item.title)+'" loading="lazy" decoding="async" data-ha-product-image="true" data-ha-image-type="'+esc(first)+'">';
    }
    return '<div class="ha-kc-card-placeholder" aria-hidden="true"><span>'+esc((item.title || 'P').charAt(0))+'</span></div>';
  }
  function imageButtons(content,item){
    var set = productImageSet(item);
    var alts = productImageAltSet(item);
    var options = [
      { key: 'workbench', label: 'Workbench' },
      { key: 'lifestyle', label: 'Lifestyle' },
      { key: 'inside', label: 'Inside' }
    ];
    return '<div class="ha-kc-swap" role="group" aria-label="Image view for '+esc(item.title || 'pattern')+'">'+options.map(function(option,index){
      var value = set[option.key] || '';
      var alt = alts[option.key] || item.alt || item.title || '';
      return '<button type="button" data-ha-image-src="'+esc(value ? imageValue(content,value) : '')+'" data-ha-image-alt="'+esc(alt)+'" data-ha-image-type="'+esc(option.key)+'" class="'+(index === 0 ? 'is-active' : '')+'">'+esc(option.label)+'</button>';
    }).join('')+'</div>';
  }
  function goodForChips(item){
    var chips = item.goodFor || [];
    if(!chips.length) return '';
    return '<div class="ha-kc-gf-chips">'+chips.map(function(chip){ return '<span>'+esc(chip)+'</span>'; }).join('')+'</div>';
  }
  function makeButton(className,label,url,fallbackLabel){
    var text = label || fallbackLabel || 'Coming soon';
    return hasUrl(url)
      ? '<a class="'+className+'" href="'+esc(url)+'"'+linkAttrs(url)+'>'+ctaLabel(text)+'</a>'
      : '<button class="'+className+' ha-kc-btn-inactive" type="button" disabled>'+ctaLabel(text)+'</button>';
  }
  function productCard(content,item){
    var tags = (item.tags || []).join('|');
    var secondary = item.secondaryLabel || item.secondaryUrl ? makeButton('ha-kc-btn ha-kc-btn-secondary', item.secondaryLabel || 'View another buying option', item.secondaryUrl, 'View another buying option') : '';
    return '<article class="ha-kc-card" data-ha-make-card="true" data-ha-collab="'+(item.collab ? 'true' : 'false')+'" data-title="'+esc(item.title)+'" data-category="'+esc(item.category || '')+'" data-difficulty="'+esc(item.difficulty || '')+'" data-tags="'+esc(tags)+'">'+
      '<div class="ha-kc-card-img-wrap">'+
        '<span class="ha-kc-pip">To Make</span><span class="ha-kc-badge ha-kc-badge-available">Available now</span>'+cardImage(content,item)+
      '</div>'+ 
      imageButtons(content,item)+ 
      '<div class="ha-kc-card-body">'+
        '<p class="ha-kc-card-collection">'+esc(item.collection || item.category || 'Stained glass')+'</p><h3>'+esc(item.title)+'</h3>'+ 
        '<div class="ha-kc-chips"><span><small>Difficulty</small>'+esc(item.difficulty || 'Beginner')+'</span><span><small>Medium</small>'+esc(item.medium || 'Copper foil')+'</span><span><small>Download</small>'+esc(item.download || 'Instant')+'</span></div>'+ 
        '<div class="ha-kc-meaning"><p>'+esc(item.about || '')+'</p>'+goodForChips(item)+'</div>'+ 
        makeButton('ha-kc-btn ha-kc-btn-keep', item.primaryLabel || 'Get this pattern on Etsy', item.primaryUrl, 'Get this pattern on Etsy')+secondary+
      '</div>'+ 
    '</article>';
  }
  function filterBar(content,total){
    var filters = content.filters || ['All'];
    return '<div class="ha-make-filter-bar" role="region" aria-label="Filter stained glass patterns"><span class="ha-make-filter-label">Filter</span>'+filters.map(function(filter,index){
      return '<button class="ha-make-filter-chip '+(index === 0 ? 'is-active' : '')+'" type="button" data-ha-filter="'+esc(filter)+'">'+esc(filter)+'</button>';
    }).join('')+'<span class="ha-make-filter-count" aria-live="polite">'+esc((content.page && content.page.visiblePatternText) || ('Showing '+total+' patterns'))+'</span></div>';
  }
  function sectionHtml(content,section,bySlug){
    var cards = (section.patternSlugs || []).map(function(slug){ return bySlug[slug] ? productCard(content,bySlug[slug]) : ''; }).join('');
    return '<div class="ha-make-section-group" data-ha-section-category="'+esc(section.category || '')+'"><p class="ha-kc-grid-eyebrow">'+esc(section.heading || section.category || 'Stained glass patterns')+'</p><div class="ha-kc-card-grid">'+cards+'</div></div>';
  }
  function html(content){
    var page = content.page || {};
    var header = content.collectionHeader || {};
    var patterns = content.patterns || [];
    var bySlug = {};
    patterns.forEach(function(pattern){ bySlug[pattern.slug]=pattern; });
    var sections = content.sections && content.sections.length ? content.sections : [{ heading: 'Stained glass patterns', category: 'All', patternSlugs: patterns.map(function(pattern){ return pattern.slug; }) }];
    var collective = content.collective || {};
    var footer = content.footer || {};
    var srOnlyStyle = 'position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important;color:transparent!important;background:transparent!important;';
    var stats = header.stats && header.stats.length ? header.stats : [{value: patterns.length, label: 'live patterns'}, {value: 'PDF', label: 'digital downloads'}];
    return '<div id="ha-make-template-v1"><div id="ha-keep-collection-v1" class="ha-make-stained-glass">'+
      '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(content,'logo')+'" alt=""><h1 class="ha-v3-sr-only" style="'+srOnlyStyle+'">'+esc(page.hiddenHeading || 'The Hope Anthology — Stained Glass Patterns')+'</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-kc-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-kc-mobile-menu" class="ha-v3-links">'+navLinks(content.navigation)+'</div></nav>'+
      breadcrumbHtml(content)+
      '<main class="ha-kc-main"><header class="ha-kc-header"><p class="ha-kc-eyebrow">'+esc(header.eyebrow || 'To Make')+'</p><h2>'+safeHtml(header.headingHtml || 'Stained <em>glass</em> patterns')+'</h2><p>'+esc(header.description || '')+'</p><div class="ha-kc-stats">'+stats.map(function(stat){ return '<span><strong>'+esc(stat.value)+'</strong><small>'+esc(stat.label)+'</small></span>'; }).join('')+'</div></header>'+ 
      filterBar(content,patterns.length)+
      '<section class="ha-kc-grid-section">'+sections.map(function(section){ return sectionHtml(content,section,bySlug); }).join('')+'</section>'+ 
      '<section class="ha-kc-collective"><div><h2>'+esc(collective.heading || 'Something worth being part of.')+'</h2><p>'+esc(collective.body || 'Join the Collective for new pattern notes, quiet launches, and gentle studio updates.')+'</p></div><a class="ha-kc-collective-btn" href="'+esc(collective.buttonUrl || '/collective')+'">'+ctaLabel(collective.buttonLabel || 'Join the Collective')+'</a></section>'+ 
      '</main>'+ 
      '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(content,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(content.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div><a href="'+esc(footer.instagramUrl || '#')+'" target="_blank" rel="noopener">Instagram</a><a href="'+esc(footer.privacyUrl || '/privacy-policy')+'">Privacy policy</a><a href="'+esc(footer.accessibilityUrl || '/accessibility')+'">Accessibility</a><a href="'+esc(footer.sellingUrl || '/why-we-sell-this-way')+'">Why we sell this way</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '© The Hope Anthology 2026')+'</span></div></footer>'+ 
    '</div></div>';
  }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-kc-mobile-menu');
    var keepRoot = root.querySelector('#ha-keep-collection-v1') || root;
    if(!toggle || !menu || toggle.getAttribute('data-bound') === 'true') return;
    toggle.setAttribute('data-bound','true');
    toggle.addEventListener('click',function(){
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      keepRoot.classList.toggle('ha-v3-menu-open', !open);
    });
    menu.addEventListener('click',function(event){
      if(event.target && event.target.tagName === 'A'){
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label','Open menu');
        keepRoot.classList.remove('ha-v3-menu-open');
      }
    });
  }
  function bindCards(root){
    root.addEventListener('click',function(event){
      var swap = event.target.closest && event.target.closest('.ha-kc-swap button');
      if(swap){
        var wrap = swap.parentNode;
        Array.prototype.forEach.call(wrap.querySelectorAll('button'),function(btn){ btn.classList.remove('is-active'); });
        swap.classList.add('is-active');
        var card = swap.closest('.ha-kc-card');
        var img = card && card.querySelector('[data-ha-product-image="true"]');
        var nextSrc = swap.getAttribute('data-ha-image-src');
        if(img && nextSrc){
          img.src = nextSrc;
          img.alt = swap.getAttribute('data-ha-image-alt') || img.alt;
          img.setAttribute('data-ha-image-type', swap.getAttribute('data-ha-image-type') || '');
        }
        return;
      }
      var filter = event.target.closest && event.target.closest('[data-ha-filter]');
      if(filter){
        applyFilter(root,filter.getAttribute('data-ha-filter') || 'All');
      }
    });
  }
  function applyFilter(root,filter){
    Array.prototype.forEach.call(root.querySelectorAll('[data-ha-filter]'),function(chip){ chip.classList.toggle('is-active', chip.getAttribute('data-ha-filter') === filter); });
    var visible = 0;
    Array.prototype.forEach.call(root.querySelectorAll('[data-ha-make-card="true"]'),function(card){
      var hay = ((card.getAttribute('data-category') || '')+'|'+(card.getAttribute('data-difficulty') || '')+'|'+(card.getAttribute('data-tags') || '')).toLowerCase();
      var show = filter === 'All' || hay.indexOf(String(filter).toLowerCase()) !== -1;
      card.style.display = show ? '' : 'none';
      if(show) visible++;
    });
    Array.prototype.forEach.call(root.querySelectorAll('.ha-make-section-group'),function(group){
      var any = false;
      Array.prototype.forEach.call(group.querySelectorAll('[data-ha-make-card="true"]'),function(card){ if(card.style.display !== 'none') any = true; });
      group.style.display = any ? '' : 'none';
    });
    var count = root.querySelector('.ha-make-filter-count');
    if(count) count.textContent = filter === 'All' ? ((window.HA_MAKE_TEMPLATE_CONTENT.page || {}).visiblePatternText || 'Showing '+visible+' patterns') : 'Showing '+visible+' patterns';
  }
  function isMakeRoute(){
    var p = location.pathname.replace(/\/$/,'') || '/';
    return p === '/collections/stained-glass-patterns' || p === '/collections/stained-glass' || p === '/stained-glass-patterns' || /local-preview-make/i.test(p) || !!document.querySelector('#ha-make-template-root[data-ha-page="make"], #ha-make-template-root[data-ha-make-template-root="true"]');
  }
  function mount(){
    if(!isMakeRoute()) return;
    if(document.getElementById('ha-make-template-v1')) return;
    var content = window.HA_MAKE_TEMPLATE_CONTENT || {};
    if(!content.patterns || !content.patterns.length) return;
    if(content.page && content.page.title) document.title = content.page.title;
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    injectScopedTheme();
    document.body.classList.add('ha-make-template-v1-active','ha-make-template-active','ha-keep-collection-v1-active');
    var wrap=document.createElement('div');
    wrap.innerHTML=html(content);
    var root = wrap.firstChild;
    anchor.parentNode.insertBefore(root,anchor);
    bindMobileNav(root);
    bindCards(root);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
    setTimeout(mount,600);
  });
})();
