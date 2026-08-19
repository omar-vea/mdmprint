// Разовый зонд: цифры для решения по нижним виджетам (кнопка «наверх», виджет Битрикса, куки).
// Печатает ТОЛЬКО агрегаты, токен в вывод не попадает. Запуск: METRIKA_TOKEN=… node widgets-probe.mjs
const TOKEN = process.env.METRIKA_TOKEN;
const ID    = process.env.COUNTER_ID || '91973';
if (!TOKEN) { console.error('нужен METRIKA_TOKEN'); process.exit(1); }
const H = { Authorization: 'OAuth ' + TOKEN };

const d2 = n => String(n).padStart(2, '0');
const day = d => `${d.getUTCFullYear()}-${d2(d.getUTCMonth()+1)}-${d2(d.getUTCDate())}`;
const today = new Date();
const from = day(new Date(today.getTime() - 90*864e5)), to = day(today);

async function api(path, params={}) {
  const u = new URL('https://api-metrika.yandex.net' + path);
  Object.entries(params).forEach(([k,v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { headers: H });
  const t = await r.text();
  if (!r.ok) return { error: r.status + ' ' + t.slice(0,200) };
  try { return JSON.parse(t); } catch { return { error: 'не JSON' }; }
}
const stat = (params) => api('/stat/v1/data', { ids: ID, date1: from, date2: to, accuracy: 'full', limit: 30, ...params });

console.log(`\n=== СЧЁТЧИК ${ID}, период ${from} … ${to} ===\n`);

// 1. Цели: есть ли среди них клики по виджету/мессенджерам
const goals = await api(`/management/v1/counter/${ID}/goals`);
if (goals.error) console.log('ЦЕЛИ: ошибка', goals.error);
else {
  console.log(`ЦЕЛИ (${goals.goals.length}):`);
  goals.goals.forEach(g => console.log(`  id ${g.id} · ${g.name} · тип ${g.type}`));
}

// 2. Общая посещаемость и доля мобильных
const gen = await stat({ metrics: 'ym:s:visits,ym:s:users,ym:s:bounceRate', dimensions: 'ym:s:deviceCategory' });
if (gen.error) console.log('\nПОСЕЩАЕМОСТЬ: ошибка', gen.error);
else {
  console.log('\nПОСЕЩАЕМОСТЬ по устройствам:');
  console.log(`  ВСЕГО визитов ${gen.totals[0]}, посетителей ${gen.totals[1]}, отказы ${gen.totals[2].toFixed(1)}%`);
  gen.data.forEach(r => console.log(`  ${r.dimensions[0].name}: визитов ${r.metrics[0]}, отказы ${r.metrics[1+1].toFixed(1)}%`));
}

// 3. Достижения целей — что реально приносит обращения
if (!goals.error) {
  const ids = goals.goals.map(g => g.id);
  const metrics = ids.map(i => `ym:s:goal${i}reaches`).join(',');
  const gd = await stat({ metrics, dimensions: '' , limit: 1});
  if (gd.error) console.log('\nДОСТИЖЕНИЯ: ошибка', gd.error);
  else {
    console.log('\nДОСТИЖЕНИЯ ЦЕЛЕЙ за период:');
    ids.forEach((id, i) => {
      const g = goals.goals.find(x => x.id === id);
      console.log(`  ${g.name}: ${gd.totals[i]}`);
    });
  }
}

// 4. Переходы по внешним ссылкам — уходы в мессенджеры и соцсети
for (const preset of ['ext_link_domains', 'ext_link_url']) {
  const ext = await stat({ preset, metrics: 'ym:s:visits' });
  if (ext.error) { console.log(`\nВНЕШНИЕ ССЫЛКИ (${preset}): ошибка`, ext.error); continue; }
  console.log(`\nВНЕШНИЕ ССЫЛКИ (${preset}), топ:`);
  (ext.data || []).slice(0, 15).forEach(r =>
    console.log(`  ${(r.dimensions[0].name || '—')}: ${r.metrics[0]}`));
  if (ext.totals) console.log(`  ИТОГО визитов с переходами: ${ext.totals[0]}`);
}
