// utils/tamilTranslitMap.ts

// Simple phonetic mappings of English/Tanglish syllables to Tamil characters.
// This is used locally/offline to filter dropdown list suggestions when the user types in Tanglish.
const vowelMap: { [key: string]: string } = {
  a: "அ", aa: "ஆ", A: "ஆ", i: "இ", ee: "ஈ", I: "ஈ", u: "உ", oo: "ஊ", U: "ஊ",
  e: "எ", ae: "ஏ", E: "ஏ", o: "ஒ", oa: "ஓ", O: "ஓ", au: "ஔ", ow: "ஔ"
};

const consonantMap: { [key: string]: string } = {
  k: "க", g: "க", ch: "ச", s: "ச", th: "த", d: "த", t: "ட", p: "ப", b: "ப",
  m: "ம", y: "ய", r: "ர", l: "ல", v: "வ", w: "வ", z: "ழ", zh: "ழ", L: "ள", R: "ற", n: "ந", N: "ண",
  sh: "ஷ", j: "ஜ", h: "ஹ"
};

// Vowel modifiers applied to consonants
const modifierMap: { [key: string]: string } = {
  a: "", aa: "ா", A: "ா", i: "ி", ee: "ீ", I: "ீ", u: "ு", oo: "ூ", U: "ூ",
  e: "ெ", ae: "ே", E: "ே", o: "ொ", oa: "ோ", O: "ோ", au: "ௌ", ow: "ௌ"
};

/**
 * Phonetically translates a Tanglish search query into Tamil characters to perform search filtering.
 * This is a lightweight rule-based translator specifically optimized for matching Tamil lists.
 */
export function getTamilEquivalent(tanglish: string): string {
  if (!tanglish) return "";
  
  let result = "";
  let i = 0;
  const len = tanglish.toLowerCase();

  while (i < len.length) {
    let char1 = len[i];
    let char2 = len[i + 1] || "";
    let char3 = len[i + 2] || "";

    // Check 3-char consonants (like th/zh/ch/sh) + vowels
    let cons = "";
    let consLen = 0;

    if (char1 === "t" && char2 === "h") { cons = "th"; consLen = 2; }
    else if (char1 === "z" && char2 === "h") { cons = "zh"; consLen = 2; }
    else if (char1 === "c" && char2 === "h") { cons = "ch"; consLen = 2; }
    else if (char1 === "s" && char2 === "h") { cons = "sh"; consLen = 2; }
    else if (consonantMap[char1]) { cons = char1; consLen = 1; }

    if (cons) {
      let tamilCons = consonantMap[cons];
      let vowelPart = "";
      let vowelLen = 0;

      // Check next chars for vowels
      let next1 = len[i + consLen] || "";
      let next2 = len[i + consLen + 1] || "";

      if ((next1 === "a" && next2 === "a") || (next1 === "e" && next2 === "e") || (next1 === "o" && next2 === "o")) {
        vowelPart = next1 + next2;
        vowelLen = 2;
      } else if (vowelMap[next1]) {
        vowelPart = next1;
        vowelLen = 1;
      }

      if (vowelPart) {
        // Consonant + Vowel modifier (e.g. k + aa = கா)
        result += tamilCons + modifierMap[vowelPart];
        i += consLen + vowelLen;
      } else {
        // Consonant only (needs pulli e.g. க்)
        result += tamilCons + "்";
        i += consLen;
      }
    } else {
      // Vowel only (or unknown char)
      let vowelPart = "";
      let vowelLen = 0;

      if ((char1 === "a" && char2 === "a") || (char1 === "e" && char2 === "e") || (char1 === "o" && char2 === "o")) {
        vowelPart = char1 + char2;
        vowelLen = 2;
      } else if (vowelMap[char1]) {
        vowelPart = char1;
        vowelLen = 1;
      }

      if (vowelPart) {
        result += vowelMap[vowelPart];
        i += vowelLen;
      } else {
        result += char1;
        i += 1;
      }
    }
  }

  return result;
}
