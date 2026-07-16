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
  function breadcrumbHtml(collection){
    var items = collection.breadcrumbs || [];
    return '<div class="ha-kc-breadcrumb" aria-label="Breadcrumb">'+items.map(function(item,index){
      var isLast = index === items.length - 1 || !item.url;
      var part = isLast ? '<span class="ha-kc-current">'+esc(item.label)+'</span>' : '<a href="'+esc(item.url)+'">'+esc(item.label)+'</a>';
      return part + (index < items.length - 1 ? '<span class="ha-kc-sep" aria-hidden="true">›</span>' : '');
    }).join('')+'</div>';
  }
  function productImageSet(item){
    var set = item.images || {};
    return {
      lifestyle: set.lifestyle || '',
      flat: set.flat || '',
      detail: set.detail || ''
    };
  }
  function productImageAltSet(item){
    var set = item.imageAlts || {};
    var fallback = item.title || '';
    return {
      lifestyle: set.lifestyle || fallback,
      flat: set.flat || fallback,
      detail: set.detail || fallback
    };
  }
  function cardImage(content,item){
    var set = productImageSet(item);
    var alts = productImageAltSet(item);
    var first = set.lifestyle ? 'lifestyle' : (set.flat ? 'flat' : (set.detail ? 'detail' : ''));
    if(first){
      return '<img src="'+esc(imageValue(content,set[first]))+'" alt="'+esc(alts[first])+'" loading="lazy" decoding="async" data-ha-product-image="true" data-ha-image-type="'+esc(first)+'">';
    }
    return '<div class="ha-kc-card-placeholder" aria-hidden="true"><span>'+esc(item.title.charAt(0))+'</span></div>';
  }
  function imageDots(content,item,available){
    var set = productImageSet(item);
    var alts = productImageAltSet(item);
    var options = [
      { key: 'lifestyle' },
      { key: 'flat' },
      { key: 'detail' }
    ];
    return '<div class="ha-artist-dots">'+options.map(function(option,index){
      var value = set[option.key] || '';
      var alt = alts[option.key] || item.title || '';
      return '<button type="button" data-ha-image-src="'+esc(value ? imageValue(content,value) : '')+'" data-ha-image-alt="'+esc(alt)+'" data-ha-image-type="'+esc(option.key)+'" class="ha-artist-dot '+(index === 0 ? 'is-active' : '')+'" aria-label="Switch to '+esc(option.key)+' image"></button>';
    }).join('')+'</div>';
  }
  function giftChips(item){
    var chips = item.giftFor || [];
    if(!chips.length) return '';
    return '<div class="ha-kc-gf-chips">'+chips.map(function(chip){ return '<span>'+esc(chip)+'</span>'; }).join('')+'</div>';
  }
  function productCard(content,item){
    var available = item.status === 'available';
    var badge = available ? 'Available now' : 'Coming soon';
    var cardClass = available ? 'ha-kc-card' : 'ha-kc-card ha-kc-card-inactive';
    var action = available && hasUrl(item.etsyUrl)
      ? '<a class="ha-kc-btn ha-kc-btn-keep" href="'+esc(item.etsyUrl)+'" target="_blank" rel="noopener">'+ctaLabel('Get this print on Etsy')+'</a>'
      : available
        ? '<button class="ha-kc-btn ha-kc-btn-keep" type="button">'+ctaLabel('Get this print on Etsy')+'</button>'
        : '<button class="ha-kc-btn ha-kc-btn-inactive" type="button" disabled>'+ctaLabel('On its way')+'</button><a class="ha-kc-btn ha-kc-btn-collective" href="/collective">'+ctaLabel('Join the Collective to hear first')+'</a>';
    
    var priceHtml = available ? '<div class="ha-artist-price-line"><strong>£'+esc(item.price)+'</strong> <small>excludes shipping</small></div>' : '';

    return '<article class="'+cardClass+'" data-ha-make-card="true" data-category="'+esc(item.collection)+'">'+
      '<div class="ha-kc-card-img-wrap ha-artist-card-img-wrap">'+
        '<span class="ha-kc-pip">To Keep</span><span class="ha-kc-badge '+(available ? 'ha-kc-badge-available' : 'ha-kc-badge-coming')+'">'+esc(badge)+'</span>'+cardImage(content,item)+
      '</div>'+ 
      imageDots(content,item,available)+ 
      '<div class="ha-kc-card-body">'+
        '<h3>'+esc(item.title)+'</h3>'+ 
        '<div class="ha-kc-chips"><span><small>Format</small>'+esc(item.format || 'Art print')+'</span><span><small>Sizes</small>'+esc(item.sizes || 'A4 · A3')+'</span></div>'+ 
        priceHtml +
        '<div class="ha-kc-meaning"><p>'+esc(item.meaning || '')+'</p>'+giftChips(item)+'</div>'+ action +
      '</div>'+ 
    '</article>';
  }

  function filterBar(collection, total){
    var filters = collection.filterOptions || ['All'];
    return '<div class="ha-make-filter-bar ha-artist-filter-bar" role="region" aria-label="Filter works"><span class="ha-make-filter-label">Filter</span>'+filters.map(function(filter,index){
      return '<button class="ha-make-filter-chip '+(index === 0 ? 'is-active' : '')+'" type="button" data-ha-filter="'+esc(filter)+'">'+esc(filter)+'</button>';
    }).join('')+'<span class="ha-make-filter-count" aria-live="polite">Showing '+total+' works</span></div>';
  }

  function html(content,collection){
    var stats = collection.stats || {};
    var collective = content.collective || {};
    var footer = content.footer || {};
    var montage = collection.montage || [];
    var srOnlyStyle = 'position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important;color:transparent!important;background:transparent!important;';
    
    var montageHtml = montage.length >= 3 ? 
      '<div class="ha-artist-montage">' +
        '<div class="ha-artist-montage-large"><img src="'+esc(montage[0].src)+'" alt="'+esc(montage[0].alt)+'"></div>' +
        '<div class="ha-artist-montage-stack">' +
          '<div class="ha-artist-montage-small"><img src="'+esc(montage[1].src)+'" alt="'+esc(montage[1].alt)+'"></div>' +
          '<div class="ha-artist-montage-small"><img src="'+esc(montage[2].src)+'" alt="'+esc(montage[2].alt)+'"></div>' +
        '</div>' +
      '</div>' : '';

    return '<div id="ha-artist-page-v1" class="ha-keep-collection-v1-active ha-make-template-v1-active">'+
      '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(content,'logo')+'" alt=""><h1 class="ha-v3-sr-only" style="'+srOnlyStyle+'">Theresa Haskins — Print Designer | The Hope Anthology</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-kc-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-kc-mobile-menu" class="ha-v3-links">'+navLinks(content.navigation)+'</div></nav>'+
      breadcrumbHtml(collection)+
      '<main class="ha-kc-main">'+
        '<header class="ha-artist-header">'+
          '<div class="ha-artist-hero-grid">'+
            '<div class="ha-artist-hero-copy">'+
              '<p class="ha-kc-eyebrow">TO KEEP · ANTHOLOGY ARTIST</p>'+
              '<h2 class="ha-artist-h2">Theresa Haskins <br><em>Print Designer</em></h2>'+
              '<p class="ha-artist-bio">'+esc(collection.bio)+'</p>'+
              '<div class="ha-kc-stats">'+
                '<span><strong>'+esc(stats.collections)+'</strong><small>Collections</small></span>'+
                '<span><strong>'+esc(stats.prints)+'</strong><small>Prints</small></span>'+
                '<span><strong>'+esc(stats.fromPrice)+'</strong><small>From</small></span>'+
              '</div>'+
            '</div>'+
            montageHtml +
          '</div>'+
        '</header>'+ 
        filterBar(collection, collection.products.length)+
        '<section class="ha-kc-grid-section ha-artist-grid-section">'+
          '<p class="ha-kc-grid-eyebrow">THERESA HASKINS — ALL WORK</p>'+
          '<div class="ha-kc-card-grid ha-artist-card-grid">'+(collection.products||[]).map(function(item){return productCard(content,item);}).join('')+'</div>'+
        '</section>'+ 
        '<section class="ha-kc-collective"><div><h2>'+esc(collective.heading)+'</h2><p>'+esc(collective.body)+'</p></div><a class="ha-kc-collective-btn" href="'+esc(collective.buttonUrl || '/collective')+'">'+ctaLabel(collective.buttonLabel || 'Join the Collective')+'</a></section>'+ 
      '</main>'+ 
      '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(content,'star')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(content.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect & legal</div><a href="'+esc(footer.instagramUrl)+'" target="_blank" rel="noopener">Instagram</a><a href="'+esc(footer.privacyUrl)+'">Privacy policy</a><a href="'+esc(footer.accessibilityUrl)+'">Accessibility</a><a href="'+esc(footer.sellingUrl)+'">Why we sell this way</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div></footer>'+ 
    '</div>';
  }

  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-kc-mobile-menu');
    if(!toggle || !menu || toggle.getAttribute('data-bound') === 'true') return;
    toggle.setAttribute('data-bound','true');
    toggle.addEventListener('click',function(){
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      root.classList.toggle('ha-v3-menu-open', !open);
    });
  }

  function bindCards(root){
    root.addEventListener('click',function(event){
      var dot = event.target.closest && event.target.closest('.ha-artist-dot');
      if(dot){
        var wrap = dot.parentNode;
        Array.prototype.forEach.call(wrap.querySelectorAll('.ha-artist-dot'),function(btn){ btn.classList.remove('is-active'); });
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
      var category = card.getAttribute('data-category') || '';
      var show = filter === 'All' || category === filter;
      card.style.display = show ? '' : 'none';
      if(show) visible++;
    });
    var count = root.querySelector('.ha-make-filter-count');
    if(count) count.textContent = 'Showing '+visible+' works';
  }

  function mount(){
    console.log('Mounting artist page...');
    var content = window.HA_KEEP_COLLECTIONS_CONTENT || {};
    var collection = findCollection(content);
    if(!collection){
      console.warn('Collection not found for path:', location.pathname);
      // Fallback for local preview
      if(location.pathname.indexOf('local-preview') !== -1){
        collection = content.collections['theresa-haskins'];
        console.log('Using theresa-haskins fallback for local preview');
      }
      if(!collection) return;
    }
    if(document.getElementById('ha-artist-page-v1')) return;
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    
    document.title = "Theresa Haskins — Print Designer | The Hope Anthology";
    var meta = document.querySelector('meta[name="description"]');
    if(meta) meta.setAttribute('content', collection.metaDescription || '');
    
    document.body.classList.add('ha-make-template-active');
    var wrap=document.createElement('div');
    wrap.innerHTML=html(content,collection);
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
