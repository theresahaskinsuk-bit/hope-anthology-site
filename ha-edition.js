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

  var script = document.currentScript || (function(){var scripts=document.getElementsByTagName('script');return scripts[scripts.length-1];})();
  var scriptUrl = script && script.src ? new URL(script.src) : null;
  var base = scriptUrl ? scriptUrl.href.replace(/[^/]+(?:\?.*)?$/, '') : '';
  var version = scriptUrl ? (scriptUrl.searchParams.get('v') || Date.now()) : Date.now();

  function normalPath(value){
    return String(value == null ? '' : value).replace(/\/+$/, '') || '/';
  }

  function isEditionCandidate(path){
    return path === '/editions' || path.indexOf('/editions/') === 0;
  }

  if(!isEditionCandidate(normalPath(window.location.pathname))) return;

  function loadCss(){
    if(document.getElementById('ha-v3-css') || document.getElementById('ha-editions-v11-css')) return;
    var link = document.createElement('link');
    link.id = 'ha-editions-v11-css';
    link.rel = 'stylesheet';
    link.href = base + 'styles.css?v=' + encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_EDITIONS_CONTENT){ done(); return; }
    var existing = document.getElementById('ha-editions-content');
    if(existing){
      existing.addEventListener('load', done, {once:true});
      existing.addEventListener('error', done, {once:true});
      return;
    }
    var contentScript = document.createElement('script');
    contentScript.id = 'ha-editions-content';
    contentScript.src = base + 'content.editions.js?v=' + encodeURIComponent(version);
    contentScript.onload = done;
    contentScript.onerror = function(){
      console.warn('Hope Anthology Editions content file could not be loaded.');
      done();
    };
    document.head.appendChild(contentScript);
  }

  function loadHomeContent(done){
    if(window.HA_HOME_CONTENT){ done(); return; }
    var existing = document.getElementById('ha-editions-home-content');
    if(existing){
      existing.addEventListener('load', done, {once:true});
      existing.addEventListener('error', done, {once:true});
      return;
    }
    var homeScript = document.createElement('script');
    homeScript.id = 'ha-editions-home-content';
    homeScript.src = base + 'content.home.js?v=' + encodeURIComponent(version);
    homeScript.onload = done;
    homeScript.onerror = function(){
      console.warn('Hope Anthology shared home content file could not be loaded.');
      done();
    };
    document.head.appendChild(homeScript);
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(character){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
    });
  }

  function marked(value){
    return esc(value).replace(/\*([^*]+)\*/g,function(_match, phrase){
      return '<em class="ha-ed-pullout">'+phrase+'</em>';
    });
  }

  function findEdition(content){
    var editions = content && content.editions ? content.editions : {};
    var path = normalPath(window.location.pathname);
    var keys = Object.keys(editions);
    for(var index=0; index<keys.length; index++){
      var edition = editions[keys[index]];
      if(edition && normalPath(edition.pageUrl) === path) return edition;
    }
    return null;
  }

  function paintingCredit(painting){
    return esc(painting.artist)+', <em>'+esc(painting.title)+'</em>, '+esc(painting.year);
  }

  function paintingProvenance(painting){
    return [painting.medium, painting.collection, painting.rights].filter(Boolean).map(esc).join(' · ');
  }

  function partnerHtml(partner){
    if(!partner || !partner.name || !partner.logoUrl || !partner.logoAlt) return '';
    return '<div class="ha-ed-partner">'+
      '<small>In collaboration with</small>'+
      '<img src="'+esc(partner.logoUrl)+'" alt="'+esc(partner.logoAlt)+'" loading="lazy" decoding="async">'+
      '<span class="ha-v3-sr-only">'+esc(partner.name)+'</span>'+
    '</div>';
  }

  function paintingHtml(edition, thingsParagraph){
    var painting = edition.painting || {};
    return '<div class="ha-ed-hero-art">'+
      '<figure class="ha-ed-frame">'+
        '<img src="'+esc(painting.url)+'" alt="'+esc(painting.alt)+'" decoding="async">'+
        '<figcaption class="ha-ed-painting-label">'+
          '<p class="ha-ed-art-credit">'+paintingCredit(painting)+'</p>'+
          '<p class="ha-ed-provenance">'+paintingProvenance(painting)+'</p>'+
          '<p class="ha-ed-painting-line">'+esc(painting.line)+'</p>'+
          partnerHtml(edition.partner)+
        '</figcaption>'+
      '</figure>'+
      '<p class="ha-ed-things">'+esc(thingsParagraph)+'</p>'+
    '</div>';
  }

  function image(home, key){
    return home && home.images && home.images[key] ? home.images[key] : '';
  }

  function cardHtml(piece, artist, publishPrices){
    var isMakingMore = piece.comingSoonLabel === 'Making more';
    var ariaLabel = 'See '+String(piece.title || '')+' in '+String(artist.displayName || '')+'’s shop' +
      (isMakingMore ? '. Making more, not available to buy right now' : '') +
      ' (opens their shop)';
    var pipClass = piece.world === 'To Make' ? ' ha-kc-pip-make' : '';
    var badge = isMakingMore ? '<span class="ha-kc-badge ha-kc-badge-making-more">Making more</span>' : '';
    var medium = piece.medium ? '<div class="ha-kc-chips"><span><small>Medium</small>'+esc(piece.medium)+'</span></div>' : '';
    var featureContent = piece.featured && (piece.meaning || (piece.goodFor && piece.goodFor.length))
      ? '<div class="ha-kc-meaning">'+
          (piece.meaning ? '<p>'+esc(piece.meaning)+'</p>' : '')+
          (piece.goodFor && piece.goodFor.length ? '<div class="ha-kc-gf-chips">'+piece.goodFor.map(function(value){return '<span>'+esc(value)+'</span>';}).join('')+'</div>' : '')+
        '</div>'
      : '';
    var price = publishPrices === true && piece.price != null
      ? '<p class="ha-ed-price">£'+esc(piece.price)+'</p>'
      : '';
    return '<a class="ha-kc-card ha-ed-card'+(piece.featured ? ' ha-ed-card-feature' : '')+'" href="'+esc(piece.listingUrl)+'" target="_blank" rel="noopener" aria-label="'+esc(ariaLabel)+'">'+
      '<div class="ha-kc-card-img-wrap ha-ed-card-img-wrap">'+
        '<span class="ha-kc-pip'+pipClass+'">'+esc(piece.world)+'</span>'+
        badge+
        '<img src="'+esc(piece.imageUrl)+'" alt="'+esc(piece.imageAlt)+'" loading="lazy" decoding="async">'+
      '</div>'+
      '<div class="ha-kc-card-body">'+
        '<h3>'+esc(piece.title)+'</h3>'+
        medium+
        price+
        featureContent+
        '<span class="ha-ed-card-shop">See it in the artist’s shop <span aria-hidden="true">→</span></span>'+
      '</div>'+
    '</a>';
  }

  function artistHtml(artist, publishPrices){
    return '<section class="ha-ed-artist" data-ed-artist-order="'+esc(artist.order)+'">'+
      '<h2 class="ha-ed-artist-name">'+esc(artist.displayName)+'</h2>'+
      '<p class="ha-ed-artist-why">'+esc(artist.whyLine)+'</p>'+
      '<div class="ha-ed-piece-grid ha-ed-layout-'+esc(artist.layout.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))+'">'+
        (artist.pieces || []).map(function(piece){ return cardHtml(piece, artist, publishPrices); }).join('')+
      '</div>'+
    '</section>';
  }

  function preFooterHtml(preFooter){
    var photo = preFooter.photo;
    var person = '<div class="ha-ed-pre-person">'+
      '<p class="ha-ed-pre-person-name">'+esc(preFooter.personName)+'</p>'+
      '<p class="ha-ed-pre-person-role">'+esc(preFooter.personRole)+'</p>'+
    '</div>';
    var image = photo
      ? '<figure class="ha-ed-pre-figure"><img src="'+esc(photo.url)+'" alt="'+esc(photo.alt)+'" loading="lazy" decoding="async">'+person+'</figure>'
      : '<div class="ha-ed-pre-person-only">'+person+'</div>';
    return '<section class="ha-ed-pre-footer">'+
      '<div class="ha-ed-pre-grid">'+
        '<div class="ha-ed-pre-copy">'+
          '<h2>'+esc(preFooter.heading)+'</h2>'+
          '<p>'+esc(preFooter.paragraph1)+'</p>'+
          '<p>'+esc(preFooter.paragraph2)+'</p>'+
        '</div>'+
        image+
      '</div>'+
    '</section>';
  }

  function html(edition, content, home){
    var hero = edition.hero || {};
    var stats = edition.stats || {};
    var artists = edition.artists || [];
    var publishPrices = content && content.publishPrices === true;
    var footer = home && home.footer ? home.footer : {};
    return '<div id="ha-edition-v1">'+
      '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation">'+
        '<a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home">'+
          '<img class="ha-v3-logo" src="'+esc(image(home,'logo'))+'" alt="">'+
        '</a>'+
      '</nav>'+
      '<main>'+ 
        '<section class="ha-ed-hero">'+
          '<div class="ha-ed-hero-grid">'+
            '<div class="ha-ed-hero-copy">'+
              '<p class="ha-ed-eyebrow">The Hope Anthology · Edition '+esc(edition.editionNumber)+'</p>'+
              '<h1>'+esc(edition.title)+'<em>'+esc(hero.strapline)+'</em></h1>'+
              '<p class="ha-ed-hero-body">'+marked(hero.paragraph1)+'</p>'+
              '<p class="ha-ed-hero-body">'+marked(hero.paragraph2)+'</p>'+
              '<p class="ha-ed-hero-reach">'+esc(hero.paragraph3)+'</p>'+
              '<p class="ha-ed-hero-signoff">'+esc(hero.signoff)+'</p>'+
              '<div class="ha-ed-stats" aria-label="Edition statistics">'+
                '<span><strong>'+esc(stats.artists)+'</strong><small>Artists</small></span>'+
                '<span><strong>'+esc(stats.toKeep)+'</strong><small>To Keep</small></span>'+
                '<span><strong>'+esc(stats.toMake)+'</strong><small>To Make</small></span>'+
              '</div>'+
            '</div>'+
            paintingHtml(edition, hero.thingsParagraph)+
          '</div>'+
        '</section>'+
        '<section class="ha-ed-main" aria-label="Edition artists">'+
          '<div class="ha-ed-artist-stream">'+artists.map(function(artist){ return artistHtml(artist, publishPrices); }).join('')+'</div>'+
        '</section>'+
        preFooterHtml(edition.preFooter || {})+
      '</main>'+
      '<footer class="ha-v3-footer">'+
        '<div class="ha-v3-footer-top">'+
          '<img class="ha-v3-footer-star" src="'+esc(image(home,'star'))+'" alt="">'+
          '<div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a></div>'+
          '<div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div><a href="/contact">Contact</a><a href="/privacy">Privacy policy</a><a href="/accessibility">Accessibility</a></div>'+
        '</div>'+
        '<div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright || '')+'</span></div>'+
      '</footer>'+
    '</div>';
  }

  function suppressSquarespaceFallback(){
    document.body.classList.add('ha-edition-v1-active');
  }

  function setupIndependentColumns(root){
    var stream = root.querySelector('.ha-ed-artist-stream');
    if(!stream || stream.getAttribute('data-ha-edition-columns') === 'true') return;
    stream.setAttribute('data-ha-edition-columns','true');
    var scheduled = false;
    function reset(items){
      stream.style.height = '';
      items.forEach(function(item){
        item.style.position = '';
        item.style.left = '';
        item.style.top = '';
        item.style.width = '';
        item.style.margin = '';
      });
    }
    function layout(){
      scheduled = false;
      var items = Array.prototype.slice.call(stream.querySelectorAll('.ha-ed-artist'));
      if(window.innerWidth <= 1100){
        reset(items);
        return;
      }
      var width = stream.clientWidth;
      var gap = 64;
      var columnWidth = Math.max(0, (width - gap) / 2);
      if(!columnWidth) return;
      var heights = [0, 0];
      items.forEach(function(item, index){
        var column = index % 2;
        item.style.position = 'absolute';
        item.style.width = columnWidth + 'px';
        item.style.left = (column ? columnWidth + gap : 0) + 'px';
        item.style.top = heights[column] + 'px';
        item.style.margin = '0';
        heights[column] += item.offsetHeight + 52;
      });
      stream.style.height = Math.max(heights[0], heights[1]) + 'px';
    }
    function schedule(){
      if(scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(layout);
    }
    window.addEventListener('resize', schedule);
    Array.prototype.forEach.call(stream.querySelectorAll('img'),function(image){
      image.addEventListener('load', schedule);
      image.addEventListener('error', schedule);
    });
    if(window.ResizeObserver){
      var observer = new ResizeObserver(schedule);
      Array.prototype.forEach.call(stream.querySelectorAll('.ha-ed-artist'),function(item){ observer.observe(item); });
    }
    schedule();
    setTimeout(schedule, 150);
    setTimeout(schedule, 750);
  }

  function mount(){
    var content = window.HA_EDITIONS_CONTENT || {};
    var home = window.HA_HOME_CONTENT || {};
    var edition = findEdition(content);
    if(!edition) return;
    var existing = document.getElementById('ha-edition-v1');
    if(existing){
      suppressSquarespaceFallback();
      setupIndependentColumns(existing);
      return;
    }
    if(!document.body){ setTimeout(mount, 150); return; }
    document.body.classList.add('ha-edition-v1-active');
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html(edition, content, home);
    var root = wrapper.firstChild;
    var anchor = document.querySelector('#sections') || document.querySelector('main') || document.body.firstElementChild;
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(root, anchor);
    else document.body.insertBefore(root, document.body.firstChild);
    suppressSquarespaceFallback();
    setupIndependentColumns(root);
  }

  loadCss();
  loadContent(function(){
    loadHomeContent(function(){
      if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
      else mount();
      setTimeout(mount, 600);
    });
  });
})();
