import i18next from 'i18next';
import type { Locale } from '@/types';
import { G6_BY_ID, textbookSource } from './concepts';
import { localiseRef, unitKey } from '@/lib/displayNames';

/**
 * MOCK tutor knowledge. Answers and source titles are written per locale because they are free text
 * (not i18n keys). A real backend must do the same job by passing `locale` to the LLM and instructing it
 * to answer in that language (see docs/CONTRACT.md, "AI tutor and language").
 * Sources cite the real Grade 6 textbook unit and pages; titles are localised (book name, unit name via the
 * `unit.*` locale keys, page label) so that a Sinhala/Tamil answer never carries an English citation.
 */
interface LocalisedAnswer {
  text: string;
  sources: { title: string; ref: string }[];
}
export interface TutorTopic {
  /** Matches the question in English, Sinhala or Tamil, whichever language the student typed. */
  match: RegExp;
  answers: (locale: Locale) => LocalisedAnswer;
}

type L3 = Record<Locale, string>;

const BOOK: Record<string, L3> = {
  maths1: { en: '', si: 'ගණිතය 6 ශ්‍රේණිය I කොටස', ta: 'கணிதம் தரம் 6 பகுதி I' },
  maths2: { en: '', si: 'ගණිතය 6 ශ්‍රේණිය II කොටස', ta: 'கணிதம் தரம் 6 பகுதி II' },
  science: { en: '', si: 'විද්‍යාව 6 ශ්‍රේණිය', ta: 'அறிவியல் தரம் 6' },
  sinhala: { en: '', si: 'සිංහල භාෂාව හා සාහිත්‍යය 6 ශ්‍රේණිය', ta: 'சிங்கள மொழியும் இலக்கியமும் தரம் 6' },
  english: { en: '', si: 'ඉංග්‍රීසි ශිෂ්‍ය පොත 6 ශ්‍රේණිය', ta: 'ஆங்கில மாணவர் புத்தகம் தரம் 6' },
  ict: { en: '', si: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය 6 ශ්‍රේණිය කියවීම් පොත', ta: 'தகவல் தொடர்புத் தொழில்நுட்பம் தரம் 6 வாசிப்பு நூல்' },
};
function textbook(conceptId: string, locale: Locale): { title: string; ref: string } {
  const en = textbookSource(conceptId);
  if (locale === 'en') return en;
  const c = G6_BY_ID.get(conceptId);
  if (!c) return en;
  const unit = i18next.t(unitKey(c.unit), { lng: locale, defaultValue: c.unit }) as string;
  const bookKey = c.subject === 'maths' ? (/Part 2/.test(c.textbookRef) ? 'maths2' : 'maths1') : c.subject;
  return { title: `${BOOK[bookKey][locale]}, ${unit}`, ref: localiseRef(c.textbookRef, locale) };
}

interface Spec {
  match: RegExp;
  text: L3;
  books: string[];
  extra?: { ref: string; title: L3 };
}
const SPECS: Spec[] = [
  {
    match: /fraction|භාග|பின்ன/i,
    text: {
      en: 'Equivalent fractions name the same amount: multiply the top and bottom by the same number, so 1/2 = 2/4 = 3/6. To add fractions, first give them the same denominator, then add the numerators: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.',
      si: 'සමාන භාග එකම ප්‍රමාණයක් නම් කරයි: ලවය සහ හරය එකම සංඛ්‍යාවෙන් ගුණ කරන්න, එවිට 1/2 = 2/4 = 3/6 වේ. භාග එකතු කිරීමට, පළමුව ඒවාට එකම හරය ලබා දී, ඉන්පසු ලව එකතු කරන්න: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.',
      ta: 'சமான பின்னங்கள் ஒரே அளவைக் குறிக்கின்றன: தொகுதியையும் பகுதியையும் ஒரே எண்ணால் பெருக்குங்கள், அப்போது 1/2 = 2/4 = 3/6 ஆகும். பின்னங்களைக் கூட்ட, முதலில் அவற்றுக்கு ஒரே பகுதியைக் கொடுத்து, பின்னர் தொகுதிகளைக் கூட்டுங்கள்: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.',
    },
    books: ['m6-fractions'],
    extra: {
      ref: 'lib:frac-equiv-01',
      title: { en: 'EduNova worked examples: equivalent fractions', si: 'EduNova විසඳූ උදාහරණ: සමාන භාග', ta: 'EduNova தீர்க்கப்பட்ட எடுத்துக்காட்டுகள்: சமான பின்னங்கள்' },
    },
  },
  {
    match: /decimal|දශම|தசம/i,
    text: {
      en: 'A decimal is another way to write tenths and hundredths. 3/10 is written 0.3 and 25/100 is written 0.25. The first place after the point is tenths, the second is hundredths.',
      si: 'දශම යනු දහයෙන් කොටස් සහ සියයෙන් කොටස් ලිවීමේ තවත් ක්‍රමයකි. 3/10 ලියන්නේ 0.3 ලෙසත්, 25/100 ලියන්නේ 0.25 ලෙසත් ය. දශම ලක්ෂයට පසු පළමු ස්ථානය දහයෙන් කොටස් ද, දෙවැන්න සියයෙන් කොටස් ද වේ.',
      ta: 'தசமம் என்பது பத்தில் ஒரு பகுதிகளையும் நூறில் ஒரு பகுதிகளையும் எழுதும் மற்றொரு முறை. 3/10 என்பது 0.3 எனவும் 25/100 என்பது 0.25 எனவும் எழுதப்படும். தசமப் புள்ளிக்குப் பின் முதல் இடம் பத்தில் ஒன்று, இரண்டாவது இடம் நூறில் ஒன்று.',
    },
    books: ['m6-decimals'],
  },
  {
    match: /algebra|symbol|substitut|වීජ|இயற்கணித/i,
    text: {
      en: 'In algebra a letter stands for an unknown number. If x is the number of pens in a box, 3 boxes hold 3x pens. To substitute, replace the letter with its value: when x = 5, 3x = 15.',
      si: 'වීජ ගණිතයේ දී අකුරක් නොදන්නා සංඛ්‍යාවක් නියෝජනය කරයි. x යනු පෙට්ටියක ඇති පෑන් ගණන නම්, පෙට්ටි 3 ක පෑන් 3x ක් ඇත. ආදේශ කිරීමට, අකුර වෙනුවට එහි අගය යොදන්න: x = 5 විට, 3x = 15.',
      ta: 'இயற்கணிதத்தில் ஓர் எழுத்து தெரியாத எண்ணைக் குறிக்கும். x என்பது ஒரு பெட்டியில் உள்ள பேனாக்களின் எண்ணிக்கை எனில், 3 பெட்டிகளில் 3x பேனாக்கள் இருக்கும். பிரதியிட, எழுத்துக்குப் பதிலாக அதன் பெறுமானத்தை இடுங்கள்: x = 5 ஆக இருக்கும்போது, 3x = 15.',
    },
    books: ['m6-algebraic-symbols', 'm6-algebraic-expressions'],
  },
  {
    match: /angle|කෝණ|கோண/i,
    text: {
      en: 'An angle shows how much one line turns from another. A right angle is a quarter turn. Angles smaller than a right angle are acute; angles between a right angle and a straight line are obtuse.',
      si: 'කෝණයක් මගින් එක් රේඛාවක් තවත් රේඛාවකින් කොපමණ හැරී ඇත්දැයි පෙන්වයි. සෘජුකෝණයක් යනු හතරෙන් එකක හැරීමකි. සෘජුකෝණයට කුඩා කෝණ සුළු කෝණ වන අතර, සෘජුකෝණය සහ සරල රේඛාව අතර කෝණ මහා කෝණ වේ.',
      ta: 'ஒரு கோணம் ஒரு கோடு மற்றொன்றிலிருந்து எவ்வளவு திரும்பியுள்ளது என்பதைக் காட்டுகிறது. செங்கோணம் என்பது கால் சுழற்சி. செங்கோணத்தை விடச் சிறிய கோணங்கள் குறுங்கோணங்கள்; செங்கோணத்துக்கும் நேர்கோட்டுக்கும் இடைப்பட்ட கோணங்கள் விரிகோணங்கள்.',
    },
    books: ['m6-angles'],
  },
  {
    match: /magnet|චුම්බක|காந்த/i,
    text: {
      en: 'A magnet attracts things made of iron, nickel and cobalt. Every magnet has a north and a south pole: like poles push apart and unlike poles pull together.',
      si: 'චුම්බකයක් යකඩ, නිකල් සහ කොබෝල්ට් වලින් සෑදූ දේවල් ආකර්ෂණය කරයි. සෑම චුම්බකයකටම උතුරු සහ දකුණු ධ්‍රැව ඇත: සමාන ධ්‍රැව එකිනෙක විකර්ෂණය කරන අතර අසමාන ධ්‍රැව ආකර්ෂණය කරයි.',
      ta: 'காந்தம் இரும்பு, நிக்கல், கோபால்ட் ஆகியவற்றால் ஆன பொருள்களைக் கவரும். ஒவ்வொரு காந்தத்துக்கும் வட, தென் முனைகள் உண்டு: ஒத்த முனைகள் ஒன்றையொன்று தள்ளும், வேறுபட்ட முனைகள் ஒன்றையொன்று கவரும்.',
    },
    books: ['s6-magnets'],
  },
  {
    match: /circuit|electric|conductor|විදුලි|විද්‍යුත්|மின்/i,
    text: {
      en: 'Electricity flows only around a complete circuit: a cell, wires, a switch and a bulb joined in a loop. Metals such as copper are conductors; rubber, plastic and glass are insulators.',
      si: 'විදුලිය ගලන්නේ සම්පූර්ණ පරිපථයක පමණි: කෝෂයක්, සන්නායක කම්බි, ස්විච්චයක් සහ විදුලි බල්බයක් වළල්ලක් ලෙස සම්බන්ධ කළ විට. තඹ වැනි ලෝහ සන්නායක වන අතර, රබර්, ප්ලාස්ටික් සහ වීදුරු පරිවාරක වේ.',
      ta: 'மின்சாரம் முழுமையான சுற்றில் மட்டுமே பாய்கிறது: ஒரு மின்கலம், கம்பிகள், ஒரு சுவிட்சு, ஒரு மின்குமிழ் ஆகியவை வளையமாக இணைக்கப்பட்டிருக்க வேண்டும். செம்பு போன்ற உலோகங்கள் கடத்திகள்; இறப்பர், பிளாஸ்டிக், கண்ணாடி ஆகியவை காவலிகள்.',
    },
    books: ['s6-electric-circuits'],
  },
  {
    match: /tense|past|yesterday|අතීත|இறந்த/i,
    text: {
      en: 'We use the past tense for actions that are finished. Many verbs add -ed (play to played), but some common verbs change form (go to went, see to saw, have to had).',
      si: 'අවසන් වූ ක්‍රියා සඳහා අතීත කාලය භාවිත කරයි. බොහෝ ක්‍රියාපද -ed එකතු කරයි (play → played), නමුත් සමහර පොදු ක්‍රියාපද හැඩය වෙනස් කරයි (go → went, see → saw, have → had).',
      ta: 'முடிந்துவிட்ட செயல்களுக்கு இறந்த காலத்தைப் பயன்படுத்துகிறோம். பல வினைச்சொற்கள் -ed சேர்க்கும் (play → played), ஆனால் சில பொதுவான வினைச்சொற்கள் வடிவம் மாறும் (go → went, see → saw, have → had).',
    },
    books: ['en6-was-it-yesterday'],
  },
  {
    match: /verb|noun|ක්‍රියා|නාම|வினை|பெயர்ச்சொல்/i,
    text: {
      en: 'A noun names a person, place or thing; a verb tells us what someone does. In Sinhala, nouns change for number (one or many) and verbs agree with the subject of the sentence.',
      si: 'නාම පදයක් පුද්ගලයෙකු, ස්ථානයක් හෝ දෙයක් නම් කරයි; ක්‍රියා පදයක් යමෙක් කරන දේ කියයි. සිංහලයේ දී නාම පද වචන සංඛ්‍යාව (එක හෝ කිහිපය) අනුව වෙනස් වන අතර, ක්‍රියා පද වාක්‍යයේ කර්තෘට අනුකූල වේ.',
      ta: 'பெயர்ச்சொல் ஒரு நபர், இடம் அல்லது பொருளைக் குறிக்கும்; வினைச்சொல் ஒருவர் செய்வதைக் கூறும். சிங்களத்தில் பெயர்ச்சொற்கள் எண்ணுக்கு (ஒன்று அல்லது பல) ஏற்ப மாறும்; வினைச்சொற்கள் வாக்கியத்தின் எழுவாய்க்கு ஏற்ப அமையும்.',
    },
    books: ['si6-nouns', 'si6-verbs'],
  },
  {
    match: /flowchart|algorithm|ඇල්ගොරිතම|ගැලීම්|படிமுறை|பாய்ச்சல்|பாய்வு/i,
    text: {
      en: 'An algorithm is a clear list of steps that solves a problem. A flowchart draws those steps: ovals for start and end, rectangles for actions, and diamonds for decisions.',
      si: 'ඇල්ගොරිතමයක් යනු ගැටලුවක් විසඳීමට අදාළ පැහැදිලි පියවර ලැයිස්තුවකි. ගැලීම් සටහනක් එම පියවර අඳී: ආරම්භය සහ අවසානය සඳහා ඕවලාකාර, ක්‍රියා සඳහා සෘජුකෝණාස්‍ර, තීරණ සඳහා දියමන්ති හැඩ.',
      ta: 'படிமுறை என்பது ஒரு சிக்கலைத் தீர்க்கும் தெளிவான படிகளின் பட்டியல். பாய்ச்சல் கோட்டுப்படம் அந்தப் படிகளை வரைந்து காட்டும்: தொடக்கம், முடிவுக்கு நீள்வட்டம்; செயல்களுக்குச் செவ்வகம்; தீர்மானங்களுக்குச் சாய்சதுரம்.',
    },
    books: ['ict6-problem-solving-algorithms', 'ict6-flowcharts'],
  },
  {
    match: /internet|online|safe|password|අන්තර්ජාල|இணைய/i,
    text: {
      en: 'Stay safe online: never share your address, phone number or passwords, only use websites your teacher or parent trusts, and tell a trusted adult if something online worries you.',
      si: 'අන්තර්ජාලයේ ආරක්ෂිතව සිටින්න: ඔබේ ලිපිනය, දුරකථන අංකය හෝ මුරපද කිසි විටෙක බෙදා නොගන්න, ඔබේ ගුරුවරයා හෝ දෙමාපියන් විශ්වාස කරන වෙබ් අඩවි පමණක් භාවිත කරන්න, අන්තර්ජාලයේ යමක් ඔබව කනස්සලු කළහොත් විශ්වාසවන්ත වැඩිහිටියෙකුට කියන්න.',
      ta: 'இணையத்தில் பாதுகாப்பாக இருங்கள்: உங்கள் முகவரி, தொலைபேசி எண் அல்லது கடவுச்சொற்களை ஒருபோதும் பகிராதீர்கள்; உங்கள் ஆசிரியரோ பெற்றோரோ நம்பும் இணையத்தளங்களை மட்டுமே பயன்படுத்துங்கள்; இணையத்தில் ஏதாவது உங்களைக் கவலைப்படுத்தினால் நம்பிக்கைக்குரிய ஒரு பெரியவரிடம் சொல்லுங்கள்.',
    },
    books: ['ict6-online-safety'],
  },
];

export const TUTOR_TOPICS: TutorTopic[] = SPECS.map((s) => ({
  match: s.match,
  answers: (locale) => ({
    text: s.text[locale],
    sources: [
      ...s.books.map((b) => textbook(b, locale)),
      ...(s.extra ? [{ title: s.extra.title[locale], ref: s.extra.ref }] : []),
    ],
  }),
}));

export const TUTOR_FALLBACK: Record<Locale, LocalisedAnswer> = {
  en: {
    text: 'Good question. Let us break it into small steps: first write down what you already know, then what the question asks, then try one step at a time. Tell me which step feels unclear and I will explain it.',
    sources: [{ title: 'EduNova study skills guide: breaking down problems', ref: 'lib:study-skills-01' }],
  },
  si: {
    text: 'හොඳ ප්‍රශ්නයක්. අපි එය කුඩා පියවරවලට බෙදා ගනිමු: මුලින් ඔබ දැනටමත් දන්නා දේ ලියන්න, ඉන්පසු ප්‍රශ්නයෙන් අසන්නේ කුමක්දැයි ලියන්න, ඉන්පසු එක් වරකට එක් පියවරක් උත්සාහ කරන්න. ඔබට පැහැදිලි නැති පියවර මොනවාදැයි මට කියන්න, මම එය පැහැදිලි කරමි.',
    sources: [{ title: 'EduNova අධ්‍යයන කුසලතා මාර්ගෝපදේශය: ගැටලු කුඩා කොටස්වලට බෙදීම', ref: 'lib:study-skills-01' }],
  },
  ta: {
    text: 'நல்ல கேள்வி. இதைச் சிறு படிகளாகப் பிரிப்போம்: முதலில் உங்களுக்கு ஏற்கனவே தெரிந்ததை எழுதுங்கள், பிறகு கேள்வி என்ன கேட்கிறது என்பதை எழுதுங்கள், அதன் பின் ஒவ்வொரு படியாக முயலுங்கள். எந்தப் படி புரியவில்லை என்று சொல்லுங்கள், நான் விளக்குகிறேன்.',
    sources: [{ title: 'EduNova கற்றல் திறன் வழிகாட்டி: சிக்கல்களைச் சிறு பகுதிகளாகப் பிரித்தல்', ref: 'lib:study-skills-01' }],
  },
};
