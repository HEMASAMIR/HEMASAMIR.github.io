/* =========================================================
   Settings + translations for: AI estimator, chat assistant,
   smart search, pricing, booking, CV, live ratings.
   ========================================================= */

const SITE_CONFIG = {
  // Where the AI endpoints live. On Vercel (or a custom domain on Vercel) leave it empty — same origin.
  // On GitHub Pages put your Vercel URL here, e.g. 'https://ebrahim-samir.vercel.app'.
  apiBase: '',
  vercelFallback: 'https://ebrahim-samir.vercel.app', // set after the first Vercel deploy so hemasamir.github.io can use the AI too
  whatsapp: '201055673184',
  // App Store ids for live ratings
  appStore: { rafiq: '6759332192', quickin: '6778979967', metro: '6782100362' },
};

/* Local currencies — approximate rates per 1 USD (update from time to time).
   The visitor's currency is guessed from their time zone; they can change it from the pricing section. */
const CURRENCIES = {
  USD: { rate: 1, ar: 'دولار', en: 'USD', sym: '$', round: 10 },
  SAR: { rate: 3.75, ar: 'ر.س', en: 'SAR', round: 50 },
  AED: { rate: 3.67, ar: 'د.إ', en: 'AED', round: 50 },
  KWD: { rate: 0.307, ar: 'د.ك', en: 'KWD', round: 5 },
  QAR: { rate: 3.64, ar: 'ر.ق', en: 'QAR', round: 50 },
  OMR: { rate: 0.385, ar: 'ر.ع', en: 'OMR', round: 5 },
  BHD: { rate: 0.376, ar: 'د.ب', en: 'BHD', round: 5 },
  EUR: { rate: 0.86, ar: 'يورو', en: 'EUR', sym: '€', round: 10 },
  EGP: { rate: 48.5, ar: 'ج.م', en: 'EGP', round: 500 },
  IQD: { rate: 1310, ar: 'د.ع', en: 'IQD', round: 10000 },
  JOD: { rate: 0.709, ar: 'د.أ', en: 'JOD', round: 10 },
};
const TZ_CURRENCY = {
  'Asia/Riyadh': 'SAR', 'Asia/Dubai': 'AED', 'Asia/Kuwait': 'KWD', 'Asia/Qatar': 'QAR', 'Asia/Muscat': 'OMR',
  'Asia/Bahrain': 'BHD', 'Africa/Cairo': 'EGP', 'Asia/Baghdad': 'IQD', 'Asia/Amman': 'JOD',
};

/* Package prices (USD, "starting from"). Edit freely — the estimator's offline mode uses the same numbers. */
const PRICING = [
  {
    id: 'starter', from: 350, weeks: '1–2',
    ar: { name: 'موقع احترافي', tag: 'لانشاء حضور قوي أونلاين', features: ['حتى 6 صفحات بتصميم مخصص', 'عربي + إنجليزي ووضع داكن', 'متجاوب مع كل الشاشات', 'SEO أساسي + ربط واتساب', 'دعم مجاني شهر'] },
    en: { name: 'Pro Website', tag: 'A strong online presence', features: ['Up to 6 custom-designed pages', 'Arabic + English with dark mode', 'Responsive on every screen', 'Basic SEO + WhatsApp integration', '1 month free support'] },
  },
  {
    id: 'pro', from: 1200, weeks: '4–8', popular: true,
    ar: { name: 'تطبيق موبايل أو متجر', tag: 'الأكثر طلبًا', features: ['تطبيق Android + iOS بـ Flutter أو متجر Next.js', 'تسجيل دخول + دفع إلكتروني', 'لوحة تحكم لإدارة المحتوى', 'رفع على App Store و Google Play', 'دعم مجاني 3 شهور'] },
    en: { name: 'Mobile App or Store', tag: 'Most popular', features: ['Android + iOS app in Flutter, or a Next.js store', 'Authentication + online payments', 'Admin dashboard to manage content', 'App Store & Google Play publishing', '3 months free support'] },
  },
  {
    id: 'business', from: 3000, weeks: '8–16',
    ar: { name: 'نظام متكامل', tag: 'للشركات والمشاريع الكبيرة', features: ['تطبيق + موقع + لوحة تحكم متكاملين', 'صلاحيات متعددة وتحديثات لحظية', 'مميزات ذكاء اصطناعي', 'CI/CD وتقارير وتحليلات', 'دعم مجاني 6 شهور'] },
    en: { name: 'Complete System', tag: 'For companies & big projects', features: ['App + website + dashboard, fully connected', 'Multiple roles & realtime updates', 'AI-powered features', 'CI/CD, reports and analytics', '6 months free support'] },
  },
];

/* Options shown in the estimator (also used by its offline engine). */
const EST_OPTIONS = {
  types: [
    { id: 'mobile', price: [1200, 2600], weeks: [5, 8], ar: 'تطبيق موبايل', en: 'Mobile app', icon: '📱' },
    { id: 'web', price: [400, 1200], weeks: [2, 4], ar: 'موقع / منصة ويب', en: 'Website / web app', icon: '🌐' },
    { id: 'store', price: [900, 2200], weeks: [4, 7], ar: 'متجر إلكتروني', en: 'Online store', icon: '🛒' },
    { id: 'system', price: [3000, 6500], weeks: [9, 16], ar: 'نظام متكامل', en: 'Complete system', icon: '🧩' },
  ],
  features: [
    { id: 'auth', price: 150, ar: 'تسجيل دخول وحسابات', en: 'Login & accounts', kw: ['تسجيل', 'حساب', 'login', 'account', 'sign'] },
    { id: 'payments', price: 300, ar: 'دفع إلكتروني', en: 'Online payments', kw: ['دفع', 'فيزا', 'payment', 'pay', 'instapay', 'stripe', 'paymob'] },
    { id: 'admin', price: 450, ar: 'لوحة تحكم', en: 'Admin dashboard', kw: ['لوحة', 'ادمن', 'أدمن', 'admin', 'dashboard', 'إدارة', 'ادارة'] },
    { id: 'maps', price: 300, ar: 'خرائط وتتبع', en: 'Maps & tracking', kw: ['خريطة', 'خرائط', 'تتبع', 'توصيل', 'map', 'track', 'gps', 'delivery'] },
    { id: 'chat', price: 350, ar: 'شات ورسائل', en: 'Chat & messaging', kw: ['شات', 'رسائل', 'محادثة', 'chat', 'message'] },
    { id: 'notifications', price: 120, ar: 'إشعارات', en: 'Push notifications', kw: ['إشعار', 'اشعار', 'notification', 'push'] },
    { id: 'booking', price: 300, ar: 'حجوزات ومواعيد', en: 'Bookings & scheduling', kw: ['حجز', 'موعد', 'مواعيد', 'booking', 'appointment', 'reserve'] },
    { id: 'video', price: 350, ar: 'فيديو وكورسات', en: 'Video & courses', kw: ['فيديو', 'كورس', 'دروس', 'video', 'course', 'lesson'] },
    { id: 'ai', price: 500, ar: 'ذكاء اصطناعي', en: 'AI features', kw: ['ذكاء', 'ai', 'gpt', 'claude', 'شات بوت', 'chatbot'] },
    { id: 'multilang', price: 150, ar: 'عربي + إنجليزي', en: 'Arabic + English', kw: ['انجليزي', 'إنجليزي', 'لغتين', 'english', 'arabic', 'لغات'] },
  ],
};

/* Synonyms for the smart project search (query word → project ids). */
const SEARCH_SYNONYMS = {
  'طلبات|talabat|توصيل|دليفري|delivery|مندوب|driver|اوردر|أوردر': ['delivery', 'graduation', 'goalzone'],
  'متجر|ستور|store|shop|ecommerce|e-commerce|تسوق|بيع|منتجات': ['zona', 'fayrouza', 'incense', 'goalzone', 'ecommerce', 'vortexa'],
  'عطور|برفان|perfume|incense|بخور': ['incense'],
  'تعليم|كورس|كورسات|دروس|مدرسة|سنتر|education|course|learning|lms|طلاب': ['dwapp', 'dw', 'manara', 'aladeeb', 'mogahed'],
  'الماني|ألماني|المانيا|ألمانيا|german|deutsch': ['dwapp', 'dw', 'mogahed', 'fayrouza'],
  'حجز|شاليه|فندق|airbnb|booking|إقامة|اقامة|سفر': ['quickin', 'docdoc'],
  'دكتور|طبيب|عيادة|doctor|clinic|medical|صحة': ['docdoc'],
  'اسلامي|إسلامي|قرآن|قران|صلاة|اذكار|أذكار|quran|islamic|prayer': ['rafiq', 'quran'],
  'مترو|مواصلات|metro|transport': ['metro', 'maps'],
  'ذكاء|ai|اصطناعي|ocr|كاميرا|vision|رؤية': ['ocr', 'metro'],
  'مصنع|صناعي|ادوية|أدوية|factory|industrial|pharma': ['ocr'],
  'لوحة|ادمن|أدمن|dashboard|admin|ارباح|أرباح|إدارة|ادارة': ['zona', 'manara', 'marketadmin', 'dw'],
  'سوشيال|social|فيسبوك|facebook|بوست': ['fbclone', 'socialapp'],
  'سيارة|عربية|صيانة|car|auto': ['checkauto'],
  'سوبرماركت|بقالة|grocery|supermarket': ['vortexa'],
  'مصاريف|مصروف|فلوس|expense|money|ميزانية': ['masrofy'],
  'خريطة|خرائط|map|maps|gps|تتبع': ['maps', 'delivery', 'checkauto', 'metro'],
  'كتب|كتاب|books|book|مكتبة': ['bookly', 'dwapp'],
  'اسعار|أسعار|price|تخفيض|عروض': ['wasfy'],
};

Object.assign(I18N.ar, {
  navEstimate: 'احسب التكلفة', navPricing: 'الأسعار',
  // estimator
  estEyebrow: 'جديد — بالذكاء الاصطناعي', estTitle: 'احسب تكلفة مشروعك في ثواني',
  estSub: 'اكتب فكرتك بكلامك، والذكاء الاصطناعي هيطلعلك خطة كاملة: المميزات، المدة، التكلفة التقريبية، والتقنيات — مجانًا.',
  estIdeaLabel: 'احكيلنا فكرتك', estIdeaPh: 'مثال: عايز تطبيق لمطعمي فيه منيو وطلب أونلاين ودفع وتتبع للمندوب، وعايز لوحة تحكم أتابع منها الطلبات...',
  estTypeLabel: 'نوع المشروع', estFeatLabel: 'مميزات محتاجها (اختياري)',
  estGo: 'احسب بالذكاء الاصطناعي', estLoading: 'الذكاء الاصطناعي بيحلل فكرتك...', estLoadingSteps: ['بيفهم الفكرة', 'بيحدد المميزات', 'بيحسب المدة والتكلفة', 'بيجهز الخطة'],
  estResultTitle: 'خطة مشروعك المبدئية', estFeatures: 'المميزات', estMust: 'أساسي', estNice: 'إضافي لاحقًا',
  estTimeline: 'المدة المتوقعة', estWeeks: 'أسابيع', estCost: 'التكلفة التقريبية', estScreens: 'شاشة / صفحة', estTech: 'التقنيات المقترحة',
  estPhases: 'مراحل التنفيذ', estSimilar: 'مشاريع شبه فكرتك من شغلي', estNotes: 'ملاحظات',
  estSend: 'ابعت الخطة على واتساب', estPdf: 'نزّل الخطة PDF', estAgain: 'جرّب فكرة تانية',
  estDisclaimer: 'تقدير مبدئي للمساعدة في التخطيط — السعر النهائي بيتحدد بعد مكالمة قصيرة نفهم فيها التفاصيل.',
  estOffline: 'تقدير سريع (الذكاء الاصطناعي هيتفعّل قريبًا)', estAiBadge: 'تحليل بالذكاء الاصطناعي',
  estTooShort: 'اكتب فكرتك في جملة أو اتنين على الأقل 🙏',
  estWaIntro: 'أهلاً م. إبراهيم 👋 استخدمت حاسبة التكلفة في موقعك، ودي خطة مشروعي:',
  // chat
  chatTitle: 'اسأل إبراهيم', chatStatus: 'مساعد ذكي — بيرد فورًا', chatPh: 'اكتب سؤالك...', chatSend: 'إرسال',
  chatHello: 'أهلاً بيك 👋 أنا المساعد الذكي لـ م. إبراهيم. اسألني عن الخدمات أو الأسعار أو أي مشروع من الشغل.',
  chatSuggest: ['بتعمل تطبيقات توصيل؟', 'التطبيق بياخد وقت قد إيه؟', 'الأسعار بتبدأ من كام؟', 'عندك شغل في التعليم؟'],
  chatHandoff: 'كمّل مع م. إبراهيم على واتساب', chatErr: 'حصلت مشكلة في الاتصال، جرّب تاني أو كلّمنا واتساب.', chatOpenProject: 'افتح المشروع',
  // search
  searchPh: 'ابحث بفكرتك... مثلًا: زي طلبات، متجر عطور، تطبيق كورسات', searchNone: 'مفيش مشروع مطابق بالظبط — جرّب حاسبة التكلفة بالذكاء الاصطناعي وهتعرف تقدر تعمل فكرتك إزاي.',
  searchResults: 'نتيجة', searchClear: 'مسح',
  // pricing
  prEyebrow: 'الباقات', prTitle: 'باقات تناسب كل مشروع', prSub: 'السعر بيتحدد حسب احتياجك بالظبط — ابعتلنا فكرتك وخد عرض سعر مجاني خلال 24 ساعة.',
  prFrom: 'التكلفة', prQuote: 'عرض سعر مجاني',  prWeeks: 'أسابيع', prStart: 'ابدأ بالباقة دي', prPopular: 'الأكثر طلبًا', prCustom: 'مش لاقي الباقة المناسبة؟', prCustomSub: 'احسب تكلفة فكرتك بالظبط بالذكاء الاصطناعي.',
  bookTitle: 'احجز مكالمة مجانية 15 دقيقة', bookSub: 'نتكلم عن فكرتك وتاخد نصايح ببلاش — اختار اليوم والوقت.', bookDay: 'اليوم', bookTime: 'الوقت', bookGo: 'احجز على واتساب',
  bookWa: 'أهلاً م. إبراهيم 👋 عايز أحجز مكالمة مجانية', bookAt: 'يوم', bookHour: 'الساعة', prWa: 'أهلاً م. إبراهيم 👋 مهتم بباقة',
  // cv
  cvDownload: 'تحميل الـ CV', cvAr: 'عربي', cvEn: 'English',
  // ratings
  ratingOf: 'تقييم',
  curLabel: 'العملة', curApprox: 'تقريبًا',
  quoteLink: 'انسخ لينك عرض السعر', quoteCopied: 'اتنسخ اللينك ✓ ابعته لأي حد',
  ghNowTitle: 'شغال على إيه دلوقتي', ghNowSub: 'آخر تحديثات على مشاريعي — مباشرة من GitHub', ghAgo: ['دلوقتي', 'من {n} دقيقة', 'من {n} ساعة', 'من {n} يوم', 'من {n} شهر'],
  navBlog: 'المدونة', ftCountries: 'خدماتي في', cSA: 'السعودية', cAE: 'الإمارات', cKW: 'الكويت', cQA: 'قطر', cEG: 'مصر', cDE: 'ألمانيا',
});

Object.assign(I18N.en, {
  navEstimate: 'Estimate', navPricing: 'Pricing',
  estEyebrow: 'New — powered by AI', estTitle: 'Estimate your project in seconds',
  estSub: 'Describe your idea in your own words and AI builds a full plan: features, timeline, estimated cost and tech stack — for free.',
  estIdeaLabel: 'Tell us your idea', estIdeaPh: 'e.g. I need an app for my restaurant with a menu, online ordering, payments and driver tracking, plus a dashboard to follow orders...',
  estTypeLabel: 'Project type', estFeatLabel: 'Features you need (optional)',
  estGo: 'Estimate with AI', estLoading: 'AI is analysing your idea...', estLoadingSteps: ['Understanding the idea', 'Mapping the features', 'Calculating time & cost', 'Preparing the plan'],
  estResultTitle: 'Your project plan', estFeatures: 'Features', estMust: 'MVP', estNice: 'Later',
  estTimeline: 'Estimated timeline', estWeeks: 'weeks', estCost: 'Estimated cost', estScreens: 'screens / pages', estTech: 'Suggested tech',
  estPhases: 'Delivery phases', estSimilar: 'Similar projects from my portfolio', estNotes: 'Notes',
  estSend: 'Send the plan on WhatsApp', estPdf: 'Download PDF plan', estAgain: 'Try another idea',
  estDisclaimer: 'A first estimate to help you plan — the final price is set after a short call about the details.',
  estOffline: 'Quick estimate (AI coming online soon)', estAiBadge: 'AI analysis',
  estTooShort: 'Please describe your idea in at least a sentence or two 🙏',
  estWaIntro: 'Hi Eng. Ebrahim 👋 I used the cost estimator on your website — here is my project plan:',
  chatTitle: 'Ask Ebrahim', chatStatus: 'AI assistant — replies instantly', chatPh: 'Type your question...', chatSend: 'Send',
  chatHello: "Hi there 👋 I'm Eng. Ebrahim's AI assistant. Ask me about services, pricing, or any project in the portfolio.",
  chatSuggest: ['Do you build delivery apps?', 'How long does an app take?', 'What are your starting prices?', 'Any e-learning work?'],
  chatHandoff: 'Continue with Ebrahim on WhatsApp', chatErr: 'Connection problem — try again or reach us on WhatsApp.', chatOpenProject: 'Open project',
  searchPh: 'Search by idea... e.g. delivery app, perfume store, courses app', searchNone: 'No exact match — try the AI cost estimator to see how your idea can be built.',
  searchResults: 'results', searchClear: 'Clear',
  prEyebrow: 'Packages', prTitle: 'Packages for every project', prSub: 'Pricing depends on exactly what you need — send your idea and get a free quote within 24 hours.',
  prFrom: 'Cost', prQuote: 'Free custom quote',  prWeeks: 'weeks', prStart: 'Start with this package', prPopular: 'Most popular', prCustom: "Can't find the right package?", prCustomSub: 'Get an exact AI estimate for your idea.',
  bookTitle: 'Book a free 15-minute call', bookSub: 'Talk through your idea and get free advice — pick a day and time.', bookDay: 'Day', bookTime: 'Time', bookGo: 'Book on WhatsApp',
  bookWa: 'Hi Eng. Ebrahim 👋 I would like to book a free call', bookAt: 'on', bookHour: 'at', prWa: 'Hi Eng. Ebrahim 👋 I am interested in the package',
  cvDownload: 'Download CV', cvAr: 'عربي', cvEn: 'English',
  ratingOf: 'rating',
  curLabel: 'Currency', curApprox: 'approx.',
  quoteLink: 'Copy proposal link', quoteCopied: 'Link copied ✓ share it with anyone',
  ghNowTitle: 'What I am working on', ghNowSub: 'Latest updates to my projects — live from GitHub', ghAgo: ['just now', '{n} min ago', '{n} h ago', '{n} days ago', '{n} months ago'],
  navBlog: 'Blog', ftCountries: 'Services in', cSA: 'Saudi Arabia', cAE: 'UAE', cKW: 'Kuwait', cQA: 'Qatar', cEG: 'Egypt', cDE: 'Germany',
});

/* =========================================================
   Interactive Mobile Simulator Data
   ========================================================= */
const SIMULATOR_APPS = [
  {
    id: 'quickin',
    name: { ar: 'QuickIn — حجز شاليهات', en: 'QuickIn — Stays & Chalets' },
    tag: { ar: 'منشور على App Store & Google Play', en: 'Live on App Store & Google Play' },
    icon: 'assets/img/quickin-icon.jpg',
    rating: '4.9 ★',
    desc: {
      ar: 'منصة حجز إقامات على طريقة Airbnb مع خريطة ودفع إلكتروني وتوثيق هوية.',
      en: 'Airbnb-style stays platform with map search, online payments and host wizard.'
    },
    storeUrl: 'https://apps.apple.com/us/app/quickin-app/id6778979967',
    storeName: 'App Store',
    accent: '#0d9488',
    screens: [
      { id: 'home', label: { ar: 'الرئيسية', en: 'Home' }, img: 'assets/img/quickin-1.jpg', badge: 'Supabase Realtime' },
      { id: 'explore', label: { ar: 'البحث والفلترة', en: 'Explore' }, img: 'assets/img/quickin-2.jpg', badge: 'Map & GeoFilter' },
      { id: 'details', label: { ar: 'تفاصيل الشاليه', en: 'Details' }, img: 'assets/img/quickin-3.jpg', badge: 'Online Payment' },
      { id: 'wizard', label: { ar: 'إضافة وحدة', en: 'Host Wizard' }, img: 'assets/img/quickin-4.jpg', badge: 'Clean Architecture' },
    ]
  },
  {
    id: 'rafiq',
    name: { ar: 'رفيق المسلم — إسلامي شامل', en: 'Rafiq Muslim — Islamic App' },
    tag: { ar: 'تقييم 5.0 كامل على App Store', en: '5.0 Rating on App Store' },
    icon: 'assets/img/rafiq-icon.jpg',
    rating: '5.0 ★',
    desc: {
      ar: 'مواقيت صلاة بدقة، صوتيات قرآنية، أذكار وسبحة إلكترونية، واجهة بدون إعلانات.',
      en: 'Accurate prayer times, offline Quran audio, azkar counter, clean ad-free UI.'
    },
    storeUrl: 'https://apps.apple.com/us/app/rafiq-muslim/id6759332192',
    storeName: 'App Store (5.0)',
    accent: '#10b981',
    screens: [
      { id: 'home', label: { ar: 'مواقيت الصلاة', en: 'Prayer Times' }, img: 'assets/img/rafiq-1.jpg', badge: 'Offline GPS' },
      { id: 'quran', label: { ar: 'القرآن الكريم', en: 'Quran Audio' }, img: 'assets/img/rafiq-2.jpg', badge: 'Audio Stream' },
      { id: 'azkar', label: { ar: 'الأذكار والسبحة', en: 'Azkar' }, img: 'assets/img/rafiq-3.jpg', badge: 'Hive Local DB' },
      { id: 'qibla', label: { ar: 'اتجاه القبلة', en: 'Qibla Compass' }, img: 'assets/img/rafiq-4.jpg', badge: 'Sensors / Compass' },
    ]
  },
  {
    id: 'dwapp',
    name: { ar: 'Deutsche Welt — تعليم الألماني', en: 'Deutsche Welt — German Academy' },
    tag: { ar: 'تطبيق للطلاب في مصر والخليج وألمانيا', en: 'Serving Egypt, Gulf & Germany' },
    icon: 'assets/img/dw-icon.png',
    rating: '4.8 ★',
    desc: {
      ar: 'أكاديمية لغة ألمانية: كورسات مسجلة، كتب Schritt für Schritt، وتواصل مع الفروع.',
      en: 'German academy mobile app: recorded video lessons, book library and branch locator.'
    },
    storeUrl: '',
    storeName: 'Flutter App',
    accent: '#dd0000',
    screens: [
      { id: 'home', label: { ar: 'المستويات والكورسات', en: 'Course Levels' }, img: 'assets/img/dwapp-1.jpg', badge: 'Dark Theme' },
      { id: 'video', label: { ar: 'الدروس المسجلة', en: 'Video Player' }, img: 'assets/img/dwapp-2.jpg', badge: 'REST API' },
      { id: 'books', label: { ar: 'مكتبة الكتب', en: 'Books Library' }, img: 'assets/img/dwapp-3.jpg', badge: 'PDF Viewer' },
      { id: 'profile', label: { ar: 'متابعة التقدم', en: 'Progress' }, img: 'assets/img/dwapp-4.jpg', badge: 'BLoC State' },
    ]
  }
];

/* =========================================================
   AI Architecture Advisor Data & Blueprints
   ========================================================= */
const ADVISOR_DATA = {
  steps: {
    type: {
      ar: 'طبيعة المشروع', en: 'Project Type',
      options: [
        { id: 'mobile', icon: '📱', ar: 'تطبيق موبايل (iOS & Android)', en: 'Mobile App (iOS & Android)' },
        { id: 'store', icon: '🛒', ar: 'متجر إلكتروني يبيع أونلاين', en: 'E-commerce Store' },
        { id: 'saas', icon: '🏢', ar: 'منصة تعليمية / SaaS للشركات', en: 'Educational / SaaS Platform' },
        { id: 'system', icon: '🧩', ar: 'نظام متكامل (تطبيق + ويب + لوحة)', en: 'Complete System (App + Web + Admin)' }
      ]
    },
    priority: {
      ar: 'الأولوية التشغيلية القصوى', en: 'Core Priority',
      options: [
        { id: 'speed', icon: '⚡', ar: 'أقصى أداء وسلاسة واجهات (60 FPS)', en: 'Maximum 60 FPS Fluidity' },
        { id: 'offline', icon: '🛡️', ar: 'أوفلاين وأمان بيانات وسرية تامة', en: 'Offline-First & Data Security' },
        { id: 'fast_market', icon: '🚀', ar: 'إطلاق صاروخي للمتاجر بأقل تكلفة صيانة', en: 'Fast Time-to-Market & Lower TCO' },
        { id: 'scale', icon: '📈', ar: 'توسع هائل لملايين المستخدمين والتحديث اللحظي', en: 'Massive Realtime Scale & Sync' }
      ]
    },
    features: {
      ar: 'المتطلبات الخاصة (اختر ما يناسبك)', en: 'Special Requirements',
      options: [
        { id: 'payments', icon: '💳', ar: 'دفع إلكتروني (Apple Pay / فيزا / تمارا / فوري)', en: 'Online Payments & Wallets' },
        { id: 'realtime', icon: '💬', ar: 'شات فوري وإشعارات Push لحظية', en: 'Realtime Chat & Push Notifications' },
        { id: 'ai', icon: '🤖', ar: 'ذكاء اصطناعي وتوصيات ذكية للمستخدم', en: 'AI Features & Recommendations' },
        { id: 'maps', icon: '📍', ar: 'خرائط وتتبع مناديب وسائقين مباشر', en: 'Live GPS Maps & Tracking' },
        { id: 'dashboard', icon: '📊', ar: 'لوحة تحكم إدارية وتقارير Excel وأرباح', en: 'Role-Based Dashboard & Reports' }
      ]
    }
  }
};

/* =========================================================
   Smart Interactive FAQ Data
   ========================================================= */
const FAQ_DATA = [
  {
    q: { ar: 'هل السورس كود بيكون ملكي بالكامل بنسبة 100% بعد التسليم؟', en: 'Will I 100% own the source code after delivery?' },
    a: {
      ar: 'نعم بالتأكيد! السورس كود يُسلّم لك كاملاً بجميع ملفاته، بدون أي تشفير أو قيود أو حقوق ملكية خفية. الكود بيكون منظم بـ Clean Architecture ومكتوب فيه توثيق كامل (Documentation) يتيح لأي فريق برمجي استكماله مستقبلاً.',
      en: 'Absolutely! Full source code ownership is transferred to you with zero restrictions, obfuscation or hidden lock-in. The code is strictly structured with Clean Architecture and thoroughly documented for seamless handoff.'
    }
  },
  {
    q: { ar: 'مين اللي بيملك حسابات المطورين على App Store و Google Play؟', en: 'Who owns the App Store and Google Play developer accounts?' },
    a: {
      ar: 'الحسابات بتكون باسم شركتك أو اسمك الشخصي بنسبة 100%. أنا بساعدك خطوة بخطوة في إنشاء حساب Apple Developer وحساب Google Play Console وتوثيق هويتهم، ثم أقوم برفع التطبيق وإعداد الـ Metadata وحل أي متطلبات مع مراجعي آبل وجوجل حتى القبول التام.',
      en: 'The accounts are 100% under your name or company. I guide you through registration and identity verification, then handle build signing, store listing metadata, and the review process with Apple and Google until full approval.'
    }
  },
  {
    q: { ar: 'كيف يتم تقسيم الدفعات المالية للمشروع؟', en: 'How are milestone payments structured?' },
    a: {
      ar: 'التعامل بنظام المراحل الموثقة (Milestones) العادل للطرفين: دفعة مقدمة لبدء التحليل وتصميم الواجهات، ودفعات مربوطة بتسليم مراحل حقيقية تشوفها وتجربها بنفسك كنسخة تجريبية على موبايلك، ودفعة نهائية عند النشر والتسليم التام.',
      en: 'We work on a milestone-based structure that protects both sides: an initial deposit for UI/UX and architectural setup, milestone payments linked to testable working builds on your phone, and a final payment upon store release and handover.'
    }
  },
  {
    q: { ar: 'هل أحصل على دعم فني وصيانة مجانية بعد إطلاق التطبيق؟', en: 'Do I get free technical support and warranty after launch?' },
    a: {
      ar: 'نعم، كل مشروع يشمل فترة دعم فني وصيانة مجانية (من شهر إلى 6 شهور حسب الباقة). الدعم يغطي مراقبة استقرار السيرفرات، حل أي باجز غير متوقعة، والتأكد من توافق التطبيق مع أحدث إصدارات iOS و Android.',
      en: 'Yes! Every project includes complimentary technical support and warranty (1 to 6 months depending on package). We cover bug fixes, server stability monitoring, and compatibility with the newest iOS & Android releases.'
    }
  },
  {
    q: { ar: 'ليه اختار Flutter بدل ما أعمل تطبيقين Native منفصلين (Swift + Kotlin)؟', en: 'Why Flutter instead of two separate Native apps (Swift + Kotlin)?' },
    a: {
      ar: 'Flutter بفضل محرك Impeller بيدي أداء Native حقيقي 60 FPS و120 FPS بدون أي فرق يُذكر عن النيتف. الميزة الضخمة إنك بتكتب كود موحد، فبتوفر أكثر من 40% من تكلفة ووقت التطوير، وكل ميزة أو تحديث بتنزل لآيفون وأندرويد في نفس اللحظة.',
      en: 'With Flutter’s Impeller engine, you get smooth 60–120 FPS native performance with zero compromise. Maintaining a single codebase cuts your development and maintenance costs by over 40% and keeps iOS and Android features always in sync.'
    }
  },
  {
    q: { ar: 'لو عندي تطبيق أو موقع قائم فيه بطء أو أخطاء، تقدر تطوره أو تعيد هيكلته؟', en: 'Can you refactor or optimize an existing slow or buggy codebase?' },
    a: {
      ar: 'بالتأكيد. بنعمل فحص شامل للكود (Code Audit & Profiling) لكشف تسريبات الذاكرة (Memory Leaks) والمشاكل الهيكلية، وبنقدّم تقرير واضح بالحلول سواء بتحسين الكود الحالي أو إعادة كتابته بـ Clean Architecture و BLoC.',
      en: 'Yes. We conduct a thorough Code Audit and performance profiling to detect bottlenecks, memory leaks, and architectural flaws, then provide a clear strategy to refactor or restructure the system cleanly.'
    }
  }
];

