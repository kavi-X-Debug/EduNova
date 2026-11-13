import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { A_AN_ADJECTIVES, A_AN_FRAMES, A_AN_NOUNS, BE_PREDICATES, BE_SUBJECTS, DEMO_ADJECTIVES, DEMO_NOUNS, PRESENT_SUBJECTS, PRESENT_VERBS, SOME_FRAMES, SOME_NOUNS, WAS_PHRASES, WAS_SUBJECTS } from './data/gaps';

/** Which one-sentence rule explains the answer (a key suffix under `games.english.fillTheGap.rule.`). */
export type GapRule = 'be' | 'a' | 'an' | 'some' | 'this' | 'that' | 'these' | 'those' | 's' | 'base' | 'was' | 'were';

export interface GapRound {
  /** Words before and after the blank ("She" / "my friend."); `before` is empty when the blank starts the sentence. */
  before: string;
  after: string;
  answer: string;
  options: string[];
  rule: GapRule;
  /** Values for the rule sentence: `subject` and `word`, and sometimes `ending`. */
  vars: Record<string, string>;
}

export const sentenceOf = (r: Pick<GapRound, 'before' | 'after' | 'answer'>): string => [r.before, r.answer, r.after].filter(Boolean).join(' ');

function make(rng: Rng, before: string, after: string, answer: string, wrong: string[], rule: GapRule, vars: Record<string, string>, count = 3): GapRound {
  return { before, after, answer, options: buildChoices(rng, answer, wrong, count).options, rule, vars };
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Level 1: am / is / are. */
function beRound(rng: Rng): GapRound {
  const subj = rng.pick(BE_SUBJECTS);
  const pred = rng.pick(BE_PREDICATES);
  const question = rng.chance(0.35);
  const forms = ['am', 'is', 'are'];
  if (question) {
    const ans = cap(subj.be);
    return make(rng, '', `${subj.q} ${pred}?`, ans, forms.filter((f) => f !== subj.be).map(cap), 'be', { subject: subj.q, word: ans });
  }
  return make(rng, subj.s, `${pred}.`, subj.be, forms.filter((f) => f !== subj.be), 'be', { subject: subj.s, word: subj.be });
}

/** a / an / some. `adjective` puts an adjective between the article and the noun. */
function articleRound(rng: Rng, adjective: boolean): GapRound {
  const options = ['a', 'an', 'some'];
  if (!adjective && rng.chance(0.3)) {
    const noun = rng.pick(SOME_NOUNS);
    const [before, tail] = rng.pick(SOME_FRAMES);
    return make(rng, before, `${noun} ${tail}`.replace(' .', '.'), 'some', ['a', 'an'], 'some', { subject: noun, word: 'some' });
  }
  const noun = rng.pick(A_AN_NOUNS);
  const adj = adjective ? rng.pick(A_AN_ADJECTIVES) : undefined;
  const first = adj ?? noun;
  const [before, tail] = rng.pick(A_AN_FRAMES);
  const phrase = adj ? `${adj.w} ${noun.w}` : noun.w;
  const wrong = options.filter((o) => o !== first.art);
  return make(rng, before, `${phrase} ${tail}`.replace(' .', '.'), first.art, wrong, first.art, { subject: first.w, word: first.art });
}

/** this / that / these / those, told apart by "here" and "over there". */
function demoRound(rng: Rng): GapRound {
  const noun = rng.pick(DEMO_NOUNS);
  const adj = rng.pick(DEMO_ADJECTIVES);
  const near = rng.chance();
  const many = rng.chance();
  const answer = near ? (many ? 'these' : 'this') : many ? 'those' : 'that';
  const cue = near ? 'here' : 'over there';
  const text = `${many ? noun.many : noun.one} ${cue} ${many ? 'are' : 'is'} ${adj}.`;
  return make(rng, '', text, cap(answer), ['this', 'that', 'these', 'those'].filter((w) => w !== answer).map(cap), answer as GapRule, { subject: cue, word: cap(answer) }, 4);
}

/** Simple present: the verb with -s for he / she / it. */
function presentRound(rng: Rng): GapRound {
  const verb = rng.pick(PRESENT_VERBS);
  const subj = rng.pick(PRESENT_SUBJECTS);
  const answer = subj.third ? verb.s : verb.base;
  const wrong = [subj.third ? verb.base : verb.s, verb.ing];
  return make(rng, subj.s, verb.rest, answer, wrong, subj.third ? 's' : 'base', { subject: subj.s, word: answer, ending: '-s / -es' });
}

function wasRound(rng: Rng): GapRound {
  const subj = rng.pick(WAS_SUBJECTS);
  const answer = subj.was ? 'was' : 'were';
  return make(rng, subj.s, rng.pick(WAS_PHRASES), answer, [subj.was ? 'were' : 'was'], answer, { subject: subj.s, word: answer }, 2);
}

/** PURE: the same rng always gives the same round. */
export function makeGapRound(rng: Rng, { level }: RoundContext): GapRound {
  if (level === 1) return beRound(rng);
  if (level === 2) return rng.chance(0.5) ? articleRound(rng, false) : demoRound(rng);
  const r = rng.next();
  if (r < 0.45) return presentRound(rng);
  if (r < 0.75) return wasRound(rng);
  return articleRound(rng, true);
}

export const ROUNDS_PER_PLAY = 8;
