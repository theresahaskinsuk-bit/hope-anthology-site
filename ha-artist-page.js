(function(){
  var script = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();
  /* ── CSS loader — identical pattern to ha-keep-collection.js ── */
  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-v3-css')) return;
    var link=document.createElement('link');
    link.id='ha-v3-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }
  /* ── Content loader — reuses same content file as keep-collection ── */
  function loadContent(done){
    if(window.HA_KEEP_COLLECTIONS_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-keep-collections-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-keep-collections-content';
    s.src=base+'content.keep-collections.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Keep collection content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }
  /* ── Utilities — identical to ha-keep-collection.js ── */
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
  /* ── Find artist collection by path ── */
  function findCollection(content){
    var path = location.pathname.replace(/\/$/,'') || '/';
    var collections = content.collections || {};
    var keys = Object.keys(collections);
    for(var i=0;i<keys.length;i++){
      var item = collections[keys[i]];
      if((item.path || '').replace(/\/$/,'') === path) return item;
    }
    return null;
  }
  /* ── Breadcrumb — reuses ha-kc-breadcrumb classes from styles.css ── */
  function breadcrumbHtml(collection){
    var items = collection.breadcrumbs || [];
    if(!items.length) return '';
    return '<div class="ha-kc-breadcrumb" aria-label="Breadcrumb">'+items.map(function(item,index){
      var isLast = index === items.length - 1 || !item.url;
      var part = isLast ? '<span class="ha-kc-current">'+esc(item.label)+'</span>' : '<a href="'+esc(item.url)+'">'+esc(item.label)+'</a>';
      return part + (index < items.length - 1 ? '<span class="ha-kc-sep" aria-hidden="true">›</span>' : '');
    }).join('')+'</div>';
  }
  /* ── Card image helpers ── */
  function productImageSet(item){
    var set = item.images || {};
    return { lifestyle: set.lifestyle || '', flat: set.flat || '', detail: set.detail || '' };
  }
  function productImageAltSet(item){
    var set = item.imageAlts || {};
    var fallback = item.title || '';
    return { lifestyle: set.lifestyle || fallback, flat: set.flat || fallback, detail: set.detail || fallback };
  }
  function cardImage(content,item){
    var set = productImageSet(item);
    var alts = productImageAltSet(item);
    var first = set.lifestyle ? 'lifestyle' : (set.flat ? 'flat' : (set.detail ? 'detail' : ''));
    if(first){
      return '<img src="'+esc(imageValue(content,set[first]))+'" alt="'+esc(alts[first])+'" loading="lazy" decoding="async" data-ha-product-image="true" data-ha-image-type="'+esc(first)+'">';
    }
    return '<div class="ha-kc-card-placeholder" aria-hidden="true"><span>'+esc((item.title||'').charAt(0))+'</span></div>';
  }
  /* ── Dots navigation (replaces Lifestyle/Flat/Detail tabs) ── */
  function imageDots(content,item){
    var set = productImageSet(item);
    var alts = productImageAltSet(item);
    var options = [{key:'lifestyle'},{key:'flat'},{key:'detail'}];
    return '<div class="ha-ap-dots">'+options.map(function(option,index){
      var value = set[option.key] || '';
      var alt = alts[option.key] || item.title || '';
      return '<button type="button" class="ha-ap-dot'+(index === 0 ? ' is-active' : '')+'" data-ha-image-src="'+esc(value ? imageValue(content,value) : '')+'" data-ha-image-alt="'+esc(alt)+'" data-ha-image-type="'+esc(option.key)+'" aria-label="'+esc(option.key)+' view"></button>';
    }).join('')+'</div>';
  }
  /* ── Gift-for chips ── */
  function giftChips(item){
    var chips = item.giftFor || [];
    if(!chips.length) return '';
    return '<div class="ha-kc-gf-chips">'+chips.map(function(chip){ return '<span>'+esc(chip)+'</span>'; }).join('')+'</div>';
  }
  /* ── Product card — reuses ha-kc-* classes, removes Collection chip, adds price, uses dots ── */
  function productCard(content,item){
    var available = item.status === 'available';
    var badge = available ? 'Available now' : 'Coming soon';
    var cardClass = available ? 'ha-kc-card' : 'ha-kc-card ha-kc-card-inactive';
    var action = available && hasUrl(item.etsyUrl)
      ? '<a class="ha-kc-btn ha-kc-btn-keep" href="'+esc(item.etsyUrl)+'" target="_blank" rel="noopener">'+ctaLabel('Get this print on Etsy')+'</a>'
      : available
        ? '<button class="ha-kc-btn ha-kc-btn-keep" type="button">'+ctaLabel('Get this print on Etsy')+'</button>'
        : '<button class="ha-kc-btn ha-kc-btn-inactive" type="button" disabled>'+ctaLabel('On its way')+'</button><a class="ha-kc-btn ha-kc-btn-collective" href="/collective">'+ctaLabel('Join the Collective to hear first')+'</a>';
    var priceHtml = available && item.price ? '<div class="ha-ap-price-line"><strong>'+esc(item.price)+'</strong><small>excludes shipping</small></div>' : '';
    return '<article class="'+cardClass+'" data-ha-collection="'+esc(item.collection || '')+'">'+
      '<div class="ha-kc-card-img-wrap">'+
        '<span class="ha-kc-pip">To Keep</span>'+
        '<span class="ha-kc-badge '+(available ? 'ha-kc-badge-available' : 'ha-kc-badge-coming')+'">'+esc(badge)+'</span>'+
        cardImage(content,item)+
      '</div>'+
      imageDots(content,item)+
      '<div class="ha-kc-card-body">'+
        '<h3>'+esc(item.title)+'</h3>'+
        '<div class="ha-kc-chips"><span><small>Format</small>'+esc(item.format || 'Art print')+'</span><span><small>Sizes</small>'+esc(item.sizes || 'A4 · A3')+'</span></div>'+
        priceHtml+
        '<div class="ha-kc-meaning"><p>'+esc(item.meaning || '')+'</p>'+giftChips(item)+'</div>'+
        action+
      '</div>'+
    '</article>';
  }
  /* ── Filter bar — single row of collection chips ── */
  function filterBar(collection){
    var filters = collection.filterOptions || ['All'];
    var total = (collection.products || []).filter(function(p){ return p.active !== false; }).length;
    return '<div class="ha-ap-filter-bar">'+
      '<span class="ha-kc-breadcrumb-label">Filter</span>'+
      filters.map(function(filter,index){
        return '<button class="ha-kc-filter-chip'+(index === 0 ? ' is-active' : '')+'" type="button" data-ha-ap-filter="'+esc(filter)+'">'+esc(filter)+'</button>';
      }).join('')+
      '<span class="ha-ap-filter-count" aria-live="polite">Showing '+total+' works</span>'+
    '</div>';
  }
  /* ── Full page HTML — structure mirrors ha-keep-collection.js exactly ── */
  function html(content,collection){
    var stats = collection.stats || {};
    var collective = content.collective || {};
    var footer = content.footer || {};
    var montage = collection.montage || [];
    var srOnlyStyle = 'position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important;color:transparent!important;background:transparent!important;';
    var montageHtml = montage.length >= 3 ?
      '<div class="ha-ap-montage">'+
        '<div class="ha-ap-montage-large"><img src="'+esc(montage[0].src)+'" alt="'+esc(montage[0].alt)+'" loading="lazy" decoding="async"></div>'+
        '<div class="ha-ap-montage-stack">'+
          '<div class="ha-ap-montage-small"><img src="'+esc(montage[1].src)+'" alt="'+esc(montage[1].alt)+'" loading="lazy" decoding="async"></div>'+
          '<div class="ha-ap-montage-small"><img src="'+esc(montage[2].src)+'" alt="'+esc(montage[2].alt)+'" loading="lazy" decoding="async"></div>'+
        '</div>'+
      '</div>' : '';
    return '<div id="ha-artist-page-v1">'+
      /* Nav — identical to ha-keep-collection.js */
      '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation">'+
        '<a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home">'+
          '<img class="ha-v3-logo" src="'+image(content,'logo')+'" alt="">'+
          '<h1 class="ha-v3-sr-only" style="'+srOnlyStyle+'">'+esc(collection.metaTitle || 'The Hope Anthology')+'</h1>'+
        '</a>'+
        '<button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-ap-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button>'+
        '<div id="ha-ap-mobile-menu" class="ha-v3-links">'+navLinks(content.navigation)+'</div>'+
      '</nav>'+
      /* Breadcrumb */
      breadcrumbHtml(collection)+
      /* Main */
      '<main class="ha-kc-main">'+
        /* Hero header */
        '<header class="ha-kc-header ha-ap-header">'+
          '<div class="ha-ap-hero-grid">'+
            '<div class="ha-ap-hero-copy">'+
              '<p class="ha-kc-eyebrow">'+esc(collection.eyebrow || 'TO KEEP · ANTHOLOGY ARTIST')+'</p>'+
              '<h2 class="ha-ap-heading">'+esc(collection.artistName || 'Theresa Haskins')+'<br><em>'+esc(collection.artistTitle || 'Print Designer')+'</em></h2>'+
              '<p class="ha-ap-bio">'+esc(collection.bio || '')+'</p>'+
              '<div class="ha-kc-stats">'+
                '<span><strong>'+esc(stats.collections || '')+'</strong><small>Collections</small></span>'+
                '<span><strong>'+esc(stats.prints || '')+'</strong><small>Prints</small></span>'+
                '<span><strong>'+esc(stats.fromPrice || '')+'</strong><small>From</small></span>'+
              '</div>'+
            '</div>'+
            montageHtml+
          '</div>'+
        '</header>'+
        /* Filter bar */
        filterBar(collection)+
        /* Grid */
        '<section class="ha-kc-grid-section">'+
          '<p class="ha-kc-grid-eyebrow">'+esc(collection.gridEyebrow || ((collection.artistName || 'ARTIST').toUpperCase() + ' — ALL WORK'))+'</p>'+
          '<div class="ha-kc-card-grid ha-ap-card-grid">'+
            (collection.products||[]).filter(function(p){ return p.active !== false; }).map(function(item){ return productCard(content,item); }).join('')+
          '</div>'+
        '</section>'+
        /* Collective band — identical to ha-keep-collection.js */
        '<section class="ha-kc-collective">'+
          '<div><h2>'+esc(collective.heading)+'</h2><p>'+esc(collective.body)+'</p></div>'+
          '<a class="ha-kc-collective-btn" href="'+esc(collective.buttonUrl || '/collective')+'">'+ctaLabel(collective.buttonLabel || 'Join the Collective')+'</a>'+
        '</section>'+
      '</main>'+
      /* Footer — identical to ha-keep-collection.js */
      '<footer class="ha-v3-footer">'+
        '<div class="ha-v3-footer-top">'+
          '<img class="ha-v3-footer-star" src="'+image(content,'star')+'" alt="">'+
          '<div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(content.navigation)+'</div>'+
          '<div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div>'+
            '<a href="'+esc(footer.instagramUrl)+'" target="_blank" rel="noopener">Instagram</a>'+
            '<a href="'+esc(footer.privacyUrl)+'">Privacy policy</a>'+
            '<a href="'+esc(footer.accessibilityUrl)+'">Accessibility</a>'+
            '<a href="'+esc(footer.sellingUrl)+'">Why I sell this way</a>'+
          '</div>'+
        '</div>'+
        '<div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div>'+
      '</footer>'+
    '</div>';
  }
  /* ── Mobile nav binding — identical to ha-keep-collection.js ── */
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-ap-mobile-menu');
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
  /* ── Card and filter binding ── */
  function bindCards(root){
    root.addEventListener('click',function(event){
      /* Dot image swap */
      var dot = event.target.closest && event.target.closest('.ha-ap-dot');
      if(dot){
        var dotsWrap = dot.parentNode;
        Array.prototype.forEach.call(dotsWrap.querySelectorAll('.ha-ap-dot'),function(btn){ btn.classList.remove('is-active'); });
        dot.classList.add('is-active');
        var card = dot.closest('.ha-kc-card');
        var img = card && card.querySelector('[data-ha-product-image="true"]');
        var nextSrc = dot.getAttribute('data-ha-image-src');
        if(img && nextSrc){
          img.src = nextSrc;
          img.alt = dot.getAttribute('data-ha-image-alt') || img.alt;
          img.setAttribute('data-ha-image-type', dot.getAttribute('data-ha-image-type') || '');
        }
        return;
      }
      /* Collection filter */
      var filterChip = event.target.closest && event.target.closest('[data-ha-ap-filter]');
      if(filterChip){
        var filterVal = filterChip.getAttribute('data-ha-ap-filter') || 'All';
        Array.prototype.forEach.call(root.querySelectorAll('[data-ha-ap-filter]'),function(chip){
          chip.classList.toggle('is-active', chip.getAttribute('data-ha-ap-filter') === filterVal);
        });
        var visible = 0;
        Array.prototype.forEach.call(root.querySelectorAll('.ha-kc-card'),function(card){
          var col = card.getAttribute('data-ha-collection') || '';
          var show = filterVal === 'All' || col === filterVal;
          card.style.display = show ? '' : 'none';
          if(show) visible++;
        });
        var countEl = root.querySelector('.ha-ap-filter-count');
        if(countEl) countEl.textContent = 'Showing '+visible+' works';
      }
    });
  }
  /* ── Mount — strict path guard, identical pattern to ha-to-keep.js ── */
  function mount(){
    var path = location.pathname.replace(/\/$/,'') || '/';
    if(!path.startsWith('/to-keep/') || path === '/to-keep') return;
    var content = window.HA_KEEP_COLLECTIONS_CONTENT || {};
    var collection = findCollection(content);
    if(!collection) return;
    if(document.getElementById('ha-artist-page-v1')) return;
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    document.title = collection.metaTitle || (collection.name ? collection.name + ' — Print Designer | The Hope Anthology' : 'The Hope Anthology');
    var metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc) metaDesc.setAttribute('content', collection.metaDescription || '');
    document.body.classList.add('ha-artist-page-v1-active');
    var wrap=document.createElement('div');
    wrap.innerHTML=html(content,collection);
    var root=wrap.firstChild;
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
