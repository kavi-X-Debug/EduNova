import type { Locale } from '@/types';

/**
 * MOCK tutor knowledge. Answers and source titles are written per locale because they are free text
 * (not i18n keys). A real backend must do the same job by passing `locale` to the LLM and instructing it
 * to answer in that language (see docs/CONTRACT.md, "AI tutor and language").
 */
interface LocalisedAnswer {
  text: string;
  sources: { title: string; ref: string }[];
}
export interface TutorTopic {
  /** Matches the question in English, Sinhala or Tamil, whichever language the student typed. */
  match: RegExp;
  answers: Record<Locale, LocalisedAnswer>;
}

export const TUTOR_TOPICS: TutorTopic[] = [
  {
    match: /fraction|භාග|பின்ன/i,
    answers: {
      en: {
        text: 'To add fractions with different denominators, first find a common denominator. For 1/2 + 1/4, change 1/2 to 2/4, then add the numerators: 2/4 + 1/4 = 3/4.',
        sources: [
          { title: 'Grade 6 Mathematics, Unit 3: Fractions', ref: 'curriculum:g6-maths-u3' },
          { title: 'EduNova worked examples: adding fractions', ref: 'lib:frac-add-01' },
        ],
      },
      si: {
        text: 'හර වෙනස් භාග එකතු කිරීමට, පළමුව පොදු හරයක් සොයාගන්න. 1/2 + 1/4 සඳහා, 1/2 යන්න 2/4 ලෙස ලියා, ඉන්පසු ලව එකතු කරන්න: 2/4 + 1/4 = 3/4.',
        sources: [
          { title: '6 ශ්‍රේණියේ ගණිතය, 3 වන ඒකකය: භාග', ref: 'curriculum:g6-maths-u3' },
          { title: 'EduNova විසඳූ උදාහරණ: භාග එකතු කිරීම', ref: 'lib:frac-add-01' },
        ],
      },
      ta: {
        text: 'வெவ்வேறு பகுதிகளைக் கொண்ட பின்னங்களைக் கூட்ட, முதலில் பொதுப் பகுதியைக் காணுங்கள். 1/2 + 1/4 இல், 1/2 ஐ 2/4 ஆக மாற்றி, பின்னர் தொகுதிகளைக் கூட்டுங்கள்: 2/4 + 1/4 = 3/4.',
        sources: [
          { title: '6 ஆம் தரக் கணிதம், அலகு 3: பின்னங்கள்', ref: 'curriculum:g6-maths-u3' },
          { title: 'EduNova தீர்க்கப்பட்ட எடுத்துக்காட்டுகள்: பின்னங்களைக் கூட்டுதல்', ref: 'lib:frac-add-01' },
        ],
      },
    },
  },
  {
    match: /equation|solve|algebra|සමීකරණ|විසඳ|சமன்பாடு|தீர்/i,
    answers: {
      en: {
        text: 'To solve a linear equation, do the same operation on both sides to get x alone. For 2x + 3 = 11: subtract 3 to get 2x = 8, then divide by 2 to get x = 4.',
        sources: [{ title: 'Grade 8 Mathematics, Unit 5: Linear equations', ref: 'curriculum:g8-maths-u5' }],
      },
      si: {
        text: 'රේඛීය සමීකරණයක් විසඳීමට, x තනිවන තෙක් දෙපසටම එකම ක්‍රියාව කරන්න. 2x + 3 = 11 සඳහා: 3 අඩු කර 2x = 8 ලබාගන්න, ඉන්පසු 2 න් බෙදා x = 4 ලබාගන්න.',
        sources: [{ title: '8 ශ්‍රේණියේ ගණිතය, 5 වන ඒකකය: රේඛීය සමීකරණ', ref: 'curriculum:g8-maths-u5' }],
      },
      ta: {
        text: 'ஒரு நேரிய சமன்பாட்டைத் தீர்க்க, x தனித்து வரும் வரை இரு பக்கங்களிலும் ஒரே செயலைச் செய்யுங்கள். 2x + 3 = 11 இல்: 3 ஐக் கழித்து 2x = 8 எனப் பெறுங்கள், பின்னர் 2 ஆல் வகுத்து x = 4 எனப் பெறுங்கள்.',
        sources: [{ title: '8 ஆம் தரக் கணிதம், அலகு 5: நேரிய சமன்பாடுகள்', ref: 'curriculum:g8-maths-u5' }],
      },
    },
  },
  {
    match: /pythag|triangle|hypotenuse|පයිතගරස්|කර්ණ|ත්‍රිකෝණ|பிதாகரஸ்|செம்பக்க|முக்கோண/i,
    answers: {
      en: {
        text: 'In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: c² = a² + b². With sides 3 and 4, c² = 9 + 16 = 25, so c = 5.',
        sources: [{ title: 'Grade 9 Mathematics, Unit 2: Pythagoras theorem', ref: 'curriculum:g9-maths-u2' }],
      },
      si: {
        text: 'සෘජුකෝණී ත්‍රිකෝණයක කර්ණයේ වර්ගය, අනෙක් පාද දෙකේ වර්ගවල එකතුවට සමාන වේ: c² = a² + b². පාද 3 සහ 4 නම්, c² = 9 + 16 = 25, එබැවින් c = 5.',
        sources: [{ title: '9 ශ්‍රේණියේ ගණිතය, 2 වන ඒකකය: පයිතගරස් ප්‍රමේයය', ref: 'curriculum:g9-maths-u2' }],
      },
      ta: {
        text: 'ஒரு செங்கோண முக்கோணத்தில் செம்பக்கத்தின் வர்க்கம், மற்ற இரு பக்கங்களின் வர்க்கங்களின் கூட்டுத்தொகைக்குச் சமம்: c² = a² + b². பக்கங்கள் 3 மற்றும் 4 எனில், c² = 9 + 16 = 25, எனவே c = 5.',
        sources: [{ title: '9 ஆம் தரக் கணிதம், அலகு 2: பிதாகரஸ் தேற்றம்', ref: 'curriculum:g9-maths-u2' }],
      },
    },
  },
  {
    match: /cell|nucleus|photosynth|plant|සෛල|න්‍යෂ්ටි|ශාක|கலம்|கலங்|கருவம்|தாவர/i,
    answers: {
      en: {
        text: "The cell is the basic unit of living things. The nucleus controls the cell's activities, while in plant cells the chloroplasts capture light for photosynthesis.",
        sources: [{ title: 'Grade 7 Science, Unit 1: Cells and living things', ref: 'curriculum:g7-science-u1' }],
      },
      si: {
        text: 'සෛලය ජීවීන්ගේ මූලික ඒකකයයි. න්‍යෂ්ටිය සෛලයේ ක්‍රියාකාරකම් පාලනය කරයි; ශාක සෛලවල හරිතලව ප්‍රභාසංශ්ලේෂණය සඳහා ආලෝකය උකහා ගනී.',
        sources: [{ title: '7 ශ්‍රේණියේ විද්‍යාව, 1 වන ඒකකය: සෛල සහ ජීවීන්', ref: 'curriculum:g7-science-u1' }],
      },
      ta: {
        text: 'கலம் உயிரினங்களின் அடிப்படை அலகு. கருவம் கலத்தின் செயற்பாடுகளைக் கட்டுப்படுத்துகிறது; தாவரக் கலங்களில் பசுங்கணிகங்கள் ஒளிச்சேர்க்கைக்காக ஒளியை உறிஞ்சுகின்றன.',
        sources: [{ title: '7 ஆம் தர அறிவியல், அலகு 1: கலங்களும் உயிரினங்களும்', ref: 'curriculum:g7-science-u1' }],
      },
    },
  },
  {
    match: /force|newton|motion|බලය|බල සහ|චලිත|නිව්ටන්|விசை|நியூட்டன்|இயக்க/i,
    answers: {
      en: {
        text: 'A force is a push or a pull, measured in newtons (N). A net force on an object changes its speed or direction of motion.',
        sources: [{ title: 'Grade 8 Science, Unit 4: Forces and motion', ref: 'curriculum:g8-science-u4' }],
      },
      si: {
        text: 'බලය යනු තල්ලුවක් හෝ ඇදීමකි; එය මනිනු ලබන්නේ නිව්ටන් (N) වලිනි. වස්තුවක් මත ක්‍රියා කරන සම්ප්‍රයුක්ත බලයක් එහි වේගය හෝ චලිත දිශාව වෙනස් කරයි.',
        sources: [{ title: '8 ශ්‍රේණියේ විද්‍යාව, 4 වන ඒකකය: බල සහ චලිතය', ref: 'curriculum:g8-science-u4' }],
      },
      ta: {
        text: 'விசை என்பது தள்ளுதல் அல்லது இழுத்தல்; அது நியூட்டனில் (N) அளக்கப்படுகிறது. ஒரு பொருளின் மீது செயற்படும் தேறிய விசை அதன் கதியையோ இயக்கத் திசையையோ மாற்றும்.',
        sources: [{ title: '8 ஆம் தர அறிவியல், அலகு 4: விசையும் இயக்கமும்', ref: 'curriculum:g8-science-u4' }],
      },
    },
  },
  {
    match: /tense|grammar|verb|past|කාල|ක්‍රියාපද|ව්‍යාකරණ|காலம்|வினை|இலக்கண/i,
    answers: {
      en: {
        text: 'The simple past tense describes finished actions. Regular verbs add -ed (walk to walked); many common verbs are irregular (go to went, see to saw).',
        sources: [{ title: 'Grade 6 English, Unit 2: Tenses', ref: 'curriculum:g6-english-u2' }],
      },
      si: {
        text: 'සරල අතීත කාලය අවසන් වූ ක්‍රියා විස්තර කරයි. සාමාන්‍ය ක්‍රියාපද -ed එකතු කරයි (walk → walked); බොහෝ පොදු ක්‍රියාපද අක්‍රමවත් ය (go → went, see → saw).',
        sources: [{ title: '6 ශ්‍රේණියේ ඉංග්‍රීසි, 2 වන ඒකකය: කාල', ref: 'curriculum:g6-english-u2' }],
      },
      ta: {
        text: 'எளிய இறந்தகாலம் முடிந்துபோன செயல்களை விவரிக்கிறது. ஒழுங்கான வினைச்சொற்கள் -ed சேர்க்கும் (walk → walked); பல பொதுவான வினைச்சொற்கள் ஒழுங்கற்றவை (go → went, see → saw).',
        sources: [{ title: '6 ஆம் தர ஆங்கிலம், அலகு 2: காலங்கள்', ref: 'curriculum:g6-english-u2' }],
      },
    },
  },
  {
    match: /flowchart|algorithm|program|code|ඇල්ගොරිතම|ගැලීම්|ක්‍රමලේඛ|படிமுறை|பாய்வு|நிரல்/i,
    answers: {
      en: {
        text: 'An algorithm is a clear set of steps to solve a problem. A flowchart draws those steps: ovals for start/end, rectangles for actions, and diamonds for decisions.',
        sources: [{ title: 'Grade 8 ICT, Unit 3: Algorithms and flowcharts', ref: 'curriculum:g8-ict-u3' }],
      },
      si: {
        text: 'ඇල්ගොරිතමයක් යනු ගැටලුවක් විසඳීමට අදාළ පැහැදිලි පියවර මාලාවකි. ගැලීම් සටහනක් එම පියවර අඳී: ආරම්භය/අවසානය සඳහා ඕවලාකාර, ක්‍රියා සඳහා සෘජුකෝණාස්‍ර, තීරණ සඳහා දියමන්ති හැඩ.',
        sources: [{ title: '8 ශ්‍රේණියේ තොරතුරු හා සන්නිවේදන තාක්ෂණය, 3 වන ඒකකය: ඇල්ගොරිතම සහ ගැලීම් සටහන්', ref: 'curriculum:g8-ict-u3' }],
      },
      ta: {
        text: 'படிமுறை என்பது ஒரு சிக்கலைத் தீர்க்கும் தெளிவான படிகளின் தொகுப்பு. பாய்வுப்படம் அந்தப் படிகளை வரைந்து காட்டும்: தொடக்கம்/முடிவுக்கு நீள்வட்டம், செயல்களுக்குச் செவ்வகம், தீர்மானங்களுக்குச் சாய்சதுரம்.',
        sources: [{ title: '8 ஆம் தரத் தகவல் தொடர்புத் தொழில்நுட்பம், அலகு 3: படிமுறைகளும் பாய்வுப்படங்களும்', ref: 'curriculum:g8-ict-u3' }],
      },
    },
  },
];

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
