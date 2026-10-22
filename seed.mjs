#!/usr/bin/env node
/* =============================================================================
 * seed.mjs — Génère des données de démonstration pour Mofawid via l'API.
 *
 *   Un dossier d'exemple COMPLET par type de procès-verbal (les 7 types de
 *   l'application, inspirés de vrais PV d'huissier — noms fictifs) :
 *
 *     1. NOTIFICATION             محضر تبليغ           (remis en main propre)
 *     2. NOTIFICATION_INFORMATIF  محضر اخباري          (adresse incomplète)
 *     3. NOTIFICATION_REFUS       محضر رفض التوصل      (3 visites, refus du père)
 *     4. CONSTAT_LIEU             محضر معاينة مكان     (ascenseur + parking)
 *     5. CONSTAT_WHATSAPP         محضر معاينة واتساب   (messages + vocaux)
 *     6. CONSTAT_EMAIL            محضر معاينة بريد     (e-mails + captures)
 *     7. CONSTAT_REUNION          محضر معاينة اجتماع   (présents + déclarations)
 *
 *   Pour chaque dossier : parties, mission du collaborateur (visites, personne
 *   présente, observations par section, photos légendées) et un exemple de PV
 *   déjà rédigé (statut DRAFT) pour voir à quoi ressemble chaque type.
 *
 *   Usage :
 *     npm run seed                                   (API par défaut ci-dessous)
 *     MOFAWID_API=http://localhost:8080 npm run seed (back-end local)
 *     SEED_AI=1 npm run seed                         (génère aussi un brouillon Gemini par dossier)
 *
 *   Relancer le script est sans danger : un dossier déjà créé (même objet) est sauté.
 * ========================================================================== */

const BASE = process.env.MOFAWID_API || 'https://mofawid-backend.onrender.com'
const WITH_AI = process.env.SEED_AI === '1'
const DEMO_PASSWORD = 'Admin@123' // mot de passe admin démo

async function req(method, path, token, body) {
  const isForm = body instanceof FormData
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(isForm || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })
  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${method} ${path}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

async function login(username, password) {
  const res = await req('POST', '/api/auth/login', null, { username, password })
  return res.token
}

const out = (msg) => console.log(`  ${msg}`)
const line = (msg = '') => console.log(msg)

let step = 0
const stepLog = (msg) => line(`\n[${++step}] ${msg}`)

/* --------------------------- Données de l'étude --------------------------- */

const OFFICE = {
  name: 'Cabinet Démo — Casablanca',
  slug: 'demo-casablanca',
  status: 'active',
  adress: 'شارع مصطفى المعاني زنقة طرابلس رقم 11 الطابق 1 الشقة 2 الدار البيضاء',
  phone: '+212 5 22 00 12 34',
  // En-tête des procès-verbaux (fictif)
  huissierNameAr: 'عبد الرحيم السعدي',
  huissierNameFr: 'ESSAADI ABDERRAHIM',
  appealCourtAr: 'الدار البيضاء',
  appealCourtFr: 'Casablanca',
  firstInstanceCourtAr: 'المحاكم الابتدائية بالدار البيضاء',
  addressFr: 'Bd Mustafa El Maani, Rue Tarablous, Imm 11, 1er Etg, App 2, Casablanca',
  email: 'cabinet.demo@mofawid.ma',
  city: 'الدار البيضاء',
  // Le registre papier de l'étude en était à 2281 : le 1er dossier de l'app sera 2026/2282.
  startNumber: 2282,
}

const LAW =
  'بناء على الظهير الشريف رقم 1-25-49 الصادر في 09 ذي الحجة 1446 (6 يونيو 2025) بتنفيذ القانون رقم 46-21 المتعلق بتنظيم مهنة المفوضين القضائيين.'
const ARTICLE_43 =
  'وبناء على الفصل الأول من المادة 43 من القانون رقم 46-21 المنظم لمهنة المفوضين القضائيين.'

// Société requérante (fictive) utilisée par plusieurs dossiers
const ATLAS = {
  role: 'REQUESTER',
  type: 'COMPANY',
  fullName: 'ATLAS SERVICES CASABLANCA SARL',
  rc: '435105',
  legalRepresentative: 'مديرها العام',
  address: 'Tour Atlas, 1 Rue des Plateformes, Lot N° 123, 7ème étage, Casablanca',
}

const header = (title, ref, date, notification) =>
  [
    title,
    '',
    `مرجعنا: ${ref}                بتاريخ: ${date}`,
    '',
    `نحن الموقع أسفله الأستاذ ${OFFICE.huissierNameAr} مفوض قضائي ${
      notification ? `بدائرة استئناف ${OFFICE.appealCourtAr}` : `لدى ${OFFICE.firstInstanceCourtAr}`
    }.`,
    '',
    LAW,
  ].join('\n')

/* ------------------- Les 7 dossiers d'exemple (1 par type) ------------------- */

const SCENARIOS = [
  /* 1. محضر تبليغ — la personne a reçu la lettre en main propre */
  {
    kind: 'NOTIFICATION',
    collab: 'collab.ahmed',
    case: {
      clientName: 'Atlas Services Casablanca',
      clientIce: '001234567000045',
      address: ATLAS.address,
      phone: '+212 5 20 66 55 46',
      subject: 'رسالة: Confirmation du maintien du contrat de travail',
      description: 'تبليغ رسالة تأكيد استمرار عقد الشغل إلى الأجير المعني بالأمر.',
    },
    parties: [
      ATLAS,
      {
        role: 'TARGET',
        type: 'PERSON',
        fullName: 'KHALID BENNANI',
        cin: 'BK123456',
        address: 'Lot Annour, Rue 5, N° 12, Casablanca',
        capacity: 'أجير',
      },
    ],
    mission: { title: 'تبليغ رسالة إلى السيد خالد بناني' },
    attempts: [
      { attemptedAt: '2026-07-13T10:05:00', result: 'DELIVERED_IN_PERSON', receiverName: 'خالد بناني', receiverCin: 'BK123456', signed: true },
    ],
    content: (ref, date) =>
      [
        header('محضر تبليغ', ref, date, true),
        '',
        `بناء على طلب شركة ${ATLAS.fullName} الكائن مقرها الاجتماعي في ${ATLAS.address} في شخص مديرها العام`,
        '',
        'والرامي الى الانتقال الى السيد KHALID BENNANI الكائن ب Lot Annour, Rue 5, N° 12, Casablanca',
        '',
        'وذلك قصد: تبليغه برسالة.',
        '',
        ARTICLE_43,
        '',
        'لأجلـــه',
        '',
        'بتاريخ 2026/07/13 توصل السيد خالد بناني شخصيا بذكره الحامل لبطاقة التعريف الوطنية عدد BK123456 بنسخة من هذه الرسالة ووقع على نسخة منها.',
        '',
        'وبمضمنه حررنا هذا المحضر للرجوع اليه عند الاقتضاء.',
        'توقيع المفوض القضائي:',
      ].join('\n'),
  },

  /* 2. محضر اخباري — l'adresse ne permet pas de trouver la personne */
  {
    kind: 'NOTIFICATION_INFORMATIF',
    collab: 'collab.sara',
    case: {
      clientName: 'Atlas Services Casablanca',
      clientIce: '001234567000045',
      address: ATLAS.address,
      phone: '+212 5 20 66 55 46',
      subject: 'رسالة: Mise en demeure de reprendre le travail',
      description: 'تبليغ إنذار بالرجوع إلى العمل إلى الأجير المعني بالأمر.',
    },
    parties: [
      ATLAS,
      {
        role: 'TARGET',
        type: 'PERSON',
        fullName: 'HICHAM AMRANI',
        cin: 'BE654321',
        address: 'Lot Zoubir, Oulfa, Casablanca',
        capacity: 'أجير',
      },
    ],
    mission: { title: 'تبليغ إنذار إلى السيد هشام العمراني' },
    attempts: [
      {
        attemptedAt: '2026-07-18T11:30:00',
        result: 'ADDRESS_INCOMPLETE',
        notes: 'انتقلنا الى تجزئة الزبير الألفة فتعذر علينا الوصول الى المعني بالأمر كون العنوان لم يحدد لنا رقم العقار ورقم الزنقة.',
      },
    ],
    content: (ref, date) =>
      [
        header('محضر اخباري', ref, date, true),
        '',
        `بناء على طلب شركة ${ATLAS.fullName} الكائن مقرها الاجتماعي في ${ATLAS.address} في شخص مديرها العام`,
        '',
        'والرامي الى الانتقال الى السيد HICHAM AMRANI الكائن ب Lot Zoubir, Oulfa, Casablanca',
        '',
        'وذلك قصد: تبليغه برسالة.',
        '',
        ARTICLE_43,
        '',
        'لأجلـــه',
        '',
        'انتقل كاتبنا المحلف السيد سارة برادة إلى العنوان المطلوب وذلك بحسب ما ورد في ملاحظته المدونة على صورة من الرسالة رفقته.',
        'فيما يلي نص الملاحظة: بتاريخ 18/07/2026 انتقلنا الى تجزئة الزبير الألفة فتعذر علينا الوصول الى المعني بالأمر كون العنوان لم يحدد لنا رقم العقار ورقم الزنقة.',
        '',
        'وبمضمنه حررنا هذا المحضر للرجوع اليه عند الاقتضاء.',
        'توقيع المفوض القضائي:',
      ].join('\n'),
  },

  /* 3. محضر رفض التوصل — 3 visites, le père refuse */
  {
    kind: 'NOTIFICATION_REFUS',
    collab: 'collab.driss',
    case: {
      clientName: 'Atlas Services Casablanca',
      clientIce: '001234567000045',
      address: ATLAS.address,
      phone: '+212 5 20 66 55 46',
      subject: 'رسالة: Confirmation du maintien du contrat et mise en demeure',
      description: 'تبليغ رسالة تأكيد استمرار عقد الشغل والإنذار بالرجوع إلى العمل.',
    },
    parties: [
      ATLAS,
      {
        role: 'TARGET',
        type: 'PERSON',
        fullName: 'YOUSSEF TAZI',
        cin: 'JA112233',
        address: 'Bloc C N° 26, Cité Al Houda, Casablanca',
        capacity: 'أجير',
      },
    ],
    mission: { title: 'تبليغ رسالة إلى السيد يوسف التازي' },
    attempts: [
      { attemptedAt: '2026-07-23T10:00:00', result: 'NOBODY_THERE', visitCardLeft: true, notes: 'طرقنا الباب وضغطنا على الجرس عدة مرات.' },
      { attemptedAt: '2026-07-24T16:15:00', result: 'NOBODY_THERE', notes: 'طرقنا الباب وضغطنا على الجرس عدة مرات.' },
      { attemptedAt: '2026-07-28T11:40:00', result: 'REFUSED', receiverName: 'عبد الكريم التازي', receiverCapacity: 'والد المعني بالأمر حسب تصريحه', signed: false },
    ],
    content: (ref, date) =>
      [
        header('محضر رفض التوصل', ref, date, true),
        '',
        ARTICLE_43,
        '',
        `بناء على الطلب الذي تقدمت به شركة ${ATLAS.fullName} في شخص مديرها العام الرامي إلى تبليغ: رسالة Confirmation du maintien du contrat et mise en demeure`,
        'إلى السيد YOUSSEF TAZI',
        'Cin JA112233',
        'Bloc C N° 26, Cité Al Houda, Casablanca',
        '',
        'ولهذه الغاية انتقلنا بتاريخ 2026/07/23 إلى عنوان المبلغ إليه المذكور أعلاه، وبعد طرقنا الباب والضغط على الجرس عدة مرات لم يجبنا أحد وقمنا بترك بطاقة الزيارة تحت الباب.',
        'وبتاريخ 2026/07/24 انتقلنا إلى عنوان المبلغ إليه المذكور أعلاه، وبعد طرقنا الباب والضغط على الجرس عدة مرات لم يجبنا أحد.',
        'وبتاريخ 2026/07/28 انتقلنا إلى عنوان المبلغ إليه المذكور أعلاه، هناك وجدنا السيد عبد الكريم التازي بصفته والد المعني بالأمر حسب تصريحه، وبعد أن عرفناه بصفتنا وموضوع مهمتنا، عرضنا عليه الرسالة المراد تبليغها فرفض التوصل بها.',
        'ودون نص الرسالة الذي رفض التوصل به على ظهر هذا المحضر.',
        '',
        'وبمضمنه حررنا هذا المحضر للرجوع إليه عند الضرورة.',
        'توقيع المفوض القضائي:',
      ].join('\n'),
  },

  /* 4. محضر معاينة مكان — ascenseur en panne et parking sale */
  {
    kind: 'CONSTAT_LIEU',
    collab: 'collab.ahmed',
    case: {
      clientName: 'سلمى الإدريسي',
      address: 'إقامة "Les Jardins"، شارع النوادي، الدار البيضاء',
      phone: '+212 6 61 22 33 44',
      subject: 'معاينة حالة المصعد والمرآب بإقامة Les Jardins',
      description:
        'يشرفني أن ألتمس من سيادتكم التفضل بالانتقال الى إقامة "Les Jardins" الكائنة بشارع النوادي قصد إجراء معاينة دقيقة لإثبات حالة المصعد الكهربائي بالعمارة رقم 8 وحالة المرآب بالطابق السفلي الثاني، مع تضمين المحضر صورا فوتوغرافية.',
    },
    parties: [
      {
        role: 'REQUESTER',
        type: 'PERSON',
        fullName: 'سلمى الإدريسي',
        cin: 'BH778899',
        address: 'إقامة "Les Jardins"، العمارة 8، الدار البيضاء',
        capacity: 'قاطنة بالإقامة',
      },
      { role: 'OTHER', type: 'COMPANY', fullName: 'سنديك إقامة Les Jardins', legalRepresentative: 'رئيس السنديك', address: 'إقامة "Les Jardins"، الدار البيضاء' },
    ],
    mission: { title: 'معاينة المصعد والمرآب بإقامة Les Jardins' },
    presence: { presentPersonName: 'سلمى الإدريسي', presentPersonCapacity: 'قاطنة بالإقامة المعنية بتصريحها' },
    observations: [
      { sectionTitle: 'معاينة مدخل العمارة رقم 8', kind: 'DIRECT', description: 'العمارة تحمل الرقم "8" الظاهر بشكل بارز أعلى المدخل الرئيسي المكسو بالرخام، وهي المعنية بطلب المعاينة.' },
      { sectionTitle: 'معاينة المصعد الكهربائي', kind: 'DIRECT', description: 'يوجد مصعدان كهربائيان يمين البهو. مؤشر الإشارة الضوئية بجانب المصعد الأيمن مضاء باللون الأحمر، والباب مغلق، ولم يستجب المصعد لمحاولة استدعائه بالأزرار.' },
      { sectionTitle: 'معاينة المصعد الكهربائي', kind: 'DECLARATION', description: 'صرحت السيدة سلمى الإدريسي بأن المصعد معطل منذ حوالي ثلاثة أشهر.' },
      { sectionTitle: 'معاينة المرآب (تحت أرضي ناقص 2)', kind: 'DIRECT', description: 'أرضية المرآب من الإسمنت وعليها طبقة من الأتربة والغبار متراكمة بشكل ظاهر، خاصة في ممرات مرور السيارات.' },
      { sectionTitle: 'معاينة المرآب (تحت أرضي ناقص 2)', kind: 'DIRECT', description: 'العلامات والأسهم الصفراء المرسومة على الأرضية في حالة تآكل متقدمة، ويوجد شق طولي واضح بالقرب من أحد الجدران.' },
    ],
    attachments: [
      { name: 'photo-1-entree.png', caption: 'مدخل العمارة رقم 8' },
      { name: 'photo-2-ascenseur.png', caption: 'المصعد الأيمن وإشارته الحمراء' },
      { name: 'photo-3-parking.png', caption: 'الشق الطولي بأرضية المرآب' },
    ],
    content: (ref, date) =>
      [
        header('محضر معاينة', ref, date, false),
        '',
        'وبناء على الطلب الذي تقدمت به السيدة سلمى الإدريسي الحاملة لبطاقة التعريف الوطنية عدد BH778899 والذي جاء فيه: "يشرفني أن ألتمس من سيادتكم التفضل بالانتقال الى إقامة Les Jardins … قصد إجراء معاينة دقيقة لإثبات حالة المصعد الكهربائي وحالة المرآب"',
        '',
        'لأجلـــه',
        '',
        'وبناء على طلب السيدة سلمى الإدريسي، انتقلنا بتاريخ 19 غشت 2026 على الساعة الرابعة وأربعة وعشرين دقيقة زوالا 16H24 الى إقامة "Les Jardins" الكائنة بشارع النوادي، وذلك بحضور، وتحت عهدة ومسؤولية السيدة سلمى الإدريسي، بصفتها قاطنة بالإقامة المعنية بتصريحها. وعليه، أثبتنا ما يلي:',
        '',
        'أولا: معاينة مدخل العمارة رقم 8',
        'توجهنا إلى مدخل العمارة الحاملة للرقم "8"، الظاهر بشكل بارز أعلى المدخل الرئيسي، والمكسو بالرخام، وتحققنا من كون هذه العمارة هي المعنية بطلب المعاينة.',
        '',
        'ثانيا: معاينة المصعد الكهربائي',
        'عاينا وجود مصعدين كهربائيين يمين البهو، وأثبتنا أن مؤشر الإشارة الضوئية الموجود بجانب باب المصعد الموجود أقصى اليمين كان مضاء باللون الأحمر، وأن باب المصعد كان في وضعية مغلقة، ولم يستجب لمحاولة استدعائه بواسطة أزرار التحكم.',
        'وصرحت السيدة سلمى الإدريسي بأن المصعد معطل منذ حوالي ثلاثة أشهر.',
        '',
        'ثالثا: معاينة المرآب (تحت أرضي ناقص 2)',
        '- أرضية المرآب من مادة إسمنتية، وقد لاحظنا وجود طبقة من الأتربة والغبار متراكمة بشكل ظاهر، خاصة في الممرات المخصصة لمرور السيارات.',
        '- العلامات والأسهم الإرشادية المرسومة باللون الأصفر في حالة تآكل متقدمة، مع وجود شق طولي واضح بالقرب من أحد الجدران.',
        '',
        'وبمضمنه حررنا هذا المحضر للرجوع اليه عند الحاجة.',
        'المرفقات: الصور الفوتوغرافية الملتقطة من عين المكان الموثقة لما أشرنا اليه أعلاه والمؤشر عليها بطابعنا.',
        'توقيع المفوض القضائي:',
      ].join('\n'),
  },

  /* 5. محضر معاينة رسائل واتساب */
  {
    kind: 'CONSTAT_WHATSAPP',
    collab: 'collab.sara',
    case: {
      clientName: 'Atlas Services Casablanca',
      clientIce: '001234567000045',
      address: ATLAS.address,
      phone: '+212 5 20 66 55 46',
      subject: 'تفريغ رسائل واتساب بين مسؤولة الموارد البشرية والسيد كمال',
      description:
        'السيد المفوض القضائي نلتمس منكم العمل على تفريغ مجموعة رسائل على تطبيق واتساب تم تبادلها بين مسؤولة الموارد البشرية بشركتنا السيدة نادية العلوي وبين السيد كمال الشرقاوي.',
    },
    parties: [ATLAS],
    mission: { title: 'تفريغ رسائل واتساب بمقر الشركة' },
    presence: { presentPersonName: 'نادية العلوي', presentPersonCapacity: 'مسؤولة الموارد البشرية' },
    observations: [
      { sectionTitle: 'تعريف الهاتف', kind: 'DIRECT', description: 'هاتف محمول ممسوك بين يدي السيدة نادية العلوي: Nom de téléphone: iPhone 14 Pro Max / Model Number: MQ863ZA/A / NUMERO DE SERIE: Q40P00XX00. جهة الاتصال: الرقم 0669000000 المسجل تحت اسم Legal Kamal.' },
      { sectionTitle: 'الرسائل النصية يوم 30 يونيو 2026', kind: 'DIRECT', description: 'ثلاث رسائل نصية متتالية من صاحب الرقم 0669000000 جاء فيها: "Adil Charaf" ثم "Accident de travail survenu le 29/10/2024" ثم "Artus".' },
      { sectionTitle: 'الرسائل النصية يوم 30 يونيو 2026', kind: 'DIRECT', description: 'على الساعة 17H36 ردت السيدة نادية العلوي برسالة نصية جاء فيها: "Thank you for contacting! Please let me know how can I help you"، ثم على الساعة 22H27 بعثت له ثلاث وثائق بصيغة PDF.' },
      { sectionTitle: 'الرسائل الصوتية يوم 02 يوليوز 2026', kind: 'DIRECT', description: 'الرسالة الأولى، مرسلة من طرف السيدة نادية العلوي على الساعة 12H04 جاء فيها: "Bonjour كمال ça va? صافي ديك l\'accident du travail لي قلتي ليا… tiens moi au courant s\'il te plaît".' },
    ],
    content: (ref, date) =>
      [
        header('محضر معاينة', ref, date, false),
        '',
        `وبناء على الطلب الذي تقدمت به شركة ${ATLAS.fullName} الكائن عنوانها ب ${ATLAS.address} والذي جاء فيه: "السيد المفوض القضائي نلتمس منكم العمل على تفريغ مجموعة رسائل على تطبيق واتساب تم تبادلها بين مسؤولة الموارد البشرية بشركتنا السيدة نادية العلوي وبين السيد كمال الشرقاوي"`,
        '',
        'لأجلـــه',
        '',
        'فإنه بتاريخ 2026/09/07 على الساعة الثانية عشر وعشر دقائق زوالا، انتقلنا الى مقر الشركة بعنوانها أعلاه، ومن خلال الهاتف المحمول الممسوك بين يدي السيدة نادية العلوي، والمعرف بالمراجع التالية:',
        'Nom de téléphone: iPhone 14 Pro Max',
        'Model Number: MQ863ZA/A',
        'NUMERO DE SERIE: Q40P00XX00',
        'وبعد أخذنا المعلومات المومأ اليها أعلاه، عاينا السيدة نادية العلوي تتصفح الهاتف المحمول المطلوب فيه المعاينة، وبإرشاد منها، وتحت عهدتها ومسؤوليتها، وبعد تحديد رقم الهاتف 0669000000 المسجل تحت اسم Legal Kamal، فقد سجلنا أنه جاء فيها ما يلي:',
        '',
        'الرسائل النصية يوم 30 يونيو 2026',
        'عاينا وجود ثلاث رسائل نصية متتالية مرسلة من صاحب رقم الهاتف المذكور أعلاه جاء فيها: "Adil Charaf" / "Accident de travail survenu le 29/10/2024" / "Artus".',
        'وعاينا السيدة نادية العلوي على الساعة 17H36 تقوم بالرد برسالة نصية جاء فيها: "Thank you for contacting! Please let me know how can I help you"، ثم على الساعة 22H27 بعثت له ثلاث وثائق بصيغة PDF.',
        '',
        'الرسائل الصوتية المتبادلة يوم 02 يوليوز 2026',
        'الرسالة الأولى: مرسلة من طرف السيدة نادية العلوي على الساعة 12H04 زوالا جاء فيها: "Bonjour كمال ça va? صافي ديك l\'accident du travail لي قلتي ليا… tiens moi au courant s\'il te plaît".',
        '',
        'وبمضمنه حررنا هذا المحضر للرجوع اليه عند الحاجة.',
        'توقيع المفوض القضائي:',
      ].join('\n'),
  },

  /* 6. محضر معاينة بريد إلكتروني — e-mails + captures numérotées */
  {
    kind: 'CONSTAT_EMAIL',
    collab: 'collab.driss',
    case: {
      clientName: 'Atlas Services Casablanca',
      clientIce: '001234567000045',
      address: ATLAS.address,
      phone: '+212 5 20 66 55 46',
      subject: 'معاينة رسائل البريد الإلكتروني المهني للسيدة رجاء',
      description:
        'السيد المفوض القضائي نلتمس منكم العمل على الانتقال الى مقر شركتنا قصد معاينة بعض الرسائل التي تبادلتها السيدة رجاء المنصوري من خلال بريدها المهني مع بعض مسؤولي الشركة.',
    },
    parties: [ATLAS],
    mission: { title: 'معاينة البريد الإلكتروني المهني بمقر الشركة' },
    presence: { presentPersonName: 'نادية العلوي', presentPersonCapacity: 'مسؤولة الموارد البشرية' },
    observations: [
      { sectionTitle: 'المراسلة المؤرخة في 08 يوليوز 2026', kind: 'DIRECT', description: 'رسالة صادرة يوم الأربعاء 08 يوليوز 2026 على الساعة 17:14 من الحساب المهني raja.mansouri@atlas-demo.ma، الموضوع: "DEMANDE FFT - DACIA DUSTER"، يتضمن نصها طلب متابعة طلب المرأب بصفة مستعجلة واسترجاع السيارة في نفس اليوم.' },
      { sectionTitle: 'المراسلات المؤرخة في 10 يوليوز 2026', kind: 'DIRECT', description: 'رسالة صادرة يوم الجمعة 10 يوليوز 2026 على الساعة 14:28 من نفس الحساب بشأن ملف حادث شغل، تفيد بأن المعني بالأمر تنقل عدة مرات إلى البنك لسحب مبلغ التسوية دون أن يكون متوفرا، مع طلب تدخل شركة التأمين.' },
    ],
    attachments: [
      { name: 'capture-1.png', caption: 'مراسلة 2026/07/08 بشأن المتابعة المستعجلة لملف السيارة' },
      { name: 'capture-2.png', caption: 'مراسلة 2026/07/10 بشأن ملف حادث الشغل' },
    ],
    content: (ref, date) =>
      [
        header('محضر معاينة', ref, date, false),
        '',
        `بناء على الطلب الذي تقدمت به شركة ${ATLAS.fullName} والذي جاء فيه: "السيد المفوض القضائي نلتمس منكم العمل على الانتقال الى مقر شركتنا قصد معاينة بعض الرسائل التي تبادلتها السيدة رجاء المنصوري من خلال بريدها المهني مع بعض مسؤولي الشركة"`,
        '',
        'لأجلـــه',
        '',
        'وبناء على الطلب المذكور أعلاه، انتقلنا بتاريخ 18 شتنبر 2026 على الساعة الثانية عشر والنصف زوالا 12H30 الى مقر الشركة بعنوانها المذكور أعلاه، وهناك خاطبنا السيدة نادية العلوي بصفتها مسؤولة الموارد البشرية بتصريحها، وبعد اطلاعنا على البريد الإلكتروني المهني، وتحت عهدتها ومسؤوليتها الشخصية، فقد دلتنا على الرسائل الإلكترونية المراد معاينتها وتفريغها في هذا المحضر.',
        '',
        'أولا: المراسلة المؤرخة في 08 يوليوز 2026',
        'عاينا رسالة صادرة يوم الأربعاء 08 يوليوز 2026 على الساعة 17:14 من الحساب المهني raja.mansouri@atlas-demo.ma ضمن سلسلة مراسلات تتعلق بسيارة من نوع Dacia Duster، ويتضمن نصها طلب إعطاء المتابعة لطلب المرأب بصفة مستعجلة، مع بيان ضرورة استرجاع السيارة في اليوم نفسه.',
        'والصورة رقم 1 أدناه موثقة لما أشرنا إليه أعلاه.',
        'الصورة رقم 1: مراسلة 2026/07/08 بشأن المتابعة المستعجلة لملف السيارة',
        '',
        'ثانيا: المراسلات المؤرخة في 10 يوليوز 2026',
        'عاينا رسالة صادرة يوم الجمعة 10 يوليوز 2026 على الساعة 14:28 من الحساب المهني المنسوب إلى السيدة رجاء المنصوري، بشأن ملف حادث شغل، وورد فيها أن المعني بالأمر تنقل عدة مرات إلى البنك لسحب مبلغ التسوية، غير أن المبلغ لم يكن متوفرا، مع طلب تدخل شركة التأمين.',
        'والصورة رقم 2 أدناه موثقة لما أشرنا إليه أعلاه.',
        'الصورة رقم 2: مراسلة 2026/07/10 بشأن ملف حادث الشغل',
        '',
        'وبمضمنه حررنا هذا المحضر للرجوع اليه عند الحاجة.',
        'توقيع المفوض القضائي:',
      ].join('\n'),
  },

  /* 7. محضر معاينة اجتماع — présents, déclarations, heure de fin */
  {
    kind: 'CONSTAT_REUNION',
    collab: 'collab.ahmed',
    case: {
      clientName: 'Atlas Services Casablanca',
      clientIce: '001234567000045',
      address: ATLAS.address,
      phone: '+212 5 20 66 55 46',
      subject: 'معاينة انعقاد الاجتماع بين الشركة والمكتب النقابي',
      description:
        'الانتقال الى مقر الشركة قصد معاينة وإثبات انعقاد الاجتماع بين ممثلي الشركة وبين المكتب النقابي لعمال الشركة.',
    },
    parties: [ATLAS, { role: 'OTHER', type: 'COMPANY', fullName: 'المكتب النقابي لعمال شركة أطلس', legalRepresentative: 'الكاتب العام' }],
    mission: { title: 'معاينة اجتماع الشركة والمكتب النقابي' },
    observations: [
      { sectionTitle: 'الحاضرون', kind: 'DIRECT', description: 'وقع الحاضرون على لائحة الحضور. عن الشركة: المدير العام محمد الغالي، ياسر حمود، نادية العلوي. عن المكتب النقابي: المصطفى فريخ، عبد الوهاب فخور، محمد اريتوني.' },
      { sectionTitle: 'مجريات الاجتماع', kind: 'DECLARATION', description: 'أخذ السيد محمد الغالي الكلمة ورحب بالجميع، وأكد أن الشركة منفتحة على الحوار وليس لها أي موقف من أي إطار نقابي.' },
      { sectionTitle: 'مجريات الاجتماع', kind: 'DECLARATION', description: 'صرح ممثلو المكتب النقابي بأنهم يتوفرون على الأغلبية وطالبوا باعتبارهم المحاور الرسمي وبإعادة انتخاب مناديب الأجراء في أقرب وقت.' },
      { sectionTitle: 'نهاية الاجتماع', kind: 'DIRECT', description: 'انتهى الاجتماع على الساعة الواحدة زوالا 13H00 وغادر الجميع عين المكان في جو يسوده الاحترام المتبادل.' },
    ],
    content: (ref, date) =>
      [
        header('محضر معاينة', ref, date, false),
        '',
        `بناء على الطلب الذي تقدمت به شركة ${ATLAS.fullName} والذي يطلب منا بمقتضاه: "الانتقال الى مقر الشركة قصد معاينة وإثبات انعقاد الاجتماع بين ممثلي الشركة وبين المكتب النقابي لعمال الشركة"`,
        '',
        'لأجلـــه',
        '',
        'ونزولا عند القيام بالمطلوب، فقد انتقلنا بتاريخ 18 فبراير 2026 على الساعة الحادية عشر صباحا 11H00 الى مقر الشركة المذكور أعلاه، وعند وقوفنا بعين المكان، وبعد أخذ مكاننا بقاعة الاجتماعات، وتعريفنا الحاضرين بصفتنا وموضوع مهمتنا، فإننا قمنا بعد ذلك بما يلي:',
        '',
        'أولا: عاينا قيام الحاضرين بالتوقيع على لائحة الحضور على النحو الآتي:',
        'بخصوص ممثلي الشركة حضر السادة: المدير العام محمد الغالي، ياسر حمود ونادية العلوي.',
        'بخصوص ممثلي المكتب النقابي حضر السادة: المصطفى فريخ، عبد الوهاب فخور ومحمد اريتوني.',
        '',
        'بعد ذلك، أخذ السيد محمد الغالي الكلمة رحب من خلالها بالجميع، وأكد للحضور بأن الشركة منفتحة على النقاش، وليس لها أي موقف من أي إطار نقابي كيفما كان انتماؤه.',
        'أما من جانب المكتب النقابي، فقد صرحوا بأنهم يتوفرون على الأغلبية، وطالبوا باعتبارهم المحاور الرسمي وبإعادة انتخاب مناديب الأجراء في أقرب وقت ممكن.',
        '',
        'لينتهي الاجتماع عند هذا الحد على الساعة الواحدة زوالا 13H00 وغادر الجميع عين المكان في جو يسوده الاحترام المتبادل.',
        '',
        'وبمضمنه حررنا هذا المحضر للرجوع اليه عند الحاجة.',
        'توقيع المفوض القضائي:',
      ].join('\n'),
  },
]

// Petite image PNG 1x1 (fausse photo) pour les pièces jointes de démonstration.
const FAKE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

/* ---------------------------------------------------------------------- */

try {
  line('═══════════════════════════════════════════════════════════════')
  line('  Mofawid — génération des données de démonstration')
  line(`  Cible API : ${BASE}`)
  line('═══════════════════════════════════════════════════════════════')

  stepLog('Connexion en tant que superadmin')
  const superToken = await login('superadmin', 'Admin@123')
  out('OK superadmin')

  stepLog('Établissement démo (celui de admin.demo) + administrateur')
  let adminToken = null
  let tenant = null
  try {
    // admin.demo existe déjà : on travaille dans SON établissement.
    adminToken = await login('admin.demo', DEMO_PASSWORD)
    tenant = await req('GET', '/api/tenants/me', adminToken)
    out(`admin.demo déjà existant — établissement : ${tenant.name}`)
  } catch {
    const tenantsPage = await req('GET', `/api/tenants?page=0&size=100`, superToken)
    tenant = (tenantsPage.content || []).find((t) => t.slug === OFFICE.slug)
    if (!tenant) {
      tenant = await req('POST', '/api/tenants', superToken, OFFICE)
      out(`Établissement créé : ${tenant.name}`)
    }
    await req('POST', `/api/tenants/${tenant.id}/admin`, superToken, {
      username: 'admin.demo',
      email: 'admin.demo@mofawid.ma',
      password: DEMO_PASSWORD,
      nom: 'Bennani',
      prenom: 'Karim',
      phone: '+212 6 61 00 00 01',
      role: 'ADMIN',
    })
    adminToken = await login('admin.demo', DEMO_PASSWORD)
    out('admin.demo créé et connecté')
  }

  // En-tête des procès-verbaux : on garde nom / slug / statut / adresse / téléphone de l'établissement.
  tenant = await req('PUT', `/api/tenants/${tenant.id}`, superToken, {
    ...OFFICE,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status || OFFICE.status,
    adress: tenant.adress || OFFICE.adress,
    phone: tenant.phone || OFFICE.phone,
  })
  out(`En-tête : ${tenant.huissierNameAr} — ${tenant.huissierNameFr}`)

  stepLog('Création des utilisateurs (assistant + collaborateurs)')
  const usersPage = await req('GET', '/api/users?page=0&size=200', adminToken)
  const existingByUsername = new Map((usersPage.content || []).map((u) => [u.username, u]))

  const usersToCreate = [
    { username: 'assistant.demo', email: 'assistant.demo@mofawid.ma', password: 'Assist@123', nom: 'Alaoui', prenom: 'Nadia', role: 'ASSISTANT' },
    // nom/prénom en arabe : ils apparaissent dans le PV (« كاتبنا المحلف السيد … »)
    { username: 'collab.ahmed', email: 'collab.ahmed@mofawid.ma', password: 'Ahmed@123', nom: 'الفاسي', prenom: 'أحمد', role: 'COLLABORATEUR' },
    { username: 'collab.sara', email: 'collab.sara@mofawid.ma', password: 'Sara@123', nom: 'برادة', prenom: 'سارة', role: 'COLLABORATEUR' },
    { username: 'collab.driss', email: 'collab.driss@mofawid.ma', password: 'Driss@123', nom: 'التازي', prenom: 'إدريس', role: 'COLLABORATEUR' },
  ]

  const collaborators = {}
  for (const u of usersToCreate) {
    if (existingByUsername.has(u.username)) {
      out(`${u.username} existe déjà`)
      if (u.role === 'COLLABORATEUR') collaborators[u.username] = existingByUsername.get(u.username)
      continue
    }
    const created = await req('POST', '/api/users', adminToken, u)
    out(`${u.username} créé`)
    if (u.role === 'COLLABORATEUR') collaborators[u.username] = created
  }

  const collabPasswords = {
    'collab.ahmed': 'Ahmed@123',
    'collab.sara': 'Sara@123',
    'collab.driss': 'Driss@123',
  }
  const collabTokens = {}
  for (const username of Object.keys(collabPasswords)) {
    collabTokens[username] = await login(username, collabPasswords[username])
  }

  stepLog('Les 7 dossiers d\'exemple (un par type de procès-verbal)')
  const casesPage = await req('GET', '/api/cases?page=0&size=200', adminToken)
  const existingBySubject = new Map((casesPage.content || []).map((c) => [c.subject, c]))
  const allMissions = (await req('GET', '/api/missions?page=0&size=500', adminToken)).content || []
  const createdCases = []

  for (const sc of SCENARIOS) {
    line(`\n  ▸ ${sc.kind}`)

    // Un dossier déjà terminé (il a son PV d'exemple) est sauté.
    // Un dossier arrêté en cours de route (erreur) est repris là où il s'est arrêté.
    let caseItem = existingBySubject.get(sc.case.subject)
    if (caseItem) {
      const docs = await req('GET', `/api/cases/${caseItem.id}/documents?page=0&size=10`, adminToken)
      if ((docs.content || []).length > 0) {
        out(`  ${caseItem.ref} déjà créé — sauté`)
        continue
      }
      out(`  ${caseItem.ref} incomplet — reprise`)
    }

    // 1. Dossier (le numéro 2026/N est donné par le back-end)
    if (!caseItem) {
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 20)
      caseItem = await req('POST', '/api/cases', adminToken, { ...sc.case, deadline: localDate(deadline) })
      createdCases.push(caseItem)
      out(`  dossier ${caseItem.ref} — ${sc.case.subject}`)
    }

    // 2. Parties (si le dossier n'en a pas encore)
    const parties = await req('GET', `/api/cases/${caseItem.id}/parties`, adminToken)
    if (parties.length === 0) {
      for (const p of sc.parties) {
        await req('POST', `/api/cases/${caseItem.id}/parties`, adminToken, p)
      }
      out(`  ${sc.parties.length} partie(s)`)
    }

    // 3. Photos / captures avec légende (envoyées dans l'ordre → photo 1, 2, 3)
    const files = await req('GET', `/api/cases/${caseItem.id}/attachments?page=0&size=20`, adminToken)
    if ((files.content || []).length === 0) {
      for (const a of sc.attachments || []) {
        const form = new FormData()
        form.append('file', new Blob([FAKE_PNG], { type: 'image/png' }), a.name)
        form.append('caption', a.caption)
        await req('POST', `/api/cases/${caseItem.id}/attachments`, adminToken, form)
      }
      if (sc.attachments) out(`  ${sc.attachments.length} photo(s) légendée(s)`)
    }

    // 4. Mission du collaborateur (réutilisée si elle existe déjà)
    const collab = collaborators[sc.collab]
    const collabToken = collabTokens[sc.collab]
    let mission = allMissions.find((m) => m.caseId === caseItem.id)
    if (!mission) {
      mission = await req('POST', '/api/missions', adminToken, {
        caseId: caseItem.id,
        collaborateurId: collab.id,
        title: sc.mission.title,
        description: `Mission d'exemple — ${sc.kind}`,
        scheduledAt: localDateTime(new Date()),
      })
    }
    if (mission.status === 'ASSIGNED') {
      await req('PATCH', `/api/missions/${mission.id}/start`, collabToken)
      mission.status = 'IN_PROGRESS'
    }

    if (mission.status === 'IN_PROGRESS') {
      if (sc.presence) {
        await req('PATCH', `/api/missions/${mission.id}/presence`, collabToken, sc.presence)
        out(`  personne présente : ${sc.presence.presentPersonName}`)
      }

      const attempts = await req('GET', `/api/missions/${mission.id}/attempts`, collabToken)
      if (attempts.length === 0) {
        for (const at of sc.attempts || []) {
          await req('POST', `/api/missions/${mission.id}/attempts`, collabToken, at)
        }
        if (sc.attempts) out(`  ${sc.attempts.length} visite(s) — dernière : ${sc.attempts.at(-1).result}`)
      }

      const observations = await req('GET', `/api/missions/${mission.id}/observations?page=0&size=50`, collabToken)
      if ((observations.content || []).length === 0) {
        for (const o of sc.observations || []) {
          await req('POST', `/api/missions/${mission.id}/observations`, collabToken, o)
        }
        if (sc.observations) out(`  ${sc.observations.length} observation(s)`)
      }

      await req('PATCH', `/api/missions/${mission.id}/complete`, collabToken)
      out(`  mission terminée par ${sc.collab}`)
    }

    // 5. Exemple de procès-verbal rédigé (pour voir à quoi ressemble le type)
    const today = new Date()
    const date = `${today.getFullYear()}/${pad(today.getMonth() + 1)}/${pad(today.getDate())}`
    await req('POST', `/api/cases/${caseItem.id}/documents`, adminToken, {
      kind: sc.kind,
      content: sc.content(caseItem.ref, date),
    })
    out('  exemple de PV ajouté (DRAFT)')

    // 6. (optionnel) brouillon Gemini à comparer avec l'exemple
    if (WITH_AI) {
      try {
        await req('POST', `/api/cases/${caseItem.id}/ai-draft?kind=${sc.kind}`, adminToken)
        out('  brouillon IA généré (DRAFT_AI)')
      } catch (err) {
        out(`  brouillon IA : ${err.message} ${err.data ? JSON.stringify(err.data) : ''}`)
      }
    }
  }

  if (createdCases.length > 0) {
    stepLog('Code de suivi client (premier dossier)')
    try {
      const tracking = await req('POST', `/api/cases/${createdCases[0].id}/tracking-code`, adminToken)
      out(`Code de suivi pour ${tracking.caseRef} : ${tracking.trackingCode}`)
      line(`         → Vue client : http://localhost:5173/suivi/${tracking.trackingCode}`)
    } catch (err) {
      out(`Suivi client : ${err.message}`)
    }
  }

  line()
  line('═══════════════════════════════════════════════════════════════')
  line('  ✔ Données de démonstration prêtes')
  line('═══════════════════════════════════════════════════════════════')
  line()
  out('Connexion à l\'application sur http://localhost:5173')
  out('Ouvrez « Dossiers » : un dossier par type de PV. Dans chaque dossier,')
  out('regardez les onglets Parties, Missions (visites / observations),')
  out('Pièces jointes et Documents (l\'exemple de PV).')
  line()
  line('  Comptes de test :')
  line('  ────────────────────────────────────────────────────────')
  line('  superadmin        / Admin@123      (Super administrateur)')
  line(`  admin.demo        / ${DEMO_PASSWORD}         (Administrateur — ${tenant.name})`)
  line('  assistant.demo    / Assist@123      (Assistant)')
  line('  collab.ahmed      / Ahmed@123       (Collaborateur)')
  line('  collab.sara       / Sara@123        (Collaborateur)')
  line('  collab.driss      / Driss@123       (Collaborateur)')
  line('═══════════════════════════════════════════════════════════════')
} catch (err) {
  console.error(`\nEchec du script : ${err.message}`)
  if (err.data) console.error('Détail serveur :', JSON.stringify(err.data))
  process.exit(1)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// Date au format attendu par LocalDate (yyyy-MM-dd).
function localDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Date/heure locale au format attendu par LocalDateTime (sans fuseau).
function localDateTime(date) {
  return (
    `${localDate(date)}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
