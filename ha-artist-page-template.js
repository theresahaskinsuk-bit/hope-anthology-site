(function(){
  var boot=window.HA_ARTIST_PAGE_BOOT;
  if(!boot || document.getElementById('ha-artist-page-v2')) return;
  var world=boot.world, base=boot.base, version=boot.version;
  var path=location.pathname.replace(/\/+$/, '') || '/';
  var slug=(path.match(world==='keep' ? /^\/to-keep\/([^/]+)$/ : /^\/to-make\/([^/]+)$/)||[])[1];
  if(!slug) return;

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function loadCss(){if(document.getElementById('ha-artist-page-v2-css'))return;var link=document.createElement('link');link.id='ha-artist-page-v2-css';link.rel='stylesheet';link.href=base+'styles.css?v='+encodeURIComponent(version);document.head.appendChild(link);}
  function loadScript(id,src,done){if(document.getElementById(id)){if(done)done();return;}var s=document.createElement('script');s.id=id;s.src=src;s.onload=done;s.onerror=function(){console.warn('Hope Anthology artist data could not be loaded.');if(done)done();};document.head.appendChild(s);}
  function loadData(done){if(world==='keep'){if(window.HA_KEEP_COLLECTIONS_CONTENT)return done();loadScript('ha-keep-collections-content',base+'content.keep-collections.js?v='+encodeURIComponent(version),done);}else{window.HA_TO_MAKE_MAKERS=window.HA_TO_MAKE_MAKERS||{};if(window.HA_TO_MAKE_MAKERS[slug])return done();loadScript('ha-to-make-maker-content-'+slug,base+'content.to-make.'+encodeURIComponent(slug)+'.js?v='+encodeURIComponent(version),done);}}
  function profileData(){if(world==='keep')return (window.HA_KEEP_COLLECTIONS_CONTENT||{}).collections&&(window.HA_KEEP_COLLECTIONS_CONTENT||{}).collections[slug];var payload=(window.HA_TO_MAKE_MAKERS||{})[slug]||{};return payload.maker||null;}
  function hash(value){var h=2166136261;for(var i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function scatter(key,index){var h=hash(key+'-'+index);return {r:((h%9)-4)+'deg',x:((h>>>4)%7-3)+'%',y:((h>>>8)%6-2)+'%'};}
  function sizeFor(layout,index,typed){if(typed)return typed;var patterns={Even:['50'],Pairs:['50','40','40','50'],Mixed:['50','40','50','50','40','50'],Stacks:['50','40','40','40','40','50'],Trios:['33'],Default:['33','33','33','50','40']};var selected=patterns[layout]||patterns.Default;return selected[index%selected.length];}

  function artButton(piece){
    var imgs=piece.images||[],first=imgs[0]||{},layers='';
    if(imgs.length<=1)return '<div class="ha-ap-art is-single"><img class="ha-ap-art-front'+(first.photo?' is-photo':'')+'" src="'+esc(first.url||'')+'" alt="'+esc(first.alt||piece.title||'')+'"></div>';
    for(var i=imgs.length-1;i>=1;i--){var s=scatter(piece.slug||piece.title,i);layers+='<img class="ha-ap-pile-layer'+(imgs[i].photo?' is-photo':'')+'" data-ha-layer="'+i+'" src="'+esc(imgs[i].url)+'" alt="" style="--pile-r:'+s.r+';--pile-x:'+s.x+';--pile-y:'+s.y+'">';}
    return '<button type="button" class="ha-ap-art has-pile" data-ha-piece="'+esc(piece.slug||piece.title||'piece')+'" data-ha-images="'+esc(JSON.stringify(imgs))+'" data-ha-index="0" aria-label="Show next image. Showing image 1 of '+imgs.length+'">'+layers+'<img class="ha-ap-art-front'+(first.photo?' is-photo':'')+'" src="'+esc(first.url||'')+'" alt="'+esc(first.alt||piece.title||'')+'"></button>';
  }
  function card(piece,artist,small){
    var chips=(piece.chips||[]).slice(0,small?3:5).map(function(item){return '<span>'+esc(item)+'</span>';}).join('');
    var count=(piece.images||[]).length,status=piece.status==='paused'?'<span class="ha-ap-status">Working on more</span>':'',meaning=piece.meaning?'<p class="ha-ap-meaning">'+esc(piece.meaning)+'</p>':'',chipHtml=chips?'<div class="ha-ap-chips">'+chips+'</div>':'',href=piece.listingUrl||piece.etsyUrl||'#';
    return '<article class="ha-ap-card'+(small?' is-small':'')+'">'+artButton(piece)+'<p class="ha-ap-count"'+(count>1?' aria-live="polite"':' aria-hidden="true"')+'>'+(count>1?'1 / '+count:'')+'</p><div class="ha-ap-medium-row"><span>'+esc(piece.medium||'')+'</span>'+status+'</div><h3>'+esc(piece.title)+'</h3>'+meaning+chipHtml+'<a class="ha-ap-shop" href="'+esc(href)+'" target="_blank" rel="noopener" aria-label="See '+esc(piece.title)+' in '+esc(artist.name)+'&#39;s shop">See it in the artist\'s shop <span aria-hidden="true">→</span></a></article>';
  }
  function wrapItem(piece,width,artist){return {width:width,html:card(piece,artist,false),piece:piece};}
  function stackItem(top,bottom,artist){return {width:'40',html:'<div class="ha-ap-stack">'+card(top,artist,false)+card(bottom,artist,false)+'</div>',piece:top};}
  function genericRows(items,layout,artist){
    var rows=[],row=[],sum=0;
    function width(piece,index){var size=sizeFor(layout,index,piece.size||'');return size==='40 under'?'40':size;}
    function flush(){if(row.length){rows.push({items:row.splice(0),reverse:false});sum=0;}}
    for(var i=0;i<items.length;i++){
      var piece=items[i],size=width(piece,i),numeric=Number(size)||50;
      if((piece.size||'')==='40 under'&&row.length&&row[row.length-1].width==='40'){var previous=row.pop();row.push(stackItem(previous.piece,piece,artist));continue;}
      if(sum+numeric>100)flush();
      row.push(wrapItem(piece,size,artist));sum+=numeric;
    }
    flush();return rows;
  }
  function stackRows(items,artist){
    if(items.some(function(piece){return piece.size;}))return genericRows(items,'Stacks',artist);
    var rows=[];
    for(var i=0;i<items.length;i+=3){
      var trio=items.slice(i,i+3),reverse=(Math.floor(i/3)%2===1),parts=[];
      if(trio.length===3)parts=[wrapItem(trio[0],'50',artist),stackItem(trio[1],trio[2],artist)];
      else if(trio.length===2)parts=[wrapItem(trio[0],'50',artist),wrapItem(trio[1],'40',artist)];
      else if(trio.length===1)parts=[wrapItem(trio[0],'50',artist)];
      if(reverse)parts.reverse();
      rows.push({items:parts,reverse:reverse});
    }
    return rows;
  }
  /* Default layout (15 Oct 2026): 33/33/33 then 50/40, repeating. No card is ever left alone on the last row:
     a lone leftover turns a final 50/40 into a trio, or a final trio into two 50/40 rows. One print = one 50. */
  function defaultRows(items,artist){
    if(items.some(function(piece){return piece.size;}))return genericRows(items,'Default',artist);
    if(items.length===1)return [{items:[wrapItem(items[0],'50',artist)],reverse:false}];
    var counts=[],want=3,left=items.length,k;
    while(left>0){k=Math.min(want,left);counts.push(k);left-=k;want=want===3?2:3;}
    if(counts[counts.length-1]===1){counts.pop();if(counts[counts.length-1]===2)counts[counts.length-1]=3;else{counts[counts.length-1]=2;counts.push(2);}}
    var rows=[],i=0;
    counts.forEach(function(n){var slice=items.slice(i,i+n);i+=n;rows.push({items:slice.map(function(piece,j){return wrapItem(piece,n===3?'33':(j===0?'50':'40'),artist);}),reverse:false});});
    return rows;
  }
  function gallery(group,artist){
    var pieces=group.products||[],layout=group.effectiveLayout||artist.profile&&artist.profile.galleryLayout||'Default',rows=layout==='Stacks'?stackRows(pieces,artist):(layout==='Default'||!{Even:1,Pairs:1,Mixed:1,Trios:1,Custom:1}[layout])?defaultRows(pieces,artist):genericRows(pieces,layout,artist);
    return '<div class="ha-ap-gallery ha-ap-layout-'+esc(layout.toLowerCase().replace(/\s+/g,'-'))+'">'+rows.map(function(row){return '<div class="ha-ap-gallery-row'+(row.reverse?' is-reversed':'')+'">'+row.items.map(function(item){return '<div class="ha-ap-gallery-item is-'+item.width+'">'+item.html+'</div>';}).join('')+'</div>';}).join('')+'</div>';
  }
  function nav(items){var here=path;return (items||[]).map(function(item){return '<a href="'+esc(item.url)+'"'+(item.url===here?' aria-current="page"':'')+'>'+esc(item.label)+'</a>';}).join('');}
  function footer(content){var footerData=content.footer||{};return '<footer class="ha-v3-footer"><div class="ha-v3-footer-top"><img class="ha-v3-footer-star" src="'+esc((content.images||{}).star||'')+'" alt=""><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Explore</div><a href="/">Home</a>'+nav(content.navigation)+'</div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Collaborate</div><a href="/for-artists">For Artists</a><a href="/for-organisations">For Organisations</a></div><div class="ha-v3-footer-col"><div class="ha-v3-footer-title">Connect</div><a href="/contact">Contact</a><a href="/collective">Collective</a><a href="'+esc(footerData.instagramUrl||'https://www.instagram.com/thehopeanthology')+'" target="_blank" rel="noopener">Instagram</a><a href="'+esc(footerData.privacyUrl||'/privacy-policy')+'">Privacy policy</a><a href="'+esc(footerData.accessibilityUrl||'/accessibility')+'">Accessibility</a></div></div><div class="ha-v3-footer-bottom"><span>'+esc(footerData.copyright||'© The Hope Anthology')+'</span></div></footer>';}
  function setShareImage(piece){var first=(piece&&piece.images||[])[0];if(!first||!first.url)return;[['property','og:image',first.url],['property','og:image:alt',first.alt||''],['name','twitter:image',first.url]].forEach(function(spec){var meta=document.head.querySelector('meta['+spec[0]+'="'+spec[1]+'"]');if(!meta){meta=document.createElement('meta');meta.setAttribute(spec[0],spec[1]);document.head.appendChild(meta);}meta.setAttribute('content',spec[2]);});}
  function imageHtml(item){return '<img src="'+esc(item.url)+'" alt="'+esc(item.alt||'')+'">';}

  function render(){
    var artist=profileData();if(!artist)return;
    var content=world==='keep'?(window.HA_KEEP_COLLECTIONS_CONTENT||{}):((window.HA_TO_MAKE_MAKERS||{})[slug]||{}),profile=artist.profile||{},groups=artist.groups||[],named=groups.filter(function(group){return group.name;}),first=groups.reduce(function(found,group){return found||(group.products||[])[0];},null);
    setShareImage(first);
    var title=artist.artistName||artist.name||'',discipline=artist.artistTitle||profile.discipline||'',image=profile.artistImage,eyebrow=world==='keep'?'TO KEEP · ANTHOLOGY ARTIST':'TO MAKE · ANTHOLOGY MAKER',statName=world==='keep'?'Prints':'Patterns',stats=profile.stats||artist.stats||{};
    var links=named.length>=2?'<nav class="ha-ap-group-links" aria-label="'+(world==='keep'?'Collections':'Projects')+'"><strong>'+(world==='keep'?'Collections:':'Projects:')+'</strong> '+named.map(function(group){return '<a href="#ha-ap-group-'+esc(group.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'))+'">'+esc(group.name)+'</a>';}).join(' <span>·</span> ')+'</nav>':'';
    var groupsHtml=groups.map(function(group){var id='ha-ap-group-'+group.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),show=named.length>=2||!!group.name;return '<section class="ha-ap-group"'+(group.name?' id="'+esc(id)+'"':'')+'>'+(show?'<header><h2>'+esc(group.name)+'</h2>'+(group.oneLine?'<p>'+esc(group.oneLine)+'</p>':'')+'</header>':'')+gallery(group,artist)+'</section>';}).join('');
    var root=document.createElement('div');root.id='ha-artist-page-v2';
    root.innerHTML='<nav class="ha-v3-nav" aria-label="Hope Anthology navigation"><a class="ha-v3-brand" href="/" aria-label="The Hope Anthology home"><img class="ha-v3-logo" src="'+esc((content.images||{}).logo||'')+'" alt="The Hope Anthology"></a><button class="ha-v3-menu-toggle" type="button" aria-label="Open menu" aria-controls="ha-ap-menu" aria-expanded="false"><span></span><span></span><span></span></button><div id="ha-ap-menu" class="ha-v3-links">'+nav(content.navigation)+'</div></nav><main><div class="ha-ap-crumb"><a href="'+(world==='keep'?'/to-keep':'/to-make')+'">'+(world==='keep'?'To Keep':'To Make')+'</a><span> / </span><span>'+esc(title)+'</span></div><header class="ha-ap-header'+(!image?' no-image':'')+'"><div class="ha-ap-heading"><div><p class="ha-ap-eyebrow">'+esc(eyebrow)+'</p><h1>'+esc(title)+'</h1><em>'+esc(discipline)+'</em></div><p class="ha-ap-bio">'+esc(profile.bio||artist.bio||'')+'</p><div class="ha-ap-stats"><span>'+esc(stats.collections||0)+' collections</span><span>'+esc(stats.prints||stats.patterns||0)+' '+statName.toLowerCase()+'</span></div></div>'+(image?'<div class="ha-ap-artist-image">'+imageHtml(image)+'</div>':'')+'</header><section class="ha-ap-content">'+links+groupsHtml+'</section></main>'+footer(content);
    document.body.insertBefore(root,document.body.firstChild);document.body.classList.add('ha-artist-page-v2-active');bind(root);
  }
  function bind(root){
    var menu=root.querySelector('.ha-v3-menu-toggle');if(menu)menu.addEventListener('click',function(){var open=root.classList.toggle('ha-ap-menu-open');menu.setAttribute('aria-expanded',open?'true':'false');});
    Array.prototype.forEach.call(root.querySelectorAll('.ha-ap-art.has-pile'),function(button){
      var startX=null,swiped=false;
      function show(index){var images=JSON.parse(button.getAttribute('data-ha-images')||'[]'),front=button.querySelector('.ha-ap-art-front'),layers=button.querySelectorAll('.ha-ap-pile-layer'),next=images[index];if(!images.length)return;button.setAttribute('data-ha-index',index);front.src=next.url;front.alt=next.alt||'';front.classList.toggle('is-photo',!!next.photo);Array.prototype.forEach.call(layers,function(layer,rank){var sourceIndex=(index+layers.length-rank)%images.length,source=images[sourceIndex],scatterValue=scatter(button.getAttribute('data-ha-piece')||'',sourceIndex);layer.src=source.url;layer.classList.toggle('is-photo',!!source.photo);layer.style.setProperty('--pile-r',scatterValue.r);layer.style.setProperty('--pile-x',scatterValue.x);layer.style.setProperty('--pile-y',scatterValue.y);});button.setAttribute('aria-label','Show next image. Showing image '+(index+1)+' of '+images.length);var count=button.parentNode.querySelector('.ha-ap-count');if(count)count.textContent=(index+1)+' / '+images.length;}
      function advance(){var images=JSON.parse(button.getAttribute('data-ha-images')||'[]');if(images.length)show((Number(button.getAttribute('data-ha-index'))+1)%images.length);}
      show(0);
      button.addEventListener('click',function(event){if(swiped){event.preventDefault();event.stopPropagation();swiped=false;return;}advance();});
      button.addEventListener('pointerdown',function(event){startX=event.clientX;swiped=false;});
      button.addEventListener('pointerup',function(event){if(startX!==null&&Math.abs(event.clientX-startX)>35){advance();swiped=true;}startX=null;});
      button.addEventListener('pointercancel',function(){startX=null;});
    });
  }
  loadCss();loadData(render);
})();
