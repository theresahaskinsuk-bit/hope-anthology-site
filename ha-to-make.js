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

  function loadContent(done){
    if(window.HA_TO_MAKE_CONTENT){ done(); return; }
    var existing = document.getElementById('ha-to-make-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var content = document.createElement('script');
    content.id = 'ha-to-make-content';
    content.src = base + 'content.to-make.js?v=' + encodeURIComponent(version);
    content.onload = done;
    content.onerror = function(){ console.warn('Hope Anthology To Make content file could not be loaded.'); done(); };
    document.head.appendChild(content);
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
    return isAbsoluteUrl(value) ? value : base + value.replace(/^\.\//, '');
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
      var label = item.label;
      return '<a href="' + esc(href) + '"' + (active ? ' aria-current="page"' : '') + '>' + esc(label) + '</a>';
    }).join('');
  }

  function directoryWorkLabel(maker){
    var name = String(maker.buttonName || maker.name || '').trim();
    if(!name) return 'See their work';
    return 'See ' + name + (/[sS]$/.test(name) ? "'" : "'s") + ' work';
  }
  function makerCard(maker){
    var traits = (maker.traits || []).map(function(trait){ return '<span class="ha-tk-trait">' + esc(trait) + '</span>'; }).join('');
    var collections = (maker.collections || []).map(function(collection){ return '<li>' + esc(collection) + '</li>'; }).join('');
    return '<article class="ha-tk-card" data-medium="' + esc(maker.filterMedium || maker.medium || '') + '" data-level="' + esc(maker.difficulty || '') + '" data-delivery="' + esc(maker.delivery || '') + '">' +
      '<a class="ha-tk-card-img-link" href="' + esc(maker.cardUrl || '#') + '" aria-label="' + esc(directoryWorkLabel(maker)) + '">' +
        '<div class="ha-tk-card-img-wrap">' +
          '<img src="' + esc(maker.heroImage || '') + '" alt="' + esc(maker.heroAlt || maker.name || '') + '" loading="lazy" decoding="async">' +
          '<span class="ha-tk-pip">To Make</span>' +
          '<span class="ha-tk-badge">' + esc(maker.badge || 'Founding maker') + '</span>' +
        '</div>' +
      '</a>' +
      '<div class="ha-tk-card-body">' +
        '<h3 class="ha-tk-artist-name">' + esc(maker.name) + '</h3>' +
        '<div class="ha-tk-chips"><span class="ha-tk-chip"><small>Medium</small>' + esc(maker.medium || '') + '</span></div>' +
        '<div class="ha-tk-collections"><p class="ha-tk-collections-label">Collections</p><ul>' + collections + '</ul></div>' +
        '<div class="ha-tk-price-block"><span class="ha-tk-price-from-label">From</span><span class="ha-tk-price">' + esc(maker.priceFrom || '') + '</span><span class="ha-tk-price-note">excludes shipping</span></div>' +
        '<p class="ha-tk-feeling">' + esc(maker.feeling || '') + '</p>' +
        '<div class="ha-tk-traits">' + traits + '</div>' +
        '<a class="ha-kc-btn ha-kc-btn-teal" href="' + esc(maker.cardUrl || '#') + '" target="_blank" rel="noopener">' + ctaLabel(directoryWorkLabel(maker)) + '</a>' +
      '</div>' +
    '</article>';
  }

  function filterGroup(values, type){
    return (values || []).map(function(value, index){
      return '<button type="button" class="ha-tk-filter-btn' + (index === 0 ? ' is-active' : '') + '" data-filter-' + type + '="' + esc(value) + '">' + esc(value) + '</button>';
    }).join('');
  }

  function filterBar(content){
    var filters = content.filters || {};
    var makers = (content.makers || []).filter(function(maker){ return maker.active !== false; });
    return '<div class="ha-tk-filters">' +
      filterGroup(filters.medium, 'medium') +
      '<span class="ha-tk-filter-divider" aria-hidden="true"></span>' +
      filterGroup(filters.level, 'level') +
      '<span class="ha-tk-filter-divider" aria-hidden="true"></span>' +
      filterGroup(filters.delivery, 'delivery') +
      '<span class="ha-tk-grid-eyebrow" id="ha-to-make-count-label">' + esc('Curated makers — ' + makers.length) + '</span>' +
    '</div>';
  }

  function html(content){
    var page = content.page || {};
    var collective = content.collective || {};
    var footer = content.footer || {};
    var makers = (content.makers || []).filter(function(maker){ return maker.active !== false; });
    var recruitment = content.recruitment || {};
    var stats = page.stats || [];
    var statHtml = stats.map(function(stat, index){
      return '<span><strong>' + esc(index === 0 ? makers.length : stat.value) + (index === 0 ? '<b class="ha-directory-stat-suffix">of the first 50</b>' : '') + '</strong><small>' + esc(stat.label || '') + '</small></span>';
    }).join('');
    var cards = makers.map(makerCard).join('') +
      '<article class="ha-directory-recruitment"><p class="ha-v3-kicker">' + esc(recruitment.eyebrow) + '</p><div class="ha-v3-card-title" role="heading" aria-level="3">' + esc(recruitment.heading) + '</div><p class="ha-v3-card-copy">' + esc(recruitment.body) + '</p><a class="ha-c-btn" href="' + esc(recruitment.linkUrl || '/for-artists') + '">' + ctaLabel(recruitment.linkLabel || 'See how it works for artists') + '</a></article>';

    /* The outer route wrapper is unique for loader cleanup. The nested #ha-to-keep-v1 root is intentional: existing page-scoped CSS is the only no-stylesheet-change way to preserve the signed-off directory visual system. */
    return '<div id="ha-to-make-route">' +
      '<!-- #ha-to-keep-v1 is nested for existing styling only; this is the To Make route. -->' +
      '<div id="ha-to-keep-v1">' +
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation">' +
          '<a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="' + image(content, 'logo') + '" alt=""><h1 class="ha-v3-sr-only">The Hope Anthology — To Make</h1></a>' +
          '<button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-to-make-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
          '<div id="ha-to-make-mobile-menu" class="ha-v3-links">' + navLinks(content.navigation) + '</div>' +
        '</nav>' +
        '<main class="ha-tk-main">' +
          '<header class="ha-kc-header"><p class="ha-kc-eyebrow">' + esc(page.eyebrow || 'To Make') + '</p><h2>' + safeHtml(page.headingHtml || 'Curated <em>Makers</em>') + '</h2><p>' + esc(page.intro || '') + '</p><div class="ha-kc-stats">' + statHtml + '</div></header>' +
          '<section class="ha-kc-grid-section">' + filterBar(content) + '<div class="ha-kc-card-grid ha-tk-grid" id="ha-to-make-grid">' + cards + '</div></section>' +
          '<section class="ha-kc-collective"><div><h2>' + esc(collective.heading || '') + '</h2><p>' + esc(collective.body || '') + '</p></div><a class="ha-kc-collective-btn" href="' + esc(collective.buttonUrl || '/collective') + '">' + ctaLabel(collective.buttonLabel || 'Join the Collective') + '</a></section>' +
        '</main>' +
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="' + image(content, 'star') + '" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>' + navLinks(content.navigation) + '<a href="/for-organisations">For Organisations</a></div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div><a href="' + esc(footer.privacyUrl || '/privacy-policy') + '">Privacy policy</a><a href="' + esc(footer.accessibilityUrl || '/accessibility') + '">Accessibility</a></div></div><div class="ha-v3-footer-bottom"><span>' + esc(footer.copyright || '© The Hope Anthology 2026') + '</span></div></footer>' +
      '</div>' +
    '</div>';
  }

  function bindMobileNav(root){
    var styleRoot = root.querySelector('#ha-to-keep-v1') || root;
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-to-make-mobile-menu');
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

  function bindFilters(root, content){
    var selected = {medium: 'All mediums', level: 'All levels', delivery: 'All delivery'};
    function allows(value, selectedValue, allValue){ return selectedValue === allValue || value === selectedValue; }
    function applyFilters(){
      var visible = 0;
      Array.prototype.forEach.call(root.querySelectorAll('.ha-tk-card'), function(card){
        var show = allows(card.getAttribute('data-medium') || '', selected.medium, 'All mediums') &&
          allows(card.getAttribute('data-level') || '', selected.level, 'All levels') &&
          allows(card.getAttribute('data-delivery') || '', selected.delivery, 'All delivery');
        card.style.display = show ? '' : 'none';
        if(show) visible++;
      });
      var label = root.querySelector('#ha-to-make-count-label');
      if(label) label.textContent = 'Curated makers — ' + visible;
    }
    ['medium', 'level', 'delivery'].forEach(function(type){
      var buttons = root.querySelectorAll('[data-filter-' + type + ']');
      Array.prototype.forEach.call(buttons, function(button){
        button.addEventListener('click', function(){
          Array.prototype.forEach.call(buttons, function(other){ other.classList.remove('is-active'); });
          button.classList.add('is-active');
          selected[type] = button.getAttribute('data-filter-' + type) || selected[type];
          applyFilters();
        });
      });
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
    var path = location.pathname.replace(/\/$/, '') || '/';
    if(path !== '/to-make') return;
    var existingRoot = document.getElementById('ha-to-make-route');
    if(existingRoot){
      document.body.classList.add('ha-to-make-active');
      suppressSquarespaceFallback(existingRoot);
      bindMobileNav(existingRoot);
      return;
    }
    var content = window.HA_TO_MAKE_CONTENT || {};
    var anchor = document.querySelector('#sections') || document.querySelector('main') || document.body.firstElementChild;
    if(!anchor){ setTimeout(mount, 150); return; }
    document.body.classList.add('ha-to-make-active');
    var wrap = document.createElement('div');
    wrap.innerHTML = html(content);
    var root = wrap.firstChild;
    document.body.insertBefore(root, document.body.firstChild);
    suppressSquarespaceFallback(root);
    bindMobileNav(root);
    bindFilters(root, content);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
    setTimeout(mount, 600);
  });
})();
