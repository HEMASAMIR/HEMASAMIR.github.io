(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  let lang = root.lang === 'en' ? 'en' : 'ar';
  const t = (k) => I18N[lang][k];

  /* ---------- Icons ---------- */
  const ICONS = {
    phone: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/>',
    web: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    dash: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    offline: '<path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.17-2.8M19 13a10 10 0 0 0-2.4-1.7M2 8.82a15 15 0 0 1 4.17-2.65M22 8.82A15 15 0 0 0 11.5 5M2 2l20 20"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    images: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  };
  const BRAND = {
    apple: 'M15.53 3.83c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.8-3.53 1.82-.78.9-1.46 2.34-1.27 3.71 1.34.1 2.71-.69 3.55-1.7M12.15 6.9c-.95 0-2.41-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.2 3.09 3.79 3.04 1.52-.07 2.09-.99 3.93-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.15-1.69 1.63-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.15-3.68 1.09-4.61 1.09z',
    play: 'M22.02 13.3 18.1 15.52l-3.52-3.5 3.55-3.52 3.89 2.2a1.49 1.49 0 0 1 0 2.6zM1.34.92a1.49 1.49 0 0 0-.11.57v21.02c0 .22.04.42.12.6L12.5 12 1.34.92zm12.2 10.07 3.26-3.24L3.45.2a1.47 1.47 0 0 0-.95-.18l11.04 10.97zm0 2.07-11 10.93c.3.04.61-.02.9-.18l13.33-7.54-3.23-3.21z',
    github: 'M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3',
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${ICONS[n]}</svg>`;
  const brand = (n) => `<svg class="i fill" viewBox="0 0 24 24"><path d="${BRAND[n]}"/></svg>`;

  /* ---------- Covers (device mockups) ---------- */
  function cover(p, big) {
    const img = (src, extra = '') => `<img src="${src}" alt="" loading="lazy" ${extra}/>`;
    let inner = '';
    switch (p.device) {
      case 'browser':
        inner = `<div class="browser mock-browser"><div class="browser-bar"><i></i><i></i><i></i></div><div class="browser-body">
          ${p.coverDark ? img(p.cover, 'class="theme-light-only"') + img(p.coverDark, 'class="theme-dark-only"') : img(p.cover)}
        </div></div>`;
        break;
      case 'phone':
      case 'poster': {
        const s = p.shots.slice(0, 3);
        inner = `<div class="fan fan-${p.device}">${s.map((src, i) => `<div class="${p.device === 'phone' ? 'phone' : 'poster'} f${i}">${p.device === 'phone' ? '<div class="phone-notch"></div>' : ''}${img(src)}</div>`).join('')}</div>`;
        break;
      }
      case 'tablet': {
        const s = p.shots.slice(0, big ? 3 : 2);
        inner = `<div class="fan fan-tablet">${s.map((src, i) => `<div class="tablet f${i}">${img(src)}</div>`).join('')}</div>`;
        break;
      }
      case 'art':
        inner = `<img class="cover-art-img" src="${p.cover}" alt="" loading="lazy"/>`;
        break;
      case 'icon':
        inner = `<div class="cover-icon"><img src="${p.icon}" alt="" loading="lazy"/><span>${p.title[lang]}</span></div>`;
        break;
      case 'logo':
        inner = `<div class="cover-logo">${img(p.cover)}</div>`;
        break;
      case 'portrait':
        inner = `<div class="cover-portrait">${img(p.cover)}<div class="cp-text"><b>Herr Mogahed</b><span>Deutsch · A1 → C1</span></div></div>`;
        break;
    }
    return `<div class="cover cover-${p.device}" style="--accent:${p.accent}">${inner}</div>`;
  }

  function storeLinks(p, small) {
    const L = p.links || {};
    const cls = small ? 'btn btn-ghost btn-sm' : 'btn btn-ghost';
    let h = '';
    if (L.appstore) h += `<a class="${cls} store-btn" href="${L.appstore}" target="_blank" rel="noopener">${brand('apple')}<span>${t('appStore')}</span></a>`;
    if (L.play) h += `<a class="${cls} store-btn" href="${L.play}" target="_blank" rel="noopener">${brand('play')}<span>${t('googlePlay')}</span></a>`;
    if (L.site) h += `<a class="${cls}" href="${L.site}" target="_blank" rel="noopener">${icon('ext')}<span>${t('liveSite')}</span></a>`;
    if (L.github) h += `<a class="${cls}" href="${L.github}" target="_blank" rel="noopener">${brand('github')}<span>${t('code')}</span></a>`;
    return h;
  }

  const badges = (p) =>
    (p.live ? `<span class="badge badge-live"><span class="dot-live"></span>${p.links && (p.links.appstore || p.links.play) ? t('onStores') : t('live')}</span>` : '') +
    p.cat.map((c) => `<span class="badge">${t(c)}</span>`).join('');

  /* ---------- Featured ---------- */
  function renderFeatured() {
    const list = PROJECTS.filter((p) => p.featured);
    $('#featured').innerHTML = list.map((p, i) => `
      <article class="feature reveal ${i % 2 ? 'alt' : ''}" style="--accent:${p.accent}">
        <button class="feature-visual" data-open="${p.id}" aria-label="${p.title[lang]}">
          ${cover(p, true)}
          <span class="view-hint">${icon('images')} ${p.shots.length} ${t('screenshots')}</span>
        </button>
        <div class="feature-body">
          <span class="feature-num">${String(i + 1).padStart(2, '0')}</span>
          <div class="badges">${badges(p)}</div>
          <span class="kicker">${p.kicker[lang]}</span>
          <h3>${p.title[lang]}</h3>
          <p>${p.desc[lang]}</p>
          <ul class="checks">${p.features[lang].slice(0, 4).map((f) => `<li>${icon('check')}<span>${f}</span></li>`).join('')}</ul>
          <div class="tags">${p.tags.map((x) => `<span>${x}</span>`).join('')}</div>
          <div class="actions">
            <button class="btn btn-primary" data-open="${p.id}">${t('viewDetails')} ${icon('arrow', 'flip')}</button>
            ${storeLinks(p)}
          </div>
        </div>
      </article>`).join('');
  }

  /* ---------- Grid ---------- */
  let filter = 'all';
  let expanded = false;
  const PAGE = 9;
  function renderGrid() {
    const all = PROJECTS.filter((p) => filter === 'all' || (filter === 'live' ? p.live : p.cat.includes(filter)));
    const list = expanded ? all : all.slice(0, PAGE);
    const more = $('#showMore');
    more.hidden = all.length <= PAGE;
    more.querySelector('span').textContent = expanded ? t('showLess') : `${t('showMore')} (${all.length - PAGE})`;
    more.classList.toggle('open', expanded);
    $('#grid').innerHTML = list.map((p, i) => `
      <article class="card reveal in" style="animation-delay:${(i % PAGE) * 70}ms" data-open="${p.id}" tabindex="0" role="button" aria-label="${p.title[lang]}">
        ${cover(p, false)}
        <div class="card-body">
          <div class="badges">${badges(p)}</div>
          <h3>${p.title[lang]}</h3>
          <p>${p.kicker[lang]}</p>
          <div class="tags">${p.tags.slice(0, 3).map((x) => `<span>${x}</span>`).join('')}</div>
        </div>
        <span class="card-arrow">${icon('arrow', 'flip')}</span>
      </article>`).join('');
  }

  /* ---------- Services / process / about ---------- */
  function renderStatic() {
    $('#services-grid').innerHTML = SERVICES.map((s, i) => `
      <div class="service reveal" style="--d:${i * 60}ms">
        <span class="service-ico">${icon(s.icon)}</span>
        <h3>${s[lang][0]}</h3><p>${s[lang][1]}</p>
      </div>`).join('');
    $('#process-list').innerHTML = PROCESS.map((s, i) => `
      <li class="step reveal" style="--d:${i * 80}ms">
        <span class="step-num">0${i + 1}</span>
        <h3>${s[lang][0]}</h3><p>${s[lang][1]}</p>
      </li>`).join('');
    $("#why-list").innerHTML = WHY.map((w, i) => `<div class="why-item reveal" style="--d:${i * 70}ms">${icon(w.icon)}<span>${w[lang]}</span></div>`).join('');
    $('#stack').innerHTML = STACK.map((s) => `<span>${s}</span>`).join('');
    $('#footServices').innerHTML = SERVICES.map((s) => `<li><a href="#services">${s[lang][0]}</a></li>`).join('');
    // cover wall: two rows scrolling in opposite directions
    const covers = PROJECTS.filter((p) => p.device === 'art' || p.device === 'browser');
    const half = Math.ceil(covers.length / 2);
    const rowHTML = (arr) => { const h = arr.map((p) => `<button class="wall-item" data-open="${p.id}" aria-label="${p.title[lang]}"><img src="${p.cover}" alt="" loading="lazy"/><span>${p.title[lang]}</span></button>`).join(''); return h + h; };
    $('#wallA').innerHTML = rowHTML(covers.slice(0, half));
    $('#wallB').innerHTML = rowHTML(covers.slice(half));
    $('#projCount').textContent = PROJECTS.length;
    const m = STACK.map((s) => `<span>${s}</span><i>✦</i>`).join('');
    $('#marquee').innerHTML = m + m;

    $('#typeSelect').innerHTML = t('types').map((x) => `<option>${x}</option>`).join('');
    $('#budgetSelect').innerHTML = t('budgets').map((x) => `<option>${x}</option>`).join('');
  }

  /* ---------- Language ---------- */
  function applyLang(l) {
    lang = l;
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.title = l === 'ar' ? 'م. إبراهيم سمير | مطوّر تطبيقات ومواقع' : 'Eng. Ebrahim Samir | Mobile & Web Developer';
    renderFeatured();
    renderGrid();
    renderStatic();
    observeReveals();
    restartTyped();
    if (current) openModal(current.id, gIndex);
  }

  /* ---------- Theme ---------- */
  function applyTheme(th) {
    root.setAttribute('data-theme', th);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = th === 'dark' ? '#070b14' : '#f7f8fb';
  }

  /* ---------- Typed text ---------- */
  let typedTimer;
  function restartTyped() {
    clearTimeout(typedTimer);
    const el = $('#typed');
    const words = t('typed');
    let w = 0, c = 0, del = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = words[0]; return; }
    (function tick() {
      const word = words[w];
      el.textContent = word.slice(0, c);
      if (!del && c < word.length) { c++; typedTimer = setTimeout(tick, 55); }
      else if (!del) { del = true; typedTimer = setTimeout(tick, 1600); }
      else if (c > 0) { c--; typedTimer = setTimeout(tick, 28); }
      else { del = false; w = (w + 1) % words.length; typedTimer = setTimeout(tick, 250); }
    })();
  }

  /* ---------- Reveal on scroll ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  function observeReveals() {
    $$('.reveal:not(.in)').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));
  }

  /* ---------- Counters ---------- */
  function counters() {
    const els = $$('[data-count]');
    const run = (el) => {
      const dur = 1400, t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(+el.dataset.count * (1 - Math.pow(1 - k, 3))); // re-read: live GitHub count may arrive mid-animation
        if (k < 1) requestAnimationFrame(step); else el.dataset.done = '1';
      };
      requestAnimationFrame(step);
    };
    if (!io) return els.forEach((el) => (el.textContent = el.dataset.count));
    const cio = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } }), { threshold: 0.6 });
    els.forEach((el) => cio.observe(el));
  }

  /* ---------- Modal gallery ---------- */
  const modal = $('#modal');
  let current = null, gIndex = 0, lastFocus = null;

  function openModal(id, index = 0) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    if (!current) lastFocus = document.activeElement;
    current = p;
    const tall = ['phone', 'poster', 'tablet'].includes(p.device) || p.device === 'icon';
    modal.classList.toggle('tall', tall);
    $('#gThumbs').innerHTML = p.shots.length > 1
      ? p.shots.map((s, i) => `<button class="thumb" data-i="${i}"><img src="${s}" alt="" loading="lazy"/></button>`).join('')
      : '';
    $('#gPrev').hidden = $('#gNext').hidden = p.shots.length < 2;
    $('#mInfo').innerHTML = `
      <div class="badges">${badges(p)}</div>
      <span class="kicker">${p.kicker[lang]}</span>
      <h3>${p.title[lang]}</h3>
      <p>${p.desc[lang]}</p>
      ${p.concept ? `<p class="concept-note">${icon('images')}<span>${t('concept')}</span></p>` : ''}
      <h4>${t('features')}</h4>
      <ul class="checks">${p.features[lang].map((f) => `<li>${icon('check')}<span>${f}</span></li>`).join('')}</ul>
      <h4>${t('tech')}</h4>
      <div class="tags">${p.tags.map((x) => `<span>${x}</span>`).join('')}</div>
      <div class="actions">${storeLinks(p, true)}</div>`;
    showShot(index);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    $('.modal-close', modal).focus({ preventScroll: true });
  }
  function showShot(i) {
    const p = current;
    gIndex = (i + p.shots.length) % p.shots.length;
    $('#gStage').innerHTML = `<img src="${p.shots[gIndex]}" alt="${p.title[lang]} ${gIndex + 1}" class="${p.device === 'icon' ? 'is-icon' : ''}"/>`;
    $$('.thumb', modal).forEach((b, k) => b.classList.toggle('active', k === gIndex));
    const at = $(`.thumb[data-i="${gIndex}"]`, modal);
    if (at) at.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    current = null;
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- Events ---------- */
  function bind() {
    document.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (o && !e.target.closest('a')) { e.preventDefault(); openModal(o.dataset.open); return; }
      if (e.target.closest('[data-close]')) closeModal();
      const th = e.target.closest('.thumb');
      if (th) showShot(+th.dataset.i);
    });
    document.addEventListener('keydown', (e) => {
      if (current) {
        if (e.key === 'Escape') closeModal();
        const rtl = root.dir === 'rtl';
        if (e.key === 'ArrowRight') showShot(gIndex + (rtl ? -1 : 1));
        if (e.key === 'ArrowLeft') showShot(gIndex + (rtl ? 1 : -1));
      } else if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card[data-open]')) {
        e.preventDefault(); openModal(e.target.dataset.open);
      }
    });
    $('#gPrev').addEventListener('click', () => showShot(gIndex - 1));
    $('#gNext').addEventListener('click', () => showShot(gIndex + 1));

    // swipe in gallery
    let sx = null;
    $('#gStage').addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
    $('#gStage').addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) showShot(gIndex + (dx < 0 ? 1 : -1) * (root.dir === 'rtl' ? -1 : 1));
      sx = null;
    });

    $('#filters').addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      filter = b.dataset.filter;
      expanded = false;
      $$('#filters .chip').forEach((c) => c.classList.toggle('active', c === b));
      renderGrid();
    });
    $('#showMore').addEventListener('click', () => {
      expanded = !expanded;
      renderGrid();
      if (!expanded) $('#projects').scrollIntoView({ behavior: 'smooth' });
    });

    $('#langBtn').addEventListener('click', () => {
      const l = lang === 'ar' ? 'en' : 'ar';
      store.set('lang', l);
      applyLang(l);
    });
    $('#themeBtn').addEventListener('click', () => {
      const th = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      store.set('theme', th);
      applyTheme(th);
    });

    // mobile menu
    const header = $('#header');
    $('#menuBtn').addEventListener('click', () => header.classList.toggle('menu-open'));
    $$('#nav a').forEach((a) => a.addEventListener('click', () => header.classList.remove('menu-open')));

    // header shadow + active link
    const links = $$('#nav a[href^="#"]');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const onScroll = () => {
      header.classList.toggle('scrolled', scrollY > 10);
      let cur = null;
      sections.forEach((s) => { if (s.getBoundingClientRect().top < 140) cur = s.id; });
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // contact form -> WhatsApp
    $('#contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const msg = `${t('waIntro')}\n\n${t('waName')}: ${f.get('name')}\n${t('waType')}: ${f.get('type')}\n${t('waBudget')}: ${f.get('budget')}\n${t('waMsg')}: ${f.get('msg')}`;
      window.open('https://wa.me/201055673184?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });

    // hero flip: hover on desktop (CSS); on touch screens tap or auto-flip every few seconds
    const hv = $('#heroVisual');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hv) {
      hv.addEventListener('click', () => hv.classList.toggle('flipped'));
      if (matchMedia('(hover: none)').matches && !reduce) setInterval(() => hv.classList.toggle('flipped'), 4000);
    }

    // scroll progress bar
    const bar = $('#progress');
    if (bar) {
      const top = $('#toTop'), ring = $('#toTopRing'), C = 2 * Math.PI * 21;
      if (ring) ring.style.strokeDasharray = C;
      const upd = () => {
        const h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, scrollY / h) : 0;
        bar.style.transform = `scaleX(${p})`;
        if (top) { top.classList.toggle('show', scrollY > 600); ring.style.strokeDashoffset = C * (1 - p); }
      };
      addEventListener('scroll', upd, { passive: true }); upd();
    }

    // 3D tilt + glare that follows the cursor on project cards
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
      // spotlight that follows the cursor on service / step / why cards
      document.addEventListener('mousemove', (e) => {
        const el = e.target.closest('.service, .step, .why-item');
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });

      // magnetic primary buttons
      document.addEventListener('mousemove', (e) => {
        $$('.btn-primary, .btn-wa, .wa-float').forEach((b) => {
          const r = b.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          const near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 30;
          b.classList.add('magnet');
          b.style.transform = near ? `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)` : '';
        });
      }, { passive: true });

      let active = null;
      const reset = (el) => { el.classList.remove('tilting'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); };
      document.addEventListener('mousemove', (e) => {
        const el = e.target.closest('.card, .feature-visual');
        if (active && active !== el) { reset(active); active = null; }
        if (!el) return;
        active = el;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const max = el.classList.contains('card') ? 8 : 5;
        el.classList.add('tilting');
        el.style.setProperty('--ry', ((x - 0.5) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      }, { passive: true });
      document.addEventListener('mouseleave', () => { if (active) { reset(active); active = null; } });
    }

    // follow OS theme changes when the user hasn't picked one
    if (window.matchMedia) {
      matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
        if (!store.get('theme')) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  }

  /* ---------- Live GitHub numbers ---------- */
  function loadGitHub() {
    const setNum = (id, v) => { const el = document.getElementById(id); if (el) { el.dataset.count = v; if (el.dataset.done || !el.hasAttribute('data-count')) el.textContent = v; } };
    fetch('https://api.github.com/users/HEMASAMIR').then((r) => (r.ok ? r.json() : null)).then((u) => {
      if (!u) return;
      setNum('repoCount', u.public_repos);
      ['ghRepos', 'projCount'].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = u.public_repos; });
      $('#ghFollowers').textContent = u.followers;
      $('#ghYears').textContent = Math.max(1, Math.floor((Date.now() - new Date(u.created_at)) / 31557600000));
    }).catch(() => {});
    fetch('https://api.github.com/users/HEMASAMIR/repos?per_page=100').then((r) => (r.ok ? r.json() : null)).then((repos) => {
      if (!Array.isArray(repos)) return;
      // Flutter apps are often tagged "C++" by GitHub because of their windows/ runner folder
      const map = { Dart: 'Flutter / Dart', 'C++': 'Flutter / Dart' };
      const colors = { 'Flutter / Dart': '#00b4ab', TypeScript: '#3178c6', JavaScript: '#f1e05a', HTML: '#e34c26', Python: '#3572a5', CSS: '#663399' };
      const count = {};
      repos.forEach((r) => { if (!r.language || r.fork) return; const k = map[r.language] || r.language; count[k] = (count[k] || 0) + 1; });
      const total = Object.values(count).reduce((a, b) => a + b, 0);
      if (!total) return;
      const rows = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([k, n]) => ({ k, p: Math.round((n / total) * 100), c: colors[k] || '#94a3b8' }));
      $('#ghLangs').innerHTML = `<div class="lang-bar">${rows.map((r) => `<i style="--w:${r.p}%;--c:${r.c}"></i>`).join('')}</div>
        <span class="lang-legend">${rows.map((r) => `<em style="--c:${r.c}">${r.k} ${r.p}%</em>`).join('')}</span>`;
    }).catch(() => {});
  }

  /* ---------- Init ---------- */
  $('#year').textContent = new Date().getFullYear();
  applyTheme(root.getAttribute('data-theme') || 'light');
  bind();
  applyLang(lang);
  counters();
  loadGitHub();
})();
