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
        <div class="est-kpi cost"><span>${t('estCost')}</span><b>${usd(e.price_usd.min)} – ${usd(e.price_usd.max)}</b></div>
        <div class="est-kpi"><span>${t('estTimeline')}</span><b>${fmt(e.timeline_weeks.min)}–${fmt(e.timeline_weeks.max)} <small>${t('estWeeks')}</small></b></div>
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
      `💰 ${t('estCost')}: ${usd(e.price_usd.min)} – ${usd(e.price_usd.max)}`,
      `⏱ ${t('estTimeline')}: ${e.timeline_weeks.min}–${e.timeline_weeks.max} ${t('estWeeks')}`,
      `📱 ${e.platforms.join(' · ')} — ${e.screens} ${t('estScreens')}`, '',
      `✅ ${t('estFeatures')}:`, ...e.features.map((f) => `• ${f.name}${f.priority === 'must' ? '' : ` (${t('estNice')})`}`), '',
      `🛠 ${e.tech.join(', ')}`,
    ];
    return lines.join('\n');
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
<div class="kpis"><div class="kpi cost"><span>${t('estCost')}</span><b>${usd(e.price_usd.min)} – ${usd(e.price_usd.max)}</b></div>
<div class="kpi"><span>${t('estTimeline')}</span><b>${e.timeline_weeks.min}–${e.timeline_weeks.max} ${t('estWeeks')}</b></div>
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
      reply = ar ? `الأسعار بتبدأ من ${usd(PRICING[0].from)} للمواقع، و${usd(PRICING[1].from)} لتطبيقات الموبايل والمتاجر، و${usd(PRICING[2].from)} للأنظمة المتكاملة. جرّب حاسبة التكلفة بالذكاء الاصطناعي في الصفحة وهتطلعلك خطة بالسعر لفكرتك بالظبط.`
        : `Prices start at ${usd(PRICING[0].from)} for websites, ${usd(PRICING[1].from)} for mobile apps and stores, and ${usd(PRICING[2].from)} for complete systems. Try the AI cost estimator on this page for an exact plan for your idea.`;
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
        <div class="price-amount"><small>${t('prFrom')}</small><b>${usd(p.from)}</b><span>${p.weeks} ${t('prWeeks')}</span></div>
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
  function initPricing() {
    if (!$('#pricingGrid')) return;
    renderPricing();
    $('#pricingGrid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-plan]'); if (!b) return;
      const p = PRICING.find((x) => x.id === b.dataset.plan);
      wa(`${t('prWa')} "${p[L()].name}" (${t('prFrom')} ${usd(p.from)})`);
      notifyLead('pricing', `${p.en.name} — from ${usd(p.from)}`);
    });
    $('#bookForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = `${t('bookWa')} — ${t('bookAt')} ${$('#bookDay').value} ${t('bookHour')} ${$('#bookTime').value}`;
      wa(msg); notifyLead('booking', msg);
    });
  }

  /* ---------- Language changes ---------- */
  PF.onLang(() => {
    renderEstOptions(); renderExamples(); renderPricing();
    if (est.last && !$('#estResult').hidden && est.last.offline) renderEstimate(offlineEstimate($('#estIdea').value));
    const fresh = chat.history.length <= 1; if (fresh) chatReset(); else chatRender();
  });

  /* ---------- Init ---------- */
  initSearch();
  initEstimator();
  renderExamples();
  initChat();
  initPricing();
  loadRatings();
})();
