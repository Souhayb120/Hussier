/**
 * Textes de la landing page publique (« / »), en arabe et en français.
 * Les intitulés (types de PV, rôles) reprennent ceux de l'application (i18n).
 */

export type LandingLang = 'ar' | 'fr'
export type LandingTheme = 'light' | 'dark'

/** Coordonnées affichées et destinataire du formulaire de contact (à renseigner). */
export const CONTACT_EMAIL: string = ''
export const CONTACT_PHONE: string = ''

/** Lien de la vidéo de démonstration ; `null` affiche l'emplacement réservé. */
export const DEMO_VIDEO_URL: string | null = null

interface Item {
  title: string
  text: string
}

interface Step extends Item {
  role: string
}

interface DocType extends Item {
  family: 'notification' | 'constat'
  tag: string
}

export interface LandingCopy {
  utility: string
  nav: { features: string; workflow: string; documents: string; ai: string; faq: string }
  login: string
  contactCta: string
  menu: string
  themeToDark: string
  themeToLight: string
  hero: {
    eyebrow: string
    titleBefore: string
    titleHighlight: string
    titleAfter: string
    lead: string
    ctaVideo: string
    ctaHow: string
    facts: { value: string; label: string }[]
    mock: {
      date: string
      title: string
      newCase: string
      kpis: { label: string; value: string; pending?: boolean }[]
      rows: { label: string; status: string; pending?: boolean }[]
      ariaLabel: string
    }
    seal: string
    sealSub: string
  }
  roles: { title: string; items: (Item & { badge: string })[] }
  features: { eyebrow: string; title: string; lead: string; quote: string; items: Item[] }
  workflow: { eyebrow: string; title: string; lead: string; steps: Step[] }
  video: {
    eyebrow: string
    title: string
    lead: string
    label: string
    placeholder: string
    caption: string
    play: string
  }
  documents: { eyebrow: string; title: string; lead: string; items: DocType[]; ctaTitle: string; cta: string }
  ai: {
    eyebrow: string
    title: string
    lead: string
    points: { strong: string; text: string }[]
    disclaimer: string
    doc: { caseRef: string; badge: string; title: string; source: string; signature: string; ariaLabel: string }
    review: { title: string; checks: string[]; pending: string; approve: string; changes: string }
  }
  trust: { title: string; items: Item[] }
  faq: { title: string; items: { q: string; a: string }[] }
  contact: {
    eyebrow: string
    title: string
    lead: string
    name: string
    namePlaceholder: string
    office: string
    email: string
    phone: string
    optional: string
    subject: string
    subjects: string[]
    message: string
    messagePlaceholder: string
    submit: string
    privacy: string
    missingEmail: string
  }
  footer: { tagline: string; platform: string; contact: string; rights: string; legal: string; privacy: string }
}

const ar: LandingCopy = {
  utility: 'منصة رقمية لتدبير مكاتب المفوضين القضائيين بالمغرب',
  nav: {
    features: 'الوظائف',
    workflow: 'مسار العمل',
    documents: 'المحاضر',
    ai: 'المساعد الذكي',
    faq: 'أسئلة شائعة',
  },
  login: 'تسجيل الدخول',
  contactCta: 'تواصلوا معنا',
  menu: 'القائمة',
  themeToDark: 'تفعيل الوضع الليلي',
  themeToLight: 'تفعيل الوضع النهاري',
  hero: {
    eyebrow: 'تدبير مكتب المفوض القضائي، بمنهجية واضحة',
    titleBefore: 'من فتح الملف\nإلى ',
    titleHighlight: 'اعتماد المحضر',
    titleAfter: '،\nفي مسار واحد.',
    lead: '«مفوّض» يجمع الملفات والمهام والزيارات والمحاضر في فضاء عمل واحد، ليعرف كل فرد في المكتب ما عليه، ويعرف المفوض القضائي أين وصل كل ملف.',
    ctaVideo: 'شاهدوا الفيديو التوضيحي',
    ctaHow: 'كيف يشتغل؟',
    facts: [
      { value: '7', label: 'أنواع من المحاضر جاهزة' },
      { value: '3', label: 'أدوار بصلاحيات محددة' },
      { value: '2', label: 'لغتان: العربية والفرنسية' },
    ],
    mock: {
      date: 'الثلاثاء 14 أكتوبر',
      title: 'لوحة التحكم',
      newCase: '+ ملف جديد',
      kpis: [
        { label: 'ملفات جارية', value: '48' },
        { label: 'مهام مسندة', value: '12' },
        { label: 'للاعتماد', value: '3', pending: true },
      ],
      rows: [
        { label: 'محضر معاينة مكان · D-0142', status: 'قيد الإنجاز' },
        { label: 'محضر تبليغ · D-0139', status: 'في انتظار الاعتماد', pending: true },
      ],
      ariaLabel: 'معاينة لوحة تحكم مفوّض',
    },
    seal: 'معتمد',
    sealSub: 'PDF جاهز',
  },
  roles: {
    title: 'لكل فرد في المكتب\nمكانه ودوره.',
    items: [
      { title: 'المفوض القضائي', badge: 'مدير', text: 'نظرة شاملة على المكتب، إسناد المهام للمتعاونين، مراجعة المحاضر واعتمادها، وتدبير فريق العمل.' },
      { title: 'المساعد الإداري', badge: 'مساعد', text: 'فتح الملفات وتحيينها، إعداد مسودات المحاضر، المرفقات، الفوترة، ورمز تتبع الملف للموكل.' },
      { title: 'المتعاون', badge: 'متعاون', text: '«مهامي» في مكان واحد: الزيارات، الملاحظات الميدانية، والصور والمرفقات.' },
    ],
  },
  features: {
    eyebrow: 'الوظائف',
    title: 'كل ما يحتاجه المكتب،\nولا شيء زائد.',
    lead: 'سبع وحدات، كل واحدة منها تقابل مرحلة حقيقية من عمل المكتب اليومي.',
    quote: '«النظام في العمل نصف الإنجاز.»',
    items: [
      { title: 'تدبير الملفات القضائية', text: 'إنشاء الملفات وتنظيمها وتتبعها، مع معطيات الموكل والأطراف ووضعية كل ملف.' },
      { title: 'تدبير المهام', text: 'إسناد المهام إلى المتعاونين، وتحديد الآجال، وتتبع تقدّمها لحظة بلحظة.' },
      { title: 'تتبع الزيارات والملاحظات', text: 'تسجيل ملاحظات الميدان والزيارات مع الصور والمرفقات، مؤرخة ومرتبطة بالملف.' },
      { title: 'تحرير المحاضر بمساعدة الذكاء الاصطناعي', text: 'مسودة أولى منظمة انطلاقاً من معطيات الملف والملاحظات، قابلة للتعديل بالكامل.' },
      { title: 'المراجعة والاعتماد', text: 'عند الاعتماد تُقفل الوثيقة، ويُغلق الملف، ويصبح ملف PDF جاهزاً.' },
      { title: 'المستخدمون والصلاحيات', text: 'المفوض القضائي، المساعد، والمتعاون: لكلٍّ صلاحياته، ولا يرى إلا ما يعنيه.' },
      { title: 'لوحة تحكم المكتب', text: 'الملفات الجارية، الوثائق في انتظار الاعتماد، المهام المسندة، والأعمال المنجزة.' },
    ],
  },
  workflow: {
    eyebrow: 'مسار العمل',
    title: 'خمس مراحل واضحة، من الملف إلى المحضر المعتمد.',
    lead: 'كل مرحلة مسندة لشخص، مؤرخة، ويمكن تتبعها في أي وقت.',
    steps: [
      { role: 'المساعد الإداري', title: 'فتح الملف', text: 'معطيات الموكل والأطراف ونوع المحضر والوثائق المرفقة.' },
      { role: 'المفوض القضائي', title: 'إسناد المهمة', text: 'تُسند المهمة لمتعاون بأجل محدد وتعليمات واضحة.' },
      { role: 'المتعاون', title: 'الزيارة والملاحظات', text: 'تسجيل كل زيارة وما عاينه المتعاون، مع الصور، مباشرة من الميدان.' },
      { role: 'الذكاء الاصطناعي', title: 'تحرير المسودة', text: 'مسودة محضر أولى انطلاقاً من معطيات الملف والملاحظات، يراجعها المساعد.' },
      { role: 'المفوض القضائي', title: 'المراجعة والاعتماد', text: 'يُراجَع المحضر ويُعدَّل عند الحاجة ثم يُعتمد. لا شيء يُنهى دون موافقتكم.' },
    ],
  },
  video: {
    eyebrow: 'الفيديو التوضيحي',
    title: 'شاهدوا «مفوّض» في دقائق.',
    lead: 'جولة سريعة: من فتح الملف وإسناد المهمة، إلى تحرير المحضر واعتماده.',
    label: 'فيديو العرض التوضيحي',
    placeholder: 'سيُضاف الفيديو قريباً',
    caption: 'مفوّض · جولة في المنصة',
    play: 'تشغيل الفيديو التوضيحي',
  },
  documents: {
    eyebrow: 'المحاضر',
    title: 'سبعة أنواع من المحاضر، بقوالب جاهزة.',
    lead: 'لكل نوع معطياته الخاصة، فيعرف المتعاون ما يجب تسجيله، ويخرج المحضر كاملاً من أول مرة.',
    items: [
      { family: 'notification', tag: 'تبليغ', title: 'محضر تبليغ', text: 'المعني بالأمر توصّل بالوثيقة، مع تسجيل زيارة التوصل.' },
      { family: 'notification', tag: 'تبليغ', title: 'محضر إخباري', text: 'عند تعذّر التبليغ: عنوان غير محدد، أو لا أحد في العنوان.' },
      { family: 'notification', tag: 'تبليغ', title: 'محضر رفض التوصل', text: 'رفض المعني بالأمر أو من ينوب عنه التوصل، مع ذكر جميع الزيارات.' },
      { family: 'constat', tag: 'معاينة', title: 'محضر معاينة مكان', text: 'معاينة عمارة أو مرآب أو محل، انطلاقاً من الملاحظات حسب الأقسام.' },
      { family: 'constat', tag: 'معاينة', title: 'معاينة رسائل واتساب', text: 'تفريغ حرفي للرسائل: الهاتف، جهة الاتصال، ومضمون الرسائل.' },
      { family: 'constat', tag: 'معاينة', title: 'معاينة بريد إلكتروني', text: 'تفريغ الرسائل الإلكترونية مع الصور المرقمة والمرفقات.' },
      { family: 'constat', tag: 'معاينة', title: 'معاينة اجتماع', text: 'الحاضرون، تصريحات كل طرف، وساعة البداية والنهاية.' },
    ],
    ctaTitle: 'شاهدوا كيف يُحرَّر محضر في دقائق.',
    cta: 'شاهدوا الفيديو',
  },
  ai: {
    eyebrow: 'المساعد الذكي',
    title: 'الذكاء الاصطناعي يُحرّر المسودة،\nوالقرار لكم.',
    lead: 'يجمع «مفوّض» معطيات الملف وملاحظات الميدان ليقترح صيغة أولى منظمة للمحضر. يبقى النص قابلاً للتعديل بالكامل، ولا يعتمده إلا شخص مخوَّل.',
    points: [
      { strong: 'مبنية على معطياتكم فقط:', text: 'الملف، الأطراف، والملاحظات المسجلة.' },
      { strong: 'كل فقرة قابلة للتعديل', text: 'قبل المراجعة.' },
      { strong: 'الاعتماد بشري دائماً:', text: 'لا تُقفل أي وثيقة تلقائياً.' },
    ],
    disclaimer: 'المساعد الذكي أداة للتحرير، ولا يعوّض التقدير المهني ولا مسؤولية المفوض القضائي.',
    doc: {
      caseRef: 'الملف D-0139',
      badge: 'مسودة · المساعد الذكي',
      title: 'محضر معاينة مكان',
      source: 'مأخوذ من ملاحظة 14/10 · للتحقق',
      signature: 'توقيع المفوض القضائي',
      ariaLabel: 'مسودة محضر في انتظار الاعتماد',
    },
    review: {
      title: 'المراجعة',
      checks: ['هوية الأطراف', 'التاريخ والمكان'],
      pending: 'المعاينات',
      approve: 'اعتماد',
      changes: 'طلب تعديل',
    },
  },
  trust: {
    title: 'كل إجراء مسند، مؤرخ، وقابل للتحقق.',
    items: [
      { title: 'صلاحيات حسب الدور', text: 'لا يطّلع كل مستخدم إلا على ما يدخل في مسؤوليته.' },
      { title: 'تتبّع كامل', text: 'الزيارات والتعديلات والاعتمادات محفوظة في سجل كل ملف.' },
      { title: 'وثيقة مقفلة بعد الاعتماد', text: 'بعد الاعتماد لا تُعدَّل الوثيقة، ويُغلق الملف تلقائياً.' },
      { title: 'معطيات كل مكتب منفصلة', text: 'يشتغل كل مكتب في فضائه الخاص، دون أي اطلاع على معطيات المكاتب الأخرى.' },
    ],
  },
  faq: {
    title: 'أسئلة شائعة',
    items: [
      { q: 'هل يحرّر الذكاء الاصطناعي المحاضر بدلاً من المفوض القضائي؟', a: 'لا. يقترح مسودة أولى فقط، ويجب مراجعتها وتعديلها عند الحاجة واعتمادها من طرف شخص مخوَّل قبل إقفالها.' },
      { q: 'من يستطيع اعتماد وثيقة؟', a: 'الاعتماد من صلاحية المفوض القضائي وحده: يُعدّ المساعد المسودة، ويراجعها المفوض ويعتمدها.' },
      { q: 'هل المنصة متوفرة بالعربية؟', a: 'نعم، الواجهة متوفرة بالعربية والفرنسية، مع عرض من اليمين إلى اليسار.' },
      { q: 'هل يجب تثبيت برنامج؟', a: 'لا. «مفوّض» تطبيق ويب يُفتح من المتصفح، في المكتب أو في الميدان.' },
    ],
  },
  contact: {
    eyebrow: 'اتصلوا بنا',
    title: 'لديكم سؤال؟ نحن هنا للإجابة.',
    lead: 'راسلونا بخصوص المنصة، الاشتراك، أو أي استفسار آخر، وسنعود إليكم في أقرب الآجال.',
    name: 'الاسم الكامل',
    namePlaceholder: 'الأستاذ(ة)…',
    office: 'اسم المكتب',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    optional: '(اختياري)',
    subject: 'الموضوع',
    subjects: ['سؤال عام', 'الاشتراك والأسعار', 'الدعم التقني', 'موضوع آخر'],
    message: 'رسالتكم',
    messagePlaceholder: 'اكتبوا رسالتكم هنا…',
    submit: 'إرسال الرسالة',
    privacy: 'تُستعمل معطياتكم فقط للرد على رسالتكم.',
    missingEmail: 'عنوان الاتصال غير مُعدّ بعد.',
  },
  footer: {
    tagline: 'منصة لتدبير مكاتب المفوضين القضائيين بالمغرب.',
    platform: 'المنصة',
    contact: 'تواصل',
    rights: 'جميع الحقوق محفوظة.',
    legal: 'الإشعار القانوني',
    privacy: 'سياسة الخصوصية',
  },
}

const fr: LandingCopy = {
  utility: 'Plateforme numérique de gestion des cabinets de commissaires judiciaires au Maroc',
  nav: {
    features: 'Fonctionnalités',
    workflow: 'Processus',
    documents: 'Procès-verbaux',
    ai: 'Assistant IA',
    faq: 'FAQ',
  },
  login: 'Se connecter',
  contactCta: 'Nous contacter',
  menu: 'Menu',
  themeToDark: 'Activer le mode sombre',
  themeToLight: 'Activer le mode clair',
  hero: {
    eyebrow: 'La gestion du cabinet du commissaire judiciaire, avec méthode',
    titleBefore: "De l'ouverture du dossier\nà ",
    titleHighlight: "l'approbation du PV",
    titleAfter: ',\nun seul parcours.',
    lead: "Mofawid réunit dossiers, missions, visites et procès-verbaux dans un seul espace de travail : chacun au cabinet sait ce qu'il a à faire, et le commissaire judiciaire sait où en est chaque dossier.",
    ctaVideo: 'Voir la vidéo de démonstration',
    ctaHow: 'Comment ça marche ?',
    facts: [
      { value: '7', label: 'types de procès-verbaux prêts' },
      { value: '3', label: 'rôles aux droits définis' },
      { value: '2', label: 'langues : français et arabe' },
    ],
    mock: {
      date: 'Mardi 14 octobre',
      title: 'Tableau de bord',
      newCase: '+ Nouveau dossier',
      kpis: [
        { label: 'Dossiers en cours', value: '48' },
        { label: 'Missions', value: '12' },
        { label: 'À approuver', value: '3', pending: true },
      ],
      rows: [
        { label: "Constat d'un lieu · D-0142", status: 'En cours' },
        { label: 'PV de notification · D-0139', status: 'À approuver', pending: true },
      ],
      ariaLabel: 'Aperçu du tableau de bord Mofawid',
    },
    seal: 'APPROUVÉ',
    sealSub: 'PDF prêt',
  },
  roles: {
    title: 'Chacun à sa place,\nchacun son rôle.',
    items: [
      { title: 'Commissaire judiciaire', badge: 'Administrateur', text: "Vue d'ensemble du cabinet, affectation des missions, relecture et approbation des PV, gestion de l'équipe." },
      { title: 'Assistant du cabinet', badge: 'Assistant', text: 'Ouverture et mise à jour des dossiers, préparation des projets de PV, pièces jointes, facturation et code de suivi client.' },
      { title: 'Collaborateur', badge: 'Collaborateur', text: '« Mes missions » au même endroit : visites, observations de terrain, photos et pièces jointes.' },
    ],
  },
  features: {
    eyebrow: 'Fonctionnalités',
    title: 'Tout ce dont le cabinet a besoin,\nrien de superflu.',
    lead: 'Sept modules, chacun correspondant à une étape réelle du travail quotidien du cabinet.',
    quote: "« L'ordre est la moitié de l'ouvrage. »",
    items: [
      { title: 'Gestion des dossiers judiciaires', text: 'Créez, organisez et suivez vos dossiers, avec les informations du client, des parties et le statut de chacun.' },
      { title: 'Gestion des missions', text: 'Affectez les missions aux collaborateurs, fixez les délais et suivez leur avancement en temps réel.' },
      { title: 'Suivi des visites et observations', text: 'Consignez les visites et les observations de terrain, avec photos et pièces jointes, datées et rattachées au dossier.' },
      { title: 'Rédaction des PV assistée par IA', text: 'Un premier projet structuré à partir des données du dossier et des observations, entièrement modifiable.' },
      { title: 'Relecture et approbation', text: "À l'approbation, le document est verrouillé, le dossier clôturé et le PDF prêt." },
      { title: 'Utilisateurs et droits', text: 'Commissaire judiciaire, assistant et collaborateur : chacun ses droits, chacun ne voit que ce qui le concerne.' },
      { title: 'Tableau de bord du cabinet', text: "Dossiers en cours, documents en attente d'approbation, missions affectées et travail terminé." },
    ],
  },
  workflow: {
    eyebrow: 'Processus',
    title: 'Cinq étapes claires, du dossier au PV approuvé.',
    lead: 'Chaque étape est attribuée, datée et traçable à tout moment.',
    steps: [
      { role: 'Assistant', title: 'Ouverture du dossier', text: 'Informations du client, parties, type de PV et pièces jointes.' },
      { role: 'Commissaire judiciaire', title: 'Affectation de la mission', text: 'La mission est confiée à un collaborateur, avec un délai et des consignes claires.' },
      { role: 'Collaborateur', title: 'Visite et observations', text: "Chaque visite et chaque constatation est enregistrée, photos à l'appui, directement sur le terrain." },
      { role: 'IA', title: 'Rédaction du projet', text: "Un premier projet de PV à partir des données du dossier et des observations, revu par l'assistant." },
      { role: 'Commissaire judiciaire', title: 'Relecture et approbation', text: "Le PV est relu, corrigé si besoin, puis approuvé. Rien n'est finalisé sans votre accord." },
    ],
  },
  video: {
    eyebrow: 'Vidéo de démonstration',
    title: 'Découvrez Mofawid en quelques minutes.',
    lead: "Une visite rapide : de l'ouverture du dossier et l'affectation de la mission, jusqu'à la rédaction et l'approbation du PV.",
    label: 'Vidéo de démonstration',
    placeholder: 'La vidéo sera bientôt disponible',
    caption: 'Mofawid · Visite de la plateforme',
    play: 'Lire la vidéo de démonstration',
  },
  documents: {
    eyebrow: 'Procès-verbaux',
    title: 'Sept types de procès-verbaux, avec des modèles prêts.',
    lead: 'Chaque type a ses propres informations : le collaborateur sait quoi consigner, et le PV est complet dès la première fois.',
    items: [
      { family: 'notification', tag: 'Notification', title: 'PV de notification', text: "La personne a reçu l'acte, avec l'enregistrement de la visite de remise." },
      { family: 'notification', tag: 'Notification', title: 'PV informatif', text: "La notification n'a pas pu être faite : adresse incomplète ou personne absente." },
      { family: 'notification', tag: 'Notification', title: 'PV de refus de réception', text: "La personne, ou un proche, a refusé de recevoir l'acte. Toutes les visites sont reprises." },
      { family: 'constat', tag: 'Constat', title: "Constat d'un lieu", text: 'Bâtiment, parking, local… rédigé à partir des observations, section par section.' },
      { family: 'constat', tag: 'Constat', title: 'Constat de messages WhatsApp', text: 'Transcription mot à mot : téléphone, contact et contenu des messages.' },
      { family: 'constat', tag: 'Constat', title: "Constat d'e-mails", text: 'Transcription des e-mails avec les captures numérotées et les pièces jointes.' },
      { family: 'constat', tag: 'Constat', title: "Constat d'une réunion", text: 'Présents, déclarations de chacun, heure de début et de fin.' },
    ],
    ctaTitle: 'Voyez comment un PV se rédige en quelques minutes.',
    cta: 'Voir la vidéo',
  },
  ai: {
    eyebrow: 'Assistant IA',
    title: "L'IA rédige le projet,\nla décision vous appartient.",
    lead: "Mofawid rassemble les données du dossier et les observations de terrain pour proposer une première version structurée du PV. Le texte reste entièrement modifiable, et seule une personne habilitée peut l'approuver.",
    points: [
      { strong: 'Fondé uniquement sur vos données :', text: 'le dossier, les parties et les observations saisies.' },
      { strong: 'Chaque paragraphe reste modifiable', text: 'avant la relecture.' },
      { strong: "L'approbation reste humaine :", text: "aucun document n'est verrouillé automatiquement." },
    ],
    disclaimer: "L'assistant IA est un outil de rédaction. Il ne remplace ni l'appréciation professionnelle ni la responsabilité du commissaire judiciaire.",
    doc: {
      caseRef: 'Dossier D-0139',
      badge: 'Projet · Assistant IA',
      title: "Constat d'un lieu",
      source: "Repris de l'observation du 14/10 · à vérifier",
      signature: 'Signature du commissaire judiciaire',
      ariaLabel: "Projet de PV en attente d'approbation",
    },
    review: {
      title: 'Relecture',
      checks: ['Identité des parties', 'Date et lieu'],
      pending: 'Constatations',
      approve: 'Approuver',
      changes: 'Demander une modification',
    },
  },
  trust: {
    title: 'Chaque action est attribuée, datée et vérifiable.',
    items: [
      { title: 'Droits selon le rôle', text: "Chaque utilisateur n'accède qu'à ce qui relève de sa responsabilité." },
      { title: 'Traçabilité complète', text: 'Visites, modifications et approbations sont historisées dans chaque dossier.' },
      { title: 'Document verrouillé après approbation', text: 'Une fois approuvé, le document ne peut plus être modifié et le dossier est clôturé.' },
      { title: 'Données de chaque cabinet isolées', text: 'Chaque cabinet travaille dans son propre espace, sans accès aux données des autres cabinets.' },
    ],
  },
  faq: {
    title: 'Questions fréquentes',
    items: [
      { q: "L'IA rédige-t-elle les PV à la place du commissaire judiciaire ?", a: "Non. Elle propose seulement un premier projet, qui doit être relu, corrigé si besoin et approuvé par une personne habilitée avant d'être verrouillé." },
      { q: 'Qui peut approuver un document ?', a: "L'approbation est réservée au commissaire judiciaire : l'assistant prépare le projet, le commissaire le relit et l'approuve." },
      { q: 'La plateforme est-elle disponible en arabe ?', a: "Oui. L'interface est disponible en français et en arabe, avec un affichage de droite à gauche pour l'arabe." },
      { q: 'Faut-il installer un logiciel ?', a: "Non. Mofawid est une application web qui s'ouvre dans le navigateur, au cabinet comme sur le terrain." },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Une question ? Nous sommes là pour y répondre.',
    lead: "Écrivez-nous au sujet de la plateforme, de l'abonnement ou de toute autre demande : nous vous répondrons dans les meilleurs délais.",
    name: 'Nom complet',
    namePlaceholder: 'Me Prénom Nom',
    office: 'Nom du cabinet',
    email: 'E-mail',
    phone: 'Téléphone',
    optional: '(facultatif)',
    subject: 'Objet',
    subjects: ['Question générale', 'Abonnement et tarifs', 'Support technique', 'Autre demande'],
    message: 'Votre message',
    messagePlaceholder: 'Écrivez votre message ici…',
    submit: 'Envoyer le message',
    privacy: 'Vos informations servent uniquement à répondre à votre message.',
    missingEmail: "L'adresse de contact n'est pas encore configurée.",
  },
  footer: {
    tagline: 'La plateforme de gestion des cabinets de commissaires judiciaires au Maroc.',
    platform: 'Plateforme',
    contact: 'Contact',
    rights: 'Tous droits réservés.',
    legal: 'Mentions légales',
    privacy: 'Politique de confidentialité',
  },
}

export const LANDING_COPY: Record<LandingLang, LandingCopy> = { ar, fr }
