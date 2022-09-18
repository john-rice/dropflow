// All code based on foliojs/grapheme-breaker at time of writing
import graphemeBreakTrie from '../../gen/graphemeBreakTrie.js';

// Gets a code point from a UTF-16 string
// handling surrogate pairs appropriately
function codePointAt(str: string, idx: number) {
  let hi, low;
  idx = idx || 0;
  const code = str.charCodeAt(idx);

  // High surrogate
  if (0xD800 <= code && code <= 0xDBFF) {
    hi = code;
    low = str.charCodeAt(idx + 1);
    if (0xDC00 <= low && low <= 0xDFFF) {
      return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }

    return hi;
  }

  // Low surrogate
  if (0xDC00 <= code && code <= 0xDFFF) {
    hi = str.charCodeAt(idx - 1);
    low = code;
    if (0xD800 <= hi && hi <= 0xDBFF) {
      return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }

    return low;
  }

  return code;
};

export const Other = 0;
export const CR = 1;
export const LF = 2;
export const Control = 3;
export const Extend = 4;
export const Regional_Indicator = 5;
export const SpacingMark = 6;
export const L = 7;
export const V = 8;
export const T = 9;
export const LV = 10;
export const LVT = 11;

// Returns whether a break is allowed between the
// two given grapheme breaking classes
function shouldBreak(previous: number, current: number) {
  // GB3. CR X LF
  if ((previous === CR) && (current === LF)) {
    return false;

    // GB4. (Control|CR|LF) ÷
  } else if ([Control, CR, LF].includes(previous)) {
    return true;

    // GB5. ÷ (Control|CR|LF)
  } else if ([Control, CR, LF].includes(current)) {
    return true;

    // GB6. L X (L|V|LV|LVT)
  } else if ((previous === L) && [L, V, LV, LVT].includes(current)) {
    return false;

    // GB7. (LV|V) X (V|T)
  } else if ([LV, V].includes(previous) && [V, T].includes(current)) {
    return false;

    // GB8. (LVT|T) X (T)
  } else if ([LVT, T].includes(previous) && (current === T)) {
    return false;

    // GB8a. Regional_Indicator X Regional_Indicator
  } else if ((previous === Regional_Indicator) && (current === Regional_Indicator)) {
    return false;

    // GB9. X Extend
  } else if (current === Extend) {
    return false;

    // GB9a. X SpacingMark
  } else if (current === SpacingMark) {
    return false;
  }

  // GB9b. Prepend X (there are currently no characters with this class)
  //else if (previous === Prepend) {
  //  return false;
  //}

  // GB10. Any ÷ Any
  return true;
};

// Returns the next grapheme break in the string after the given index
export default function nextGraphemeBreak(string: string, index: number) {
  if (index == null) {
    index = 0;
  }
  if (index < 0) {
    return 0;
  }

  if (index >= (string.length - 1)) {
    return string.length;
  }

  let prev = graphemeBreakTrie.get(codePointAt(string, index));
  for (let i = index + 1; i < string.length; i++) {
    // check for already processed low surrogates
    let middle, middle1;
    if ((0xd800 <= (middle = string.charCodeAt(i - 1)) && middle <= 0xdbff) &&
      (0xdc00 <= (middle1 = string.charCodeAt(i)) && middle1 <= 0xdfff)) {
      continue;
    }

    const next = graphemeBreakTrie.get(codePointAt(string, i));
    if (shouldBreak(prev, next)) {
      return i;
    }

    prev = next;
  }

  return string.length;
};
