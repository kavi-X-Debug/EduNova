# Strings that need a native-speaker review

Sinhala and Tamil text in this repo was written and checked by a non-native reviewer for consistency, structure, interpolation and Unicode only. **Nothing here has been verified by a native speaker.** Please review the items below (most important first). Terms are in `docs/I18N-GLOSSARY.md`.

## 1. Safety-critical wording (please review all)
- `wellbeing.prompt.*`, `teacher.wellbeing.*` (si, ta): confirm they read as gentle, private, non-diagnostic and not stigmatising ("සුවදුක් විමසීම", "நலம் விசாரிப்பு").
- `student.exams.band.*`, `ui.band.*` and `*.desc` (si, ta): confirm the four band names do not sound like marks or judgements, especially Tamil "அடித்தளம் அமைக்கிறது" (Building) and Sinhala "ස්ථාවර" (Secure).
- `student.exams.readiness.note`, `student.exams.readiness.bandNotMark`: "not a mark / not a prediction".

## 2. Terminology to confirm
- AI tutor: si "උපදේශකයා" (advisor/counsellor; alternative: "AI ගුරුවරයා" but that collides with the teacher role), ta "பயிற்றுநர்" (trainer; alternative "AI ஆசிரியர்").
- Diagnostic: si "ඇගයීම" (evaluation), ta "நிலை அறியும் மதிப்பீடு" (changed from "அறிநிலை மதிப்பீடு", which looked unnatural).
- ta science terms in diagnostic questions and tutor answers: "கருவம்" (nucleus), "நுண்குமிழ்" (vacuole), "தேறிய விசை" (net force), "கதி" (speed), "பசுங்கணிகம்" (chloroplast), "இலத்திரன்" (electron).
- si "සම්ප්‍රයුක්ත බලය" (net force), "පද රූප" (word forms), "ප්‍රභාසංශ්ලේෂණය" (photosynthesis), "පරතරයක් සහිත පුනරීක්ෂණය" (spaced review; changed from "විරාම සහිත", which means "with pauses/punctuation").
- Quest / mission / badge: "අභියෝගය / කාර්යය / ලාංඡනය", "சவால் / பணி / பதக்கம்".
- ICT shown in full ("තොරතුරු හා සන්නිවේදන තාක්ෂණය", "தகவல் தொடர்புத் தொழில்நுட்பம்"): long in table cells and curriculum titles; confirm whether "ICT" alone is preferred.

## 3. Tutor mock answers and source titles (`src/mocks/tutorContent.ts`)
All 7 topic answers plus the fallback, in si and ta, and their source titles (unit names are mock data, not the real syllabus). English examples inside the tense answer (walk/walked, go/went) are deliberately left in English.

## 4. Grammar and register
- Tamil: UI buttons use the plain imperative ("தொடங்கு", "பார்"), messages use the polite form ("முயற்சிக்கவும்", "கேளுங்கள்"); confirm this mix is acceptable for Grade 6+ students, or standardise.
- Tamil strings changed to avoid case suffixes on placeholders (e.g. `teacher.overview.openClassNamed` = "வகுப்பைத் திற: {{name}}"); confirm these read naturally.
- Sinhala audit-log actions were changed from colloquial "...කළා" to written "...කරන ලදී"; confirm. Student-facing encouragement keeps friendly endings ("ඉතා හොඳයි! ... කළා.").
- Plural forms: si/ta `_one` and `_other` are identical in Sinhala ("දෙනෙක්") and differ only for some Tamil strings; confirm counts of 1 read correctly.
- Word order for "X of Y" (e.g. si "පියවර {{total}} න් {{done}} ක්", ta "{{total}} படிகளில் {{done}}") and si "XP {{xp}}" vs ta "{{xp}} XP".
- Class label `common.classLabel`: si "8 ශ්‍රේණිය A", ta "தரம் 8 A"; confirm how schools actually write "8A".

## 5. Known leftovers (not translated on purpose)
- Person names in mock data (Latin script) and class section letters (A/B/C).
- Native language names in the switcher ("English", "සිංහල", "தமிழ்"), `EduNova Sahayaka`, `AI`, `XP`, `SI`, `cm`.
- `diagnostic.q-en8-essay.opt2` keeps the English term "(Topic sentence)" because it is the answer to an English-subject question.
- Digits are Latin in all languages; dates come from `Intl` (`si-LK`, `ta-LK`); verify the month names the browser produces look right on the target devices.
