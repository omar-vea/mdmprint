// Разовый зонд: цифры для решения по нижним виджетам. Печатает только агрегаты.
const TOKEN = process.env.METRIKA_TOKEN;
const ID    = process.env.COUNTER_ID || '91973';
if (!TOKEN) { console.error('нужен METRIKA_TOKEN'); process.exit(1); }
const H = { Authorization: 'OAuth ' + TOKEN };
const d2 = n => String(n).padStart(2,'0');
const day = d => `${d.getUTCFullYear()}-${d2(d.getUTCMonth()+1)}-${d2(d.getUTCDate())}`;
const now = new Date();
const from = day(new Date(now.getTime() - 90*864e5)), to = day(now);

async function stat(params){
  const u = new URL('https://api-metrika.yandex.net/stat/v1/data');
  Object.entries({ ids: ID, date1: from, date2: to, accuracy: 'medium', limit: 20, ...params })
    .forEach(([k,v]) => u.searchParams.set(k,v));
  const r = await fetch(u,{headers:H}); const t = await r.text();
  if(!r.ok) return { error: r.status + ' ' + t.slice(0,160) };
  return JSON.parse(t);
}
const num = n => Number(n).toLocaleString('ru-RU');
const pct = (a,b) => b ? (a/b*100).toFixed(2) + '%' : '—';

console.log(`\n=== период ${from} … ${to}, выборка medium ===`);

const GOALS = {
  151947109: 'переход в мессенджер',
  196109470: 'переход в соцсеть',
  189330493: 'клик на телефон',
  318880710: 'клик e-mail',
  360663062: 'отправка заявки',
  175974346: 'отправка формы',
  279541417: 'звонки',
};

const base = await stat({ metrics: 'ym:s:visits,ym:s:users' });
const visits = base.error ? 0 : base.totals[0];
console.log(base.error ? `ВИЗИТЫ: ошибка ${base.error}`
  : `\nВИЗИТЫ за период: ${num(visits)} (посетителей ${num(base.totals[1])})`);

console.log('\nДОСТИЖЕНИЯ ЦЕЛЕЙ (и доля от визитов):');
for (const [id, name] of Object.entries(GOALS)) {
  const r = await stat({ metrics: `ym:s:goal${id}reaches,ym:s:goal${id}visits` });
  if (r.error) { console.log(`  ${name}: ошибка ${r.error}`); continue; }
  console.log(`  ${name}: ${num(r.totals[0])} достижений, визитов с ним ${num(r.totals[1])} (${pct(r.totals[1], visits)})`);
}

console.log('\nМЕССЕНДЖЕРЫ И СОЦСЕТИ ПО УСТРОЙСТВАМ:');
for (const id of [151947109, 196109470]) {
  const r = await stat({ metrics: `ym:s:goal${id}visits`, dimensions: 'ym:s:deviceCategory' });
  if (r.error) { console.log(`  цель ${id}: ошибка ${r.error}`); continue; }
  console.log(`  ${GOALS[id]}:`);
  (r.data||[]).forEach(x => console.log(`    ${x.dimensions[0].name}: ${num(x.metrics[0])}`));
}

console.log('\nВНЕШНИЕ ССЫЛКИ (куда уходят):');
for (const preset of ['ext_link_domains','ext_link_url']) {
  const r = await stat({ preset, metrics: 'ym:s:visits' });
  if (r.error) { console.log(`  ${preset}: ошибка ${r.error}`); continue; }
  console.log(`  — ${preset}, итого визитов ${num(r.totals?.[0] ?? 0)}:`);
  (r.data||[]).slice(0,12).forEach(x => console.log(`    ${x.dimensions[0].name || '—'}: ${num(x.metrics[0])}`));
}
