# Kids UX brief: make the student side easy for a Grade 6 child (age 10-11)

Problem (from the product owner): a child can't easily understand how the system works. Adults' vocabulary
(mastery, diagnostic, revision, readiness band, path, exam report, XP) and 9 nav items are too much.
Goal: a child opens the app and knows within 5 seconds **what to do next and why**, without reading
instructions, in English, Sinhala and Tamil. Teacher and admin areas stay as they are.

## Principles
1. **One big thing per screen.** Every student screen has one obvious primary action ("Start", "Next", "Ask").
   Secondary things are smaller or tucked away.
2. **Few choices.** Student navigation becomes 5 items at most, each a big icon plus ONE short word:
   Home, Learn, Ask (tutor), Play (quests + badges), Me (profile). Revision, exams, diagnostic, path detail
   live inside these (Home card "Quick review", Learn tabs, "Check-ups" inside Learn), not as top-level items.
   Keep the old routes working (redirect or keep as sub-pages) so nothing breaks.
3. **Kid words, short sentences.** Reading age 9-10. Rename jargon everywhere (all three locales):
   diagnostic -> "Warm-up quiz" / "Let's see what you know"; revision -> "Remember it again";
   mastery band -> "How strong am I?" with friendly names; quest/mission -> "Adventure"/"Challenge";
   exam report -> "Test results"; path -> "My learning trail". Never show jargon, percent or numbers
   without a picture. Keep readiness as a band (never a mark or rank): show it as a friendly meter
   (e.g. seedling, sprout, plant, tree) with a word. No leaderboards, no comparing, no shame.
4. **Show, don't tell.** Icons and illustrations carry meaning; text confirms. A mascot (original, friendly,
   simple SVG using tokens; name it, e.g. "Nova") appears on Home, tutor, empty states and tips, with short
   speech bubbles ("Hi Kavi! Ready for a 5 minute lesson?"). Use the student's first name.
5. **Guided first run.** A short (4-5 step) welcome tour on first login: what Home is, how to start a lesson,
   where to ask for help, where badges live. Skippable, replayable from Me > "Show me around". Plus tiny
   "?" help bubbles on each main page ("What is this?") with 1-2 sentences and an icon. Remember completion
   in the mock profile/localStorage. Keyboard accessible, focus-managed, announced via aria-live.
6. **Always say what's next.** A big "Today's plan" card on Home: 3 steps max with checkmarks and an estimated
   time ("About 10 minutes"), one big "Start" button. After finishing a step: a friendly done screen with
   "Great job" + the next step button. No dead ends.
7. **Big and forgiving.** Touch targets 56px+ for primary actions, body text >= 18px, generous spacing,
   high-contrast, rounded shapes, clear focus. Errors in plain words with a mascot ("Oops, let's try again").
   Confirm destructive things; undo where possible.
8. **Read aloud.** A speaker button on key text (instructions, questions, tutor answers) using the browser
   Web Speech API (speechSynthesis) with the page language; hide or disable gracefully when no voice exists for
   si/ta (check voices; do not claim support that isn't there; say so in docs).
9. **Calm, not noisy.** Keep the existing motion rules (reduced motion honoured, no flashing, no urgency).
   Celebrate effort gently. Never tie rewards to wellbeing. Keep educational safety rules: no leaderboards,
   readiness shown as bands, tutor answers always show sources (kid wording: "Where this comes from").
10. **Language parity.** Every new string in en, si and ta (natural, child-level wording, consistent with
    docs/I18N-GLOSSARY.md); npm run i18n:check must pass; mark new si/ta strings in docs/I18N-REVIEW.md
    for native review. Don't leave English in si/ta (e.g. mascot lines, tips, tour).

## Definition of done
npm run typecheck, lint, i18n:check, build pass; no hex outside tailwind.config.ts; components from
src/components/ui; data via services; works at 1440/834/390; keyboard and screen-reader sane (labels, headings,
focus, aria-live); each student page checked in the browser in en, si and ta; update docs/PROGRESS.md and README
route map.
