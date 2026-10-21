

  const YM_ID = 0;
  window.__goals = [];
  function goal(name, place){
    window.__goals.push(place ? name + ':' + place : name);
    if(YM_ID && typeof ym === 'function') ym(YM_ID, 'reachGoal', name, place ? {place: place} : undefined);
  }

  const goalOnce = (function(){ const seen = new Set();
    return function(name){ if(seen.has(name)) return; seen.add(name); goal(name); }; })();

  document.addEventListener('click', function(e){
    const el = e.target.closest('[data-goal]');
    if(el) goal(el.dataset.goal, el.dataset.place);
  });

  document.getElementById('calc')?.addEventListener('change', function(){ goalOnce('calc_use'); });

  (function(){
    if(!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const copy = async text => {
      try { await navigator.clipboard.writeText(text); return true; }
      catch(e){
        const t=document.createElement('textarea');
        t.value=text; t.setAttribute('readonly',''); t.style.cssText='position:fixed;opacity:0';
        document.body.appendChild(t); t.select();
        let ok=false; try{ ok=document.execCommand('copy'); }catch(_){}
        t.remove(); return ok;
      }
    };
    for(const a of document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]')){
      if(a.dataset.copy) continue;
      a.dataset.copy='';
      a.addEventListener('click', async e => {
        e.preventDefault();
        const value = decodeURIComponent(a.getAttribute('href').replace(/^(tel|mailto):/,''));
        if(await copy(value)){
          a.classList.add('is-copied');
          clearTimeout(a._ct);
          a._ct = setTimeout(()=>a.classList.remove('is-copied'), 1500);
        } else location.href = a.getAttribute('href');
      });
    }
  })();

  const CONTACTS = {
    tg:  'https://t.me/MDMprint_bot',
    max: 'https://max.ru/u/f9LHodD0cOI9Tc-bhH8PtupT-lmXfFhPewx04OC-N5XYug9PIubEzTbzfIk'
  };
  (function(){
    for(const a of document.querySelectorAll('[data-msg]')){
      const url = CONTACTS[a.dataset.msg];
      if(!url) continue;
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
    }
  })();

  const LEGAL = {
    offer:   'https://mdmprint.ru/publichnaya-oferta',

    privacy: 'https://mdmprint.ru/soglasie-na-obrabotku-personalnyh-dannyh',
    terms:   'https://mdmprint.ru/terms',
    consent: '',

    cookie:  'https://mdmprint.ru/polozhenie-ob-obrabotke-fajlov-cookies'
  };
  (function(){
    for(const a of document.querySelectorAll('[data-legal]')){
      const url = LEGAL[a.dataset.legal];
      if(url){ a.href = url; a.removeAttribute('data-pending'); }
      else {

        a.removeAttribute('href'); a.removeAttribute('target'); a.removeAttribute('rel');
        a.setAttribute('data-pending','');
        a.title = 'Документ ещё не предоставлен заказчиком';
      }
    }
  })();

  (function(){
    const hero  = document.querySelector('.hero');
    const stage = document.querySelector('.hero__stage');
    if(!hero || !stage) return;
    const rm   = matchMedia('(prefers-reduced-motion:reduce)');
    const mob  = matchMedia('(max-width:860px)');
    if(rm.matches) return;

    const SHADOW = {from:{sx:1,sy:1,op:.5}, to:{sx:1.9,sy:.78,op:.22}};
    const OBJS = {
      main:{t:[0,.9],  d:16,
        from:{x:0,  y:8,   r:-4, s:1,   blur:0,   o:[-12,52,104]},
        to:  {x:6,  y:-6,  r:0,  s:1.06,blur:0,   o:[10,14,94]}},
      a:{t:[.06,1],    d:22,
        from:{x:-64,y:-36, r:-12,s:.82, blur:.2, o:[22,64,106]},
        to:  {x:-98,y:-62, r:-20,s:.76, blur:0,   o:[46,30,104]}},
      b:{t:[.12,1],    d:24,
        from:{x:60, y:-42, r:13, s:.8,  blur:.25,o:[-30,44,106]},
        to:  {x:82, y:-62, r:20, s:.74, blur:0,   o:[-54,26,104]}},
      c:{t:[.18,1],    d:24,
        from:{x:88, y:66,  r:8,  s:.78, blur:.3, o:[14,70,106]},
        to:  {x:96, y:80,  r:14, s:.72, blur:0,   o:[34,34,104]}}
    };

    if(mob.matches){ OBJS.c.from.y = 34; OBJS.c.to.y = 42; }

    const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
    const mix = (a,b,t) => a+(b-a)*t;
    const seg = (p,a,b) => clamp((p-a)/(b-a),0,1);
    const easeOut = t => 1-Math.pow(1-t,3);

    const easeInOut = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;

    const overshoot = t => t<.72 ? 0 : Math.sin((t-.72)/.28*Math.PI);

    const shadow = stage.querySelector('.hero__sh');
    const items = Object.entries(OBJS).map(([key,c])=>{
      const el = stage.querySelector('[data-obj="'+key+'"]');

      return {el, mv:el.querySelector('model-viewer'), c, lbl:el.querySelector('span'),
              over: key==='main' ? 0 : .08};
    });

    let mx=0,my=0,tmx=0,tmy=0;
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){
      addEventListener('pointermove', e => {
        tmx = (e.clientX/innerWidth -.5)*2;
        tmy = (e.clientY/innerHeight-.5)*2;
      }, {passive:true});
    }

    let enter = 0;
    addEventListener('load', () => setTimeout(() => {
      const t0 = performance.now();
      (function step(now){
        enter = clamp((now-t0)/900,0,1);
        if(enter<1) requestAnimationFrame(step);
      })(performance.now());
    }, 120));

    function paint(){
      mx += (tmx-mx)*.08; my += (tmy-my)*.08;
      const e = easeOut(enter);
      const r = hero.getBoundingClientRect();

      if(r.bottom > -200 && r.top < innerHeight+200){

        const travel = mob.matches ? r.height*.55 : (r.height-innerHeight);
        const p = clamp(-r.top/travel,0,1);
        hero.classList.toggle('hero--rolled', p > .12);

        for(const {el,mv,c,lbl,over} of items){
          const raw = seg(p, c.t[0], c.t[1]);
          const t = easeInOut(raw);
          const k = 1 + over*overshoot(raw);
          const f=c.from, o=c.to;
          const x = mix(f.x,o.x,t*k);
          const y = mix(f.y,o.y,t*k) + (1-e)*26;
          const s = mix(f.s,o.s,t) * mix(.86,1,e);
          el.style.transform =
            'translate('+(-50+x)+'%, '+(-50+y)+'%) rotate('+mix(f.r,o.r,t*k)+'deg) scale('+s+')';
          el.style.opacity = e;
          const bl = mix(f.blur,o.blur,t);
          el.style.filter = bl>.05 ? 'blur('+bl.toFixed(2)+'px) brightness('+mix(.93,1,t)+')' : '';

          const phBase = mix(f.o[1],o.o[1],t);
          const th = mix(f.o[0],o.o[0],t) + mx*c.d;
          const ph = clamp(phBase + my*c.d*.2, phBase-4, phBase+4);
          mv.setAttribute('camera-orbit',
            th.toFixed(1)+'deg '+ph.toFixed(1)+'deg '+mix(f.o[2],o.o[2],t).toFixed(1)+'%');
          if(lbl) lbl.style.opacity = e;
        }
        const sp = easeInOut(p);
        shadow.style.transform = 'translate(-50%,-50%) scale('+
          mix(SHADOW.from.sx,SHADOW.to.sx,sp)+','+mix(SHADOW.from.sy,SHADOW.to.sy,sp)+')';
        shadow.style.opacity = mix(SHADOW.from.op,SHADOW.to.op,sp)*e;
      }
      requestAnimationFrame(paint);
    }
    paint();
  })();

  (function(){
    const bar=document.getElementById('cookieBar'), ok=document.getElementById('cookieOk');
    if(!bar||!ok) return;
    let seen=false;
    try{ seen = localStorage.getItem('mdm-cookie-ok')==='1'; }catch(e){}
    if(seen) return;
    setTimeout(()=>bar.removeAttribute('hidden'), 1200);
    ok.addEventListener('click',()=>{
      bar.setAttribute('hidden','');
      try{ localStorage.setItem('mdm-cookie-ok','1'); }catch(e){}
    });
  })();

  function sheetInert(sheet, on){
    for(const el of document.body.children){
      if(el === sheet || el.tagName === 'SCRIPT') continue;
      if(on) el.setAttribute('inert',''); else el.removeAttribute('inert');
    }
  }

  (function(){
    const sh=document.getElementById('orderSheet');
    if(!sh) return;
    const $s=id=>document.getElementById(id);
    const spec=$s('ordSpec'), total=$s('ordTotal'), per=$s('ordPer'), promo=$s('ordPromo');
    const title=$s('orderTitle');
    const src=sh.querySelector('[name="source"]');
    const row=(k,v)=>`<div><dt>${k}</dt><dd>${v}</dd></div>`;
    let back=null;
    function fill(){
      const L=window.__calcLast||{};

      total.textContent = L.sumText ? 'от '+L.sumText : '—';
      per.textContent   = L.perLong||'';
      promo.textContent = L.promo||'';
      promo.hidden = !L.promo;
      spec.innerHTML = row('Тип', L.kind||'—')
        + row(L.packs?'Паков':'Тираж', (L.q||'—')+(L.packs?'':' шт'))
        + row(L.packs?'Формат':'Размер', (L.size||'—')+(L.packs?'':' мм'))
        + row('Плёнка', L.mat||'—') + row('Смола', L.resin||'—') + row('Срок', L.term||'—')
        + (L.extras&&L.extras.length ? row('Допы', L.extras.join(', ')) : '');
    }

    function show(sample){
      sh.classList.toggle('sheet--sample', !!sample);

      const L=window.__calcLast||{};
      const set=(n,v)=>{ const el=sh.querySelector('[name="'+n+'"]'); if(el) el.value=v?'1':''; };
      set('design', !sample && (L.extras||[]).includes('дизайн контура'));
      set('single', !sample && (L.extras||[]).includes('поштучно'));
      set('box',    !sample && (L.extras||[]).includes('инд. упаковка'));
      title.textContent = sample ? 'Заказать образец' : 'Оформить заказ';
      if(sample) spec.innerHTML = row('Заказ','Пробный стикер') + row('Тираж','1 шт'); else fill();
      if(src) src.value = sample ? 'sample' : 'calc';
      goal(sample ? 'sample_open' : 'order_open');
      back=document.activeElement; sh.setAttribute('open','');
      sheetInert(sh, true);
      document.body.style.overflow='hidden'; sh.querySelector('.sheet__close').focus(); }
    function hide(){ sh.removeAttribute('open'); sheetInert(sh, false);
      document.body.style.overflow=''; if(back) back.focus(); }

    ['orderOpen','barOrder'].forEach(id=>{ const b=document.getElementById(id); if(b) b.addEventListener('click',()=>show(false)); });
    const smp=document.getElementById('heroSample');
    if(smp) smp.addEventListener('click',e=>{ e.preventDefault(); show(true); });
    sh.querySelector('.sheet__close').addEventListener('click',hide);
    sh.addEventListener('click',e=>{ if(e.target===sh) hide(); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&sh.hasAttribute('open')) hide(); });
  })();

  (function(){
    const lane=document.querySelector('.lane');
    const btns=[...document.querySelectorAll('.lane__btn')];
    if(!lane||!btns.length) return;
    const step=()=>{ const c=lane.querySelector('.fcard');
      return c ? c.getBoundingClientRect().width + 20 : lane.clientWidth*.8; };
    const sync=()=>{ const max=lane.scrollWidth-lane.clientWidth-1;
      btns.forEach(b=>{ const back=b.dataset.lane==='-1';
        b.disabled = back ? lane.scrollLeft<=1 : lane.scrollLeft>=max; }); };
    btns.forEach(b=>b.addEventListener('click',()=>
      lane.scrollBy({left:step()*(+b.dataset.lane),behavior:'smooth'})));
    lane.addEventListener('scroll',sync,{passive:true});
    addEventListener('resize',sync,{passive:true});
    sync();
  })();

  (function(){
    const digits = v => (v||'').replace(/\D/g,'');
    const norm = v => { let d=digits(v); if(d[0]==='8') d='7'+d.slice(1);
      if(d && d[0]!=='7') d='7'+d; return d.slice(0,11); };
    const fmt = v => { const d=norm(v); if(!d) return ''; let r='+7';
      if(d.length>1) r+=' ('+d.slice(1,4); if(d.length>=4) r+=')';
      if(d.length>=5) r+=' '+d.slice(4,7); if(d.length>=8) r+='-'+d.slice(7,9);
      if(d.length>=10) r+='-'+d.slice(9,11); return r; };
    const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());

    const ok = el => (!el.required && !el.value.trim()) ? true
                   : el.type==='tel'   ? norm(el.value).length===11
                   : el.type==='email' ? emailOk(el.value)
                   : el.value.trim().length>=2;

    let errUid = 0;
    const mark = (el,bad) => {
      const box = el.closest('.calc__f');
      if(!box) return;
      box.classList.toggle('calc__f--bad', !!bad);
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      const err = box.querySelector('.calc__err');
      if(!err) return;
      if(!err.id) err.id = 'err-' + (++errUid);
      if(bad) el.setAttribute('aria-describedby', err.id);
      else el.removeAttribute('aria-describedby');
    };

    document.querySelectorAll('#orderSheet form, #orderForm').forEach(form=>{
      const fields=[...form.querySelectorAll('.calc__f input')];
      const consent=form.querySelector('[name="agree"]');
      const phone=form.querySelector('input[type=tel]');
      if(phone) phone.addEventListener('input',()=>{ phone.value=fmt(phone.value); mark(phone,false); });
      fields.forEach(el=>{
        const soft=()=>mark(el, el.value.trim() ? !ok(el) : false);
        el.addEventListener('blur',soft);
        el.addEventListener('input',()=>{ if(ok(el)) mark(el,false); });
      });
      if(consent) consent.addEventListener('change',()=>
        consent.closest('.calc__ok')?.classList.toggle('calc__ok--bad', !consent.checked));
      form.addEventListener('submit',e=>{
        e.preventDefault();
        let first=null;
        fields.forEach(el=>{ const bad=!ok(el); mark(el,bad); if(bad&&!first) first=el; });
        const noConsent = consent && !consent.checked;
        if(consent) consent.closest('.calc__ok')?.classList.toggle('calc__ok--bad', noConsent);
        if(first || noConsent){ (first||consent).focus(); return; }

        goal('lead_' + (form.querySelector('[name="source"]')?.value || 'zayavka'));

        const done=document.createElement('p');
        done.className='calc__done';
        done.setAttribute('role','status');
        done.textContent='Проверено: форма заполнена верно. Это прототип — заявка никуда не уходит, отправку в Битрикс подключает разработчик.';
        form.querySelector('.calc__done')?.remove();
        (form.querySelector('.ord__foot') || form).appendChild(done);
      });
    });
  })();

  (function(){
    const items=[...document.querySelectorAll('.faq details')];
    if(items.length<2) return;
    items.forEach(d=>d.addEventListener('toggle',()=>{
      if(!d.open) return;
      items.forEach(o=>{ if(o!==d) o.open=false; });
    }));
  })();

  (function(){
    const box=document.querySelector('.hd__reach');
    if(!box) return;
    const btn=box.querySelector('.hd__reachbtn');
    const hoverable=matchMedia('(hover:hover) and (pointer:fine)').matches;
    let t=null;
    const open=on=>{ if(on) box.setAttribute('data-open',''); else box.removeAttribute('data-open');
      btn.setAttribute('aria-expanded', on?'true':'false'); };
    btn.addEventListener('click',()=>open(!box.hasAttribute('data-open')));
    if(hoverable){
      box.addEventListener('mouseenter',()=>{ clearTimeout(t); open(true); });
      box.addEventListener('mouseleave',()=>{ clearTimeout(t); t=setTimeout(()=>open(false),220); });
    }
    box.addEventListener('focusout',e=>{ if(!box.contains(e.relatedTarget)) open(false); });
    document.addEventListener('click',e=>{ if(!box.contains(e.target)) open(false); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&box.hasAttribute('data-open')){ open(false); btn.focus(); } });
  })();

  (function(){
    const bar=document.getElementById('calcBar'), calc=document.querySelector('.calc');
    if(!bar||!calc) return;
    const out=calc.querySelector('.calc__out');

    const rbar=document.getElementById('reachBar');
    const heroCta=document.querySelector('.hero__cta'), ft=document.querySelector('.ft');
    const calcH2=calc.querySelector('h2');
    const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
    let raf=0;
    function paint(){
      raf=0;
      const cr=calc.getBoundingClientRect();

      const inCalc = (calcH2 ? calcH2.getBoundingClientRect().top <= 0 : cr.top < innerHeight)
        && cr.bottom > 0;
      bar.classList.toggle('calcbar--live', inCalc);
      if(rbar){

        const passed = !heroCta || heroCta.getBoundingClientRect().bottom < 0;
        const atFoot = ft && ft.getBoundingClientRect().top < innerHeight - 8;
        rbar.classList.toggle('rbar--on', passed && !inCalc && !atFoot);
      }
      if(!inCalc){ document.body.classList.remove('has-calcbar'); return; }

      let t=0;
      if(out){
        const o=out.getBoundingClientRect();
        const start=innerHeight;
        const end=innerHeight-o.height-24;
        t=clamp((start-o.top)/Math.max(1,start-end),0,1);
      }
      const ease=t*t*(3-2*t);
      bar.style.transform='translateY('+(ease*115).toFixed(1)+'%) scale('+(1-ease*.06).toFixed(3)+')';
      bar.style.opacity=(1-ease).toFixed(3);
      if(out) out.style.opacity=(0.35+0.65*ease).toFixed(3);
      document.body.classList.toggle('has-calcbar', ease<.9);
    }
    const onScroll=()=>{ if(!raf) raf=requestAnimationFrame(paint); };
    addEventListener('scroll',onScroll,{passive:true});
    addEventListener('resize',onScroll,{passive:true});
    paint();
  })();

  (function(){
    const sh=document.getElementById('shipSheet'), open=document.getElementById('shipOpen');
    if(!sh||!open) return;
    let back=null;
    const show=()=>{ back=document.activeElement; sh.setAttribute('open','');
      sheetInert(sh, true);
      document.body.style.overflow='hidden'; sh.querySelector('.sheet__close').focus(); };
    const hide=()=>{ sh.removeAttribute('open'); sheetInert(sh, false);
      document.body.style.overflow=''; if(back) back.focus(); };
    open.addEventListener('click',show);

    document.getElementById('showShip')?.addEventListener('click',show);
    sh.querySelector('.sheet__close').addEventListener('click',hide);
    sh.addEventListener('click',e=>{ if(e.target===sh) hide(); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&sh.hasAttribute('open')) hide(); });
  })();

  (function(){
    const hd = document.querySelector('.hd');
    if(!hd) return;
    const links = [...hd.querySelectorAll('.hd__nav a')];
    const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const heroCta = document.querySelector('.hero__cta');
    let queued = false;

    const paint = () => {
      queued = false;
      const stuck = scrollY > 80;
      hd.classList.toggle('hd--stuck', stuck);

      hd.classList.toggle('hd--cta',
        !heroCta || heroCta.getBoundingClientRect().bottom < hd.getBoundingClientRect().bottom);

      const probe = hd.getBoundingClientRect().bottom;

      let cur = null;

      targets.forEach(s => { if(s.getBoundingClientRect().top <= probe + 16) cur = s; });
      links.forEach(a => {
        const on = cur && a.getAttribute('href') === '#' + cur.id;
        if(on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
      });
    };
    const onScroll = () => { if(!queued){ queued = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', onScroll, {passive:true});
    addEventListener('resize', onScroll, {passive:true});
    paint();
  })();

  (function(){
    const a = document.querySelector('.hd__phone[data-copy]');
    if(!a || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    let t = null;
    a.addEventListener('click', e => {
      if(!navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText(a.dataset.copy).then(() => {
        a.setAttribute('data-done','');
        clearTimeout(t); t = setTimeout(() => a.removeAttribute('data-done'), 1600);
      });
    });
  })();

  (function(){

    const BIZ={

      terms:[[10,'3 дня',3],[1000,'7 рабочих дней',7],[5000,'14 рабочих дней',14],
             [50000,'около месяца',null]],

      resinAt:100, resinLow:'эпоксидная', resinHigh:'полиуретановая',

      promo:{off:.3, till:'2026-08-31', label:'до 31 августа', minSt:1000, minPack:500},

    };

    const PRICE={
      qty:  [10,50,100,500,1000,5000,50000],
      size: [10,15,20,25,50],
      mat: [
        [ [400,402,402,400.7,400.7],
          [80,80.4,80.4,80.14,111.6],
          [40,40.2,40.2,40.07,71.1],
          [8,11.21,14.3,17.38,44.24],
          [5.6,7.15,10.4,13.54,39.95],
          [2.73,4.72,6.82,10.13,37.52],
          [2,3.96,6.04,9,33.23] ],
        [ [443,443.7,443.7,441.1,441.1],

          [88.74,88.74,88.74,88.22,133.38],
          [44.37,44.37,44.37,44.11,89],
          [8.87,13.44,17.96,22.2,66.78],
          [6.72,8.98,13.4,17.53,62.54],
          [3.54,6.38,10.55,14.59,59.67],
          [2.86,5.88,9.73,13.75,56.69] ],

        [ [560,560,560,609,609],
          [112,112,112,122,183.26],
          [56,56,56,61,121.81],
          [17.43,17.43,23.54,30.28,68.48],
          [11.8,14.77,17.71,23.68,60.23],
          [6.83,10.44,14.31,19.12,56.35],
          [5.81,9.21,12.98,17.15,50.5] ] ],

      packQty:[10,50,100,500,1000],
      pack: [ [405.5,564,714],[213,277,446],[171,227,403],[137,201,378],[134,193,370] ],

      cut:  {fix:300, per:8.25},
    };
    const F={

      kind: [['Стикеры',0,'Любой формы, листом или поштучно'],['Стикерпаки',1,'Лист выбранного формата']],

      mat:  [['Белый глянец',0,'Виден контур наклейки'],
             ['Голографическая',1,'Радужный перелив'],
             ['Светится в темноте',2,'Копит свет за день']],

      size: [['10×10',10],['15×15',15],['20×20',20],['25×25',25],['50×50',50],
             ['Свой','own','Свой размер']],

      pack: [['Листом',0,'Как есть, на подложке'],['Поштучно',1,'Порежем, цену назовёт менеджер'],
             ['По одному',2,'Каждый стикер в свой пакет']],
      sheet:[['А7',0],['А6',1],['А5',2]],

      qty:  [[10,10],[50,50],[100,100],[500,500],[1000,1000],[5000,5000],[50000,50000],
             ['Своё','own','Свой тираж']],
      qtyPack:[[10,10],[50,50],[100,100],[500,500],[1000,1000],['Своё','own','Свой тираж']],
    };
    const S={kind:0,mat:0,size:0,qty:2,pack:0};
    const $=id=>document.getElementById(id);
    const rub=n=>n.toLocaleString('ru-RU')+' \u20BD';

    function build(key,labels){
      const box=$(key); box.innerHTML='';
      labels.forEach((it,i)=>{
        const l=document.createElement('label'); l.className='opt';

        if(it[1]==='own') l.classList.add('opt--wide');
        const own = it[1]==='own';
        const desc = (!own && it[2]) ? `<em class="opt__desc">${it[2]}</em>` : '';
        const inner = own
          ? `<input class="opt__inp" id="${key}Own" `+
            `type="text" inputmode="numeric" maxlength="5" `+
            (key==='qty' ? `pattern="[0-9]{1,5}"` : `pattern="[0-9]{1,2}x[0-9]{1,2}"`)+
            ` placeholder="${it[2]||'Свой'}" aria-label="${it[2]||'Свой'}">`

          : `<b class="opt__txt">${typeof it[0]==='number'?it[0].toLocaleString('ru-RU'):it[0]}${desc}</b>`+
            (['kind','mat'].includes(key)
              ? `<img class="opt__ico" src="calc-icons/${key}-${i}.webp" alt="" `+
                `onerror="this.closest('span')?.classList.remove('has-ico');this.remove()">`
              : '');
        l.innerHTML=`<input type="radio" name="${key}" value="${i}"${i===S[key]?' checked':''}>`+
          `<span class="${own?'opt--own':(['kind','mat'].includes(key)?'has-ico':'')}${desc?' opt--card':''}">${inner}</span>`;
        if(own){
          const f=l.querySelector('.opt__inp');
          f.addEventListener('focus',()=>{ l.querySelector('input[type=radio]').checked=true; S[key]=i; calc(); });
          f.addEventListener('input',()=>{
            if(key==='size'){
              const d=f.value.replace(/\D/g,'').slice(0,4);
              f.value = d.length>2 ? d.slice(0,2)+'x'+d.slice(2) : d;
            } else f.value = f.value.replace(/\D/g,'').slice(0,5);
          });
          f.addEventListener('input',()=>{ l.querySelector('input[type=radio]').checked=true; S[key]=i; calc(); });
        }
        l.querySelector('input').addEventListener('change',()=>{S[key]=i;calc();});
        box.appendChild(l);
      });
    }

    function sumAt(rows,col,q,nodes){
      const sums=nodes.map((n,i)=>rows[i][col]*n);
      if(q<=nodes[0]) return sums[0];
      for(let i=1;i<nodes.length;i++) if(q<=nodes[i]){
        const t=(q-nodes[i-1])/(nodes[i]-nodes[i-1]);
        return sums[i-1]+(sums[i]-sums[i-1])*t;
      }
      return sums[sums.length-1];
    }

    function unitFor(mat,side,q){
      const rows=PRICE.mat[mat], N=PRICE.size, at=c=>sumAt(rows,c,q,PRICE.qty)/q;
      if(side<=N[0]) return at(0);
      for(let i=1;i<N.length;i++) if(side<=N[i]){
        const t=(side-N[i-1])/(N[i]-N[i-1]);
        return at(i-1)+(at(i)-at(i-1))*t;
      }
      return at(N.length-1);
    }

    function termFor(q){
      const T=BIZ.terms;
      for(let i=0;i<T.length;i++){
        if(q===T[i][0]) return T[i][1];
        if(q<T[i][0]) return i===0 ? T[0][1]
          : T[i][2]!=null ? T[i-1][2]+'–'+T[i][2]+' рабочих дней'
          : 'от '+T[i-1][2]+' рабочих дней';
      }
      return T[T.length-1][1];
    }
    function calc(){
      const packs=S.kind===1;
      const sizes=packs?F.sheet:F.size, qtys=packs?F.qtyPack:F.qty;
      $('qtyLeg').textContent  = packs?'Количество паков':'Количество, штук';
      $('sizeLeg').textContent = packs?'Формат листа':'Размер, мм';
      if($('size').dataset.mode!==(packs?'sheet':'size')){
        $('size').dataset.mode = packs?'sheet':'size'; if(S.size>=sizes.length) S.size=0; build('size',sizes);
      }

      if($('qty').dataset.mode!==(packs?'pack':'st')){
        $('qty').dataset.mode = packs?'pack':'st'; if(S.qty>=qtys.length) S.qty=qtys.length-1; build('qty',qtys);
      }
      const sizeOwn = !packs && sizes[S.size][1]==='own';
      const qtyOwn  = qtys[S.qty][1]==='own';

      const qMax = packs ? 1000 : 50000;
      const q = qtyOwn ? Math.min(qMax, Math.max(10, +($('qtyOwn')||{}).value||100)) : qtys[S.qty][0];

      let side=null;
      if(!packs && sizeOwn){
        const t=(($('sizeOwn')||{}).value||'').replace(',','.').split(/[x×х*]/i);

        const w=Math.min(99,parseFloat(t[0])||20), h=Math.min(99,parseFloat(t[1])||w);
        side=Math.sqrt(Math.max(100,w*h));
      } else if(!packs) side=sizes[S.size][1];

      let unit = packs
        ? sumAt(PRICE.pack, sizes[S.size][1], q, PRICE.packQty)/q
        : unitFor(F.mat[S.mat][1], side, q);

      const P=BIZ.promo, promoLive = new Date(P.till + 'T23:59:59') >= new Date(),
        onPromo = promoLive && q >= (packs?P.minPack:P.minSt);
      if(onPromo) unit *= (1 - P.off);
      const design=$('needDesign');

      const packOpts=$('pack').children;
      packOpts[1].hidden = packs;
      if(packs && S.pack===1){ S.pack=0; packOpts[0].querySelector('input').checked=true; }

      const sum=Math.round(unit*q);

      const unitTxt = unit<10 && Math.abs(unit-Math.round(unit))>.005
        ? unit.toFixed(2).replace('.',',')+' ₽' : rub(Math.round(unit));
      const per=unitTxt+(packs?' / пак':' / шт');
      const term = termFor(q);
      const resin = q<BIZ.resinAt ? BIZ.resinLow : BIZ.resinHigh;

      $('total').textContent = unitTxt;
      $('unit').textContent = packs?'за пак':'за штуку';

      $('sumOut').textContent = 'от '+rub(sum);
      $('term').textContent = term;
      $('resinOut').textContent = resin;
      $('promo').hidden = !onPromo;

      const heroPromo=document.querySelector('.hero__promo');
      if(heroPromo) heroPromo.hidden = !promoLive;
      const mark=$('calcMark');
      mark.textContent = packs && S.mat!==0
        ? 'Цена по белому глянцу. Пак на другой плёнке посчитает менеджер.' : '';
      mark.hidden = !mark.textContent;
      const extras=[design.checked?'дизайн контура':null,
        [null,'поштучно','инд. упаковка'][S.pack]].filter(Boolean);

      const L = {sum, unit:Math.round(unit), per, q:q.toLocaleString('ru-RU'), packs, term, resin, extras,
        perLong: unitTxt+' за '+(packs?'пак':'штуку'),
        kind:F.kind[S.kind][0], mat:F.mat[S.mat][0],
        size:(packs?F.sheet:F.size)[S.size][0],
        promo: onPromo ? ('−'+Math.round(P.off*100)+'% '+P.label) : null};
      L.sumText=rub(sum); window.__calcLast=L;
      const bp=$('barPrice'), bm=$('barMeta');
      if(bp){ bp.textContent='от '+per; bm.textContent='от '+rub(sum)+' · '+L.q+(packs?' паков':' шт')+' · '+term; }
    }
    build('kind',F.kind); build('mat',F.mat); build('size',F.size); build('qty',F.qty);
    build('pack',F.pack);
    $('needDesign').addEventListener('change',calc);

    const FILES={ max:5, mbEach:25, mbTotal:50,
      ext:['pdf','ai','eps','svg','png','jpg','jpeg','tif','tiff','cdr'] };
    const drop=$('dropZone'), file=$('artFile'), name=$('fileName'),
          list=$('fileList'), err=$('fileErr'), hint=$('dropHint');
    let picked=[];
    const mb=n=>n/1048576;
    const size=n=> n<1048576 ? Math.max(1,Math.round(n/1024))+' КБ' : (mb(n)).toFixed(1)+' МБ';
    const ext=n=>(n.split('.').pop()||'').toLowerCase();

    function sync(){
      const dt=new DataTransfer(); picked.forEach(f=>dt.items.add(f)); file.files=dt.files;
    }
    function render(){
      list.innerHTML = picked.map((f,i)=>
        '<li><b title="'+f.name.replace(/"/g,'&quot;')+'">'+f.name+'</b><span>'+size(f.size)+'</span>'+
        '<button type="button" data-i="'+i+'" aria-label="Убрать '+f.name.replace(/"/g,'&quot;')+'">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" '+
        'stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></li>').join('');
      list.hidden = !picked.length;
      drop.toggleAttribute('data-has', !!picked.length);
      const total = picked.reduce((a,f)=>a+f.size,0);
      name.textContent = picked.length
        ? 'Добавить ещё' + (picked.length>=FILES.max ? ' — достигнут предел' : '')
        : 'Перетащите макеты или выберите файлы';
      hint.textContent = picked.length
        ? picked.length+' из '+FILES.max+' · '+size(total)+' из '+FILES.mbTotal+' МБ'
        : 'PDF, AI, EPS, SVG, PNG, JPG, TIFF, CDR · до '+FILES.mbEach+' МБ файл';
      sync();
    }
    function fail(msgs){
      err.innerHTML = msgs.join('<br>');
      err.hidden = !msgs.length;
    }
    function add(incoming){
      const msgs=[];
      [...incoming].forEach(f=>{
        if(picked.length>=FILES.max){ msgs.push('Больше '+FILES.max+' файлов не нужно — остальное пришлём менеджеру'); return; }
        if(picked.some(p=>p.name===f.name && p.size===f.size)){ msgs.push('«'+f.name+'» уже добавлен'); return; }
        if(!FILES.ext.includes(ext(f.name))){ msgs.push('«'+f.name+'» — формат не поддерживается'); return; }
        if(mb(f.size)>FILES.mbEach){ msgs.push('«'+f.name+'» больше '+FILES.mbEach+' МБ'); return; }
        const total=picked.reduce((a,x)=>a+x.size,0)+f.size;
        if(mb(total)>FILES.mbTotal){ msgs.push('Суммарно больше '+FILES.mbTotal+' МБ — пришлите остальное менеджеру'); return; }
        picked.push(f);
      });
      fail(msgs); render();
      if(picked.length) goalOnce('art_attach');
    }
    file.addEventListener('change',e=>{ add(e.target.files); });
    list.addEventListener('click',e=>{
      const b=e.target.closest('button[data-i]'); if(!b) return;
      picked.splice(+b.dataset.i,1); fail([]); render();
    });
    ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{
      e.preventDefault(); drop.setAttribute('data-over',''); }));
    ['dragleave','dragend','drop'].forEach(t=>drop.addEventListener(t,()=>drop.removeAttribute('data-over')));
    drop.addEventListener('drop',e=>{ e.preventDefault();
      if(e.dataTransfer.files&&e.dataTransfer.files.length) add(e.dataTransfer.files); });
    render();
    calc();
  })();

  (function(){
    document.querySelectorAll('[data-media]').forEach(fig=>{
      const base=fig.dataset.media, vertical=/v\d$/.test(base);

      const put = el => {
        const ph = fig.querySelector('.adv__ph,.abt__ph,.cmp__ph');
        if(ph) fig.insertBefore(el, ph); else fig.appendChild(el);
      };
      if(vertical){
        const v=document.createElement('video');
        Object.assign(v,{muted:true,loop:true,playsInline:true,autoplay:true,preload:'metadata'});

        [['webm','video/webm'],['mp4','video/mp4']].forEach(([ext,type])=>{
          const s=document.createElement('source'); s.src=base+'.'+ext; s.type=type; v.appendChild(s);
        });

        const poster = base + '-poster.webp';
        const probe = new Image();
        probe.onload = () => { v.poster = poster; fig.querySelector('.adv__ph,.abt__ph,.cmp__ph')?.remove(); };
        probe.src = poster;
        v.addEventListener('loadeddata',()=>{ fig.querySelector('.adv__ph,.abt__ph,.cmp__ph')?.remove(); v.play().catch(()=>{}); });
        put(v);
      } else {
        const i=document.createElement('img');
        i.loading='lazy'; i.decoding='async'; i.alt='';
        i.addEventListener('load',()=> fig.querySelector('.adv__ph,.abt__ph,.cmp__ph')?.remove());
        i.addEventListener('error',()=> i.remove());
        i.src=base+'.webp';
        put(i);
      }
    });
  })();

  (function(){
    const box=document.querySelector('.b2b__logos');
    if(!box) return;
    const mob=matchMedia('(max-width:860px)');
    const you=box.querySelector('.b2b__logo--you');
    const logos=[...box.querySelectorAll('.b2b__logo:not(.b2b__logo--you)')];
    let lane=null;
    function sync(){
      if(mob.matches){
        if(lane) return;
        lane=document.createElement('div'); lane.className='b2b__lane';
        const row=document.createElement('div'); row.className='b2b__row is-lane';
        logos.forEach(el=>row.appendChild(el));
        logos.forEach(el=>{
          const c=el.cloneNode(true);
          c.setAttribute('aria-hidden','true');
          row.appendChild(c);
        });
        lane.appendChild(row);
        box.insertBefore(lane, you || null);
      } else {
        if(!lane) return;
        logos.forEach(el=>box.insertBefore(el, you || null));
        lane.remove(); lane=null;
      }
    }
    mob.addEventListener('change', sync);
    sync();
  })();

  (function(){
    document.querySelectorAll('.b2b__logo[data-logo]').forEach(box=>{
      const i=document.createElement('img');
      i.loading='lazy'; i.decoding='async';

      i.alt=box.dataset.name || '';

      i.addEventListener('load',()=>{
        [...box.childNodes].forEach(n=>{ if(n.nodeType===3) n.remove(); });
      });
      i.addEventListener('error',()=> i.remove());

      i.src=box.dataset.logo;
      box.appendChild(i);
    });
  })();

  (function(){
    document.querySelectorAll('.rev__slot[data-shot]').forEach(fig=>{
      const i=document.createElement('img');
      i.loading='lazy'; i.decoding='async'; i.alt='Отзыв клиента';
      i.addEventListener('load',()=> fig.querySelector('.rev__ph')?.remove());
      i.addEventListener('error',()=> i.remove());
      i.src=fig.dataset.shot+'.webp';
      fig.appendChild(i);
    });
  })();

  (function(){
    const cells=[...document.querySelectorAll('.work__cell[data-work]')];
    if(!cells.length) return;
    cells.forEach((btn, n)=>{
      const i=document.createElement('img');
      i.loading='lazy'; i.decoding='async'; i.alt='Пример работы';
      i.addEventListener('load',()=>{ btn.querySelector('.work__ph')?.remove(); btn.dataset.ready='1'; });
      i.addEventListener('error',()=> i.remove());
      i.src=btn.dataset.work+'.webp';
      btn.appendChild(i);

      btn.setAttribute('aria-label', 'Пример работы ' + (n + 1) + ' — открыть крупно');
      btn.addEventListener('click',()=>{
        if(!btn.dataset.ready) return;
        open(btn, i.currentSrc || i.src, btn.getAttribute('aria-label'));
      });
    });

    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="lb__x" type="button" aria-label="Закрыть">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M18 6 6 18M6 6l12 12"/></svg></button><img class="lb__img" alt="">';
    document.body.appendChild(lb);
    const shot = lb.querySelector('.lb__img'), x = lb.querySelector('.lb__x');
    let back = null;

    function open(btn, src, label){
      back = btn;
      shot.src = src; shot.alt = label.replace(' — открыть крупно', '');
      goal('work_open');
      lb.setAttribute('open', '');
      sheetInert(lb, true);
      document.body.style.overflow = 'hidden';
      x.focus();
    }
    function close(){
      lb.removeAttribute('open');
      sheetInert(lb, false);
      document.body.style.overflow = '';
      shot.removeAttribute('src');
      back?.focus();
    }
    x.addEventListener('click', close);
    lb.addEventListener('click', e => { if(e.target === lb) close(); });
    addEventListener('keydown', e => { if(e.key === 'Escape' && lb.hasAttribute('open')) close(); });
  })();
