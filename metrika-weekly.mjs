// Еженедельный отчёт MDMprint: Метрика (неделя к неделе) → правила → Telegram.
// Запуск: METRIKA_TOKEN=… TG_BOT_TOKEN=… TG_CHAT_ID=… [COUNTER_ID=91973] node metrika-weekly.mjs
const TOKEN = process.env.METRIKA_TOKEN;
const IDS   = process.env.COUNTER_ID || '91973';
const BOT   = process.env.TG_BOT_TOKEN;
const CHAT  = process.env.TG_CHAT_ID;
const DRY   = process.env.DRY === '1';        // DRY=1 — только напечатать, не слать
if(!TOKEN || (!DRY && (!BOT || !CHAT))){ console.error('Нужны METRIKA_TOKEN и (TG_BOT_TOKEN+TG_CHAT_ID | DRY=1)'); process.exit(1); }
const H = { Authorization: 'OAuth ' + TOKEN };

const p1  = n => Math.round(Number(n)*10)/10;
const pct = (c,p) => p ? Math.round((c-p)/p*1000)/10 : null;   // % изменения (для абсолютов)
const ppd = (c,p) => (c==null||p==null) ? null : Math.round((c-p)*10)/10; // изменение в пунктах (для ставок)

async function stat(d1,d2,params){
  const url = 'https://api-metrika.yandex.net/stat/v1/data?' +
    new URLSearchParams({ ids:IDS, date1:d1, date2:d2, accuracy:'full', lang:'ru', ...params });
  const r = await fetch(url,{headers:H}); const t = await r.text();
  if(!r.ok) throw new Error('stat '+r.status+': '+t.slice(0,200));
  return JSON.parse(t);
}
async function mgmt(path){ const r=await fetch('https://api-metrika.yandex.net/management/v1'+path,{headers:H});
  const t=await r.text(); if(!r.ok) throw new Error('mgmt '+r.status); return JSON.parse(t); }

async function core(d1,d2){
  const t = await stat(d1,d2,{ metrics:'ym:s:visits,ym:s:users,ym:s:bounceRate' });
  const [visits,users,bounce] = t.totals;
  const dev = await stat(d1,d2,{ dimensions:'ym:s:deviceCategory', metrics:'ym:s:bounceRate,ym:s:visits', sort:'-ym:s:visits' });
  const mob = dev.data.find(x=>/смартфон|мобил|phone/i.test(x.dimensions[0].name));
  return { visits:+visits, users:+users, bounce:+bounce, mobBounce: mob?Number(mob.metrics[0]):null };
}

// направление со смыслом: goodUp=true — рост это хорошо (визиты, конверсия); false — плохо (отказы)
const trend = (delta, goodUp) => {
  if(delta===null || Math.abs(delta)<0.05) return '▬';
  const up = delta>0; return (up?'▲':'▼') + (up===goodUp ? '🟢' : '🔴');
};

function rules(cur, prev, goalsCur, goalsPrev){
  const out = [];
  const mb = ppd(cur.mobBounce, prev.mobBounce);
  if(mb!==null && mb <= -2) out.push('👍 Отказы на мобильных снижаются ('+mb+' пп) — редизайн в нужную сторону.');
  if(mb!==null && mb >=  2) out.push('⚠️ Отказы на мобильных выросли (+'+mb+' пп) — проверь мобильную вёрстку/скорость загрузки.');
  const bb = ppd(cur.bounce, prev.bounce);
  if(bb!==null && bb >= 3) out.push('⚠️ Общие отказы растут (+'+bb+' пп) — глянь релевантность страниц входа.');
  for(const [name,label] of [['заявк','Заявки'],['мессенджер','Мессенджер'],['телефон','Клик по телефону']]){
    const k = Object.keys(goalsCur).find(id=>goalsCur[id].name.toLowerCase().includes(name));
    if(!k) continue;
    const d = ppd(goalsCur[k].conv, goalsPrev[k]?.conv);
    if(d!==null && d <= -0.3) out.push('📉 Конверсия «'+label+'» упала ('+d+' пп) — проверь форму/кнопки на этом шаге.');
    if(d!==null && d >=  0.3) out.push('📈 Конверсия «'+label+'» выросла (+'+d+' пп).');
  }
  const v = pct(cur.visits, prev.visits);
  if(v!==null && v <= -15) out.push('📉 Трафик просел ('+v+'%) — это про SEO/рекламу, не про дизайн; сверься с маркетологом.');
  if(v!==null && v >=  20) out.push('📈 Трафик заметно вырос (+'+v+'%) — при сравнении дизайна помни про этот скачок.');
  if(!out.length) out.push('Неделя ровная — резких изменений нет.');
  return out;
}

async function goalMap(d1,d2,goals){
  const out = {};
  if(!goals.length) return out;
  const ids = goals.map(g=>g.id);
  const metrics = ids.map(id=>'ym:s:goal'+id+'conversionRate').join(',');
  const t = await stat(d1,d2,{ metrics });
  ids.forEach((id,i)=> out[id] = { name: goals.find(g=>g.id===id).name, conv: Number(t.totals[i]) });
  return out;
}

const fmtDate = (offset) => { const d = new Date(); d.setDate(d.getDate()-offset);
  return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0'); };

try {
  const [cur, prev] = await Promise.all([ core('7daysAgo','yesterday'), core('14daysAgo','8daysAgo') ]);
  const goals = (await mgmt('/counter/'+IDS+'/goals').then(r=>r.goals||[]).catch(()=>[]))
                  .filter(g=>/заявк|мессенджер|телефон/i.test(g.name));
  const [gCur, gPrev] = await Promise.all([ goalMap('7daysAgo','yesterday',goals), goalMap('14daysAgo','8daysAgo',goals) ]);

  const line = (label, cur, prev, unit, goodUp, dec=0) => {
    const d = unit==='%' ? ppd(cur,prev) : pct(cur,prev);
    const dTxt = d===null ? '' : ' (' + trend(d,goodUp) + ' ' + (d>0?'+':'') + d + (unit==='%'?' пп':'%') + ')';
    const val = unit==='%' ? p1(cur)+'%' : (dec? p1(cur): Math.round(cur));
    return '• '+label+': <b>'+val+'</b>'+dTxt;
  };

  const rows = [
    line('Визиты', cur.visits, prev.visits, '', true),
    line('Отказы', cur.bounce, prev.bounce, '%', false),
    line('Отказы на мобильных', cur.mobBounce, prev.mobBounce, '%', false),
  ];
  for(const [name,label] of [['заявк','Заявки'],['мессенджер','Мессенджер'],['телефон','Клик по телефону']]){
    const k = Object.keys(gCur).find(id=>gCur[id].name.toLowerCase().includes(name));
    if(k) rows.push(line('Конв. «'+label+'»', gCur[k].conv, gPrev[k]?.conv, '%', true));
  }

  const tips = rules(cur, prev, gCur, gPrev).map(t=>'• '+t).join('\n');
  const msg = '📊 <b>MDMprint — неделя '+fmtDate(7)+'–'+fmtDate(1)+'</b>\n<i>сравнение с прошлой неделей</i>\n\n'
            + rows.join('\n') + '\n\n💡 <b>Выводы</b>\n' + tips
            + '\n\n<i>🟢 в плюс · 🔴 в минус · ▬ без изменений</i>';

  if(DRY){ console.log(msg.replace(/<[^>]+>/g,'')); process.exit(0); }

  const r = await fetch('https://api.telegram.org/bot'+BOT+'/sendMessage', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id:CHAT, text:msg, parse_mode:'HTML', disable_web_page_preview:true })
  });
  const j = await r.json();
  console.log(j.ok ? 'Отправлено в Telegram ✓' : ('Telegram ошибка: '+JSON.stringify(j)));
  process.exit(j.ok ? 0 : 3);
} catch(e){ console.error('ОШИБКА:', e.message); process.exit(2); }
