/* =========================================================
   Extras: AI cost estimator, "Ask Ebrahim" chat, smart search,
   live App Store ratings, pricing + free-call booking.
   Works offline (built-in engines) until the Vercel AI endpoint is live.
   ========================================================= */
(function () {
  'use strict';
  if (!window.PF) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const L = () => PF.lang();
  const t = (k) => PF.t(k);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Number(n).toLocaleString(L() === 'ar' ? 'ar-EG' : 'en-US');
  const usd = (n) => `$${Number(n).toLocaleString('en-US')}`;

  /* ---------- Visitor currency (guessed from time zone, changeable) ---------- */
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  let cur = (() => {
    const saved = store.get('currency');
    if (saved && CURRENCIES[saved]) return saved;
    const q = new URLSearchParams(location.search).get('cur');
    if (q && CURRENCIES[q.toUpperCase()]) return q.toUpperCase();
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    if (TZ_CURRENCY[tz]) return TZ_CURRENCY[tz];
    if (tz.startsWith('Europe/')) return 'EUR';
    return 'USD';
  })();
  const localAmt = (n) => {
    const c = CURRENCIES[cur];
    const v = Math.round((n * c.rate) / c.round) * c.round;
    const num = v.toLocaleString(L() === 'ar' ? 'ar-EG' : 'en-US');
    return c.sym ? `${c.sym}${num}` : `${num} ${c[L()]}`;
  };
  // "$1,200" or "$1,200 (≈ 4,500 ر.س)"
  const money = (n) => (cur === 'USD' ? usd(n) : `${usd(n)} (≈ ${localAmt(n)})`);
  const localLine = (a, b) => (cur === 'USD' ? '' : `<small class="cur-line"><bdi dir="ltr">≈ ${localAmt(a)}${b != null ? ` – ${localAmt(b)}` : ''}</bdi></small>`);
  const wa = (text) => window.open(`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  const projectById = (id) => PROJECTS.find((p) => p.id === id);

  /* ---------- API ---------- */
  const API = (() => {
    if (SITE_CONFIG.apiBase) return SITE_CONFIG.apiBase.replace(/\/$/, '');
    const h = location.hostname;
    if (location.protocol === 'file:' || h.endsWith('github.io') || h === 'localhost' || h === '127.0.0.1') return SITE_CONFIG.vercelFallback ? SITE_CONFIG.vercelFallback.replace(/\/$/, '') : null;
    return ''; // Vercel / custom domain → same origin
  })();
  async function callApi(path, body, ms = 45000) {
    if (API === null) throw new Error('offline');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.error || `http_${r.status}`);
      return data;
    } finally { clearTimeout(timer); }
  }
  const notifyLead = (source, summary, name) => { if (API !== null) callApi('/api/lead', { source, summary, name, lang: L() }, 8000).catch(() => {}); };

  /* =========================================================
     Smart search (shared by the search box, offline estimator and offline chat)
     ========================================================= */
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْـ]/g, '');
  const SYN = Object.entries(SEARCH_SYNONYMS).map(([k, ids]) => ({ words: k.split('|').map(norm), ids }));
  function searchProjects(q) {
    const text = norm(q).trim();
    if (!text) return [];
    const tokens = text.split(/[\s,،.\-–/]+/).filter((w) => w.length > 1);
    const score = {};
    const add = (id, n) => { score[id] = (score[id] || 0) + n; };
    SYN.forEach(({ words, ids }) => {
      if (words.some((w) => text.includes(w))) ids.forEach((id, i) => add(id, 6 - Math.min(i, 3)));
    });
    PROJECTS.forEach((p) => {
      const hay = norm([p.title.ar, p.title.en, p.kicker.ar, p.kicker.en, p.desc.ar, p.desc.en, p.tags.join(' '), p.features.ar.join(' '), p.features.en.join(' ')].join(' '));
      tokens.forEach((w) => { if (w.length > 2 && hay.includes(w)) add(p.id, norm(p.title.ar + p.title.en).includes(w) ? 4 : 1.5); });
    });
    return Object.entries(score).sort((a, b) => b[1] - a[1]).map(([id]) => id).filter((id) => projectById(id));
  }

  function initSearch() {
    const input = $('#smartSearch'), info = $('#searchInfo'), none = $('#searchNone'), clear = $('#searchClear');
    if (!input) return;
    let timer;
    const run = () => {
      const q = input.value.trim();
      clear.hidden = !q;
      if (!q) { PF.setSearch(null); info.textContent = ''; none.hidden = true; return; }
      const ids = searchProjects(q);
      PF.setSearch(ids);
      info.textContent = `${fmt(ids.length)} ${t('searchResults')}`;
      none.hidden = ids.length > 0;
    };
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 180); });
    input.addEventListener('pf:cleared', () => { clear.hidden = true; info.textContent = ''; none.hidden = true; });
    clear.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
  }

  /* =========================================================
     Cost estimator
     ========================================================= */
  const est = { type: null, feats: new Set(), last: null };

  function renderEstOptions() {
    $('#estTypes').innerHTML = EST_OPTIONS.types.map((o) => `<button type="button" class="est-type ${est.type === o.id ? 'on' : ''}" data-type="${o.id}"><span>${o.icon}</span>${esc(o[L()])}</button>`).join('');
    $('#estFeats').innerHTML = EST_OPTIONS.features.map((o) => `<button type="button" class="chip est-feat ${est.feats.has(o.id) ? 'active' : ''}" data-feat="${o.id}">${esc(o[L()])}</button>`).join('');
  }

  // Offline engine — same output shape as the AI endpoint.
  function offlineEstimate(idea) {
    const text = norm(idea);
    const guess = est.type
      || (/(متجر|ستور|store|shop|بيع منتجات)/.test(text) ? 'store'
        : /(نظام|منصه متكامل|system|erp|crm|تطبيق و موقع|تطبيق وموقع)/.test(text) ? 'system'
          : /(تطبيق|ابلكيشن|app|موبايل|android|ios)/.test(text) ? 'mobile' : 'web');
    const type = EST_OPTIONS.types.find((o) => o.id === guess);
    const feats = new Set(est.feats);
    EST_OPTIONS.features.forEach((f) => { if (f.kw.some((k) => text.includes(norm(k)))) feats.add(f.id); });
    const chosen = EST_OPTIONS.features.filter((f) => feats.has(f.id));
    const extra = chosen.reduce((s, f) => s + f.price, 0);
    const round = (n) => Math.round(n / 50) * 50;
    const pmin = round(type.price[0] + extra * 0.8), pmax = round(type.price[1] + extra * 1.25);
    const wmin = Math.round(type.weeks[0] + chosen.length * 0.3), wmax = Math.round(type.weeks[1] + chosen.length * 0.6);
    const base = {
      mobile: { ar: ['شاشة بداية وتعريف بالتطبيق', 'الصفحة الرئيسية', 'الملف الشخصي والإعدادات'], en: ['Splash & onboarding', 'Home screen', 'Profile & settings'] },
      web: { ar: ['صفحة رئيسية جذابة', 'صفحات الخدمات / المحتوى', 'نموذج تواصل وواتساب'], en: ['Landing page', 'Services / content pages', 'Contact form & WhatsApp'] },
      store: { ar: ['عرض المنتجات والأقسام', 'سلة مشتريات وطلبات', 'تتبع الطلب'], en: ['Products & categories', 'Cart & checkout', 'Order tracking'] },
      system: { ar: ['تطبيق للمستخدمين', 'لوحة تحكم للإدارة', 'صلاحيات وأدوار متعددة', 'تقارير وإحصائيات'], en: ['User-facing app', 'Admin dashboard', 'Roles & permissions', 'Reports & analytics'] },
    }[type.id][L()];
    const features = [...base.map((n) => ({ name: n, priority: 'must' })), ...chosen.map((f, i) => ({ name: f[L()], priority: i < 3 || ['auth', 'payments', 'admin'].includes(f.id) ? 'must' : 'nice' }))];
    const tech = {
      mobile: ['Flutter', 'Dart', 'BLoC', 'Firebase / Supabase', 'REST API'],
      web: ['Next.js', 'React', 'Tailwind CSS', 'Vercel'],
      store: ['Next.js', 'TypeScript', 'Supabase', 'Payment gateway'],
      system: ['Flutter', 'Next.js', 'Supabase', 'Realtime', 'CI/CD'],
    }[type.id];
    if (feats.has('maps')) tech.push('Google Maps');
    if (feats.has('ai')) tech.push('Claude AI');
    const ph = L() === 'ar'
      ? [['تحليل الفكرة والتصميم', 0.25], ['البرمجة والتطوير', 0.55], ['الاختبار والإطلاق', 0.2]]
      : [['Discovery & UI design', 0.25], ['Development', 0.55], ['Testing & launch', 0.2]];
    const typeName = type[L()];
    return {
      offline: true,
      title: L() === 'ar' ? `${typeName} — خطة مبدئية` : `${typeName} — initial plan`,
      summary: L() === 'ar'
        ? `بناءً على وصفك، المشروع ${typeName} بـ ${fmt(features.length)} ميزة رئيسية. هنبدأ بنسخة أساسية (MVP) تطلق بسرعة، وبعدها نضيف المميزات الإضافية.`
        : `Based on your description, this is a ${typeName.toLowerCase()} with ${features.length} key features. We start with an MVP you can launch fast, then add the extras.`,
      platforms: type.id === 'web' || type.id === 'store' ? ['Web'] : type.id === 'system' ? ['Android', 'iOS', 'Web'] : ['Android', 'iOS'],
      features,
      screens: { mobile: 10, web: 6, store: 12, system: 22 }[type.id] + chosen.length * 2,
      timeline_weeks: { min: wmin, max: Math.max(wmax, wmin + 1) },
      price_usd: { min: pmin, max: Math.max(pmax, pmin + 200) },
      tech: [...new Set(tech)],
      phases: ph.map(([name, k]) => ({ name, weeks: Math.max(1, Math.round(wmax * k)) })),
      similar: searchProjects(idea).slice(0, 3),
      notes: L() === 'ar'
        ? 'السعر بيتأثر بعدد الشاشات ومستوى التصميم وبوابة الدفع والتكاملات المطلوبة.'
        : 'Price depends on the number of screens, design depth, payment gateway and required integrations.',
    };
  }

  let loadTimer;
  function setLoading(on) {
    const box = $('#estLoading'), btn = $('#estGo');
    box.hidden = !on; btn.disabled = on;
    clearInterval(loadTimer);
    if (on) {
      const steps = t('estLoadingSteps'); let i = 0;
      const el = $('#estStep');
      el.textContent = steps[0];
      loadTimer = setInterval(() => { i = (i + 1) % steps.length; el.textContent = steps[i]; }, 1400);
    }
  }

  function renderEstimate(e) {
    est.last = e;
    const box = $('#estResult');
    const must = e.features.filter((f) => f.priority === 'must'), nice = e.features.filter((f) => f.priority !== 'must');
    const totalW = e.phases.reduce((s, p) => s + p.weeks, 0) || 1;
    const sim = (e.similar || []).map(projectById).filter(Boolean);
    box.innerHTML = `
      <div class="est-head">
        <span class="est-badge ${e.offline ? 'off' : ''}">${e.offline ? '⚡ ' + t('estOffline') : '✨ ' + t('estAiBadge')}</span>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.summary)}</p>
      </div>
      <div class="est-kpis">
        <div class="est-kpi cost"><span>${t('estCost')}</span><b><bdi dir="ltr">${usd(e.price_usd.min)} – ${usd(e.price_usd.max)}</bdi></b>${localLine(e.price_usd.min, e.price_usd.max)}</div>
        <div class="est-kpi"><span>${t('estTimeline')}</span><b><bdi dir="ltr">${fmt(e.timeline_weeks.min)}–${fmt(e.timeline_weeks.max)}</bdi> <small>${t('estWeeks')}</small></b></div>
        <div class="est-kpi"><span>${esc(e.platforms.join(' · '))}</span><b>${fmt(e.screens)} <small>${t('estScreens')}</small></b></div>
      </div>
      <div class="est-cols">
        <div>
          <h4>${t('estFeatures')}</h4>
          <ul class="est-feats">${must.map((f) => `<li class="must"><i>${t('estMust')}</i>${esc(f.name)}</li>`).join('')}${nice.map((f) => `<li class="nice"><i>${t('estNice')}</i>${esc(f.name)}</li>`).join('')}</ul>
        </div>
        <div>
          <h4>${t('estPhases')}</h4>
          <div class="est-phases">${e.phases.map((p, i) => `<div class="est-phase" style="--w:${(p.weeks / totalW) * 100}%;--i:${i}"><span>${esc(p.name)}</span><b>${fmt(p.weeks)} ${t('estWeeks')}</b><i></i></div>`).join('')}</div>
          <h4>${t('estTech')}</h4>
          <div class="tags">${e.tech.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
        </div>
      </div>
      ${sim.length ? `<h4>${t('estSimilar')}</h4><div class="est-similar">${sim.map((p) => `<button type="button" data-open="${p.id}"><img src="${p.cover || p.shots[0]}" alt="" loading="lazy"/><span>${esc(p.title[L()])}</span></button>`).join('')}</div>` : ''}
      ${e.notes ? `<p class="est-notes"><b>${t('estNotes')}:</b> ${esc(e.notes)}</p>` : ''}
      <div class="est-actions">
        <button type="button" class="btn btn-wa btn-lg" id="estWa"><svg class="i fill" viewBox="0 0 24 24"><use href="#wa-path"/></svg><span>${t('estSend')}</span></button>
        <button type="button" class="btn btn-ghost btn-lg" id="estPdf"><svg class="i" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/></svg><span>${t('estPdf')}</span></button>
        <button type="button" class="btn btn-ghost btn-lg" id="estLink"><svg class="i" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><span>${t('quoteLink')}</span></button>
        <button type="button" class="btn btn-ghost" id="estAgain">↺ ${t('estAgain')}</button>
      </div>
      <p class="est-disclaimer">${t('estDisclaimer')}</p>`;
    box.hidden = false;
    box.classList.remove('show'); void box.offsetWidth; box.classList.add('show');
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function planText(e) {
    const idea = $('#estIdea').value.trim();
    const lines = [
      t('estWaIntro'), '',
      `📌 ${e.title}`,
      `💡 ${idea.slice(0, 400)}`, '',
      `💰 ${t('estCost')}: ${money(e.price_usd.min)} – ${money(e.price_usd.max)}`,
      `⏱ ${t('estTimeline')}: ${e.timeline_weeks.min}–${e.timeline_weeks.max} ${t('estWeeks')}`,
      `📱 ${e.platforms.join(' · ')} — ${e.screens} ${t('estScreens')}`, '',
      `✅ ${t('estFeatures')}:`, ...e.features.map((f) => `• ${f.name}${f.priority === 'must' ? '' : ` (${t('estNice')})`}`), '',
      `🛠 ${e.tech.join(', ')}`,
    ];
    return lines.join('\n');
  }

  // Shareable proposal page: the whole plan travels in the URL hash (nothing stored on a server).
  function quoteUrl(e) {
    const data = { v: 1, l: L(), c: cur, d: Date.now(), i: $('#estIdea').value.trim().slice(0, 600), e };
    const json = JSON.stringify(data);
    const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return new URL('quote.html', location.href.replace(/[?#].*$/, '')).href + '#' + b64;
  }

  function printPlan(e) {
    const ar = L() === 'ar';
    const idea = esc($('#estIdea').value.trim());
    const date = new Date().toLocaleDateString(ar ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `<!doctype html><html lang="${L()}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${esc(e.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:${ar ? "'Cairo'" : "'Plus Jakarta Sans','Cairo'"},sans-serif;color:#0b1324;margin:0;font-size:12.5px;line-height:1.7}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid;border-image:linear-gradient(90deg,#0d9488,#2563eb,#7c3aed) 1;padding-bottom:14px;margin-bottom:18px}
.brand{display:flex;gap:10px;align-items:center}.mark{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#0d9488,#4f46e5);color:#fff;display:grid;place-items:center;font-weight:800;font-family:'Plus Jakarta Sans'}
.brand b{display:block;font-size:15px}.brand small{color:#5d6779}.meta{text-align:end;color:#5d6779;font-size:11.5px}
h1{font-size:24px;margin:0 0 6px}h2{font-size:15px;margin:22px 0 8px;color:#0d9488}.idea{background:#f3f6fa;border-radius:10px;padding:12px 14px;color:#2b3547}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.kpi{border:1px solid #e3e8ef;border-radius:12px;padding:12px}.kpi span{color:#5d6779;font-size:11px;display:block}.kpi b{font-size:17px}
.kpi.cost{background:linear-gradient(135deg,#ecfdf5,#eef2ff);border-color:transparent}
ul{margin:0;padding-inline-start:18px}li{margin:3px 0}.tag{display:inline-block;border:1px solid #e3e8ef;border-radius:6px;padding:2px 8px;margin:2px;font-family:'Plus Jakarta Sans';font-size:11px}
table{width:100%;border-collapse:collapse}td{padding:7px 10px;border-bottom:1px solid #eef2f7}td:last-child{text-align:end;font-weight:700}
.nice{color:#5d6779}.foot{margin-top:26px;padding-top:12px;border-top:1px solid #e3e8ef;display:flex;justify-content:space-between;color:#5d6779;font-size:11px}
</style></head><body>
<div class="top"><div class="brand"><span class="mark">ES</span><span><b>${ar ? 'المهندس إبراهيم سمير' : 'Eng. Ebrahim Samir'}</b><small>${ar ? 'مطوّر تطبيقات ومواقع' : 'Mobile & Web Developer'}</small></span></div>
<div class="meta">${ar ? 'خطة مشروع مبدئية' : 'Initial project plan'}<br>${date}</div></div>
<h1>${esc(e.title)}</h1><p>${esc(e.summary)}</p>
${idea ? `<h2>${ar ? 'فكرة العميل' : 'Client idea'}</h2><div class="idea">${idea}</div>` : ''}
<div class="kpis"><div class="kpi cost"><span>${t('estCost')}</span><b><bdi dir="ltr">${usd(e.price_usd.min)} – ${usd(e.price_usd.max)}</bdi></b>${cur === 'USD' ? '' : `<span><bdi dir="ltr">≈ ${localAmt(e.price_usd.min)} – ${localAmt(e.price_usd.max)}</bdi></span>`}</div>
<div class="kpi"><span>${t('estTimeline')}</span><b><bdi dir="ltr">${e.timeline_weeks.min}–${e.timeline_weeks.max}</bdi> ${t('estWeeks')}</b></div>
<div class="kpi"><span>${esc(e.platforms.join(' · '))}</span><b>${e.screens} ${t('estScreens')}</b></div></div>
<h2>${t('estFeatures')}</h2><ul>${e.features.map((f) => `<li class="${f.priority}">${esc(f.name)}${f.priority === 'must' ? '' : ` — ${t('estNice')}`}</li>`).join('')}</ul>
<h2>${t('estPhases')}</h2><table>${e.phases.map((p, i) => `<tr><td>${i + 1}. ${esc(p.name)}</td><td>${p.weeks} ${t('estWeeks')}</td></tr>`).join('')}</table>
<h2>${t('estTech')}</h2><div>${e.tech.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>
${e.notes ? `<h2>${t('estNotes')}</h2><p>${esc(e.notes)}</p>` : ''}
<p class="nice">${t('estDisclaimer')}</p>
<div class="foot"><span>WhatsApp: +20 105 567 3184 · 01055673184hs@gmail.com</span><span>hemasamir.github.io</span></div>
</body></html>`;
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0';
    document.body.appendChild(frame);
    frame.contentDocument.open(); frame.contentDocument.write(html); frame.contentDocument.close();
    const go = () => { frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 2000); };
    (frame.contentDocument.fonts ? frame.contentDocument.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 300));
  }

  function initEstimator() {
    if (!$('#estForm')) return;
    renderEstOptions();
    $('#estTypes').addEventListener('click', (e) => {
      const b = e.target.closest('[data-type]'); if (!b) return;
      est.type = est.type === b.dataset.type ? null : b.dataset.type; renderEstOptions();
    });
    $('#estFeats').addEventListener('click', (e) => {
      const b = e.target.closest('[data-feat]'); if (!b) return;
      const id = b.dataset.feat; est.feats.has(id) ? est.feats.delete(id) : est.feats.add(id); renderEstOptions();
    });
    $('#estForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const idea = $('#estIdea').value.trim();
      const err = $('#estErr');
      if (idea.length < 15) { err.textContent = t('estTooShort'); err.hidden = false; return; }
      err.hidden = true;
      setLoading(true);
      const prefs = { type: est.type, features: [...est.feats] };
      let result;
      try {
        const data = await callApi('/api/ai', { mode: 'estimate', lang: L(), idea, prefs });
        result = data.estimate;
      } catch {
        await new Promise((r) => setTimeout(r, 1600)); // let the loading animation breathe
        result = offlineEstimate(idea);
      }
      setLoading(false);
      renderEstimate(result);
      notifyLead('estimator', planText(result));
    });
    $('#estResult').addEventListener('click', (e) => {
      if (e.target.closest('#estWa')) wa(planText(est.last));
      if (e.target.closest('#estPdf')) printPlan(est.last);
      const lb = e.target.closest('#estLink');
      if (lb) {
        const url = quoteUrl(est.last);
        const done = () => { lb.querySelector('span').textContent = t('quoteCopied'); setTimeout(() => (lb.querySelector('span').textContent = t('quoteLink')), 3500); };
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(done).catch(() => window.prompt(t('quoteLink'), url));
        window.open(url, '_blank', 'noopener');
      }
      if (e.target.closest('#estAgain')) { $('#estResult').hidden = true; $('#estIdea').focus(); $('#estimate').scrollIntoView({ behavior: 'smooth' }); }
    });
    // example prompts
    $('#estExamples').addEventListener('click', (e) => {
      const b = e.target.closest('[data-example]'); if (!b) return;
      $('#estIdea').value = b.dataset.example; $('#estIdea').focus();
    });
  }
  function renderExamples() {
    const ex = L() === 'ar'
      ? ['تطبيق توصيل أكل لمطعمي مع دفع وتتبع المندوب', 'متجر أونلاين لبراند عطور مع لوحة تحكم', 'منصة كورسات أونلاين بفيديوهات محمية واشتراكات']
      : ['Food delivery app for my restaurant with payments and driver tracking', 'Online store for a perfume brand with an admin dashboard', 'Online courses platform with protected videos and subscriptions'];
    $('#estExamples').innerHTML = ex.map((x) => `<button type="button" data-example="${esc(x)}">✦ ${esc(x)}</button>`).join('');
  }

  /* =========================================================
     Chat assistant
     ========================================================= */
  const chat = { open: false, history: [], busy: false };

  function offlineReply(q) {
    const s = norm(q), ar = L() === 'ar';
    const has = (re) => re.test(s);
    let reply, projects = [], handoff = false;
    if (has(/(سعر|اسعار|كام|تكلف|بكام|price|cost|budget|ميزاني)/)) {
      reply = ar ? `الأسعار بتبدأ من ${money(PRICING[0].from)} للمواقع، و${money(PRICING[1].from)} لتطبيقات الموبايل والمتاجر، و${money(PRICING[2].from)} للأنظمة المتكاملة. جرّب حاسبة التكلفة بالذكاء الاصطناعي في الصفحة وهتطلعلك خطة بالسعر لفكرتك بالظبط.`
        : `Prices start at ${money(PRICING[0].from)} for websites, ${money(PRICING[1].from)} for mobile apps and stores, and ${money(PRICING[2].from)} for complete systems. Try the AI cost estimator on this page for an exact plan for your idea.`;
      handoff = true;
    } else if (has(/(وقت|مده|اسبوع|شهر|امتي|how long|time|week|deadline)/)) {
      reply = ar ? 'الموقع بياخد من أسبوع لأسبوعين، تطبيق الموبايل أو المتجر من 4 لـ 8 أسابيع، والنظام المتكامل من 8 لـ 16 أسبوع — وبتستلم نسخ تجريبية تجربها بنفسك كل فترة.'
        : 'A website takes 1–2 weeks, a mobile app or store 4–8 weeks, and a complete system 8–16 weeks — with test builds you can try along the way.';
    } else if (has(/(flutter|تقني|لغه|tech|stack|framework|next|supabase|firebase)/)) {
      reply = ar ? 'بشتغل بـ Flutter للموبايل (Android و iOS)، و Next.js للمواقع، و Firebase / Supabase للباك إند، مع Clean Architecture و CI/CD للنشر التلقائي.'
        : 'I use Flutter for mobile (Android & iOS), Next.js for the web, Firebase / Supabase for backends, with Clean Architecture and CI/CD for automated releases.';
    } else if (has(/(متجر|ستور|store|shop|طلبات|توصيل|delivery|تعليم|كورس|course|حجز|booking|عطور|طبي|doctor|مترو|ذكاء|ai|سوبرماركت)/)) {
      projects = searchProjects(q).slice(0, 3);
      reply = ar ? 'أيوه، عندي شغل قريب جدًا من اللي بتسأل عليه 👇 تقدر تفتح أي مشروع وتشوف الصور والتفاصيل.'
        : 'Yes — I have work very close to what you are asking about 👇 open any project to see screenshots and details.';
    } else if (has(/(مرحب|اهلا|السلام|hello|hi|hey)/)) {
      reply = t('chatHello');
    } else {
      reply = ar ? 'سؤال حلو! عشان أديك إجابة دقيقة، الأفضل تكلم م. إبراهيم مباشرة على واتساب — أو جرّب حاسبة التكلفة لو عندك فكرة مشروع.'
        : 'Great question! For a precise answer, it is best to talk to Ebrahim directly on WhatsApp — or try the cost estimator if you have a project idea.';
      handoff = true;
    }
    return { reply, projects, handoff };
  }

  function chatRender() {
    const log = $('#chatLog');
    log.innerHTML = chat.history.map((m) => `
      <div class="msg ${m.role}">
        <div class="bubble">${esc(m.content).replace(/\n/g, '<br>')}</div>
        ${m.projects && m.projects.length ? `<div class="msg-projects">${m.projects.map(projectById).filter(Boolean).map((p) => `<button type="button" data-open="${p.id}"><img src="${p.cover || p.shots[0]}" alt=""/><span>${esc(p.title[L()])}</span></button>`).join('')}</div>` : ''}
        ${m.handoff ? `<button type="button" class="msg-handoff"><svg class="i fill" viewBox="0 0 24 24"><use href="#wa-path"/></svg>${t('chatHandoff')}</button>` : ''}
      </div>`).join('') + (chat.busy ? '<div class="msg assistant"><div class="bubble typing"><i></i><i></i><i></i></div></div>' : '');
    $('#chatSuggest').hidden = chat.history.length > 1;
    log.scrollTop = log.scrollHeight;
  }
  function chatReset() {
    chat.history = [{ role: 'assistant', content: t('chatHello') }];
    $('#chatSuggest').innerHTML = t('chatSuggest').map((s) => `<button type="button">${esc(s)}</button>`).join('');
    chatRender();
  }
  async function chatSend(text) {
    text = text.trim();
    if (!text || chat.busy) return;
    chat.history.push({ role: 'user', content: text });
    chat.busy = true; chatRender();
    let out;
    try {
      const msgs = chat.history.filter((m, i) => !(i === 0 && m.role === 'assistant')).map((m) => ({ role: m.role, content: m.content }));
      const data = await callApi('/api/ai', { mode: 'chat', lang: L(), messages: msgs }, 30000);
      out = { reply: data.reply, projects: data.projects, handoff: data.handoff };
    } catch (e) {
      await new Promise((r) => setTimeout(r, 700));
      out = offlineReply(text);
    }
    chat.busy = false;
    chat.history.push({ role: 'assistant', content: out.reply, projects: out.projects, handoff: out.handoff });
    chatRender();
    if (out.handoff) notifyLead('chat', chat.history.filter((m) => m.role === 'user').map((m) => '• ' + m.content).join('\n'));
  }
  function initChat() {
    const panel = $('#chatPanel'), fab = $('#chatFab');
    if (!panel) return;
    chatReset();
    const toggle = (open) => {
      chat.open = open ?? !chat.open;
      panel.classList.toggle('open', chat.open); fab.classList.toggle('open', chat.open);
      fab.setAttribute('aria-expanded', chat.open);
      if (chat.open) setTimeout(() => $('#chatInput').focus(), 250);
    };
    fab.addEventListener('click', () => toggle());
    $('#chatClose').addEventListener('click', () => toggle(false));
    $('#chatForm').addEventListener('submit', (e) => { e.preventDefault(); const i = $('#chatInput'); chatSend(i.value); i.value = ''; });
    $('#chatSuggest').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) chatSend(b.textContent); });
    $('#chatLog').addEventListener('click', (e) => {
      if (e.target.closest('.msg-handoff')) {
        const asked = chat.history.filter((m) => m.role === 'user').map((m) => '• ' + m.content).join('\n');
        wa(`${t('waIntro')}\n\n${asked}`);
      }
    });
    $$('[data-chat-open]').forEach((b) => b.addEventListener('click', () => toggle(true)));
    // gentle nudge bubble after 12s, once per visit
    setTimeout(() => { if (!chat.open) fab.classList.add('nudge'); }, 12000);
  }

  /* =========================================================
     Live App Store ratings (JSONP — Apple's lookup API has no CORS)
     ========================================================= */
  function loadRatings() {
    window.RATINGS = window.RATINGS || {};
    Object.entries(SITE_CONFIG.appStore).forEach(([pid, appId], i) => {
      const cb = `__pfRating${i}`;
      window[cb] = (data) => {
        const r = data && data.results && data.results[0];
        if (r && r.userRatingCount) { window.RATINGS[pid] = { r: r.averageUserRating, n: r.userRatingCount }; PF.rerender(); }
        delete window[cb]; s.remove();
      };
      const s = document.createElement('script');
      s.src = `https://itunes.apple.com/lookup?id=${appId}&country=eg&callback=${cb}`;
      s.onerror = () => s.remove();
      document.head.appendChild(s);
    });
  }

  /* =========================================================
     Pricing + free-call booking
     ========================================================= */
  function renderPricing() {
    const grid = $('#pricingGrid'); if (!grid) return;
    grid.innerHTML = PRICING.map((p, i) => `
      <div class="price-card reveal in ${p.popular ? 'popular' : ''}" style="--d:${i * 90}ms">
        ${p.popular ? `<span class="price-pop">★ ${t('prPopular')}</span>` : ''}
        <h3>${esc(p[L()].name)}</h3>
        <p class="price-tag">${esc(p[L()].tag)}</p>
        <div class="price-amount"><small>${t('prFrom')}</small><b>${usd(p.from)}</b>${localLine(p.from)}<span>${p.weeks} ${t('prWeeks')}</span></div>
        <ul>${p[L()].features.map((f) => `<li><svg class="i" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>${esc(f)}</li>`).join('')}</ul>
        <button type="button" class="btn ${p.popular ? 'btn-primary' : 'btn-ghost'} btn-block" data-plan="${p.id}">${t('prStart')}</button>
      </div>`).join('');
    // booking selects
    const days = $('#bookDay'), times = $('#bookTime');
    const loc = L() === 'ar' ? 'ar-EG' : 'en-GB';
    days.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i + 1);
      const label = d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'short' });
      return `<option>${label}</option>`;
    }).join('');
    times.innerHTML = [11, 13, 15, 17, 19, 21].map((h) => {
      const d = new Date(); d.setHours(h, 0, 0, 0);
      return `<option>${d.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' })} ${L() === 'ar' ? '(بتوقيت القاهرة)' : '(Cairo time)'}</option>`;
    }).join('');
  }
  function renderCurrency() {
    const sel = $('#curSelect'); if (!sel) return;
    sel.innerHTML = Object.entries(CURRENCIES).map(([k, c]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${k} — ${c[L()]}</option>`).join('');
  }
  function initPricing() {
    if (!$('#pricingGrid')) return;
    renderCurrency();
    $('#curSelect').addEventListener('change', (e) => {
      cur = e.target.value; store.set('currency', cur);
      renderPricing();
      if (est.last && !$('#estResult').hidden) renderEstimate(est.last);
    });
    renderPricing();
    $('#pricingGrid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-plan]'); if (!b) return;
      const p = PRICING.find((x) => x.id === b.dataset.plan);
      wa(`${t('prWa')} "${p[L()].name}" (${t('prFrom')} ${money(p.from)})`);
      notifyLead('pricing', `${p.en.name} — from ${usd(p.from)}`);
    });
    $('#bookForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = `${t('bookWa')} — ${t('bookAt')} ${$('#bookDay').value} ${t('bookHour')} ${$('#bookTime').value}`;
      wa(msg); notifyLead('booking', msg);
    });
  }

  /* =========================================================
     "What I'm working on" — latest pushed public repos (real, live)
     ========================================================= */
  let recent = null;
  function renderRecent() {
    const box = $('#ghNow'); if (!box || !recent) return;
    const ago = (d) => {
      const m = Math.max(0, (Date.now() - new Date(d)) / 60000), f = t('ghAgo');
      const n = m < 2 ? 0 : m < 60 ? [1, Math.round(m)] : m < 1440 ? [2, Math.round(m / 60)] : m < 43200 ? [3, Math.round(m / 1440)] : [4, Math.round(m / 43200)];
      return n === 0 ? f[0] : f[n[0]].replace('{n}', fmt(n[1]));
    };
    const pid = (name) => { const p = PROJECTS.find((x) => x.links && x.links.github && x.links.github.toLowerCase().endsWith('/' + name.toLowerCase())); return p; };
    box.innerHTML = recent.map((r) => {
      const p = pid(r.name);
      const title = p ? p.title[L()] : r.name.replace(/[-_]/g, ' ');
      const inner = `<span class="now-dot"></span><span class="now-main"><b>${esc(title)}</b><small>${esc(r.language || 'Code')} · ${ago(r.pushed_at)}</small></span>`;
      return p ? `<button type="button" class="now-item" data-open="${p.id}">${inner}</button>` : `<a class="now-item" href="${r.html_url}" target="_blank" rel="noopener">${inner}</a>`;
    }).join('');
    box.closest('.gh-now').hidden = false;
  }
  function loadRecent() {
    fetch('https://api.github.com/users/HEMASAMIR/repos?sort=pushed&per_page=12').then((r) => (r.ok ? r.json() : null)).then((list) => {
      if (!Array.isArray(list)) return;
      recent = list.filter((r) => !r.fork && r.name !== 'HEMASAMIR.github.io' && r.name !== 'HEMASAMIR' && !/privacy/i.test(r.name)).slice(0, 4);
      renderRecent();
    }).catch(() => {});
  }

  /* =========================================================
     Interactive Mobile Simulator
     ========================================================= */
  let simActiveApp = SIMULATOR_APPS[0];
  let simActiveScreen = simActiveApp.screens[0];

  function renderSimulator() {
    const tabsContainer = $('#simApps');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = SIMULATOR_APPS.map((app) => `
      <button type="button" class="sim-app-tab ${app.id === simActiveApp.id ? 'active' : ''}" data-sim-app="${app.id}">
        <img src="${app.icon}" alt="" />
        <span>${esc(app.name[L()])}</span>
      </button>
    `).join('');

    const diText = $('#simDiText');
    if (diText) diText.textContent = `${simActiveApp.name[L()].split('—')[0].trim()}`;

    const img = $('#simScreenImg');
    const badge = $('#simScreenBadge');
    if (img && simActiveScreen) {
      img.classList.add('switching');
      setTimeout(() => {
        img.src = simActiveScreen.img;
        if (badge) badge.textContent = simActiveScreen.badge;
        img.classList.remove('switching');
      }, 120);
    }

    const bottomBar = $('#simBottomBar');
    if (bottomBar) {
      bottomBar.innerHTML = simActiveApp.screens.map((s) => `
        <button type="button" class="sim-btn-tab ${s.id === simActiveScreen.id ? 'active' : ''}" data-screen-id="${s.id}">
          <svg viewBox="0 0 24 24" class="i"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M15 3v18"/></svg>
          <span>${esc(s.label[L()])}</span>
        </button>
      `).join('');
    }

    const cardIcon = $('#simCardIcon');
    const cardTitle = $('#simCardTitle');
    const cardRating = $('#simCardRating');
    const cardTag = $('#simCardTag');
    const cardDesc = $('#simCardDesc');
    const storeLink = $('#simStoreLink');
    const storeBtnText = $('#simStoreBtnText');

    if (cardIcon) cardIcon.src = simActiveApp.icon;
    if (cardTitle) cardTitle.textContent = simActiveApp.name[L()];
    if (cardRating) cardRating.textContent = simActiveApp.rating;
    if (cardTag) cardTag.textContent = simActiveApp.tag[L()];
    if (cardDesc) cardDesc.textContent = simActiveApp.desc[L()];

    if (storeLink) {
      if (simActiveApp.storeUrl) {
        storeLink.href = simActiveApp.storeUrl;
        storeLink.style.display = 'inline-flex';
        if (storeBtnText) storeBtnText.textContent = simActiveApp.storeName;
      } else {
        storeLink.style.display = 'none';
      }
    }
  }

  function initSimulator() {
    const wrap = $('#simPhoneWrap');
    const phone = $('#simPhone');
    if (!wrap || !phone) return;

    renderSimulator();

    $('#simApps')?.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-sim-app]');
      if (!tab) return;
      const app = SIMULATOR_APPS.find((a) => a.id === tab.dataset.simApp);
      if (app && app.id !== simActiveApp.id) {
        simActiveApp = app;
        simActiveScreen = app.screens[0];
        renderSimulator();
      }
    });

    $('#simBottomBar')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-screen-id]');
      if (!btn) return;
      const scr = simActiveApp.screens.find((s) => s.id === btn.dataset.screenId);
      if (scr && scr.id !== simActiveScreen.id) {
        simActiveScreen = scr;
        renderSimulator();
      }
    });

    if (window.matchMedia && matchMedia('(min-width: 900px)').matches) {
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = -y * 12;
        const ry = x * 12;
        phone.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
      });
      wrap.addEventListener('mouseleave', () => {
        phone.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      });
    }

    const fpsEl = $('#simFps');
    if (fpsEl) {
      setInterval(() => {
        const fps = (59.8 + Math.random() * 0.2).toFixed(1);
        fpsEl.textContent = `${fps} FPS`;
      }, 2500);
    }
  }

  /* =========================================================
     AI Architecture & Tech Stack Advisor
     ========================================================= */
  let advState = {
    type: 'mobile',
    priority: 'speed',
    features: ['payments', 'realtime']
  };

  function renderAdvisorInputs() {
    const typesGrid = $('#advTypes');
    const priGrid = $('#advPriorities');
    const featChips = $('#advFeatures');
    if (!typesGrid || !priGrid || !featChips) return;

    typesGrid.innerHTML = ADVISOR_DATA.steps.type.options.map((opt) => `
      <button type="button" class="adv-opt-card ${opt.id === advState.type ? 'active' : ''}" data-adv-type="${opt.id}">
        <span class="opt-icon">${opt.icon}</span>
        <span>${esc(opt[L()])}</span>
      </button>
    `).join('');

    priGrid.innerHTML = ADVISOR_DATA.steps.priority.options.map((opt) => `
      <button type="button" class="adv-opt-card ${opt.id === advState.priority ? 'active' : ''}" data-adv-pri="${opt.id}">
        <span class="opt-icon">${opt.icon}</span>
        <span>${esc(opt[L()])}</span>
      </button>
    `).join('');

    featChips.innerHTML = ADVISOR_DATA.steps.features.options.map((opt) => `
      <button type="button" class="adv-chip ${advState.features.includes(opt.id) ? 'active' : ''}" data-adv-feat="${opt.id}">
        <span>${opt.icon}</span>
        <span>${esc(opt[L()])}</span>
      </button>
    `).join('');
  }

  function generateBlueprint() {
    const isMobile = advState.type === 'mobile' || advState.type === 'system';
    const isWeb = advState.type === 'store' || advState.type === 'saas' || advState.type === 'system';
    const isOffline = advState.priority === 'offline';

    let frontend = '', stateArch = '', backend = '', devOps = '', rationale = '', similar = '';

    if (isMobile && !isWeb) {
      frontend = 'Flutter 3.24+ (Dart) with Impeller Graphics Engine';
      stateArch = 'Clean Architecture (Presentation / Domain / Data) + BLoC State Management';
      backend = isOffline ? 'Hive / Isar Local Storage + Supabase PostgreSQL (RLS)' : 'Supabase Realtime + Edge Functions';
      devOps = 'Fastlane + GitHub Actions CI/CD to App Store & Google Play';
      rationale = L() === 'ar'
        ? 'اختيار Flutter مع محرك Impeller يمنحك سرعة 60 FPS حقيقية بكود موحد للمنصتين ويوفر أكثر من 40% من تكلفة الصيانة مستقبلاً. استخدام Clean Architecture يفصل البيانات عن الواجهة لسهولة التوسع المستقبلي.'
        : 'Flutter with the Impeller engine delivers genuine 60 FPS native speed with a single codebase, slashing maintenance overhead by 40%. Clean Architecture decouples UI from business logic.';
      similar = 'QuickIn & Rafiq Muslim (Live on App Store & Google Play)';
    } else if (isWeb && !isMobile) {
      frontend = 'Next.js 16 (React 19) + Tailwind CSS + Framer Motion';
      stateArch = 'Server Components (RSC) + Zustand / TanStack Query';
      backend = 'Supabase PostgreSQL + Prisma / Django REST API';
      devOps = 'Vercel Edge Deployment + Automated Lighthouse CI';
      rationale = L() === 'ar'
        ? 'Next.js يضمن سرعة تحميل فائقة وتصدر محركات البحث (SEO) مع دعم كامل للغة العربية RTL والدفع الإلكتروني السلس.'
        : 'Next.js ensures ultra-fast page speeds, top SEO rankings, full Arabic RTL support, and seamless e-commerce conversions.';
      similar = 'Manara SaaS Platform & Incense Luxury Store';
    } else {
      frontend = 'Flutter (Mobile iOS/Android) + Next.js 16 (Admin & Web Portal)';
      stateArch = 'Clean Architecture + Repository Pattern across all platforms';
      backend = 'Unified Supabase PostgreSQL with Realtime Sync & Row-Level Security';
      devOps = 'Multi-target CI/CD: Fastlane for mobile + Vercel for web studio';
      rationale = L() === 'ar'
        ? 'النظام المتكامل يتشارك قاعدة بيانات واحدة لحظية (Realtime)، مما يتيح للإدارة متابعة الطلبات والعملاء فوراً مع وصول الإشعارات لتطبيقات الموبايل بدون أي تأخير.'
        : 'Unified realtime database synchronizes mobile apps with the admin studio instantly, providing zero-latency orders and live updates.';
      similar = 'Manara Education SaaS & Multi-role Delivery Suite';
    }

    const bpBox = $('#advBlueprint');
    if (!bpBox) return;

    bpBox.innerHTML = `
      <div class="bp-head">
        <h3><span class="ai-spark">✨</span> ${t('advCardTitle')}</h3>
        <span class="bp-badge-ready">PROD-READY ARCHITECTURE</span>
      </div>
      <div class="bp-layers">
        <div class="bp-layer">
          <small>${t('advFrontend')}</small>
          <strong>${esc(frontend)}</strong>
          <span>${isMobile ? 'iOS & Android Native 60 FPS' : 'SSR & Global Edge CDN'}</span>
        </div>
        <div class="bp-layer">
          <small>${t('advState')}</small>
          <strong>${esc(stateArch)}</strong>
          <span>SOLID Principles & Repository Pattern</span>
        </div>
        <div class="bp-layer">
          <small>${t('advBackend')}</small>
          <strong>${esc(backend)}</strong>
          <span>Row-Level Security & Encrypted Tokens</span>
        </div>
        <div class="bp-layer">
          <small>${t('advDevOps')}</small>
          <strong>${esc(devOps)}</strong>
          <span>Automated Store Builds & Testing</span>
        </div>
      </div>
      <div class="bp-rationale">
        <strong>${t('advWhy')}</strong>
        <p>${esc(rationale)}</p>
      </div>
      <div class="bp-footer">
        <div class="bp-proof">
          <span>${t('advSimilar')}</span>
          <b>${esc(similar)}</b>
        </div>
        <button type="button" class="btn btn-wa btn-sm" id="advBookBtn">
          <svg class="i fill" viewBox="0 0 24 24"><use href="#wa-path"/></svg>
          <span>${t('advBookWhatsapp')}</span>
        </button>
      </div>
    `;
    bpBox.hidden = false;
    bpBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    $('#advBookBtn')?.addEventListener('click', () => {
      const text = `${t('waIntro')}\n${L() === 'ar' ? 'أريد مناقشة هذا المعمار التقني المقترح لمشروعي:' : 'I want to discuss this architecture blueprint for my project:'}\n- Frontend: ${frontend}\n- Architecture: ${stateArch}\n- Backend: ${backend}`;
      wa(text);
      notifyLead('advisor', `${frontend} / ${stateArch}`);
    });
  }

  function initAdvisor() {
    if (!$('#advTypes')) return;
    renderAdvisorInputs();

    $('#advTypes').addEventListener('click', (e) => {
      const card = e.target.closest('[data-adv-type]');
      if (!card) return;
      advState.type = card.dataset.advType;
      renderAdvisorInputs();
    });

    $('#advPriorities').addEventListener('click', (e) => {
      const card = e.target.closest('[data-adv-pri]');
      if (!card) return;
      advState.priority = card.dataset.advPri;
      renderAdvisorInputs();
    });

    $('#advFeatures').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-adv-feat]');
      if (!chip) return;
      const feat = chip.dataset.advFeat;
      if (advState.features.includes(feat)) {
        advState.features = advState.features.filter((f) => f !== feat);
      } else {
        advState.features.push(feat);
      }
      renderAdvisorInputs();
    });

    $('#advGenerate')?.addEventListener('click', () => {
      generateBlueprint();
    });
  }

  /* =========================================================
     Smart Interactive FAQ
     ========================================================= */
  function renderFaq() {
    const acc = $('#faqAccordion');
    if (!acc) return;
    acc.innerHTML = FAQ_DATA.map((item, idx) => `
      <div class="faq-item ${idx === 0 ? 'active' : ''}" data-faq-index="${idx}">
        <button type="button" class="faq-q" aria-expanded="${idx === 0}">
          <span>${esc(item.q[L()])}</span>
          <svg class="i faq-chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="faq-a">
          <p>${esc(item.a[L()])}</p>
        </div>
      </div>
    `).join('');
  }

  function initFaq() {
    const acc = $('#faqAccordion');
    if (!acc) return;
    renderFaq();

    acc.addEventListener('click', (e) => {
      const q = e.target.closest('.faq-q');
      if (!q) return;
      const item = q.closest('.faq-item');
      const wasActive = item.classList.contains('active');
      $$('.faq-item', acc).forEach((el) => el.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });

    const form = $('#faqAskForm');
    const reply = $('#faqAskReply');
    if (form && reply) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = $('#faqAskInput');
        const q = input.value.trim();
        if (!q) return;

        reply.hidden = false;
        reply.innerHTML = `<div class="typing"><i></i><i></i><i></i></div>`;

        try {
          const res = await callApi('/api/ai', { mode: 'chat', lang: L(), messages: [{ role: 'user', content: q }] }, 15000);
          if (res && res.reply) {
            reply.innerHTML = `<p>${esc(res.reply)}</p><button type="button" class="btn btn-wa btn-sm" style="align-self:flex-start; margin-top:8px" id="faqWaReplyBtn"><svg class="i fill" viewBox="0 0 24 24"><use href="#wa-path"/></svg> <span>${t('ctaWhats')}</span></button>`;
            $('#faqWaReplyBtn')?.addEventListener('click', () => wa(`${t('waIntro')}\n${q}`));
            return;
          }
        } catch (_) {}

        setTimeout(() => {
          let ans = L() === 'ar'
            ? 'سؤال ممتاز! م. إبراهيم يضمن تنفيذ كل متطلبات مشروعك وفق أعلى معايير الجودة مع تسليم السورس كود كاملاً ودعم فني مستمر بعد الإطلاق. يمكنك التواصل معه مباشرة عبر واتساب لمناقشة التفاصيل.'
            : 'Great question! Eng. Ebrahim ensures top-tier development standards with 100% source code ownership and dedicated warranty support. Contact him on WhatsApp for specific details.';

          const lq = q.toLowerCase();
          if (lq.includes('دفع') || lq.includes('فلوس') || lq.includes('ميزانية') || lq.includes('pay') || lq.includes('price')) {
            ans = L() === 'ar'
              ? 'نظام الدفع يتم على دفعات مجدولة (Milestones) تبدأ بدفعة مقدمة بسيطة وتوزع باقي الدفعات مع تسليم مراحل حقيقية ومعاينتها بنفسك على موبايلك.'
              : 'Payments are milestone-based, starting with an initial deposit and remaining payments tied directly to verifiable project milestones.';
          } else if (lq.includes('وقت') || lq.includes('مدة') || lq.includes('أسبوع') || lq.includes('time') || lq.includes('week')) {
            ans = L() === 'ar'
              ? 'مدة التنفيذ تتراوح بين أسبوعين للمواقع والمتاجر، وحتى 4 إلى 8 أسابيع لتطبيقات الموبايل المتكاملة، مع التزام تام بالموعد النهائي.'
              : 'Timelines range from 2 weeks for websites to 4–8 weeks for comprehensive mobile apps, with strict delivery deadlines.';
          }

          reply.innerHTML = `
            <p>${esc(ans)}</p>
            <button type="button" class="btn btn-wa btn-sm" style="align-self:flex-start; margin-top:8px" id="faqWaReplyBtn">
              <svg class="i fill" viewBox="0 0 24 24"><use href="#wa-path"/></svg>
              <span>${t('ctaWhats')}</span>
            </button>
          `;
          $('#faqWaReplyBtn')?.addEventListener('click', () => wa(`${t('waIntro')}\n${q}`));
        }, 500);
      });
    }
  }

  /* ---------- Language changes ---------- */
  PF.onLang(() => {
    renderRecent(); renderCurrency();
    renderEstOptions(); renderExamples(); renderPricing();
    renderSimulator(); renderAdvisorInputs(); renderFaq();
    if (est.last && !$('#estResult').hidden && est.last.offline) renderEstimate(offlineEstimate($('#estIdea').value));
    const fresh = chat.history.length <= 1; if (fresh) chatReset(); else chatRender();
  });

  /* ---------- Init ---------- */
  initSearch();
  initEstimator();
  renderExamples();
  initChat();
  initPricing();
  initSimulator();
  initAdvisor();
  initFaq();
  loadRatings();
  loadRecent();
})();
