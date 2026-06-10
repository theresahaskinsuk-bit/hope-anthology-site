(function(){
  'use strict';
  const CONTENT_URL = 'content.story.js';
  const STYLE_URL = 'styles.css';
  const allowedPaths = ['/story','/the-story'];

  function currentScript(){ return document.currentScript || Array.from(document.scripts).find(s => /ha-story\.js/.test(s.src || '')); }
  function baseUrl(){ const s=currentScript(); return s && s.src ? new URL('.', s.src).href : './'; }
  function normalPath(){ return window.location.pathname.replace(/\/$/, '') || '/'; }
  function hasExplicitStoryRoot(){
    return !!document.querySelector('#ha-story-root[data-ha-page="story"], #ha-story-root[data-ha-story-root="true"]');
  }
  function isStoryRoute(){
    const path = normalPath();
    return allowedPaths.includes(path) || /local-preview-story/i.test(path);
  }
  function shouldMount(){
    const path = normalPath();
    const makePaths = ['/make','/to-make','/collections/to-make','/collections/stained-glass-patterns'];
    if (makePaths.includes(path)) return false;
    if (document.getElementById('ha-make-template-v1')) return false;
    if (document.getElementById('ha-home-v3') || document.body.classList.contains('ha-home-v3-active')) return false;
    return isStoryRoute() || hasExplicitStoryRoot();
  }
  function loadScript(src){ return new Promise((resolve,reject)=>{ if(window.HA_STORY_CONTENT) return resolve(); const el=document.createElement('script'); el.src=src; el.onload=resolve; el.onerror=reject; document.head.appendChild(el); }); }
  function loadCss(href){ if(document.getElementById('ha-stability-v12-css') || [...document.styleSheets].some(ss => ss.href && ss.href.includes('styles.css'))) return; const el=document.createElement('link'); el.rel='stylesheet'; el.href=href; document.head.appendChild(el); }
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function asset(path){ if(!path) return ''; return /^https?:|^data:|^\//.test(path) ? path : baseUrl()+path; }
  function safeStoryHtml(value){
    return String(value ?? '').replace(/<(?!\/?(?:p|em|strong|br)\b)[^>]*>/gi, '');
  }
  function bodyHtml(s){
    if (s.bodyHtml) return safeStoryHtml(s.bodyHtml);
    if (Array.isArray(s.body)) return s.body.map(p => `<p>${esc(p)}</p>`).join('');
    return `<p>${esc(s.body)}</p>`;
  }
  function hideSquarespaceShell(){
    const style=document.createElement('style');
    style.textContent = `body.ha-story-mounted > :not(#ha-story-root):not(script):not(style):not(link):not(template){display:none!important;}
      body.ha-story-mounted #ha-story-root{display:block!important;}
      body.ha-story-mounted #sections,
      body.ha-story-mounted #footer-sections,
      body.ha-story-mounted main,
      body.ha-story-mounted [role="main"],
      body.ha-story-mounted .Main,
      body.ha-story-mounted .main-content,
      body.ha-story-mounted .Header,
      body.ha-story-mounted header.Header,
      body.ha-story-mounted #header,
      body.ha-story-mounted .page-title,
      body.ha-story-mounted .entry-title,
      body.ha-story-mounted .collection-title{display:none!important;}
      body.ha-story-mounted .sqs-block-html:has(#ha-story-root){margin:0!important;padding:0!important;}`;
    document.head.appendChild(style);
  }
  function navLinks(items){
    const current = normalPath();
    return (items || []).map(item => {
      const href = item.href || item.url || '#';
      const active = item.active || ((href.replace(/\/$/,'') || '/') === current);
      return `<a href="${esc(href)}"${active ? ' aria-current="page"' : ''}>${esc(item.label)}</a>`;
    }).join('');
  }
  function suppressFallbackSiblings(root){
    Array.from(document.body.children).forEach(child => {
      const tag = child.tagName;
      if(child === root || ['SCRIPT','STYLE','LINK','TEMPLATE'].includes(tag)) return;
      child.setAttribute('data-ha-story-hidden-fallback','true');
      child.style.setProperty('display','none','important');
    });
  }
  function sectionHtml(s){
    const dark=s.theme === 'dark';
    const more = `<div id="${esc(s.id)}-more" class="ha-story-more ${dark?'ha-story-more-dark':'ha-story-more-light'} ${s.open?'show':''}"><blockquote>${esc(s.quote)}</blockquote><div class="ha-story-more-prose">${bodyHtml(s)}</div></div>`;
    const text = `<div class="ha-story-panel-text"><div class="ha-story-num ${dark?'ha-story-num-light':''}">${esc(s.number)}</div><p class="ha-story-eyebrow ${dark?'gold':'twine'}">${esc(s.eyebrow)}</p><h2 class="ha-story-section-title">${s.titleHtml}</h2><p class="ha-story-intro">${esc(s.intro)}</p><button class="ha-story-toggle" type="button" aria-expanded="${s.open?'true':'false'}" aria-controls="${esc(s.id)}-more"><span>${s.open?'Close':'Read more'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>${more}</div>`;
    const image = `<div class="ha-story-panel-image"><img src="${asset(s.image)}" alt="${esc(s.alt)}" loading="lazy"></div>`;
    const top = s.imageSide === 'right' ? text + image : image + text;
    return `<div id="${esc(s.id)}" class="ha-story-anchor"></div><section class="ha-story-section ${dark?'ha-story-dark':'ha-story-light'} ${s.imageSide==='right'?'image-right':'image-left'}">${top}</section>`;
  }
  function render(c){
    document.title = c.meta?.title || document.title;
    const root = document.getElementById('ha-story-root') || document.createElement('div');
    root.id = 'ha-story-root';
    root.className = 'ha-story-root';
    const nav = navLinks(c.nav);
    const tabs = (c.tabs||[]).map((t,i)=>`<a class="ha-story-tab ${i===0?'active':''}" href="#${esc(t.target)}" data-target="${esc(t.target)}">${esc(t.label)}</a>`).join('');
    const sections = (c.sections||[]).map(sectionHtml).join('');
    const footerCols = (c.footer?.columns||[]).map(col=>`<div class="ha-v3-footer-col"><div class="ha-v3-footer-title">${esc(col.title)}</div>${(col.links||[]).map(l=>`<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>`).join('');
    root.innerHTML = `<div id="ha-story-v1" class="ha-story-page"><nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="${asset(c.assets.logo)}" alt=""><span class="ha-v3-sr-only">The Hope Anthology</span></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-story-mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-story-mobile-menu" class="ha-v3-links">${nav}</div></nav><header class="ha-story-hero"><div class="ha-story-hero-image"><img src="${asset(c.hero.image)}" alt="${esc(c.hero.alt)}"></div><div class="ha-story-hero-text"><p class="ha-story-hero-eyebrow">${esc(c.hero.eyebrow)}</p><h1>${c.hero.titleHtml}</h1><p class="ha-story-hero-subtitle">${esc(c.hero.subtitle)}</p><p class="ha-story-hero-whisper">${esc(c.hero.whisper)}</p><p class="ha-story-scroll">${esc(c.hero.scrollCue)}</p></div></header><nav class="ha-story-section-nav" aria-label="Story sections">${tabs}</nav>${sections}<section id="${esc(c.finalSection.id)}" class="ha-story-final"><div><p class="ha-story-eyebrow gold">${esc(c.finalSection.eyebrow)}</p><h2>${c.finalSection.titleHtml}</h2><p>${esc(c.finalSection.body)}</p></div><aside><blockquote>${esc(c.finalSection.quote)}</blockquote><p>${esc(c.finalSection.signature)}</p></aside></section><section class="ha-story-collective"><div><p class="ha-story-collective-eyebrow">${esc(c.collective.eyebrow)}</p><h2>${esc(c.collective.title)}</h2><p>${esc(c.collective.body)}</p></div><form class="ha-story-email" onsubmit="event.preventDefault(); this.querySelector('.ha-story-note').textContent='Thank you — mailing list connection can be added when ready.';"><input type="email" placeholder="Email address" aria-label="Email address"><button type="submit">${esc(c.collective.button)}</button><p class="ha-story-note">${esc(c.collective.note)}</p></form></section><footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="${asset(c.assets.footerStar)}" alt="The Hope Anthology botanical star">${footerCols}</div><div class="ha-v3-footer-bottom"><span>${esc(c.footer.copyright)}</span></div></footer></div>`;
    if(root.parentNode !== document.body) document.body.prepend(root);
    else if(document.body.firstElementChild !== root) document.body.prepend(root);
    document.body.classList.add('ha-story-mounted');
    suppressFallbackSiblings(root);
    wireInteractions(root);
    bindMobileNav(root);
  }
  function bindMobileNav(root){
    const shell = root.querySelector('#ha-story-v1');
    const toggle = root.querySelector('.ha-v3-menu-toggle');
    const menu = root.querySelector('#ha-story-mobile-menu');
    if(!shell || !toggle || !menu || toggle.getAttribute('data-bound') === 'true') return;
    toggle.setAttribute('data-bound','true');
    toggle.addEventListener('click',()=>{
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      shell.classList.toggle('ha-v3-menu-open', !open);
    });
    menu.addEventListener('click',event=>{
      if(event.target && event.target.tagName === 'A'){
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label','Open menu');
        shell.classList.remove('ha-v3-menu-open');
      }
    });
  }
  function wireInteractions(root){
    root.querySelectorAll('.ha-story-toggle').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id=btn.getAttribute('aria-controls'); const panel=root.querySelector('#'+CSS.escape(id)); const open=btn.getAttribute('aria-expanded')==='true';
        btn.setAttribute('aria-expanded', String(!open)); btn.querySelector('span').textContent = open ? 'Read more' : 'Close'; panel?.classList.toggle('show', !open);
      });
    });
    const tabs=[...root.querySelectorAll('.ha-story-tab')];
    tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('active')); tab.classList.add('active');}));
  }
  async function init(){
    if(!shouldMount()) return;
    hideSquarespaceShell();
    loadCss(baseUrl()+STYLE_URL);
    await loadScript(baseUrl()+CONTENT_URL);
    render(window.HA_STORY_CONTENT);
  }
  init().catch(err=>console.error('Hope Anthology Story failed to load', err));
})();
