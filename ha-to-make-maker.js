(function(){
  var script = document.currentScript || (function(){ var scripts = document.getElementsByTagName('script'); return scripts[scripts.length - 1]; })();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-v3-css')) return;
    var link = document.createElement('link');
    link.id = 'ha-v3-css';
    link.rel = 'stylesheet';
    link.href = base + 'styles.css?v=' + encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function makerSlug(){
    var path = location.pathname.replace(/\/$/, '') || '/';
    var matched = path.match(/^\/to-make\/([^/]+)$/);
    return matched ? matched[1] : '';
  }

  function loadContent(done){
    var slug = makerSlug();
    if(!slug){ done(); return; }
    window.HA_TO_MAKE_MAKERS = window.HA_TO_MAKE_MAKERS || {};
    if(window.HA_TO_MAKE_MAKERS[slug]){ done(); return; }
    var id = 'ha-to-make-maker-content-' + slug;
    var existing = document.getElementById(id);
    if(existing){ existing.addEventListener('load', done); existing.addEventListener('error', done); return; }
    var content = document.createElement('script');
    content.id = id;
    content.src = base + 'content.to-make.' + encodeURIComponent(slug) + '.js?v=' + encodeURIComponent(version);
    content.onload = done;
    content.onerror = function(){ console.warn('Hope Anthology To Make maker content file could not be loaded.'); done(); };
    document.head.appendChild(content);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function isAbsoluteUrl(value){ return /^(https?:)?\/\//.test(String(value || '')) || /^data:/.test(String(value || '')) || /^\//.test(String(value || '')); }
  function assetUrl(value){
    value = String(value == null ? '' : value);
    if(!value) return '';
    return isAbsoluteUrl(value) ? value : base + value.replace(/^\.\//, '');
  }
  function imageValue(content, value){
    var images = content.images || {};
    return assetUrl(images[value] || value || '');
  }
  function image(content, key){ return esc(imageValue(content, key)); }
  function hasUrl(value){ return typeof value === 'string' && value.trim() && value.trim() !== '#'; }
  function ctaLabel(label){
    var clean = String(label == null ? '' : label).replace(/\s*[→›»]+\s*$/, '');
    return '<span class="ha-v3-cta-text">' + esc(clean) + '</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span>';
  }
  function navLinks(items){
    var current = location.pathname.replace(/\/$/, '') || '/';
    return (items || []).map(function(item){
      var href = item.url || '#';
      var active = (href.replace(/\/$/, '') || '/') === current;
      var label = item.label === 'Collaborate' ? 'For Artists' : (item.label === 'My Story' ? 'The Story' : item.label);
      return '<a href="' + esc(href) + '"' + (active ? ' aria-current="page"' : '') + '>' + esc(label) + '</a>';
    }).join('');
  }
  function breadcrumbHtml(maker){
    return '<div class="ha-kc-breadcrumb" aria-label="Breadcrumb"><a href="/to-make">To Make</a><span class="ha-kc-sep" aria-hidden="true">›</span><span class="ha-kc-current">' + esc(maker.name || '') + '</span></div>';
  }
  function productImageSet(item){
    var images = item.images || {};
    return {workbench: images.workbench || '', lifestyle: images.lifestyle || '', inside: images.inside || ''};
  }
  function productImageAltSet(item){
    var alts = item.imageAlts || {};
    var fallback = item.title || '';
    return {workbench: alts.workbench || fallback, lifestyle: alts.lifestyle || fallback, inside: alts.inside || fallback};
  }
  function cardImage(content, item){
    var images = productImageSet(item);
    var alts = productImageAltSet(item);
    var first = images.workbench ? 'workbench' : (images.lifestyle ? 'lifestyle' : (images.inside ? 'inside' : ''));
    if(first) return '<img src="' + esc(imageValue(content, images[first])) + '" alt="' + esc(alts[first]) + '" loading="lazy" decoding="async" data-ha-product-image="true" data-ha-image-type="' + esc(first) + '">';
    return '<div class="ha-kc-card-placeholder" aria-hidden="true"><span>' + esc((item.title || '').charAt(0)) + '</span></div>';
  }
  function imageDots(content, item){
    var images = productImageSet(item);
    var alts = productImageAltSet(item);
    return '<div class="ha-ap-dots" role="group" aria-label="Image view for ' + esc(item.title || 'pattern') + '">' +
      ['workbench', 'lifestyle', 'inside'].map(function(key, index){
        return '<button type="button" class="ha-ap-dot' + (index === 0 ? ' is-active' : '') + '" data-ha-image-src="' + esc(images[key] ? imageValue(content, images[key]) : '') + '" data-ha-image-alt="' + esc(alts[key]) + '" data-ha-image-type="' + esc(key) + '" aria-label="' + esc(key) + ' view"></button>';
      }).join('') +
    '</div>';
  }
  function goodForChips(item){
    var chips = item.goodFor || [];
    return chips.length ? '<div class="ha-kc-gf-chips">' + chips.map(function(chip){ return '<span>' + esc(chip) + '</span>'; }).join('') + '</div>' : '';
  }
  function productCard(content, item){
    var available = item.status === 'available';
    var status = available ? 'Available now' : 'Coming soon';
    var cardClass = available ? 'ha-kc-card' : 'ha-kc-card ha-kc-card-inactive';
    var action = available && hasUrl(item.etsyUrl)
      ? '<a class="ha-kc-btn ha-kc-btn-keep" href="' + esc(item.etsyUrl) + '" target="_blank" rel="noopener">' + ctaLabel('Get this from their shop') + '</a>'
      : '<button class="ha-kc-btn ha-kc-btn-inactive" type="button" disabled>' + ctaLabel(item.comingSoonLabel || 'On its way') + '</button>';
    var price = available && item.price ? '<div class="ha-ap-price-line"><span class="ha-ap-price-from">From</span><strong>' + esc(item.price) + '</strong><small>excludes shipping</small></div>' : '';
    return '<article class="' + cardClass + '" data-ha-collection="' + esc(item.collection || '') + '">' +
      '<div class="ha-kc-card-img-wrap"><span class="ha-kc-pip">To Make</span><span class="ha-kc-badge ' + (available ? 'ha-kc-badge-available' : 'ha-kc-badge-coming') + '">' + esc(status) + '</span>' + cardImage(content, item) + '</div>' +
      imageDots(content, item) +
      '<div class="ha-kc-card-body"><h3>' + esc(item.title) + '</h3><div class="ha-kc-chips"><span><small>Format</small>' + esc(item.format || '') + '</span><span><small>Technique</small>' + esc(item.technique || '') + '</span><span><small>Delivery</small>' + esc(item.delivery || '') + '</span></div>' + price + '<div class="ha-kc-meaning"><p>' + esc(item.meaning || '') + '</p>' + goodForChips(item) + '</div>' + action + '</div>' +
    '</article>';
  }
  function visiblePatterns(maker){
    return (maker.groups || []).reduce(function(patterns, group){
      return patterns.concat(group.patterns || []);
    }, []).filter(function(item){ return item.status === 'available' && hasUrl(item.etsyUrl); });
  }
  function collectionFilters(maker){
    var seen = {};
    return ['All'].concat((maker.groups || []).map(function(group){ return group.collection || ''; }).filter(function(collection){
      if(!collection || seen[collection]) return false;
      seen[collection] = true;
      return true;
    }));
  }
  function profileStats(maker, patterns){
    var collections = {};
    var prices = [];
    patterns.forEach(function(item){
      if(item.collection) collections[item.collection] = true;
      if(typeof item.priceNumber === 'number' && isFinite(item.priceNumber)) prices.push(item.priceNumber);
    });
    return {
      collections: Object.keys(collections).length,
      patterns: patterns.length,
      fromPrice: prices.length ? '£' + Math.min.apply(Math, prices).toFixed(2) : ''
    };
  }
  function filterBar(maker, patterns){
    return '<div class="ha-ap-filter-bar"><span class="ha-kc-breadcrumb-label">Filter</span>' +
      collectionFilters(maker).map(function(filter, index){
        return '<button class="ha-kc-filter-chip' + (index === 0 ? ' is-active' : '') + '" type="button" data-ha-ap-filter="' + esc(filter) + '">' + esc(filter) + '</button>';
      }).join('') +
      '<span class="ha-ap-filter-count" aria-live="polite">Showing ' + esc(patterns.length) + ' patterns</span></div>';
  }
  function html(content){
    var maker = content.maker || {};
    var profile = maker.profile || {};
    var patterns = visiblePatterns(maker);
    var stats = profileStats(maker, patterns);
    var montage = profile.montage || [];
    var collective = content.collective || {};
    var footer = content.footer || {};
    var montageHtml = montage.length >= 3 ? '<div class="ha-ap-montage"><div class="ha-ap-montage-large"><img src="' + esc(montage[0].src || '') + '" alt="' + esc(montage[0].alt || '') + '" loading="lazy" decoding="async"></div><div class="ha-ap-montage-stack"><div class="ha-ap-montage-small"><img src="' + esc(montage[1].src || '') + '" alt="' + esc(montage[1].alt || '') + '" loading="lazy" decoding="async"></div><div class="ha-ap-montage-small"><img src="' + esc(montage[2].src || '') + '" alt="' + esc(montage[2].alt || '') + '" loading="lazy" decoding="async"></div></div></div>' : '';

    /* The outer route wrapper is unique for loader cleanup. The nested #ha-artist-page-v1 root is intentional: existing page-scoped CSS is the only no-stylesheet-change way to preserve the signed-off maker-page visual system. */
    return '<div id="ha-to-make-maker-route">' +
      '<!-- #ha-artist-page-v1 is nested for existing styling only; this is a To Make maker route. -->' +
      '<div id="ha-artist-page-v1">' +
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="' + image(content, 'logo') + '" alt=""><h1 class="ha-v3-sr-only">The Hope Anthology — ' + esc(maker.name || 'Maker') + '</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-to-make-maker-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-to-make-maker-mobile-menu" class="ha-v3-links">' + navLinks(content.navigation) + '</div></nav>' +
        breadcrumbHtml(maker) +
        '<main class="ha-kc-main"><header class="ha-kc-header ha-ap-header"><div class="ha-ap-hero-grid"><div class="ha-ap-hero-copy"><p class="ha-kc-eyebrow">TO MAKE · FOUNDING MAKER</p><h2 class="ha-ap-heading">' + esc(maker.name || '') + '<br><em>' + esc(profile.discipline || '') + '</em></h2><p class="ha-ap-bio">' + esc(profile.bio || '') + '</p><div class="ha-kc-stats"><span><strong>' + esc(stats.collections) + '</strong><small>Collections</small></span><span><strong>' + esc(stats.patterns) + '</strong><small>Patterns</small></span><span><strong>' + esc(stats.fromPrice) + '</strong><small>From</small></span></div></div>' + montageHtml + '</div></header>' +
        filterBar(maker, patterns) +
        '<section class="ha-kc-grid-section"><div class="ha-kc-card-grid ha-ap-card-grid">' + patterns.map(function(item){ return productCard(content, item); }).join('') + '</div></section>' +
        '<section class="ha-kc-collective"><div><h2>' + esc(collective.heading || '') + '</h2><p>' + esc(collective.body || '') + '</p></div><a class="ha-kc-collective-btn" href="' + esc(collective.buttonUrl || '/collective') + '">' + ctaLabel(collective.buttonLabel || 'Join the Collective') + '</a></section>' +
        '</main>' +
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="' + image(content, 'star') + '" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>' + navLinks(content.navigation) + '<a href="/for-organisations">For Organisations</a></div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div><a href="' + esc(footer.privacyUrl || '/privacy-policy') + '">Privacy policy</a><a href="' + esc(footer.accessibilityUrl || '/accessibility') + '">Accessibility</a></div></div><div class="ha-v3-footer-bottom"><span>' + esc(footer.copyright || '© The Hope Anthology 2026') + '</span></div></footer>' +
      '</div>' +
    '</div>';
  }
  function bindMobileNav(root){
    var styleRoot = root.querySelector('#ha-artist-page-v1') || root;
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-to-make-maker-mobile-menu');
    if(!toggle || !menu || toggle.getAttribute('data-bound') === 'true') return;
    toggle.setAttribute('data-bound', 'true');
    toggle.addEventListener('click', function(){
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      styleRoot.classList.toggle('ha-v3-menu-open', !open);
    });
    menu.addEventListener('click', function(event){
      if(event.target && event.target.tagName === 'A'){
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        styleRoot.classList.remove('ha-v3-menu-open');
      }
    });
  }
  function bindDots(root){
    root.addEventListener('click', function(event){
      var dot = event.target.closest && event.target.closest('.ha-ap-dot');
      if(!dot) return;
      var dots = dot.parentNode;
      Array.prototype.forEach.call(dots.querySelectorAll('.ha-ap-dot'), function(item){ item.classList.remove('is-active'); });
      dot.classList.add('is-active');
      var card = dot.closest('.ha-kc-card');
      var imageElement = card && card.querySelector('[data-ha-product-image="true"]');
      if(imageElement && dot.getAttribute('data-ha-image-src')){
        imageElement.src = dot.getAttribute('data-ha-image-src');
        imageElement.alt = dot.getAttribute('data-ha-image-alt') || imageElement.alt;
        imageElement.setAttribute('data-ha-image-type', dot.getAttribute('data-ha-image-type') || '');
      }
    });
  }
  function bindFilters(root){
    if(root.getAttribute('data-ha-filters-bound') === 'true') return;
    root.setAttribute('data-ha-filters-bound', 'true');
    root.addEventListener('click', function(event){
      var filterChip = event.target.closest && event.target.closest('[data-ha-ap-filter]');
      if(!filterChip) return;
      var filterValue = filterChip.getAttribute('data-ha-ap-filter') || 'All';
      Array.prototype.forEach.call(root.querySelectorAll('[data-ha-ap-filter]'), function(chip){
        chip.classList.toggle('is-active', chip.getAttribute('data-ha-ap-filter') === filterValue);
      });
      var visible = 0;
      Array.prototype.forEach.call(root.querySelectorAll('.ha-kc-card'), function(card){
        var collection = card.getAttribute('data-ha-collection') || '';
        var show = filterValue === 'All' || collection === filterValue;
        card.style.display = show ? '' : 'none';
        if(show) visible++;
      });
      var count = root.querySelector('.ha-ap-filter-count');
      if(count) count.textContent = 'Showing ' + visible + ' patterns';
    });
  }
  function suppressSquarespaceFallback(root){
    if(!root || root.getAttribute('data-fallback-suppressed') === 'true') return;
    root.setAttribute('data-fallback-suppressed','true');
    Array.prototype.forEach.call(document.body.children,function(node){
      if(node === root) return;
      if(/^(SCRIPT|STYLE|LINK|NOSCRIPT)$/i.test(node.tagName)) return;
      node.setAttribute('data-ha-to-make-hidden','true');
      node.style.setProperty('display','none','important');
      node.style.setProperty('visibility','hidden','important');
    });
  }
  function mount(){
    if(!makerSlug()) return;
    var existingRoot = document.getElementById('ha-to-make-maker-route');
    if(existingRoot){
      document.body.classList.add('ha-to-make-maker-active');
      suppressSquarespaceFallback(existingRoot);
      bindMobileNav(existingRoot);
      bindFilters(existingRoot);
      return;
    }
    var content = window.HA_TO_MAKE_MAKERS && window.HA_TO_MAKE_MAKERS[makerSlug()];
    if(!content || !content.maker) return;
    var anchor = document.querySelector('#sections') || document.querySelector('main') || document.body.firstElementChild;
    if(!anchor){ setTimeout(mount, 150); return; }
    document.body.classList.add('ha-to-make-maker-active');
    var wrap = document.createElement('div');
    wrap.innerHTML = html(content);
    var root = wrap.firstChild;
    document.body.insertBefore(root, document.body.firstChild);
    suppressSquarespaceFallback(root);
    bindMobileNav(root);
    bindDots(root);
    bindFilters(root);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
    setTimeout(mount, 600);
  });
})();
