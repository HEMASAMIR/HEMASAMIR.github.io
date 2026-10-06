/* Renders a country landing page from LANDINGS[<body data-country>]. */
(function () {
  const slug = document.body.dataset.country;
  const L = LANDINGS[slug];
  if (!L) return;
  const ar = L.lang === 'ar';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const c = CURRENCIES[L.cur];
  const local = (n) => { const v = Math.round((n * c.rate) / c.round) * c.round; const num = v.toLocaleString(ar ? 'ar-EG' : 'en-US'); return c.sym ? `${c.sym}${num}` : `${num} ${c[L.lang]}`; };
  const T = ar
    ? { why: `ليه تختارني لمشروعك في ${L.country}؟`, work: 'من شغلي', prices: 'الباقات', from: 'يبدأ من', faq: 'أسئلة شائعة', cta: 'احسب تكلفة مشروعك بالذكاء الاصطناعي', wa: 'كلّمني واتساب', all: 'شوف كل الأعمال', ctaT: 'جاهز تبدأ؟', ctaS: 'استشارة مجانية + خطة واضحة وعرض سعر خلال 24 ساعة.', approx: 'كل باقة بتتظبط حسب احتياجك — ابعتلنا فكرتك على واتساب', waMsg: `أهلاً م. إبراهيم 👋 أنا من ${L.country} ومهتم بعمل مشروع`, home: 'الرئيسية', other: 'خدماتي في دول تانية' }
    : { why: `Why work with me in ${L.country}?`, work: 'Selected work', prices: 'Packages', from: 'From', faq: 'FAQ', cta: 'Estimate your project with AI', wa: 'Chat on WhatsApp', all: 'See all work', ctaT: 'Ready to start?', ctaS: 'Free consultation + a clear plan and quote within 24 hours.', approx: 'Every package is tailored — send your idea on WhatsApp', waMsg: `Hi Eng. Ebrahim 👋 I am based in ${L.country} and interested in a project`, home: 'Home', other: 'Services in other countries' };
  const P = L.projects.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean);
  const names = { 'saudi-arabia': ['السعودية', 'Saudi Arabia'], uae: ['الإمارات', 'UAE'], kuwait: ['الكويت', 'Kuwait'], qatar: ['قطر', 'Qatar'], egypt: ['مصر', 'Egypt'], germany: ['ألمانيا', 'Germany'] };
  const wa = `https://wa.me/201055673184?text=${encodeURIComponent(T.waMsg)}`;
  const curParam = `?lang=${L.lang}&cur=${L.cur}`;

  document.getElementById('landing').innerHTML = `
    <section class="lp-hero">
      <div class="container">
        <a class="lp-crumb" href="index.html${ar ? '' : '?lang=en'}">← ${T.home}</a>
        <span class="pill"><span class="lp-flag">${L.flag}</span><span>${esc(L.country)}</span></span>
        <h1 class="hero-title"><span>${esc(L.h1[0])}</span><span class="grad-text">${esc(L.h1[1])}</span></h1>
        <p class="hero-sub">${esc(L.sub)}</p>
        <div class="hero-ctas">
          <a class="btn btn-primary btn-lg" href="index.html${curParam}#estimate">✨ ${T.cta}</a>
          <a class="btn btn-wa btn-lg" href="${wa}" target="_blank" rel="noopener">${T.wa}</a>
        </div>
      </div>
    </section>
    <section class="section"><div class="container">
      <div class="section-head in"><h2>${esc(T.why)}</h2></div>
      <div class="lp-points">${L.points.map(([i, h, p]) => `<div class="lp-point"><span>${i}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
    </div></section>
    <section class="section section-alt"><div class="container">
      <div class="section-head in"><h2>${T.work}</h2></div>
      <div class="lp-work">${P.map((p) => `<a class="lp-card" href="index.html${ar ? '' : '?lang=en'}#projects"><img src="${p.cover || p.shots[0]}" alt="${esc(p.title[L.lang])}" loading="lazy"><span><b>${esc(p.title[L.lang])}</b><small>${esc(p.kicker[L.lang])}</small></span></a>`).join('')}</div>
      <div class="center"><a class="btn btn-ghost" href="index.html${ar ? '' : '?lang=en'}#projects">${T.all}</a></div>
    </div></section>
    <section class="section"><div class="container">
      <div class="section-head in"><h2>${T.prices}</h2><p>${T.approx}</p></div>
      <div class="lp-prices">${PRICING.map((p) => `<div class="lp-price ${p.popular ? 'pop' : ''}"><h3>${esc(p[L.lang].name)}</h3><ul>${p[L.lang].features.slice(0, 4).map((f) => `<li>✓ ${esc(f)}</li>`).join('')}</ul></div>`).join('')}</div>
    </div></section>
    <section class="section section-alt"><div class="container lp-faq-wrap">
      <div class="section-head in"><h2>${T.faq}</h2></div>
      <div class="lp-faq">${L.faq.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div></section>
    <section class="section"><div class="container">
      <div class="footer-cta">
        <div class="footer-cta-copy"><h3>${T.ctaT}</h3><p>${T.ctaS}</p></div>
        <div class="footer-cta-actions"><a class="btn btn-wa btn-lg" href="${wa}" target="_blank" rel="noopener">${T.wa}</a><a class="btn btn-ghost btn-lg" href="index.html${curParam}#estimate">✨ ${T.cta}</a></div>
      </div>
      <p class="lp-others"><b>${T.other}:</b> ${Object.keys(names).filter((k) => k !== slug).map((k) => `<a href="services/${k}.html">${names[k][ar ? 0 : 1]}</a>`).join(' · ')}</p>
    </div></section>`;

  // FAQ structured data for Google rich results
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: L.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  document.head.appendChild(ld);
})();
