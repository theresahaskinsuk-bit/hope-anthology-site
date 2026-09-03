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
  function conversationCta(conversation){
    var email = conversation.emailAddress || 'theresa@thehopeanthology.art';
    var subject = encodeURIComponent(conversation.emailSubject || 'Collaboration enquiry');
    var body = encodeURIComponent(conversation.emailBody || 'Hello The Hope Anthology,\n\nI would like to talk about a possible collaboration.\n\n');
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
  function html(){
    var C=window.HA_COLLABORATE_CONTENT || {};
    var page=C.page || {};
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
          '<header class="ha-col-header"><p class="ha-col-eyebrow">'+esc(page.eyebrow)+'</p><h2>'+safeHtml(page.headline)+'</h2><p>'+esc(page.intro)+'</p></header>'+ 
          '<section class="ha-col-white-section" aria-label="How it works heading">'+sectionHead(steps.eyebrow,steps.heading,steps.intro)+'</section>'+
          '<section class="ha-col-lanes" aria-label="How it works steps">'+(steps.cards||[]).map(lane).join('')+'</section>'+
          commissionSection(commission)+
          '<section class="ha-col-white-section" aria-label="Artist information"><div class="ha-col-current-grid">'+honestyCards.map(function(item){ return card(item); }).join('')+card(foundingYear,'ha-col-featured-card')+card(artistSpace,'ha-col-featured-card')+'</div></section>'+
          '<section class="ha-col-conversation"><div class="ha-col-conversation-copy"><p>'+esc(conversation.statement)+'</p><p>'+esc(conversation.closer)+'</p></div>'+conversationCta(conversation)+'</section>'+
          '<section class="ha-col-collective"><div><p class="ha-col-eyebrow">'+esc(collective.kicker)+'</p><h2>'+esc(collective.heading)+'</h2><p>'+esc(collective.body)+'</p></div>'+newsletterForm(collective)+'</section>'+ 
        '</main>'+ 
        '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+image(C,'star')+'" alt="The Hope Anthology botanical star"><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Navigate</div><a href="/">Home</a>'+navLinks(C.navigation)+'<a href="/for-organisations">For Organisations</a>'+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect &amp; legal</div><a href="'+esc(footer.privacyUrl)+'">Privacy policy</a><a href="'+esc(footer.accessibilityUrl)+'">Accessibility</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footer.copyright)+'</span></div></footer>'+
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
  }

  loadCss();
  loadContent(function(){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
    setTimeout(mount,600);
  });
})();
