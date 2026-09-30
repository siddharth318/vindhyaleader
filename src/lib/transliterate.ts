/**
 * Devanagari → readable Latin transliteration, used to build SEO-friendly URL
 * slugs from Hindi headlines (e.g. "सोनभद्र में बारिश" → "sonbhadra me barish").
 *
 * Simplified Hunterian-style romanisation with the usual Hindi schwa-deletion
 * heuristic (drop the inherent "a" at word end and in V-C-a-C-V positions).
 * It's intentionally approximate — slugs need to be readable and keyword-bearing,
 * not linguistically perfect. Regional proper nouns use a dictionary so they
 * match what people actually type into search (राबर्ट्सगंज → robertsganj).
 */

const WORD_OVERRIDES: Record<string, string> = {
  विंध्यलीडर: "vindhyaleader",
  विंध्य: "vindhya",
  सोनभद्र: "sonbhadra",
  राबर्ट्सगंज: "robertsganj",
  रॉबर्ट्सगंज: "robertsganj",
  रावर्ट्सगंज: "robertsganj",
  पूर्वांचल: "purvanchal",
  मिर्जापुर: "mirzapur",
  मिर्ज़ापुर: "mirzapur",
  वाराणसी: "varanasi",
  बनारस: "banaras",
  चंदौली: "chandauli",
  गाजीपुर: "ghazipur",
  ग़ाज़ीपुर: "ghazipur",
  ओबरा: "obra",
  रेणुकूट: "renukoot",
  रेनुकूट: "renukoot",
  पिपरी: "pipri",
  अनपरा: "anpara",
  चोपन: "chopan",
  दुद्धी: "duddhi",
  घोरावल: "ghorawal",
  शक्तिनगर: "shaktinagar",
  म्योरपुर: "myorpur",
  बभनी: "babhani",
  चुर्क: "churk",
  चुनार: "chunar",
  विंध्याचल: "vindhyachal",
  प्रयागराज: "prayagraj",
  गोरखपुर: "gorakhpur",
  उत्तर: "uttar",
  प्रदेश: "pradesh",
  भारत: "bharat",
  भाजपा: "bjp",
  कांग्रेस: "congress",
  पुलिस: "police",
  न्यूज़: "news",
  न्यूज: "news",
  एनटीपीसी: "ntpc",
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  अ: "a", आ: "a", इ: "i", ई: "i", उ: "u", ऊ: "u", ऋ: "ri",
  ए: "e", ऐ: "ai", ओ: "o", औ: "au", ऑ: "o", ऍ: "e",
};

const MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o", "ॅ": "e",
};

const CONSONANTS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", ळ: "l", व: "v",
  श: "sh", ष: "sh", स: "s", ह: "h",
};

/** Consonant + nukta (़) forms. NFC decomposes the precomposed letters into these. */
const NUKTA_FORMS: Record<string, string> = {
  क: "q", ख: "kh", ग: "g", ज: "z", ड: "r", ढ: "rh", फ: "f", य: "y",
};

const DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

const VIRAMA = "्";
const NUKTA = "़";
const NASALS = new Set(["ं", "ँ"]);
const VISARGA = "ः";

type Unit =
  | { kind: "cons"; base: string; sound: string; vowel: string; inherent: boolean; virama: boolean; nasal: boolean; visarga: boolean }
  | { kind: "vowel"; sound: string; nasal: boolean; visarga: boolean };

function hasVowel(u: Unit | undefined): boolean {
  if (!u) return false;
  if (u.kind === "vowel") return true;
  return !u.virama && (u.inherent || u.vowel !== "");
}

function transliterateWord(word: string): string {
  if (WORD_OVERRIDES[word]) return WORD_OVERRIDES[word];

  const chars = Array.from(word);
  const units: Unit[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (CONSONANTS[ch]) {
      let sound = CONSONANTS[ch];
      if (chars[i + 1] === NUKTA && NUKTA_FORMS[ch]) {
        sound = NUKTA_FORMS[ch];
        i++;
      }
      const next = chars[i + 1];
      const unit: Unit = { kind: "cons", base: ch, sound, vowel: "", inherent: false, virama: false, nasal: false, visarga: false };
      if (next && MATRAS[next]) {
        unit.vowel = MATRAS[next];
        i++;
      } else if (next === VIRAMA) {
        unit.virama = true;
        i++;
      } else {
        unit.inherent = true;
      }
      units.push(unit);
    } else if (INDEPENDENT_VOWELS[ch]) {
      units.push({ kind: "vowel", sound: INDEPENDENT_VOWELS[ch], nasal: false, visarga: false });
    } else if (NASALS.has(ch) || ch === VISARGA) {
      const last = units[units.length - 1];
      if (last) {
        if (ch === VISARGA) last.visarga = true;
        else last.nasal = true;
      }
    } else if (DIGITS[ch]) {
      units.push({ kind: "vowel", sound: DIGITS[ch], nasal: false, visarga: false });
    } else if (/[a-z0-9]/i.test(ch)) {
      // Latin letters/digits mixed into a Hindi word pass straight through.
      units.push({ kind: "vowel", sound: ch.toLowerCase(), nasal: false, visarga: false });
    }
    // Anything else (stray marks, ZWJ/ZWNJ) is dropped.
  }

  // ज्ञ is pronounced "gy" in Hindi.
  for (let i = 0; i < units.length - 1; i++) {
    const a = units[i];
    const b = units[i + 1];
    if (a.kind === "cons" && b.kind === "cons" && a.base === "ज" && a.virama && b.base === "ञ") {
      a.sound = "g";
      b.sound = "y";
    }
  }

  // Schwa deletion — word-final: drop the inherent "a" of a final consonant
  // (कम → kam, रिकॉर्ड → rikord), but keep it after a conjunct ending in र/य/व
  // (भद्र → bhadra, सूर्य → surya, क्षत्रियत्व → kshatriyatva). A nasalised
  // vowel is always kept.
  const last = units[units.length - 1];
  const beforeLast = units[units.length - 2];
  const afterConjunct = beforeLast?.kind === "cons" && beforeLast.virama;
  if (
    units.length > 1 &&
    last.kind === "cons" &&
    last.inherent &&
    !last.nasal &&
    !(afterConjunct && ["र", "य", "व"].includes(last.base))
  ) {
    last.inherent = false;
  }

  // Schwa deletion — medial, scanning left-to-right: V C(a) C V → V C C V.
  // Left-to-right handles the compounds common in news copy (जनसभा → jansabha,
  // जनपदों → janpadon, सोनभद्र → sonbhadra).
  for (let i = 1; i < units.length - 1; i++) {
    const u = units[i];
    const prev = units[i - 1];
    const next = units[i + 1];
    if (
      u.kind === "cons" &&
      u.inherent &&
      !u.nasal &&
      hasVowel(prev) &&
      !(prev.kind === "cons" && prev.virama) &&
      next?.kind === "cons" &&
      hasVowel(next)
    ) {
      u.inherent = false;
    }
  }

  let out = "";
  units.forEach((u, idx) => {
    if (u.kind === "cons") {
      out += u.sound;
      if (!u.virama) out += u.vowel || (u.inherent ? "a" : "");
    } else {
      out += u.sound;
    }
    if (u.nasal) {
      // "m" only after a short "a" before a labial (संपर्क → sampark); otherwise "n" (सौंपा → saunpa).
      const following = units[idx + 1];
      const shortA = (u.kind === "cons" && u.inherent) || (u.kind === "vowel" && u.sound === "a");
      const labial = following?.kind === "cons" && ["p", "ph", "b", "bh", "m"].includes(following.sound);
      out += shortA && labial ? "m" : "n";
    }
    if (u.visarga) out += "h";
  });

  return out;
}

/**
 * Transliterates any Devanagari runs in `text` to Latin, leaving other
 * characters (Latin, digits, punctuation, spaces) intact.
 */
export function transliterate(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[ऀ-ॿ]+/g, (run) => transliterateWord(run.replace(/[।॥]/g, "")) + (/[।॥]/.test(run) ? " " : ""));
}
