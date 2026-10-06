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
  prEyebrow: 'الباقات', prTitle: 'أسعار واضحة تناسب كل مشروع', prSub: 'كل باقة قابلة للتعديل حسب احتياجك — والسعر النهائي بعد فهم التفاصيل.',
  prFrom: 'يبدأ من', prWeeks: 'أسابيع', prStart: 'ابدأ بالباقة دي', prPopular: 'الأكثر طلبًا', prCustom: 'مش لاقي الباقة المناسبة؟', prCustomSub: 'احسب تكلفة فكرتك بالظبط بالذكاء الاصطناعي.',
  bookTitle: 'احجز مكالمة مجانية 15 دقيقة', bookSub: 'نتكلم عن فكرتك وتاخد نصايح ببلاش — اختار اليوم والوقت.', bookDay: 'اليوم', bookTime: 'الوقت', bookGo: 'احجز على واتساب',
  bookWa: 'أهلاً م. إبراهيم 👋 عايز أحجز مكالمة مجانية', bookAt: 'يوم', bookHour: 'الساعة', prWa: 'أهلاً م. إبراهيم 👋 مهتم بباقة',
  // cv
  cvDownload: 'تحميل الـ CV', cvAr: 'عربي', cvEn: 'English',
  // ratings
  ratingOf: 'تقييم',
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
  prEyebrow: 'Packages', prTitle: 'Clear pricing for every project', prSub: 'Every package can be tailored — the final price comes after we understand the details.',
  prFrom: 'From', prWeeks: 'weeks', prStart: 'Start with this package', prPopular: 'Most popular', prCustom: "Can't find the right package?", prCustomSub: 'Get an exact AI estimate for your idea.',
  bookTitle: 'Book a free 15-minute call', bookSub: 'Talk through your idea and get free advice — pick a day and time.', bookDay: 'Day', bookTime: 'Time', bookGo: 'Book on WhatsApp',
  bookWa: 'Hi Eng. Ebrahim 👋 I would like to book a free call', bookAt: 'on', bookHour: 'at', prWa: 'Hi Eng. Ebrahim 👋 I am interested in the package',
  cvDownload: 'Download CV', cvAr: 'عربي', cvEn: 'English',
  ratingOf: 'rating',
});
