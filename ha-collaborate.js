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

  function loadCss(){
    if(document.getElementById('ha-stability-v12-1-css') || document.getElementById('ha-stability-v12-css') || document.getElementById('ha-v3-css')) return;
    var link=document.createElement('link');
    link.id='ha-v3-css';
    link.rel='stylesheet';
    link.href=base+'styles.css?v='+encodeURIComponent(version);
    document.head.appendChild(link);
  }

  function loadContent(done){
    if(window.HA_COLLABORATE_CONTENT){ done(); return; }
    var existing=document.getElementById('ha-collaborate-content');
    if(existing){ existing.addEventListener('load', done); return; }
    var s=document.createElement('script');
    s.id='ha-collaborate-content';
    s.src=base+'content.collaborate.js?v='+encodeURIComponent(version);
    s.onload=done;
    s.onerror=function(){ console.warn('Hope Anthology Collaborations content file could not be loaded.'); done(); };
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
  function image(content,key){ return esc(assetUrl((content.images && content.images[key]) || '')); }
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
  function newsletterForm(collective){
    var action = collective.formAction || '/collective';
    var method = (collective.formMethod || 'get').toLowerCase();
    var emailName = collective.emailFieldName || 'email';
    var provider = collective.provider || 'holding-page';
    return ''+
      '<form class="ha-col-form ha-col-collective-form" action="'+esc(action)+'" method="'+esc(method)+'" data-provider="'+esc(provider)+'">'+
        '<label class="ha-v3-sr-only" for="ha-col-collective-email">'+esc(collective.emailLabel || 'Email address')+'</label>'+ 
        '<input id="ha-col-collective-email" class="ha-col-input ha-col-input-dark" type="email" name="'+esc(emailName)+'" placeholder="'+esc(collective.emailPlaceholder || 'Email address')+'" autocomplete="email" required>'+ 
        '<button class="ha-col-btn ha-col-btn-gold" type="submit">'+ctaLabel(collective.buttonLabel || 'Join the Collective')+'</button>'+ 
        '<p class="ha-col-note">'+esc(collective.note || '')+'</p>'+ 
      '</form>';
  }
  function encodeMailtoComponent(value){
    return encodeURIComponent(value).replace(/'/g,'%27');
  }
  function conversationCta(conversation){
    var email = conversation.emailAddress || 'theresa@thehopeanthology.art';
    var subject = encodeMailtoComponent(conversation.emailSubject || 'Collaboration enquiry');
    var body = encodeMailtoComponent(conversation.emailBody || 'Hello The Hope Anthology,\n\nI would like to talk about a possible collaboration.\n\n');
    var href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    return ''+
      '<div id="collaborate-enquiry" class="ha-col-enquiry-panel">'+
        '<h2>'+esc(conversation.heading || 'Start the conversation')+'</h2>'+ 
        '<p class="ha-col-enquiry-prompt">'+esc(conversation.prompt || 'Tell me what you make, where you sell it, and whether you\'d want to be in To Keep, To Make, or both. No form to fill in — just an email.')+'</p>'+
        '<a class="ha-col-btn ha-col-btn-teal" href="'+esc(href)+'">'+ctaLabel(conversation.emailLabel || 'Email Theresa')+'</a>'+ 
        '<p class="ha-col-enquiry-email"><span>Email:</span> <a href="'+esc(href)+'">'+esc(email)+'</a></p>'+ 
        (conversation.note ? '<p class="ha-col-enquiry-note">'+esc(conversation.note)+'</p>' : '')+
      '</div>';
  }
  function conversationMailto(conversation){
    var email = conversation.emailAddress || 'theresa@thehopeanthology.art';
    var subject = encodeMailtoComponent(conversation.emailSubject || 'Collaboration enquiry');
    var body = encodeMailtoComponent(conversation.emailBody || 'Hello The Hope Anthology,\n\nI would like to talk about a possible collaboration.\n\n');
    return 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  }
  function paragraphsHtml(paragraphs,className){
    return (paragraphs||[]).map(function(paragraph){ return '<p'+(className ? ' class="'+className+'"' : '')+'>'+safeHtml(paragraph)+'</p>'; }).join('');
  }
  function lane(card){
    return '<article class="ha-col-lane"><span class="ha-col-lane-num">'+esc(card.number)+'</span><h2>'+esc(card.title)+'</h2><span class="ha-col-lane-arrow" aria-hidden="true">↓</span>'+paragraphsHtml(card.paragraphs)+'</article>';
  }
  function sectionHead(eyebrow,heading,intro){
    return '<div class="ha-col-section-head"><p class="ha-col-eyebrow">'+esc(eyebrow)+'</p><h2>'+esc(heading)+'</h2><p>'+esc(intro)+'</p></div>';
  }
  function card(card, extraClass){
    return '<article class="collab-card'+(extraClass ? ' '+extraClass : '')+'"><div class="collab-card-body"><p class="collab-card-type ha-col-card-label">'+esc(card.eyebrow)+'</p><h3 class="collab-card-title">'+safeHtml(card.headingHtml || esc(card.heading))+'</h3>'+paragraphsHtml(card.paragraphs,'collab-card-body-text')+'</div></article>';
  }
  function commissionSection(commission){
    return '<section class="ha-col-current" aria-label="Why there is no commission"><div class="ha-col-current-grid"><div class="ha-col-conversation-copy"><p class="ha-col-eyebrow">'+esc(commission.eyebrow)+'</p><p>'+safeHtml(commission.quoteHtml)+'</p><p><small><em>'+esc(commission.aside)+'</em></small></p></div><div>'+paragraphsHtml(commission.paragraphs,'collab-card-body-text')+'</div></div></section>';
  }
  function pictureMedia(content,portraitKey,landscapeKey,portraitAlt,landscapeAlt,extraClass){
    var portrait = image(content,portraitKey);
    var landscape = image(content,landscapeKey);
    var classes = 'ha-col-argument-media '+(extraClass || '');
    if(!portrait && !landscape) return '<div class="'+classes+' ha-col-argument-media--placeholder" aria-hidden="true"></div>';
    if(portrait && landscape) return '<picture class="'+classes+'" data-ha-portrait-alt="'+esc(portraitAlt)+'" data-ha-landscape-alt="'+esc(landscapeAlt)+'"><source media="(max-width: 900px)" srcset="'+esc(landscape)+'"><img src="'+esc(portrait)+'" alt="'+esc(portraitAlt)+'"></picture>';
    return '<div class="'+classes+'"><img src="'+esc(portrait || landscape)+'" alt="'+esc(portrait ? portraitAlt : landscapeAlt)+'"></div>';
  }
  function squareMedia(content,key,alt){
    var src = image(content,key);
    if(!src) return '<div class="ha-col-argument-media ha-col-argument-media--square ha-col-argument-media--placeholder" aria-hidden="true"></div>';
    return '<div class="ha-col-argument-media ha-col-argument-media--square"><img src="'+src+'" alt="'+esc(alt)+'"></div>';
  }
  function argumentSection(item,modifier,copyHtml,mediaHtml,eyebrow){
    return '<section class="ha-col-argument '+(modifier || '')+'"><div class="ha-col-argument-inner"><div class="ha-col-argument-copy">'+(eyebrow ? '<p class="ha-col-eyebrow">'+esc(eyebrow)+'</p>' : '')+'<span class="ha-col-lane-num">'+esc(item.number)+'</span><h2>'+esc(item.heading)+'</h2>'+copyHtml+'</div>'+mediaHtml+'</div></section>';
  }
  function pullQuote(item){
    return '<section class="ha-col-pullquote"><div><p class="ha-col-pullquote-quote">'+esc(item.quote)+'</p><p class="ha-col-pullquote-aside">'+safeHtml(item.aside)+'</p></div></section>';
  }
  function topHalfSections(content,topHalf,conversation){
    var hero = topHalf.hero || {};
    var whatIs = topHalf.whatIs || {};
    var roadmap = topHalf.roadmap || {};
    var reassurance = topHalf.reassurance || {};
    var argument01 = topHalf.argument01 || {};
    var argument02 = topHalf.argument02 || {};
    var argument03 = topHalf.argument03 || {};
    var purpose = topHalf.purpose || {};
    var anthology = topHalf.anthology || {};
    var imageAlt = content.imageAlt || {};
    var heroIntro = '<div class="ha-col-argument-copy"><p class="ha-col-eyebrow">'+esc(hero.eyebrow)+'</p><h2>'+esc(hero.heading)+'</h2><p class="ha-col-argument-body">'+esc(hero.lede)+'</p><p class="ha-col-argument-aside">'+esc(hero.aside)+'</p></div>';
    var heroOffer = '<div class="ha-col-argument-copy"><h2>'+esc(hero.offerHeading)+'</h2><p class="ha-col-argument-body">'+esc(hero.offerBody)+'</p><a class="ha-col-btn ha-col-btn-teal" href="'+esc(conversationMailto(conversation))+'">'+ctaLabel(hero.ctaLabel)+'</a></div>';
    // Pending artwork and final descriptive alt text: set heroSquare and imageAlt.heroSquare together.
    var heroSection = '<section class="ha-col-argument ha-col-argument--hero"><div class="ha-col-tier-hero-intro">'+heroIntro+'</div><div class="ha-col-argument-inner ha-col-tier-hero-offer">'+heroOffer+squareMedia(content,'heroSquare',imageAlt.heroSquare || '')+'</div></section>';
    var whatIsCopy = paragraphsHtml(whatIs.paragraphs,'ha-col-argument-body');
    // Pending artwork and final descriptive alt text: set whatIsSquare and imageAlt.whatIsSquare together.
    var whatIsSection = '<section class="ha-col-argument"><div class="ha-col-argument-inner"><div class="ha-col-argument-copy"><h2>'+esc(whatIs.heading)+'</h2>'+whatIsCopy+'</div>'+squareMedia(content,'whatIsSquare',imageAlt.whatIsSquare || '')+'</div><div class="ha-col-tier-note"><p class="ha-col-argument-aside">'+esc(whatIs.aside)+'</p></div></section>';
    var roadmapCards = (roadmap.cards||[]).map(function(item){ return '<article class="ha-col-anthology-card"><span class="ha-col-roadmap-number">'+esc(item.number)+'</span><h3>'+esc(item.heading)+'</h3><p>'+esc(item.body)+'</p></article>'; }).join('');
    var roadmapSection = '<section class="ha-col-white-section"><div class="ha-col-section-head"><h2>'+esc(roadmap.heading)+'</h2><p>'+esc(roadmap.lede)+'</p></div><div class="ha-col-anthology-cards ha-col-roadmap">'+roadmapCards+'</div></section>';
    var reassuranceSection = '<section class="ha-col-argument ha-col-argument--hero ha-col-argument--text-only"><div class="ha-col-argument-inner"><div class="ha-col-argument-copy"><h2>'+esc(reassurance.heading)+'</h2>'+paragraphsHtml(reassurance.paragraphs,'ha-col-argument-body')+'<p class="ha-col-invitation-callout">'+esc(reassurance.standout)+'</p><a class="ha-col-btn ha-col-btn-teal" href="'+esc(conversationMailto(conversation))+'">'+ctaLabel(reassurance.ctaLabel)+'</a></div></div></section>';
    var firstCopy = paragraphsHtml(argument01.paragraphs,'ha-col-argument-body')+'<p class="ha-col-argument-aside">'+esc(argument01.aside)+'</p>';
    var secondCopy = paragraphsHtml(argument02.paragraphs,'ha-col-argument-body');
    var thirdCopy = paragraphsHtml(argument03.paragraphs,'ha-col-argument-body');
    var purposeCopy = paragraphsHtml(purpose.paragraphs,'ha-col-argument-body');
    // Pending artwork and final descriptive alt text: set argument04Square and imageAlt.argument04Square together.
    var purposeSection = '<section class="ha-col-argument ha-col-argument--image-right"><div class="ha-col-argument-inner"><div class="ha-col-argument-copy"><span class="ha-col-lane-num">'+esc(purpose.number)+'</span><h2>'+esc(purpose.heading)+'</h2>'+purposeCopy+'</div>'+squareMedia(content,'argument04Square',imageAlt.argument04Square || '')+'</div><div class="ha-col-purpose-question"><div><p>'+esc(purpose.questionLabel)+'</p><h3>'+esc(purpose.question)+'</h3><p class="ha-col-argument-aside">'+esc(purpose.aside)+'</p></div></div></section>';
    var anthologyCopy = '<p class="ha-col-argument-body">'+safeHtml(anthology.lede)+'</p><p class="ha-col-argument-aside">'+esc(anthology.aside)+'</p><h3>'+esc(anthology.rulesLabel)+'</h3><p class="ha-col-argument-body">'+safeHtml(anthology.rules)+'</p>'+paragraphsHtml(anthology.paragraphs,'ha-col-argument-body')+'<p class="ha-col-invitation-callout">'+esc(anthology.standout)+'</p>';
    return heroSection+
      pullQuote(topHalf.pullQuoteOffer || {})+
      whatIsSection+
      roadmapSection+
      reassuranceSection+
      '<section class="ha-col-seam ha-col-seam--teal" aria-label="Additional detail"><p>'+esc(topHalf.seam)+'</p></section>'+
      argumentSection(argument01,'ha-col-argument--image-right ha-col-white-section',firstCopy,pictureMedia(content,'argument04Portrait','argument04Landscape',imageAlt.argument04Portrait || '',imageAlt.argument04Landscape || '','ha-col-argument-media--portrait'))+
      pullQuote(topHalf.pullQuoteSearch || {})+
      argumentSection(argument02,'ha-col-argument--image-right',secondCopy,pictureMedia(content,'argument01Portrait','argument01Landscape',imageAlt.argument01Portrait || '',imageAlt.argument01Landscape || '','ha-col-argument-media--portrait'))+
      argumentSection(argument03,'ha-col-argument--image-left',thirdCopy,squareMedia(content,'argument03Square',imageAlt.argument03Square || ''))+
      pullQuote(topHalf.pullQuotePerformance || {})+
      purposeSection+
      argumentSection(anthology,'ha-col-argument--text-only ha-col-white-section',anthologyCopy,'');
  }
  function html(){
    var C=window.HA_COLLABORATE_CONTENT || {};
    var topHalf=C.topHalf || {};
    var steps=C.steps || {};
    var commission=C.commission || {};
    var honestyCards=C.honestyCards || [];
    var foundingYear=C.foundingYear || {};
    var artistSpace=C.artistSpace || {};
    var conversation=C.conversation || {};
    var collective=C.collective || {};
    var footer=C.footer || {};
    return ''+
        '<div id="ha-collaborate-v1">'+
        '<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+image(C,'logo')+'" alt=""><h1 class="ha-v3-sr-only">For Artists — The Hope Anthology</h1></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-col-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-col-mobile-menu" class="ha-v3-links">'+navLinks(C.navigation)+'</div></nav>'+
        '<main class="ha-col-main">'+
          topHalfSections(C,topHalf,conversation)+
          '<section class="ha-col-white-section" aria-label="How it works heading">'+sectionHead(steps.eyebrow,steps.heading,steps.intro)+'</section>'+
          '<section class="ha-col-lanes" aria-label="How it works steps">'+(steps.cards||[]).map(lane).join('')+'</section>'+
          commissionSection(commission)+
          '<section class="ha-col-white-section" aria-label="Artist information"><div class="ha-col-current-grid">'+honestyCards.map(function(item){ return card(item); }).join('')+card(foundingYear,'ha-col-featured-card')+card(artistSpace,'ha-col-featured-card')+'</div></section>'+
          '<section class="ha-col-conversation"><div class="ha-col-conversation-copy"><p>'+esc(conversation.statement)+'</p><p>'+esc(conversation.closer)+'</p></div>'+conversationCta(conversation)+'</section>'+
          '<section class="ha-col-collective"><div><p class="ha-col-eyebrow">'+esc(collective.kicker)+'</p><h2>'+esc(collective.heading)+'</h2><p>'+esc(collective.body)+'</p></div>'+newsletterForm(collective)+'</section>'+ 
        '</main>'+ 
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt="The Hope Anthology botanical star"><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'<a href="/for-organisations">For Organisations</a>'+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div><a href="/contact">Contact</a><a href="https://www.instagram.com/hopeanthology/" target="_blank" rel="noopener" aria-label="Instagram (opens in a new tab)">Instagram</a><a href="/privacy">Privacy policy</a><a href="/accessibility">Accessibility</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div></footer>'+
      '</div>';
  }
  function isCollaborate(){ var p=location.pathname.replace(/\/$/,''); return p==='/for-artists'; }
  function bindMobileNav(root){
    var toggle = root.querySelector('.ha-v3-menu-toggle');
    var menu = root.querySelector('#ha-col-mobile-menu');
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
  function bindForms(root){
    var form = root.querySelector('.ha-col-conversation-form');
    if(!form || form.getAttribute('data-bound') === 'true') return;
    form.setAttribute('data-bound','true');
    form.addEventListener('submit',function(event){
      if(form.getAttribute('data-provider') !== 'squarespace-native-form-pending') return;
      event.preventDefault();
      var notice = form.querySelector('.ha-col-form-notice');
      if(!notice){
        notice = document.createElement('p');
        notice.className = 'ha-col-form-notice';
        form.appendChild(notice);
      }
      notice.textContent = 'Thank you — the native Squarespace form connection is ready to be attached here.';
      notice.setAttribute('role','status');
    });
  }
  function bindResponsivePictureAlts(root){
    if(!root || root.getAttribute('data-responsive-alt-bound') === 'true') return;
    root.setAttribute('data-responsive-alt-bound','true');
    function sync(){
      Array.prototype.forEach.call(root.querySelectorAll('picture[data-ha-portrait-alt]'),function(picture){
        var source = picture.querySelector('source[media]');
        var img = picture.querySelector('img');
        if(!source || !img) return;
        var useLandscape = window.matchMedia(source.getAttribute('media') || 'all').matches;
        img.alt = useLandscape ? (picture.getAttribute('data-ha-landscape-alt') || '') : (picture.getAttribute('data-ha-portrait-alt') || '');
      });
    }
    sync();
    window.addEventListener('resize',sync);
  }
  function suppressSquarespaceFallback(root){
    if(!root || root.getAttribute('data-fallback-suppressed') === 'true') return;
    root.setAttribute('data-fallback-suppressed','true');
    Array.prototype.forEach.call(document.body.children,function(node){
      if(node === root) return;
      if(/^(SCRIPT|STYLE|LINK|NOSCRIPT)$/i.test(node.tagName)) return;
      node.setAttribute('data-ha-collaborate-hidden','true');
      node.style.setProperty('display','none','important');
      node.style.setProperty('visibility','hidden','important');
    });
  }
  function mount(){
    if(!isCollaborate()) return;
    var existingRoot = document.getElementById('ha-collaborate-v1');
    if(existingRoot){
      document.body.classList.add('ha-collaborate-v1-active');
      suppressSquarespaceFallback(existingRoot);
      bindMobileNav(existingRoot);
      bindResponsivePictureAlts(existingRoot);
      return;
    }
    var anchor=document.querySelector('#sections')||document.querySelector('main')||document.body.firstElementChild;
    if(!anchor){ setTimeout(mount,150); return; }
    document.body.classList.add('ha-collaborate-v1-active');
    var wrap=document.createElement('div');
    wrap.innerHTML=html();
    var root = wrap.firstChild;
    document.body.insertBefore(root, document.body.firstChild);
    suppressSquarespaceFallback(root);
    bindMobileNav(root);
    bindResponsivePictureAlts(root);
  }

  loadCss();
  loadContent(function(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
    setTimeout(mount,600);
  });
})();
