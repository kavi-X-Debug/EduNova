# Sinhala / Tamil glossary

Core terms used in `src/i18n/locales/*.json`, the tutor mock (`src/mocks/tutorContent.ts`) and the curriculum titles. Use these exact terms in new strings. This is a consistency list, **not a native-speaker-verified standard**: see `docs/I18N-REVIEW.md` for terms still to be confirmed (marked `?` below).

| English | සිංහල (si) | தமிழ் (ta) |
|---|---|---|
| Readiness (a band, never a mark) | සූදානම | தயார்நிலை |
| Band: Building | ගොඩනගමින් | அடித்தளம் அமைக்கிறது ? |
| Band: Developing | දියුණු වෙමින් | வளர்ந்து வருகிறது |
| Band: Secure | ස්ථාවර ? | உறுதியானது |
| Band: Strong | ශක්තිමත් | வலுவானது |
| Mastery | ප්‍රගුණතාව | தேர்ச்சி |
| Lesson | පාඩම | பாடம் |
| Practice | පුහුණුව | பயிற்சி |
| Quiz | ප්‍රශ්නාවලිය | வினாடி வினா |
| Revision (spaced review) | පුනරීක්ෂණය | மீள்பார்வை |
| Diagnostic | ඇගයීම | நிலை அறியும் மதிப்பீடு ? |
| Learning path | ඉගෙනුම් මාර්ගය | கற்றல் பாதை |
| Step | පියවර | படி |
| Quest | අභියෝගය | சவால் |
| Mission (inside a quest) | කාර්යය | பணி |
| Badge | ලාංඡනය | பதக்கம் |
| XP (experience points) | XP | XP |
| AI tutor | AI උපදේශකයා ? | AI பயிற்றுநர் ? |
| Sources (of an answer) | මූලාශ්‍ර | மூலங்கள் |
| Topic / concept | මාතෘකාව | தலைப்பு |
| Subject | විෂය | பாடம் |
| Curriculum | විෂය නිර්දේශය | பாடத்திட்டம் |
| Grade (school year) | ශ්‍රේණිය (`6 ශ්‍රේණිය`) | தரம் (`தரம் 6`) |
| Class | පන්තිය | வகுப்பு |
| Exam / paper | විභාගය / ප්‍රශ්න පත්‍රය | தேர்வு / வினாத்தாள் |
| Student / Teacher / Administrator | සිසුවා / ගුරුවරයා / පරිපාලක | மாணவர் / ஆசிரியர் / நிர்வாகி |
| Wellbeing check-in (teacher prompt) | සුවදුක් විමසීම | நலம் விசாரிப்பு |
| Prompt (gentle suggestion) | ඉඟිය | குறிப்பு |
| Audit log | විගණන සටහන | தணிக்கைப் பதிவு |
| Numerator / denominator | ලවය / හරය | தொகுதி / பகுதி |
| Hypotenuse | කර්ණය | செம்பக்கம் |
| Flowchart / algorithm | ගැලීම් සටහන / ඇල්ගොරිතම | பாய்ச்சல் கோட்டுப்படம் / படிமுறை |
| Cell / nucleus | සෛලය / න්‍යෂ්ටිය | கலம் / கருவம் ? |

## Style rules
- Register: formal-but-friendly, addressing the learner as "ඔබ" / "நீங்கள்". No slang, no diagnostic wording about a child. Wellbeing prompts always start with "Consider ..." (සලකා බලන්න / பரிசீலிக்கவும்), are private to the teacher and say they are not a diagnosis.
- Sinhala: written (not colloquial) verb endings in system/admin text (`කරන ලදී`); friendly spoken endings are acceptable in short student encouragement.
- Tamil: Sri Lankan school terminology (`கலம்`, `இலத்திரன்`, `செம்பக்கம்`). Button labels use the plain imperative (`தொடங்கு`), sentences use the polite form (`கேளுங்கள்`). Do not attach case suffixes to a placeholder (`{{name}} ஐ`); rephrase so the name stands alone (`வகுப்பைத் திற: {{name}}`).
- Brand names and acronyms stay Latin: EduNova Sahayaka, AI, XP, ICT, SI, units (cm, N). Everything else must be translated; `npm run i18n:check` enforces this with `scripts/i18n-allowlist.json`.
- Digits are Latin (0-9) in all three languages (standard in Sri Lankan school materials); dates use `Intl` with `si-LK` / `ta-LK`.
- Plurals: write `_one` and `_other` forms for every counted string in all three languages (si and ta use the same two CLDR categories as English).
- Interpolation only (`{{name}}`); never concatenate translated fragments. Allow 30-40% longer text; Indic scripts need line-height >= 1.6 (enforced globally in `src/styles/index.css`).
