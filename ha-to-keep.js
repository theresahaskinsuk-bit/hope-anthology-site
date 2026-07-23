(function(){
  var script = document.currentScript || (function(){ var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
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

  function loadContent(done){
    if(window.HA_TO_KEEP_CONTENT){ done(); return; }
    var existing = document.getElementById('ha-to-keep-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s = document.createElement('script');
    s.id = 'ha-to-keep-content';
    s.src = base + 'content.to-keep.js?v=' + encodeURIComponent(version);
    s.onload = done;
    s.onerror = function(){ console.warn('Hope Anthology To Keep content file could not be loaded.'); done(); };
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function safeHtml(value){ return String(value == null ? '' : value); }
  function isAbsoluteUrl(value){ return /^(https?:)?\/\//.test(String(value || '')) || /^data:/.test(String(value || '')) || /^\//.test(String(value || '')); }
  function assetUrl(value){
    value = String(value == null ? '' : value);
    if(!value) return '';
    return isAbsoluteUrl(value) ? value : base + value.replace(/^\.\//,'');
  }
  function imageValue(content, value){
    var images = content.images || {};
    return assetUrl(images[value] || value || '');
  }
  function image(content, key){ return esc(imageValue(content, key)); }
  function ctaLabel(label){
    var clean = String(label == null ? '' : label).replace(/\s*[→›»]+\s*$/, '');
    return '<span class="ha-v3-cta-text">' + esc(clean) + '</span><span class="ha-v3-cta-arrow" aria-hidden="true">→</span>';
  }
  function navLinks(items){
    var current = location.pathname.replace(/\/$/, '') || '/';
    return (items || []).map(function(item){
      var href = item.url || '#';
      var active = (href.replace(/\/$/, '') || '/') === current;
      return '<a href="' + esc(href) + '"' + (active ? ' aria-current="page"' : '') + '>' + esc(item.label) + '</a>';
    }).join('');
  }

  /* ── Price filter helpers ── */
  function parsePriceFrom(priceStr){
    var n = parseFloat(String(priceStr || '').replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  function priceMatchesBand(priceFrom, band){
    if(band === 'All') return true;
    if(band === 'Under \u00a320') return priceFrom < 20;
    if(band === '\u00a320\u2013\u00a350') return priceFrom >= 20 && priceFrom <= 50;
    if(band === '\u00a350+') return priceFrom > 50;
    return true;
  }

  /* ── Artist card ── */
  function artistCard(content, artist){
    var traitPills = (artist.traits || []).map(function(t){
      return '<span class="ha-tk-trait">' + esc(t) + '</span>';
    }).join('');
    var collectionsList = (artist.collections || []).map(function(c){
      return '<li>' + esc(c) + '</li>';
    }).join('');
    return '<article class="ha-tk-card" data-medium="' + esc(artist.medium || 'Prints') + '" data-price-from="' + esc(String(parsePriceFrom(artist.priceFrom))) + '">' +
      (artist.cardUrl
        ? '<a class="ha-tk-card-img-link" href="' + esc(artist.cardUrl) + '" aria-label="View ' + esc(artist.name) + '\'s work">'
        : '<div>') +
      '<div class="ha-tk-card-img-wrap">' +
        '<img src="' + esc(artist.heroImage || '') + '" alt="' + esc(artist.heroAlt || artist.name) + '" loading="lazy" decoding="async">' +
        '<span class="ha-tk-pip">To Keep</span>' +
        '<span class="ha-tk-badge">Founding artist</span>' +
      '</div>' +
      (artist.cardUrl ? '</a>' : '</div>') +
      '<div class="ha-tk-card-body">' +
        '<h3 class="ha-tk-artist-name">' + esc(artist.name) + '</h3>' +
        '<div class="ha-tk-chips"><span class="ha-tk-chip"><small>Medium</small>' + esc(artist.medium || 'Prints') + '</span></div>' +
        '<div class="ha-tk-collections"><p class="ha-tk-collections-label">Collections</p><ul>' + collectionsList + '</ul></div>' +
        '<div class="ha-tk-price-block"><span class="ha-tk-price-from-label">From</span><span class="ha-tk-price">£' + esc(artist.priceFrom || '') + '</span><span class="ha-tk-price-note">excludes shipping</span></div>' +
        '<p class="ha-tk-feeling">' + esc(artist.feeling || '') + '</p>' +
        '<div class="ha-tk-traits">' + traitPills + '</div>' +
        (artist.cardUrl
        ? '<a class="ha-kc-btn ha-kc-btn-teal" href="' + esc(artist.cardUrl) + '">' + ctaLabel('View their work') + '</a>'
        : '<button class="ha-kc-btn ha-kc-btn-inactive" type="button" disabled>' + ctaLabel('View their work') + '</button>') +
      '</div>' +
    '</article>';
  }

  /* ── Filter bar ── */
  function filterBar(content){
    var filters = content.filters || {};
    var mediums = filters.medium || ['All'];
    var prices = filters.price || ['All'];
    var artists = (content.artists || []).filter(function(a){ return a.active !== false; });
    var mediumBtns = mediums.map(function(m, i){
      return '<button type="button" class="ha-tk-filter-btn' + (i === 0 ? ' is-active' : '') + '" data-filter-medium="' + esc(m) + '">' + esc(m) + '</button>';
    }).join('');
    var priceLinks = prices.map(function(p, i){
      return '<button type="button" class="ha-tk-price-filter' + (i === 0 ? ' is-active' : '') + '" data-filter-price="' + esc(p) + '">' + esc(p) + '</button>';
    }).join('');
    return '<div class="ha-tk-filters">' +
      mediumBtns +
      '<span class="ha-tk-filter-divider" aria-hidden="true"></span>' +
      priceLinks +
      '<span class="ha-tk-grid-eyebrow" id="ha-tk-count-label">' + esc(content.gridEyebrow || ('The Anthology \u2014 ' + artists.length + ' Artists')) + '</span>' +
    '</div>';
  }

  /* ── Full page HTML ── */
  function html(content){
    var page = content.page || {};
    var collective = content.collective || {};
    var footer = content.footer || {};
    var artists = (content.artists || []).filter(function(a){ return a.active !== false; });
    var srOnlyStyle = 'position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important;color:transparent!important;background:transparent!important;';
    var statsHtml = (page.stats || []).map(function(s){
      return '<span><strong>' + esc(s.value) + '</strong><small>' + esc(s.label) + '</small></span>';
    }).join('');
    var cardsHtml = artists.map(function(a){ return artistCard(content, a); }).join('');

    return '<div id="ha-to-keep-v1">' +
      /* Nav */
      '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation">' +
        '<a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home">' +
          '<img class="ha-v3-logo" src="' + image(content, 'logo') + '" alt="">' +
          '<h1 class="ha-v3-sr-only" style="' + srOnlyStyle + '">The Hope Anthology \u2014 To Keep</h1>' +
        '</a>' +
        '<button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-tk-mobile-menu" aria-expanded="false">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<div id="ha-tk-mobile-menu" class="ha-v3-links">' + navLinks(content.navigation) + '</div>' +
      '</nav>' +
      /* Header */
      '<main class="ha-tk-main">' +
        '<header class="ha-kc-header">' +
          '<p class="ha-kc-eyebrow">' + esc(page.eyebrow || 'To Keep') + '</p>' +
          '<h2>' + safeHtml(page.headingHtml || 'Curated Artists') + '</h2>' +
          '<p>' + esc(page.intro || '') + '</p>' +
          '<div class="ha-kc-stats">' + statsHtml + '</div>' +
        '</header>' +
        /* Filter + grid */
        '<section class="ha-kc-grid-section">' +
          filterBar(content) +
          '<div class="ha-kc-card-grid ha-tk-grid" id="ha-tk-grid">' + cardsHtml + '</div>' +
        '</section>' +
        /* Collective */
        '<section class="ha-kc-collective">' +
          '<div><h2>' + esc(collective.heading) + '</h2><p>' + esc(collective.body) + '</p></div>' +
          '<a class="ha-kc-collective-btn" href="' + esc(collective.buttonUrl || '/collective') + '">' + ctaLabel(collective.buttonLabel || 'Join the Collective') + '</a>' +
        '</section>' +
      '</main>' +
      /* Footer */
      '<footer class="ha-v3-footer">' +
        '<div class="ha-v3-footer-top">' +
          '<img class="ha-v3-footer-star" src="' + image(content, 'star') + '" alt="">' +
          '<div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>' + navLinks(content.navigation) + '</div>' +
          '<div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div>' +
            '<a href="' + esc(footer.instagramUrl) + '" target="_blank" rel="noopener">Instagram</a>' +
            '<a href="' + esc(footer.privacyUrl) + '">Privacy policy</a>' +
            '<a href="' + esc(footer.accessibilityUrl) + '">Accessibility</a>' +
            '<a href="' + esc(footer.sellingUrl) + '">Why I sell this way</a>' +
          '</div>' +
        '</div>' +
        '<div class="ha-v3-footer-bottom"><span>' + esc(footer.copyright) + '</span></div>' +
      '</footer>' +
    '</div>';
  }

  /* ── Mobile nav binding ── */
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-tk-mobile-menu');
    if(!toggle || !menu || toggle.getAttribute('data-bound') === 'true') return;
    toggle.setAttribute('data-bound', 'true');
    toggle.addEventListener('click', function(){
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      root.classList.toggle('ha-v3-menu-open', !open);
    });
    menu.addEventListener('click', function(event){
      if(event.target && event.target.tagName === 'A'){
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        root.classList.remove('ha-v3-menu-open');
      }
    });
  }

  /* ── Filter binding ── */
  function bindFilters(root, content){
    var activeMedium = 'All';
    var activePrice = 'All';

    function applyFilters(){
      var cards = root.querySelectorAll('.ha-tk-card');
      var visible = 0;
      Array.prototype.forEach.call(cards, function(card){
        var medium = card.getAttribute('data-medium') || 'Prints';
        var priceFrom = parseFloat(card.getAttribute('data-price-from') || '0');
        var mediumOk = activeMedium === 'All' || medium === activeMedium;
        var priceOk = priceMatchesBand(priceFrom, activePrice);
        var show = mediumOk && priceOk;
        card.style.display = show ? '' : 'none';
        if(show) visible++;
      });
      var label = root.querySelector('#ha-tk-count-label');
      if(label){
        var total = (content.artists || []).filter(function(a){ return a.active !== false; }).length;
        label.textContent = visible === total
          ? (content.gridEyebrow || ('The Anthology \u2014 ' + total + ' Artists'))
          : ('The Anthology \u2014 ' + visible + ' of ' + total + ' Artists');
      }
    }

    /* Medium filter buttons */
    var mediumBtns = root.querySelectorAll('.ha-tk-filter-btn');
    Array.prototype.forEach.call(mediumBtns, function(btn){
      btn.addEventListener('click', function(){
        Array.prototype.forEach.call(mediumBtns, function(b){ b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activeMedium = btn.getAttribute('data-filter-medium') || 'All';
        applyFilters();
      });
    });

    /* Price filter buttons */
    var priceBtns = root.querySelectorAll('.ha-tk-price-filter');
    Array.prototype.forEach.call(priceBtns, function(btn){
      btn.addEventListener('click', function(){
        Array.prototype.forEach.call(priceBtns, function(b){ b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activePrice = btn.getAttribute('data-filter-price') || 'All';
        applyFilters();
      });
    });
  }

  /* ── Mount ── */
  function mount(){
    var path = location.pathname.replace(/\/$/, '') || '/';
    if(path !== '/to-keep') return;
    var content = window.HA_TO_KEEP_CONTENT || {};
    if(document.getElementById('ha-to-keep-v1')) return;
    var anchor = document.querySelector('#sections') || document.querySelector('main') || document.body.firstElementChild;
    if(!anchor){ setTimeout(mount, 150); return; }
    document.body.classList.add('ha-to-keep-v1-active');
    var wrap = document.createElement('div');
    wrap.innerHTML = html(content);
    var root = wrap.firstChild;
    anchor.parentNode.insertBefore(root, anchor);
    bindMobileNav(root);
    bindFilters(root, content);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
    setTimeout(mount, 600);
  });
})();
