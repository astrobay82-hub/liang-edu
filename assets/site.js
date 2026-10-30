(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var KEY='liang_saved_v2';
  function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
  function saved(){return store(KEY)||[]}
  function toast(msg){var t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1800)}
  function copy(text,msg){
    function ok(){toast(msg||'已複製')}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(ok,fallback)}else fallback();
    function fallback(){var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){toast('無法複製，請長按選取')}document.body.removeChild(ta)}
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  /* ---- bookmark button ---- */
  $$('[data-save]').forEach(function(b){
    var id=b.getAttribute('data-save');
    function paint(){var on=saved().indexOf(id)>-1;b.classList.toggle('on',on);b.querySelector('span').textContent=on?'已收藏':'收藏';b.setAttribute('aria-pressed',on)}
    paint();
    b.addEventListener('click',function(){var s=saved(),i=s.indexOf(id);if(i>-1){s.splice(i,1);toast('已取消收藏')}else{s.unshift(id);toast('已加入收藏，可在首頁「我的收藏」找到')}store(KEY,s);paint()});
  });
  /* ---- share ---- */
  $$('[data-share]').forEach(function(b){
    b.addEventListener('click',function(){
      var url=b.getAttribute('data-share')||location.href,title=document.title;
      if(navigator.share){navigator.share({title:title,url:url}).catch(function(){})}else copy(title+'\n'+url,'已複製文章網址');
    });
  });
  $$('[data-print]').forEach(function(b){b.addEventListener('click',function(){window.print()})});
  $$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var el=document.getElementById(b.getAttribute('data-copy'));copy(el.value||el.textContent,b.getAttribute('data-msg'))})});

  /* ---- article: visit note ---- */
  var cl=$('#visit-note');
  if(cl){
    var out=$('#visit-out'),title=cl.getAttribute('data-title');
    function upd(){
      var items=$$('input[type=checkbox]:checked',cl).map(function(i){return i.value});
      var free=$('textarea',cl).value.trim();
      out.value='【看診前觀察小抄｜'+title+'】\n'+(items.length?items.map(function(x){return '・'+x}).join('\n'):'・（尚未勾選）')+(free?'\n・補充：'+free:'')+'\n・想請教醫師：目前的居家照護方向是否合適？接下來要留意哪些變化？';
    }
    cl.addEventListener('input',upd);upd();
  }

  /* ---- article: toc highlight ---- */
  var toc=$('.toc');
  if(toc&&'IntersectionObserver' in window){
    var links=$$('a',toc),map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove('on')});var a=map[e.target.id];if(a){a.classList.add('on');a.scrollIntoView({block:'nearest',inline:'center'})}}})},{rootMargin:'-120px 0px -65% 0px'});
    Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)});
  }

  /* ---- home: topics, search, saved ---- */
  var idxEl=$('#topic-index');
  if(idxEl){
    var D=JSON.parse(idxEl.textContent),themes=D.themes,topics=D.topics,byId={};
    topics.forEach(function(t){byId[t.id]=t});
    var list=$('#alist'),head=$('#listhead-title'),cnt=$('#listhead-count'),q=$('#q'),cur=(location.hash.match(/^#(S0\d)$/)||[])[1]||store('liang_sys')||'S01';
    function row(t,hl){
      var th=themes.filter(function(x){return x.id===t.id.slice(0,3)})[0];
      function h(s){s=esc(s);return hl?s.replace(hl,function(m){return '<mark>'+m+'</mark>'}):s}
      return '<li><a class="arow" href="/a/'+t.id+'"><div class="t">'+h(t.title)+'</div><div class="s">'+h(t.subtitle)+'</div><div class="m"><span class="chip gray">'+esc(th.name)+'</span><span class="chip gray">'+esc(t.age)+'</span></div></a></li>';
    }
    function showSys(id){
      cur=id;store('liang_sys',id);
      $$('.sys').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-sys')===id);b.setAttribute('aria-pressed',b.getAttribute('data-sys')===id)});
      var th=themes.filter(function(x){return x.id===id})[0],arr=topics.filter(function(t){return t.id.slice(0,3)===id});
      head.textContent=th.name;cnt.textContent=arr.length+' 篇';
      list.innerHTML=arr.map(function(t){return row(t)}).join('');
    }
    function search(v){
      v=v.trim();
      if(!v){showSys(cur);return}
      var words=v.split(/\s+/).filter(Boolean),re=new RegExp(words.map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|'),'g');
      var res=topics.filter(function(t){var s=t.title+' '+t.subtitle+' '+t.tag+' '+t.kw;return words.every(function(w){return s.indexOf(w)>-1})});
      res.sort(function(a,b){return (b.title.indexOf(words[0])>-1)-(a.title.indexOf(words[0])>-1)});
      $$('.sys').forEach(function(b){b.classList.remove('on')});
      head.textContent='搜尋「'+v+'」';cnt.textContent=res.length+' 篇';
      list.innerHTML=res.length?res.map(function(t){return row(t,re)}).join(''):'<li class="empty">找不到相符的文章，試試「咳嗽」「便秘」「長高」等關鍵字。</li>';
    }
    $$('.sys').forEach(function(b){b.addEventListener('click',function(){q.value='';showSys(b.getAttribute('data-sys'));history.replaceState(null,'','#'+cur);$('#listhead').scrollIntoView({behavior:'smooth'})})});
    var tm;q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){search(q.value)},120)});
    $$('.quick button').forEach(function(b){b.addEventListener('click',function(){q.value=b.textContent;search(q.value);$('#listhead').scrollIntoView({behavior:'smooth'})})});
    var p=new URLSearchParams(location.search).get('q');
    if(p){q.value=p;search(p)}else showSys(cur);
    if(location.hash==='#search'){setTimeout(function(){q.focus()},60)}
    window.addEventListener('hashchange',function(){if(location.hash==='#search')q.focus();var m=location.hash.match(/^#(S0\d)$/);if(m)showSys(m[1])});
    // saved
    var sv=saved().filter(function(id){return byId[id]}),box=$('#saved');
    if(sv.length){box.hidden=false;$('#saved-list').innerHTML=sv.map(function(id){return row(byId[id])}).join('')}
  }

  /* ---- notes filter ---- */
  var pills=$('#note-pills');
  if(pills){
    pills.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var c=b.getAttribute('data-cat');$$('button',pills).forEach(function(x){x.classList.toggle('on',x===b)});$$('.nt').forEach(function(n){n.hidden=!(c==='ALL'||n.getAttribute('data-cat')===c)})});
  }
})();
