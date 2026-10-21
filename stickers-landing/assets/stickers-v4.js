  const goal=(g,place)=>{if(window.STICKERS_METRIKA_ID&&typeof window.ym==='function')window.ym(window.STICKERS_METRIKA_ID,'reachGoal',g,place?{place}:undefined)};
  const goalOnce=g=>{try{if(sessionStorage.getItem('stickers-goal-'+g)==='1')return;sessionStorage.setItem('stickers-goal-'+g,'1')}catch(_){}goal(g)};
  document.addEventListener('click',e=>{const el=e.target.closest('[data-goal]');if(el)goal(el.dataset.goal,el.dataset.place)});

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));

  const sheet=document.querySelector('.clients .sheet'), cuts=
    [...sheet.querySelectorAll('.cut')], logosEl=sheet.querySelector('.logos');
  cuts.forEach((c,i)=>c.style.setProperty('--i',i));
  io.observe(logosEl);

  const glare=(fx)=>cuts.map(c=>fx(c.getBoundingClientRect())).forEach(([x,y],i)=>{const c=cuts[i];
    c.style.setProperty('--gx',x*100+'%');c.style.setProperty('--gy',y*100+'%');c.style.setProperty('--sx',(1-x)*100+'%')});
  const cl=v=>Math.max(-.3,Math.min(1.3,v));
  let pt=null;
  sheet.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const go=!pt;pt=e;
    if(go)requestAnimationFrame(()=>{glare(r=>[cl((pt.clientX-r.left)/r.width),cl((pt.clientY-r.top)/r.height)]);pt=null})});
  sheet.addEventListener('pointerleave',()=>cuts.forEach(c=>['--gx','--gy','--sx'].forEach(k=>c.style.removeProperty(k))));
  if(!matchMedia('(hover:hover)').matches)
    (()=>{let vis=false,o=null;
      new IntersectionObserver(([e])=>vis=e.isIntersecting).observe(sheet);
      addEventListener('deviceorientation',e=>{if(!vis||e.gamma==null)return;const go=!o;o=e;
        if(go)requestAnimationFrame(()=>{const x=cl(.5+o.gamma/50),y=cl(.2+(o.beta-40)/80);glare(()=>[x,y]);o=null})})})();

  (()=>{
    const hero=document.querySelector('.hero'),sheet=hero.querySelector('.hsheet'),cv=document.getElementById('film'),ctx=cv.getContext('2d');
    const h1=sheet.querySelector('h1'),sts=[...sheet.querySelectorAll('.hst')];
    let W,H,M,dpr,F,T,G,R0=32;
    const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

    const dilate=(img,w,h,r,col)=>{const c=mk(Math.ceil((w+2*r)*dpr),Math.ceil((h+2*r)*dpr)),x=c.getContext('2d');x.scale(dpr,dpr);
      for(const k of [0,.34,.67,1])for(let i=0;i<(k?24:1);i++){const t=i/24*Math.PI*2;x.drawImage(img,r+Math.cos(t)*r*k,r+Math.sin(t)*r*k,w,h)}
      x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,w+2*r,h+2*r);return c};

    const textBand=(tg,r,col,line)=>{const cs=getComputedStyle(tg),tw=tg.offsetWidth,th=tg.offsetHeight,E=Math.ceil(r)+3,q=Math.min(3,devicePixelRatio||1);
      const c=mk(Math.ceil((tw+2*E)*q),Math.ceil((th+2*E)*q)),x=c.getContext('2d');x.scale(q,q);
      x.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;x.letterSpacing=cs.letterSpacing;x.textBaseline='alphabetic';
      const m=x.measureText('Н'),asc=m.fontBoundingBoxAscent,desc=m.fontBoundingBoxDescent,y=E+(th-(asc+desc))/2+asc,t=tg.textContent.toUpperCase();
      x.lineJoin='round';
      if(line){x.lineWidth=2*(r+.8);x.strokeStyle=line;x.strokeText(t,E,y)}
      x.lineWidth=2*r;x.strokeStyle=x.fillStyle=col;x.strokeText(t,E,y);x.fillText(t,E,y);return [c,E,tw,th]};
    const rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
    function build(){

      const tf=sheet.style.transform,tr=sheet.style.transition;sheet.style.transition='none';sheet.style.transform='none';
      try{measure()}finally{sheet.style.transform=tf;sheet.style.transition=tr}
      draw();
    }
    function measure(){
      dpr=Math.min(2,devicePixelRatio||1);W=sheet.offsetWidth;H=sheet.offsetHeight;M=Math.round(Math.max(W,H)*.4);
      R0=parseFloat(getComputedStyle(sheet).borderTopLeftRadius)||32;
      Object.assign(cv.style,{left:-M+'px',top:-M+'px',width:W+2*M+'px',height:H+2*M+'px'});
      cv.width=(W+2*M)*dpr;cv.height=(H+2*M)*dpr;
      F=mk(W*dpr,H*dpr);T=mk(W*dpr,H*dpr);G=mk(cv.width,cv.height);
      const f=F.getContext('2d');f.scale(dpr,dpr);
      const g=f.createLinearGradient(0,0,W,H);
      [[0,'#fff'],[.3,'#f3f3f2'],[.44,'#fff'],[.62,'#fafaf9'],[.86,'#efefee'],[1,'#fff']].forEach(([o,c])=>g.addColorStop(o,c));
      f.beginPath();f.moveTo(8,H);f.arc(0,H,8,0,-Math.PI/2,true);f.lineTo(0,R0);f.arcTo(0,0,R0,0,R0);f.arcTo(W,0,W,R0,R0);f.lineTo(W,H-8);f.arc(W,H,8,-Math.PI/2,Math.PI,true);f.closePath();f.fillStyle=g;f.fill();
      f.globalCompositeOperation='destination-out';
      const sr=sheet.getBoundingClientRect();
      sts.forEach(st=>{if(!st.offsetWidth)return;const img=st.querySelector('img'),b=st.getBoundingClientRect();
        const cx=b.left+b.width/2-sr.left,cy=b.top+b.height/2-sr.top,w=st.offsetWidth,h=img.offsetHeight;
        const a=parseFloat(getComputedStyle(st).getPropertyValue('--r'))*Math.PI/180||0;

        const P=7,Q=8.2,band=dilate(img,w,h,P,'#fbfbfa'),line=dilate(img,w,h,Q,'rgba(20,18,18,.16)');
        const cut=st.querySelector('.hst__cut');cut.replaceChildren(band);
        f.save();f.translate(cx,cy);f.rotate(a);
        f.globalCompositeOperation='source-over';f.drawImage(line,-w/2-Q,-h/2-Q,w+2*Q,h+2*Q);
        f.globalCompositeOperation='destination-out';f.drawImage(dilate(img,w,h,P,'#000'),-w/2-P,-h/2-P,w+2*P,h+2*P);
        f.restore();

        const tg=st.querySelector('.hst__tag');if(!tg||!tg.offsetWidth)return;
        const [tbc,E,tw,th]=textBand(tg,3.5,'#fbfbfa','#5e5a55');
        Object.assign(tbc.style,{left:-E+'px',top:-E+'px',width:tw+2*E+'px',height:th+2*E+'px'});tg.querySelector('canvas')?.remove();tg.prepend(tbc);
        const tb=tg.getBoundingClientRect(),tx=tb.left+tb.width/2-sr.left,ty=tb.top+tb.height/2-sr.top;
        f.save();f.translate(tx,ty);f.rotate(a);
        const [thc,E3]=textBand(tg,4,'#000');
        f.globalCompositeOperation='destination-out';f.drawImage(thc,-tw/2-E3,-th/2-E3,tw+2*E3,th+2*E3);
        f.restore()});
      f.globalCompositeOperation='source-over';

      const cs=getComputedStyle(h1);f.fillStyle='#141212';f.textBaseline='alphabetic';
      f.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;f.letterSpacing=cs.letterSpacing;
      const asc=f.measureText('Н').fontBoundingBoxAscent,tn=h1.firstChild,txt=tn.textContent,rg=document.createRange();
      txt.replace(/\S+/g,(w,i)=>{rg.setStart(tn,i);rg.setEnd(tn,i+w.length);const r=rg.getBoundingClientRect();
        f.fillText(w.toUpperCase(),r.left-sr.left,r.top-sr.top+asc);return w});
    }
    let P=0;
    function draw(){
      if(!F)return;
      const p=P,c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
      if(p>=1)return;
      c.setTransform(dpr,0,0,dpr,M*dpr,M*dpr);
      const nx=-Math.SQRT1_2*1.15,ny=Math.SQRT1_2*.85,nl=Math.hypot(nx,ny),n=[nx/nl,ny/nl];
      const C=[W,0],L=W*Math.abs(n[0])+H*Math.abs(n[1]),f=Math.min(W,H)*.1+p*L*1.25;
      const k=n[0]*C[0]+n[1]*C[1]+f;
      const half=(cc,side)=>{const t=[-n[1],n[0]],B=1e4,o=side*B;cc.beginPath();
        const px=n[0]*k,py=n[1]*k;cc.moveTo(px+t[0]*B,py+t[1]*B);cc.lineTo(px-t[0]*B,py-t[1]*B);
        cc.lineTo(px-t[0]*B+n[0]*o,py-t[1]*B+n[1]*o);cc.lineTo(px+t[0]*B+n[0]*o,py+t[1]*B+n[1]*o);cc.closePath()};

      c.save();half(c,1);c.clip();c.drawImage(F,0,0,W,H);c.restore();
      if(f<=0)return;

      const t=T.getContext('2d');t.setTransform(1,0,0,1,0,0);t.globalCompositeOperation='source-over';t.clearRect(0,0,T.width,T.height);
      t.drawImage(F,0,0);t.globalCompositeOperation='source-in';t.setTransform(dpr,0,0,dpr,0,0);
      const gx=n[0]*k,gy=n[1]*k,bg=t.createLinearGradient(gx,gy,gx-n[0]*Math.min(f,260),gy-n[1]*Math.min(f,260));
      bg.addColorStop(0,'#bdb9b2');bg.addColorStop(.18,'#e2dfda');bg.addColorStop(1,'#f1efeb');t.fillStyle=bg;t.fillRect(0,0,W,H);

      const g=G.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,G.width,G.height);
      g.setTransform(dpr,0,0,dpr,M*dpr,M*dpr);
      const a=1-2*n[0]*n[0],b=-2*n[0]*n[1],d=1-2*n[1]*n[1];g.transform(a,b,b,d,2*k*n[0],2*k*n[1]);
      g.save();half(g,-1);g.clip();g.drawImage(T,0,0,W,H);g.restore();
      c.setTransform(1,0,0,1,0,0);c.save();c.filter=`drop-shadow(${-n[0]*6*dpr}px ${-n[1]*6*dpr+8*dpr}px ${14*dpr}px rgba(20,18,18,.28))`;
      c.drawImage(G,0,0);c.restore();
    }

    let tp=null,flipping=false;
    sheet.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||flipping)return;const go=!tp;
      tp=e;if(go)requestAnimationFrame(()=>{
      const r=sheet.getBoundingClientRect(),nx=Math.max(-.5,Math.min(.5,(tp.clientX-r.left)/r.width-.5)),ny=Math.max(-.5,Math.min(.5,(tp.clientY-r.top)/r.height-.5));
      sheet.classList.add('is-tilt');
      Object.entries({'--ty':nx*10+'deg','--tx':-ny*8+'deg','--gx':32+nx*70+'%','--gy':8+ny*60+'%','--sx':50-nx*90+'%'}).forEach(([k,v])=>sheet.style.setProperty(k,v));tp=null})});
    sheet.addEventListener('pointerleave',()=>{sheet.classList.remove('is-tilt');['--ty','--tx','--gx','--gy','--sx'].forEach(k=>sheet.style.removeProperty(k))});

    const cl01=v=>Math.max(0,Math.min(1,v)),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
    let q=false,Pt=0,first=true;
    const step=()=>{const d=Pt-P;
      if(Math.abs(d)<.0015){if(d){P=Pt;draw()}q=false;return}
      P+=d*.22;draw();requestAnimationFrame(step)};
    const onS=()=>{
      const y=-hero.getBoundingClientRect().top,vh=innerHeight;
      Pt=cl01(y/(vh*.9));hero.classList.toggle('is-open',Pt>.5);
      if(first||still){first=false;if(Pt!==P){P=Pt;draw()}}
      else if(!q&&Pt!==P){q=true;requestAnimationFrame(step)}
      flipping=y>vh*.9;if(flipping){sheet.classList.remove('is-tilt');['--ty','--tx'].forEach(k=>sheet.style.removeProperty(k))}};

    const SZ={seal:[320,320],star:[200,200],oval:[440,280],rect:[400,208],square:[300,300],circle:[320,320],pill:[440,150],heart:[340,300]};
    const shape=(x,sh,w,h)=>{x.beginPath();
      if(sh==='circle')x.arc(w/2,h/2,w/2,0,Math.PI*2);
      else if(sh==='oval')x.ellipse(w/2,h/2,w/2,h/2,0,0,Math.PI*2);
      else if(sh==='seal'){for(let i=0;i<=360;i++){const t=i/360*Math.PI*2,r=w/2*(1-.035*(1+Math.cos(t*28))/2);i?x.lineTo(w/2+Math.cos(t)*r,h/2+Math.sin(t)*r):x.moveTo(w/2+r,h/2)}}
      else if(sh==='star'){const c=w/2,k=w*.12;x.moveTo(c,0);x.quadraticCurveTo(c+k,c-k,w,c);x.quadraticCurveTo(c+k,c+k,c,h);x.quadraticCurveTo(c-k,c+k,0,c);x.quadraticCurveTo(c-k,c-k,c,0)}
      else if(sh==='heart'){x.moveTo(w/2,h*.97);x.bezierCurveTo(w*.18,h*.74,0,h*.52,0,h*.3);x.bezierCurveTo(0,h*.1,w*.14,0,w*.28,0);x.bezierCurveTo(w*.39,0,w*.47,h*.06,w/2,h*.16);
        x.bezierCurveTo(w*.53,h*.06,w*.61,0,w*.72,0);x.bezierCurveTo(w*.86,0,w,h*.1,w,h*.3);x.bezierCurveTo(w,h*.52,w*.82,h*.74,w/2,h*.97)}
      else{const r=sh==='pill'?h/2:sh==='square'?70:60;rr(x,0,0,w,h,r);return}
      x.closePath()};
    const fill=(x,bg,w,h)=>{let g;
      if(bg==='silver'){g=x.createLinearGradient(0,0,w,w*Math.tan(28*Math.PI/180));[[0,'#dcdee1'],[.22,'#f1f2f3'],[.4,'#e2e4e6'],[.58,'#f5f6f7'],[.78,'#dfe1e3'],[1,'#eceeef']].forEach(([o,c])=>g.addColorStop(o,c))}
      else if(bg==='holo'){g=x.createLinearGradient(0,0,w,h);[[0,'#ffd6e8'],[.2,'#d8e4ff'],[.42,'#c9fff1'],[.62,'#fff6c4'],[.82,'#ffd6f2'],[1,'#d6e2ff']].forEach(([o,c])=>g.addColorStop(o,c))}
      else if(bg==='glow'){g=x.createRadialGradient(w*.5,h*.45,0,w/2,h/2,w*.55);[[0,'#f7ffe6'],[.55,'#dcf7a0'],[1,'#bdeb62']].forEach(([o,c])=>g.addColorStop(o,c))}
      else g=bg;
      x.fillStyle=g;x.fillRect(0,0,w,h)};
    const tint=(img,col,w,h)=>{const c=mk(Math.ceil(w),Math.ceil(h)),x=c.getContext('2d');x.drawImage(img,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,w,h);return c};

    const holoLogo=(img,w,h)=>{const c=mk(Math.ceil(w),Math.ceil(h)),x=c.getContext('2d');x.drawImage(img,0,0,w,h);

      const g=mk(c.width,c.height),gx=g.getContext('2d'),W2=c.width,H2=c.height,gr=gx.createLinearGradient(0,H2,W2*.55,-H2*.2);
      const st=['#ff3b30','#ff7a1a','#ffd23f','#ffb3c7','#ff8a3d','#ff4f6e','#ffb02e'];
      st.forEach((cl,i)=>gr.addColorStop(i/(st.length-1),cl));
      gx.fillStyle=gr;gx.fillRect(0,0,W2,H2);
      gx.globalCompositeOperation='lighter';
      for(let i=0;i<3;i++){const x0=W2*(.2+i*.3),sh=gx.createLinearGradient(x0-W2*.04,0,x0+W2*.04,0);
        sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.5,'rgba(255,255,255,.14)');sh.addColorStop(1,'rgba(255,255,255,0)');
        gx.save();gx.translate(x0,H2/2);gx.rotate(-.5);gx.translate(-x0,-H2/2);gx.fillStyle=sh;gx.fillRect(x0-W2*.05,-H2,W2*.1,H2*3);gx.restore()}
      const id=x.getImageData(0,0,c.width,c.height),gd=gx.getImageData(0,0,c.width,c.height).data,dd=id.data;
      const mc=mk(c.width,c.height),mx2=mc.getContext('2d'),md=mx2.createImageData(c.width,c.height),mm=md.data;
      for(let i=0;i<dd.length;i+=4){if(dd[i+3]&&dd[i]>150&&dd[i+1]>100&&dd[i+2]<110){dd[i]=gd[i];dd[i+1]=gd[i+1];dd[i+2]=gd[i+2];mm[i]=mm[i+1]=mm[i+2]=255;mm[i+3]=dd[i+3]}}
      x.putImageData(id,0,0);mx2.putImageData(md,0,0);c.mask=mc;return c};
    const load=u=>new Promise(ok=>{if(!u)return ok(null);const L=new Image();L.onload=()=>ok(L);L.onerror=()=>ok(null);L.src=u});
    const plates=[...sheet.querySelectorAll('[data-shape]')].map(async st=>{
      await document.fonts.ready;
      if(st.dataset.shape==='text'){
        const d=st.dataset,ff=getComputedStyle(h1).fontFamily,F=200,c0=mk(10,10).getContext('2d');c0.font=`800 ${F}px ${ff}`;

        const B=F*.14,tw=c0.measureText(d.text).width,sw=d.sub?(c0.font=`700 ${F*.32}px ${ff}`,c0.measureText(d.sub).width+F*.06*d.sub.length):0,w=Math.ceil(Math.max(tw,sw)+2*B+10),h=Math.ceil(F*(d.sub?1.18:.86)+2*B);
        const c=mk(w,h),x=c.getContext('2d');x.textAlign='center';x.textBaseline='alphabetic';x.lineJoin='round';
        const txt=(fill,stroke)=>{x.font=`800 ${F}px ${ff}`;x.letterSpacing='0px';if(stroke){x.lineWidth=2*B;x.strokeStyle=stroke;x.strokeText(d.text,w/2,B+F*.8)}if(fill){x.fillStyle=fill;x.fillText(d.text,w/2,B+F*.8)}
          if(d.sub){x.font=`700 ${F*.32}px ${ff}`;x.letterSpacing=`${F*.06}px`;if(stroke)x.strokeText(d.sub,w/2,B+F*1.12);if(fill){x.fillStyle=d.subc||fill;x.fillText(d.sub,w/2,B+F*1.12)}}};
        txt(d.bg||'#fff',d.bg||'#fff');
        {
          const id=x.getImageData(0,0,w,h),D=id.data,seen=new Uint8Array(w*h),q=[];
          for(let i=0;i<w;i++){q.push(i,(h-1)*w+i)}for(let j=0;j<h;j++){q.push(j*w,j*w+w-1)}
          while(q.length){const p=q.pop();if(seen[p]||D[p*4+3]>200)continue;seen[p]=1;const px=p%w,py=(p-px)/w;
            if(px>0)q.push(p-1);if(px<w-1)q.push(p+1);if(py>0)q.push(p-w);if(py<h-1)q.push(p+w)}
          x.fillStyle=d.bg||'#fff';x.fillRect(0,0,1,1);const c1=x.getImageData(0,0,1,1).data;x.putImageData(id,0,0);
          for(let p=0;p<w*h;p++)if(!seen[p]&&D[p*4+3]<255){D[p*4]=c1[0];D[p*4+1]=c1[1];D[p*4+2]=c1[2];D[p*4+3]=255}
          x.putImageData(id,0,0)}
        txt(d.fg||'#141212');
        const u=c.toDataURL(),im=st.querySelector('img');st.style.setProperty('--m',`url(${u})`);
        return new Promise(ok=>{im.onload=ok;im.src=u})}
      const d=st.dataset,[w,h]=SZ[d.shape],c=mk(w,h),x=c.getContext('2d'),L=await load(d.logo);
      shape(x,d.shape,w,h);x.clip();fill(x,d.bg,w,h);
      if(L){const bw=w*(d.shape==='rect'?.7:d.shape==='oval'?.58:.62),bh=h*(d.shape==='rect'?.5:d.shape==='oval'?.3:.42),k=Math.min(bw/L.width,bh/L.height),lw=L.width*k,lh=L.height*k;
        const lg=d.holo?holoLogo(L,lw,lh):d.fg?tint(L,d.fg,lw,lh):L;x.drawImage(lg,(w-lw)/2,(h-lh)/2,lw,lh);
        if(d.holo){
          const hm=mk(w,h);hm.getContext('2d').drawImage(lg.mask,(w-lw)/2,(h-lh)/2,lw,lh);
          st.style.setProperty('--hm',`url(${hm.toDataURL()})`);st.insertAdjacentHTML('beforeend','<i class="hst__holo"></i><i class="hst__sheen"></i>')}}
      if(d.arc){
        const t=d.text.toUpperCase(),fs=h*.205,cy=h*.42,R2=w*.95,ff=getComputedStyle(h1).fontFamily;x.font=`700 ${fs}px ${ff}`;x.textAlign='center';x.textBaseline='middle';
        const ws=[...t].map(ch=>x.measureText(ch).width+fs*.02),tot=ws.reduce((a,b)=>a+b,0);let a0=-tot/R2/2;
        for(const [col,dx,dy] of [[d.arc,fs*.05,fs*.06],[d.fg||'#fff',0,0]]){let a=a0;x.fillStyle=col;
          [...t].forEach((ch,i)=>{const am=a+ws[i]/R2/2;x.save();x.translate(w/2+Math.sin(am)*R2+dx,cy+R2-Math.cos(am)*R2+dy);x.rotate(am);x.fillText(ch,0,0);x.restore();a+=ws[i]/R2})}}
      else if(d.text){const t=d.text,big=t.length<3;x.fillStyle=d.fg||'#fff';x.textAlign='center';x.textBaseline='middle';
        let fs=big?h*.62:d.sub?h*.15:h*.3;x.font=`800 ${fs}px ${getComputedStyle(h1).fontFamily}`;const mw=w*(d.shape==='heart'?.5:d.sub?.46:.66);if(x.measureText(t).width>mw){fs*=mw/x.measureText(t).width;x.font=`800 ${fs}px ${getComputedStyle(h1).fontFamily}`}
        x.fillText(t,w/2,h*(d.shape==='heart'?.42:d.sub?.49:.53))}
      if(d.ring){const rad=w*.4,fs=h*.072,t=(d.ring+' ').repeat(3).toUpperCase();x.save();x.translate(w/2,h/2);x.fillStyle=d.ringc||'#ff8a1f';
        x.font=`700 ${fs}px ${getComputedStyle(h1).fontFamily}`;x.textAlign='center';x.textBaseline='middle';const step=Math.PI*2/t.length;
        for(let i=0;i<t.length;i++){x.save();x.rotate(i*step-Math.PI/2);x.translate(0,-rad);x.fillText(t[i],0,0);x.restore()}x.restore();
        x.strokeStyle=d.ringc||'#ff8a1f';x.lineWidth=2;x.beginPath();x.arc(w/2,h/2,w*.33,0,Math.PI*2);x.stroke()}
      if(d.sub){x.fillStyle=d.fg||'#fff';x.textAlign='center';x.textBaseline='middle';x.font=`600 ${h*.065}px ${getComputedStyle(document.body).fontFamily}`;x.fillText(d.sub,w/2,h*.63)}
      if(d.deco==='corners'){const i=w*.13,l=w*.2,t=5;[[i,i,1,1,'#fff'],[w-i,i,-1,1,'#141212'],[i,h-i,1,-1,'#141212'],[w-i,h-i,-1,-1,'#fff']].forEach(([px,py,sx,sy,cl])=>{x.fillStyle=cl;x.fillRect(sx>0?px:px-l,sy>0?py:py-t,l,t);x.fillRect(sx>0?px:px-t,sy>0?py:py-l,t,l)})}
      if(d.deco==='moon'){
        const m=mk(w,h),mx=m.getContext('2d');mx.fillStyle='#2d3a17';
        mx.beginPath();mx.arc(w*.44,h*.52,w*.27,0,Math.PI*2);mx.fill();
        mx.globalCompositeOperation='destination-out';mx.beginPath();mx.arc(w*.57,h*.43,w*.235,0,Math.PI*2);mx.fill();
        mx.globalCompositeOperation='source-over';
        const star=(cx,cy,r)=>{const k=r*.22;mx.beginPath();mx.moveTo(cx,cy-r);mx.quadraticCurveTo(cx+k,cy-k,cx+r,cy);mx.quadraticCurveTo(cx+k,cy+k,cx,cy+r);
          mx.quadraticCurveTo(cx-k,cy+k,cx-r,cy);mx.quadraticCurveTo(cx-k,cy-k,cx,cy-r);mx.fill()};
        star(w*.68,h*.36,w*.085);star(w*.62,h*.6,w*.045);
        x.drawImage(m,0,0)}
      const u=c.toDataURL(),im=st.querySelector('img');st.style.setProperty('--m',`url(${u})`);
      await new Promise(ok=>{im.onload=ok;im.src=u})});

    sts.forEach(st=>{const src=st.querySelector('img').getAttribute('src');if(src)st.style.setProperty('--m',`url(${src})`)});
    Promise.all([document.fonts.ready,...plates]).then(()=>Promise.all(sts.map(st=>st.querySelector('img').decode().catch(()=>{})))).then(()=>{build();onS();sheet.classList.add('is-ready')});
    addEventListener('scroll',onS,{passive:true});
    let rz,rw=innerWidth;addEventListener('resize',()=>{if(innerWidth===rw)return;rw=innerWidth;clearTimeout(rz);rz=setTimeout(build,150)});
  })();

  (()=>{const b=document.getElementById('vlight'),sh=document.getElementById('vsheet');if(!b)return;
    b.addEventListener('click',()=>{const on=sh.classList.toggle('is-dark');b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=on?'Включить свет':'Выключить свет'})})();

  (()=>{const r=document.getElementById('caseRail'); if(!r) return; const bs=document.querySelectorAll('.case__nav button');
    const step=()=>r.querySelector('.case').getBoundingClientRect().width+14;
    const upd=()=>{bs[0].disabled=r.scrollLeft<4; bs[1].disabled=r.scrollLeft+r.clientWidth>r.scrollWidth-4;};
    bs.forEach(b=>b.onclick=e=>{e.stopPropagation(); r.scrollBy({left:b.dataset.dir*step(),behavior:'smooth'});});
    r.addEventListener('scroll',upd,{passive:true}); upd();})();

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
      kind:[['Стикеры',0,'Любой формы, листом или поштучно'],['Стикерпаки',1,'Лист выбранного формата']],
      mat:[['Белый глянец',0,'Виден контур наклейки'],['Голографическая',1,'Радужный перелив'],['Люминесцентная',2,'Копит свет за день']],
      size:[['10×10',10],['15×15',15],['20×20',20],['25×25',25],['50×50',50],['Свой','own','Свой размер']],
      pack:[['Листом',0,'Как есть, на подложке'],['Поштучно',1,'Цену назовёт менеджер'],['По одному',2,'Каждый стикер в свой пакет']],
      sheet:[['А7',0,'74×105 мм'],['А6',1,'105×148 мм'],['А5',2,'148×210 мм']],
      qty:[[10,10],[50,50],[100,100],[500,500],[1000,1000],[5000,5000],[50000,50000],['Своё','own','Свой тираж']],
      qtyPack:[[10,10],[50,50],[100,100],[500,500],[1000,1000],['Своё','own','Свой тираж']],
    };
    const S={kind:0,mat:0,size:3,qty:2,pack:0};
    const $=id=>document.getElementById(id);
    const rub=n=>n.toLocaleString('ru-RU')+' \u20BD';

    function build(key,items){
      const box=$(key); box.innerHTML='';
      items.forEach((it,i)=>{
        const own=it[1]==='own', tile=['kind','mat'].includes(key), l=document.createElement('label');
        const chk=`<input type="radio" name="${key}" value="${i}"${i===S[key]?' checked':''}>`;
        if(tile){
          l.className='tile';
          l.innerHTML=chk+`<span class="tile__in"><span class="tile__ph"><img src="calc-icons/${key}-${i}.webp" alt="" loading="lazy"></span><span><b>${it[0]}</b><em>${it[2]}</em></span></span>`;
        } else if(own){
          l.className='chip';
          l.innerHTML=chk+`<input class="own" id="${key}Own" inputmode="numeric" maxlength="5" placeholder="${it[2]}" aria-label="${it[2]}">`;
          const f=l.querySelector('.own');
          f.addEventListener('input',()=>{
            if(key==='size'){const d=f.value.replace(/\D/g,'').slice(0,4); f.value=d.length>2?d.slice(0,2)+'x'+d.slice(2):d;}
            else f.value=f.value.replace(/\D/g,'').slice(0,5);
            l.querySelector('input').checked=true; S[key]=i; calc();
          });
          f.addEventListener('focus',()=>{l.querySelector('input').checked=true; S[key]=i; calc();});
        } else {
          l.className='chip'+(it[2]?' chip--desc':'');
          const t=typeof it[0]==='number'?it[0].toLocaleString('ru-RU'):it[0];
          const fmt=key==='size'&&$('size').dataset.mode==='sheet'?'<i class="fmt"></i>':'';
          l.innerHTML=chk+`<span>${fmt}${t}${it[2]?`<small>${it[2]}</small>`:''}</span>`;
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
      const packs=S.kind===1, sizes=packs?F.sheet:F.size, qtys=packs?F.qtyPack:F.qty;
      $('qtyLeg').textContent=packs?'Количество паков':'Количество, штук';
      $('sizeLeg').textContent=packs?'Формат листа':'Размер, мм';
      if($('size').dataset.mode!==(packs?'sheet':'size')){
        if($('size').dataset.mode){ if(packs){S.sizeSt=S.size; S.size=S.sizePk??0;} else {S.sizePk=S.size; S.size=S.sizeSt??3;} }
        $('size').dataset.mode=packs?'sheet':'size'; build('size',sizes);}
      if($('qty').dataset.mode!==(packs?'pack':'st')){$('qty').dataset.mode=packs?'pack':'st'; if(S.qty>=qtys.length) S.qty=qtys.length-1; build('qty',qtys);}
      const sizeOwn=!packs&&sizes[S.size][1]==='own', qtyOwn=qtys[S.qty][1]==='own', qMax=packs?1000:50000;
      const q=qtyOwn?Math.min(qMax,Math.max(10,+($('qtyOwn')||{}).value||100)):qtys[S.qty][0];
      let side=null;
      if(!packs&&sizeOwn){const t=(($('sizeOwn')||{}).value||'').split(/[x×х*]/i);
        const w=Math.min(99,parseFloat(t[0])||20), h=Math.min(99,parseFloat(t[1])||w); side=Math.sqrt(Math.max(100,w*h));}
      else if(!packs) side=sizes[S.size][1];

      const stage=document.querySelector('.pre-stage');
      if(stage){ if(!packs&&sizeOwn) stage.style.setProperty('--hmm',(side/.62).toFixed(1)); else stage.style.removeProperty('--hmm'); }
      let unit=packs?sumAt(PRICE.pack,sizes[S.size][1],q,PRICE.packQty)/q:unitFor(F.mat[S.mat][1],side,q);
      const P=BIZ.promo, promoLive=new Date(P.till+'T23:59:59')>=new Date(), onPromo=promoLive&&q>=(packs?P.minPack:P.minSt);
      if(onPromo) unit*=(1-P.off);
      const po=$('pack').children; po[1].hidden=packs;
      if(packs&&S.pack===1){S.pack=0; po[0].querySelector('input').checked=true;}
      const sum=Math.round(unit*q);
      const unitTxt=unit<10&&Math.abs(unit-Math.round(unit))>.005?unit.toFixed(2).replace('.',',')+' ₽':rub(Math.round(unit));
      $('total').textContent=unitTxt;
      const pick=[F.kind[S.kind][0], F.mat[S.mat][0],
        packs?sizes[S.size][0]:(sizeOwn?(($('sizeOwn')||{}).value||'свой размер').replace('x','×')+' мм':sizes[S.size][0]+' мм'),
        q.toLocaleString('ru-RU')+(packs?' паков':' шт')];
      $('calcPick').innerHTML=pick.map(t=>'<li>'+t+'</li>').join('');
      $('unit').textContent=packs?'за пак':'за штуку';
      $('sumOut').textContent='от '+rub(sum);
      $('term').textContent=termFor(q);
      $('resinOut').textContent=q<BIZ.resinAt?BIZ.resinLow:BIZ.resinHigh;
      $('promo').hidden=!onPromo; $('promo').textContent='−'+Math.round(P.off*100)+'% по акции '+P.label;
      const mark=$('calcMark');
      mark.textContent=packs&&S.mat!==0?'Цена по белому глянцу. Пак на другой плёнке посчитает менеджер.':'';
      mark.hidden=!mark.textContent;

      window.__calcLast={kind:F.kind[S.kind][0],mat:F.mat[S.mat][0],size:pick[2],q,packs,term:$('term').textContent,resin:$('resinOut').textContent,
        sumText:$('sumOut').textContent,extras:[F.pack[S.pack][0],$('needDesign').checked&&'Нужен дизайн'].filter(Boolean)};

    }
    build('kind',F.kind); build('mat',F.mat); build('size',F.size); build('qty',F.qty); build('pack',F.pack);
    $('needDesign').addEventListener('change',calc);
    ['change','input'].forEach(t=>$('calcForm').addEventListener(t,()=>goalOnce('calc_use')));
    $('calcForm').addEventListener('submit',e=>e.preventDefault());
    calc();
  })();

  (()=>{const l=document.getElementById('lap'); if(l&&window.ResizeObserver) new ResizeObserver(([e])=>l.style.setProperty('--k',(e.contentRect.width/567).toFixed(4))).observe(l)})();

  (()=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches||!navigator.clipboard) return;
    document.querySelectorAll('.hx a[href^="tel:"],.visit a[href^="tel:"],.visit a[href^="mailto:"],.ft a[href^="tel:"],.ft a[href^="mailto:"]').forEach(a=>{
      a.classList.add('cp'); a.dataset.tip='Скопировать'; let t;
      a.addEventListener('click',e=>{e.preventDefault();
        navigator.clipboard.writeText(a.textContent.trim()).then(()=>{a.dataset.tip='Скопировано'; a.classList.add('is-copied');
          clearTimeout(t); t=setTimeout(()=>{a.classList.remove('is-copied'); a.dataset.tip='Скопировать';},1600);});});
    });})();

  (()=>{const bar=document.getElementById('cookieBar'), ok=document.getElementById('cookieOk'); if(!bar) return;
    let seen=false; try{seen=localStorage.getItem('mdm-cookie-ok')==='1';}catch(e){}
    if(!seen) setTimeout(()=>{bar.hidden=false;},1200);
    ok.addEventListener('click',()=>{bar.hidden=true; try{localStorage.setItem('mdm-cookie-ok','1');}catch(e){}});})();

  (()=>{const digits=v=>(v||'').replace(/\D/g,'');
    const norm=v=>{let d=digits(v); if(d[0]==='8') d='7'+d.slice(1); if(d&&d[0]!=='7') d='7'+d; return d.slice(0,11);};
    const fmt=v=>{const d=norm(v); if(!d) return ''; let r='+7'; if(d.length>1) r+=' ('+d.slice(1,4); if(d.length>=4) r+=')';
      if(d.length>=5) r+=' '+d.slice(4,7); if(d.length>=8) r+='-'+d.slice(7,9); if(d.length>=10) r+='-'+d.slice(9,11); return r;};
    document.querySelectorAll('#leadForm,#orderForm').forEach(f=>{
      const name=f.querySelector('[name=name]'), phone=f.querySelector('[name=phone]'), email=f.querySelector('[name=email]'), agree=f.querySelector('[name=agree]'), done=f.querySelector('.form__done');
      const fields=[name,phone,email].filter(Boolean);
      const ok=el=>el===phone?norm(el.value).length===11:el===email?/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()):el.value.trim().length>=2;
      const mark=(el,bad)=>{el.closest('.fld').classList.toggle('is-bad',bad); el.setAttribute('aria-invalid',bad?'true':'false');
        if(bad) el.setAttribute('aria-describedby',el.id+'-err'); else el.removeAttribute('aria-describedby');};
      phone.addEventListener('input',()=>{phone.value=fmt(phone.value); if(ok(phone)) mark(phone,false);});
      fields.forEach(el=>{el.addEventListener('blur',()=>mark(el,el.value.trim()?!ok(el):false)); el.addEventListener('input',()=>{if(ok(el)) mark(el,false);});});
      agree.addEventListener('change',()=>agree.closest('.agree').classList.toggle('is-bad',!agree.checked));
      f.addEventListener('submit',e=>{e.preventDefault(); let first=null;
        fields.forEach(el=>{const bad=!ok(el); mark(el,bad); if(bad&&!first) first=el;});
        agree.closest('.agree').classList.toggle('is-bad',!agree.checked);
        if(first||!agree.checked){(first||agree).focus(); done.hidden=true; return;}
        done.hidden=false; goal('lead_'+f.querySelector('[name=source]').value);});
    });

    (()=>{const inp=document.getElementById('artFile'); if(!inp) return;
      const drop=document.getElementById('artDrop'), list=document.getElementById('artList'), hint=document.getElementById('artHint'), err=document.getElementById('artErr');
      const MAX=5, MB=1048576, MB_EACH=25, MB_TOTAL=50, EXT=['pdf','ai','eps','svg','png','jpg','jpeg','tif','tiff','cdr'], HINT=hint.textContent;
      let picked=[];
      const size=n=>n<MB?Math.max(1,Math.round(n/1024))+' КБ':(n/MB).toFixed(1).replace('.',',')+' МБ';
      const total=()=>picked.reduce((a,f)=>a+f.size,0);
      const render=()=>{const dt=new DataTransfer(); picked.forEach(f=>dt.items.add(f)); inp.files=dt.files;
        list.hidden=!picked.length;
        list.replaceChildren(...picked.map((f,i)=>{const li=document.createElement('li');
          li.innerHTML='<span></span><small></small><button type="button" aria-label="Убрать файл">✕</button>';
          li.children[0].textContent=f.name; li.children[1].textContent=size(f.size);
          li.children[2].onclick=()=>{picked.splice(i,1); err.textContent=''; render(); inp.focus();}; return li;}));
        hint.textContent=picked.length?picked.length+' из '+MAX+' · '+size(total())+' из '+MB_TOTAL+' МБ':HINT;};
      const add=files=>{const msgs=[], before=picked.length;
        [...files].forEach(f=>{const ext=(f.name.split('.').pop()||'').toLowerCase();
          if(!EXT.includes(ext)) return msgs.push(f.name+': такой формат не принимаем');
          if(f.size>MB_EACH*MB) return msgs.push(f.name+': больше '+MB_EACH+' МБ');
          if(picked.length>=MAX) return msgs.push('Не больше '+MAX+' файлов, остальное пришлите менеджеру');
          if(total()+f.size>MB_TOTAL*MB) return msgs.push('Суммарно больше '+MB_TOTAL+' МБ — пришлите остальное менеджеру');
          picked.push(f);});
        err.textContent=[...new Set(msgs)].join('. '); render(); if(picked.length>before) goalOnce('art_attach');};
      inp.addEventListener('change',()=>add(inp.files));

      ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault(); drop.classList.add('is-over');}));
      ['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault(); drop.classList.remove('is-over');}));
      drop.addEventListener('drop',e=>add(e.dataTransfer.files));
    })();

    const flip=document.getElementById('calcFlip'); if(!flip) return;
    const front=flip.querySelector('.calc__sum'), back=flip.querySelector('.calc__back');
    const sync=()=>{ const L=window.__calcLast||{};
        document.getElementById('ordPick').innerHTML=document.getElementById('calcPick').innerHTML+(L.extras||[]).map(t=>'<li>'+t+'</li>').join('');
        document.getElementById('ordCalc').value=JSON.stringify(L);
        document.getElementById('ordSum').textContent=document.getElementById('sumOut').textContent;
        document.getElementById('ordTerm').textContent='Срок: '+document.getElementById('term').textContent; };

    ['change','input'].forEach(t=>document.getElementById('calcForm').addEventListener(t,()=>{if(flip.classList.contains('is-back')) setTimeout(sync);}));
    const turn=(on,big)=>{ if(on){ sync(); back.classList.toggle('is-big',!!big); back.querySelector('.form__done').hidden=true; }
      flip.classList.toggle('is-back',on);
      back.inert=!on; back.setAttribute('aria-hidden',!on); front.inert=on; front.setAttribute('aria-hidden',on);
      setTimeout(()=>(on?back.querySelector(big?'[name=qty_note]':'[name=name]'):front.querySelector('[data-flip]')).focus({preventScroll:true}),450);};

    flip.querySelectorAll('[data-flip]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault(); turn(b.dataset.flip!=='0', b.dataset.flip==='big');}));
    back.addEventListener('keydown',e=>{if(e.key==='Escape') turn(false);});
  })();

  (()=>{const l=document.querySelector('.lapw');if(l)new IntersectionObserver(([e])=>l.classList.toggle('is-vis',e.isIntersecting)).observe(l)})();

  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const vio=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?e.target.play().catch(()=>{}):e.target.pause()),{rootMargin:'200px 0px'});
    document.querySelectorAll('video[data-autoplay]').forEach(v=>vio.observe(v));
  }

  document.querySelectorAll('.acc details').forEach(d=>d.addEventListener('toggle',()=>{
    if(d.open) document.querySelectorAll('.acc details[open]').forEach(o=>{if(o!==d) o.open=false;});}));

  (()=>{const c=document.querySelector('.visit__card'); if(!c||!matchMedia('(hover:hover)').matches) return; let raf=0,ev;
    c.addEventListener('pointermove',e=>{ev=e; if(raf) return; raf=requestAnimationFrame(()=>{raf=0; const r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(ev.clientX-r.left)+'px'); c.style.setProperty('--my',(ev.clientY-r.top)+'px');});});
    c.addEventListener('pointerenter',()=>c.style.setProperty('--o',1)); c.addEventListener('pointerleave',()=>c.style.setProperty('--o',0));})();

  (()=>{const box=document.getElementById('wkBox'); if(!box||!box.showModal) return; const im=box.querySelector('img'), n=box.querySelector('.wk-box__n');
    const items=[...document.querySelectorAll('.wk__img')]; let cur=0;
    const show=k=>{cur=(k+items.length)%items.length; im.src=items[cur].querySelector('img').src; n.textContent=(cur+1)+' / '+items.length;};
    items.forEach((b,k)=>b.addEventListener('click',()=>{show(k); box.showModal(); goal('work_open');}));
    box.querySelectorAll('.wk-box__nav').forEach(b=>b.addEventListener('click',()=>show(cur+ +b.dataset.step)));
    box.addEventListener('keydown',e=>{if(e.key==='ArrowRight') show(cur+1); if(e.key==='ArrowLeft') show(cur-1);});
    box.addEventListener('click',e=>{if(e.target===box) box.close();});})();

  (()=>{const hx=document.getElementById('hx'),hero=document.querySelector('.hero'),sec=document.getElementById('hxSec'),
      btn=hx.querySelector('.hx__sec'),menu=document.getElementById('hxMenu'),items=[...menu.querySelectorAll('a[href^="#"]')],
      targets=items.map(a=>document.querySelector(a.hash));
    let shown=false,cur;
    const closeMenu=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false')};
    const upd=()=>{const on=hero.getBoundingClientRect().bottom<80;
      if(on!==shown){shown=on;hx.classList.toggle('is-on',on);hx.inert=!on;if(!on)closeMenu()}
      if(!on)return;
      let a=null;targets.forEach((t,i)=>{if(t&&t.getBoundingClientRect().top<innerHeight*.33)a=items[i]});
      if(a!==cur){cur=a;items.forEach(x=>x.toggleAttribute('aria-current',x===a));sec.textContent=a?a.textContent:'Разделы'}};
    let raf=0;addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;upd()})},{passive:true});upd();

    const cta=hx.querySelector('.hx__cta'),[cl,cs]=cta.querySelectorAll('span'),flip=document.getElementById('calcFlip');let inCalc=false;
    new IntersectionObserver(([e])=>{inCalc=e.isIntersecting;cl.textContent=inCalc?'Оформить заказ':'Рассчитать стоимость';cs.textContent=inCalc?'Оформить':'Рассчитать';
      if(inCalc)cta.removeAttribute('data-goal');else cta.dataset.goal='calc_click'},{rootMargin:'-20% 0px -20% 0px'}).observe(document.getElementById('calc'));
    cta.addEventListener('click',e=>{if(!inCalc||!flip)return;e.preventDefault();
      if(!flip.classList.contains('is-back'))flip.querySelector('[data-flip="1"]').click();
      flip.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})});
    btn.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;btn.setAttribute('aria-expanded',open)});
    menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
    document.addEventListener('click',e=>{if(!hx.contains(e.target))closeMenu()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();btn.focus()}});
    hx.querySelector('.hx__logo').addEventListener('click',e=>{e.preventDefault();scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
  })();

  (()=>{const stub=document.querySelector('.hstub'),src=document.querySelector('#leadForm [name=source]');
    if(stub&&src)stub.addEventListener('click',()=>{src.value='sample'});})();

  (()=>{const m=document.querySelector('.visit__map'),lock=m&&m.querySelector('.visit__lock');if(!lock)return;let t;
    lock.addEventListener('click',()=>m.classList.add('is-live'));
    lock.addEventListener('wheel',()=>{lock.classList.add('is-hint');clearTimeout(t);t=setTimeout(()=>lock.classList.remove('is-hint'),1400)},{passive:true});
    m.addEventListener('mouseleave',()=>m.classList.remove('is-live'));
    new IntersectionObserver(([e])=>{if(!e.isIntersecting)m.classList.remove('is-live')}).observe(m);
  })();

  (()=>{const ft=document.querySelector('.ft'),end=document.getElementById('pgEnd');if(!ft||!end)return;
    ft.classList.add('is-far');
    new IntersectionObserver(([e])=>ft.classList.toggle('is-far',!e.isIntersecting),{rootMargin:'0px 0px 100% 0px'}).observe(end);
  })();
